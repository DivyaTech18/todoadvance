"use client";

import { useState, useEffect } from "react";
import Chatbot from "./Chatbot";

export default function ChatbotWrapper() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    const checkDarkMode = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("todo-theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDarkMode(stored === "dark" || (!stored && prefersDark));
      }
    };

    checkDarkMode();

    // Listen for theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => checkDarkMode();
    mediaQuery.addEventListener("change", handleChange);

    // Listen for storage changes (in case theme changes in another tab)
    window.addEventListener("storage", checkDarkMode);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener("storage", checkDarkMode);
    };
  }, []);

  // Also poll for theme changes from localStorage (same-tab changes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("todo-theme");
        setIsDarkMode(stored === "dark");
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <Chatbot isDarkMode={isDarkMode} />;
}






