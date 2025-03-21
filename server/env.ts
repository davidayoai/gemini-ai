import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

export function setupEnvironment() {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const NODE_ENV = process.env.NODE_ENV || "production";

  if (!GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY in environment variables.");
  }

  return {
    GOOGLE_API_KEY,
    NODE_ENV,
  };
}
