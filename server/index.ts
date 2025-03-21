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




// Middleware to set JSON Content-Type
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Vercel requires exporting the app as a handler
export default app;
