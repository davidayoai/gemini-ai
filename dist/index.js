// server/index.ts
import express from "express";

// server/env.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var envPath = path.resolve(__dirname, "../.env");
function setupEnvironment() {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    throw new Error(
      `Failed to load .env file from ${envPath}: ${result.error.message}`
    );
  }
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error(
      "GOOGLE_API_KEY environment variable must be set in .env file"
    );
  }
  return {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "AIzaSyDEPEgUlqSxhWtZ30lBoQYKIMX8U0fwZlA",
    NODE_ENV: process.env.NODE_ENV || "production"
  };
}

// server/routes.ts
import { createServer } from "http";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";
var env = setupEnvironment();
var genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
var model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 2048
  }
});
var chatSessions = /* @__PURE__ */ new Map();
async function formatResponseToMarkdown(text) {
  const resolvedText = await Promise.resolve(text);
  let processedText = resolvedText.replace(/\r\n/g, "\n");
  processedText = processedText.replace(/^([A-Za-z][A-Za-z\s]+):(\s*)/gm, "## $1$2");
  processedText = processedText.replace(/(?<=\n|^)([A-Za-z][A-Za-z\s]+):(?!\d)/gm, "### $1");
  processedText = processedText.replace(/^[•●○]\s*/gm, "* ");
  const paragraphs = processedText.split("\n\n").filter(Boolean);
  const formatted = paragraphs.map((p) => {
    if (p.startsWith("#") || p.startsWith("*") || p.startsWith("-")) {
      return p;
    }
    return `${p}
`;
  }).join("\n\n");
  marked.setOptions({
    gfm: true,
    breaks: true
  });
  return marked.parse(formatted);
}
function registerRoutes(app2) {
  app2.get("/api/search", async (req, res) => {
    try {
      const query = typeof req.query.q === "string" ? req.query.q : Array.isArray(req.query.q) ? req.query.q.join(" ") : "";
      if (!query) {
        return res.status(400).json({
          message: "Query parameter 'q' is required"
        });
      }
      const chat = model.startChat({
        tools: [
          {
            // @ts-ignore - google_search is a valid tool but not typed in the SDK yet
            google_search: {}
          }
        ]
      });
      const result = await chat.sendMessage(query);
      const response = await result.response;
      console.log("Raw Google API Response:", JSON.stringify({
        text: response.text(),
        candidates: response.candidates,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
      }, null, 2));
      const text = response.text();
      const formattedText = await formatResponseToMarkdown(text);
      const sourceMap = /* @__PURE__ */ new Map();
      const metadata = response.candidates?.[0]?.groundingMetadata;
      if (metadata) {
        const chunks = metadata.groundingChunks || [];
        const supports = metadata.groundingSupports || [];
        chunks.forEach((chunk, index) => {
          if (chunk.web?.uri && chunk.web?.title) {
            const url = chunk.web.uri;
            if (!sourceMap.has(url)) {
              const snippets = supports.filter((support) => (support.groundingChunckIndices ?? []).includes(index)).map((support) => {
                if (typeof support.segment === "object" && support.segment?.text) {
                  return support.segment.text || "";
                }
                return "";
              }).join(" ");
              sourceMap.set(url, {
                title: chunk.web.title,
                url,
                snippet: snippets || ""
              });
            }
          }
        });
      }
      const sources = Array.from(sourceMap.values());
      const sessionId = Math.random().toString(36).substring(7);
      chatSessions.set(sessionId, chat);
      res.json({
        sessionId,
        summary: formattedText,
        sources
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({
        message: (error instanceof Error ? error.message : "Unknown error") || "An error occurred while processing your search"
      });
    }
  });
  app2.post("/api/follow-up", async (req, res) => {
    try {
      const { sessionId, query } = req.body;
      if (!sessionId || !query) {
        return res.status(400).json({
          message: "Both sessionId and query are required"
        });
      }
      const chat = chatSessions.get(sessionId);
      if (!chat) {
        return res.status(404).json({
          message: "Chat session not found"
        });
      }
      const result = await chat.sendMessage(query);
      const response = await result.response;
      console.log("Raw Google API Follow-up Response:", JSON.stringify({
        text: response.text(),
        candidates: response.candidates,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
      }, null, 2));
      const text = response.text();
      const formattedText = await formatResponseToMarkdown(text);
      const sourceMap = /* @__PURE__ */ new Map();
      const metadata = response.candidates?.[0]?.groundingMetadata;
      if (metadata) {
        const chunks = metadata.groundingChunks || [];
        const supports = metadata.groundingSupports || [];
        chunks.forEach((chunk, index) => {
          if (chunk.web?.uri && chunk.web?.title) {
            const url = chunk.web.uri;
            if (!sourceMap.has(url)) {
              const snippets = supports.filter((support) => support.groundingChunckIndices.includes(index)).map((support) => support.segment?.text || "").join(" ");
              sourceMap.set(url, {
                title: chunk.web.title,
                url,
                snippet: snippets || ""
              });
            }
          }
        });
      }
      const sources = Array.from(sourceMap.values());
      res.json({
        summary: formattedText,
        sources
      });
    } catch (error) {
      console.error("Follow-up error:", error);
      res.status(500).json({
        message: (error instanceof Error ? error.message : "Unknown error") || "An error occurred while processing your follow-up question"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
var env2 = setupEnvironment();
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
registerRoutes(app);
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});
var PORT = process.env.PORT || 3e3;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
var index_default = app;
export {
  index_default as default
};
