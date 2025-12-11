import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase environment variables.
    Please check your .env.local file in the supabase directory and ensure:
    1. NEXT_PUBLIC_SUPABASE_URL is set to your Supabase project URL
    2. NEXT_PUBLIC_SUPABASE_ANON_KEY is set to your anon key
    3. Restart your dev server after updating .env.local`
  );
}

const trimmedUrl = supabaseUrl.trim();
const trimmedKey = supabaseAnonKey.trim();

if (trimmedUrl === "your-project-url-here" || trimmedKey === "your-anon-key-here" || !trimmedUrl || !trimmedKey) {
  throw new Error(
    `Invalid Supabase environment variables detected.
    Please update your .env.local file with actual Supabase credentials.
    Restart your dev server after updating.`
  );
}

if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
  throw new Error(
    `Invalid Supabase URL format: "${trimmedUrl}". 
    Must be a valid HTTP or HTTPS URL (e.g., https://your-project.supabase.co).`
  );
}

export const supabase = createClient(trimmedUrl, trimmedKey);

