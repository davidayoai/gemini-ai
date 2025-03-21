import { setupEnvironment } from "./env";
import path from "path";
import { fileURLToPath } from "url";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Load environment variables
const env = setupEnvironment();
console.log("\n--- Environment Setup Debug ---");
console.log("Environment variables loaded:", env);
console.log("--- End Debug ---\n");

// Get correct __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware: Request Logger & Response Capture
app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 150) {
        logLine = logLine.slice(0, 149) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Async function to initialize the server
(async () => {
  try {
    console.log("🚀 Registering API Routes...");
    registerRoutes(app);
    console.log("✅ Routes registered successfully.");

    // Global Error Handling Middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("❌ API ERROR:", err);
      res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    });

    if (app.get("env") === "development") {
      console.log("🛠 Setting up Vite (Development Mode)...");
      await setupVite(app);
      console.log("✅ Vite setup complete.");
    } else {
      console.log("📦 Serving Static Files...");
      serveStatic(app);
    }

    // Start the Server on Port 3000
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("🔥 Server Initialization Failed:", error);
    process.exit(1); // Ensure process exits if there's a fatal error
  }
})();
