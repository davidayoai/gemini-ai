import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger, type ViteDevServer } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source: string = "express"): void {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server): Promise<void> {
    const vite: ViteDevServer = await createViteServer({
        ...viteConfig,
        configFile: false,
        customLogger: {
            ...viteLogger,
            error: (msg: string, options?: any) => {
                if (msg.includes("[TypeScript] Found 0 errors. Watching for file changes")) {
                    log("no errors found", "tsc");
                    return;
                }
                if (msg.includes("[TypeScript] ")) {
                    const [errors, summary] = msg.split("[TypeScript] ", 2);
                    log(`${summary} ${errors}\u001b[0m`, "tsc");
                    return;
                } else {
                    viteLogger.error(msg, options);
                    process.exit(1);
                }
            },
        },
        server: {
            middlewareMode: true,
            hmr: { server },
        },
        appType: "custom",
        root: path.resolve(__dirname, "../client"), // Ensure correct root
    });

    app.use(vite.middlewares);
    app.use("*", async (req: Request, res: Response, next: NextFunction) => {
        const url = req.originalUrl;
        try {
            const clientTemplate = path.resolve(__dirname, "../client/index.html");
            const template = await fs.promises.readFile(clientTemplate, "utf-8");
            const page = await vite.transformIndexHtml(url, template);
            res.status(200).set({ "Content-Type": "text/html" }).end(page);
        } catch (e: unknown) {
            vite.ssrFixStacktrace(e as Error);
            next(e);
        }
    });
}

export function serveStatic(app: Express): void {
    const distPath = path.resolve(__dirname, "../dist/public"); // Fixed to match build output
    if (!fs.existsSync(distPath)) {
        throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
    }
    app.use(express.static(distPath));
    app.use("*", (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}