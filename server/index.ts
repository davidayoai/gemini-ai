import express from "express";
import { setupEnvironment } from "./env";
import { registerRoutes } from "./routes";

// Load environment variables
const env = setupEnvironment();

// Create the Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
registerRoutes(app);

// Vercel requires exporting the app as a handler
export default app;
