import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variable
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey || apiKey === "your-gemini-api-key-here") {
  console.error("Gemini API key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
}

// Initialize Gemini AI
const genAI = apiKey && apiKey !== "your-gemini-api-key-here" 
  ? new GoogleGenerativeAI(apiKey) 
  : null;

// System prompt for task management context
const SYSTEM_PROMPT = `You are a helpful AI assistant integrated into a task management application. 
You can help users with:
1. General questions and conversation
2. Task management advice (creating, organizing, prioritizing tasks)
3. Productivity tips and suggestions
4. Answering questions about how to use the task manager

Be friendly, concise, and helpful. When users ask about tasks, provide practical, actionable advice.
Keep responses clear and to the point.`;

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!genAI) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, chatHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Build conversation history for Gemini (skip current message, it will be sent separately)
    const history = chatHistory
      .filter((msg: { role: string; content: string }) => msg.role !== "user" || msg.content !== message)
      .slice(-10) // Keep last 10 messages for context (avoid token limits)
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    // Prepare the message to send
    let messageToSend = message;
    
    // If no history, prepend system prompt to the first message
    if (history.length === 0) {
      messageToSend = `${SYSTEM_PROMPT}\n\nUser: ${message}`;
    }

    // Try multiple models until one works
    const modelNames = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro"];
    let lastError = null;
    let text = null;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Start chat with history if available
        let chat;
        if (history.length > 0) {
          chat = model.startChat({ history });
        } else {
          chat = model.startChat();
        }

        // Generate response
        const result = await chat.sendMessage(messageToSend);
        const response = await result.response;
        text = response.text();
        break; // Success, exit loop
      } catch (err: any) {
        lastError = err;
        // If it's not a model not found error, throw it
        if (!err.message?.includes("not found") && !err.message?.includes("404")) {
          throw err;
        }
        // Otherwise, try next model
        continue;
      }
    }

    // If all models failed
    if (!text) {
      throw lastError || new Error("No available models found");
    }

    return NextResponse.json({ 
      message: text,
      success: true 
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid Gemini API key. Please check your .env.local configuration." },
        { status: 401 }
      );
    }

    if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      return NextResponse.json(
        { error: "API rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Handle model not found errors - try to provide helpful guidance
    if (error.message?.includes("not found") || error.message?.includes("404")) {
      return NextResponse.json(
        { 
          error: "Model not available with your API key. Please: 1) Check your Google AI Studio (https://aistudio.google.com/app/apikey) to see which models are enabled, 2) Make sure you've enabled the Gemini API in Google Cloud Console, 3) Try using 'gemini-pro' or 'gemini-1.0-pro' instead. Contact Google Cloud support if models aren't available.",
          details: error.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "An error occurred while processing your request. Please try again." },
      { status: 500 }
    );
  }
}

