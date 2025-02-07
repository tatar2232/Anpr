import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCaptureSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  app.get("/api/captures", async (_req, res) => {
    const captures = await storage.getCaptures();
    res.json(captures);
  });

  app.post("/api/captures", async (req, res) => {
    const result = insertCaptureSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid capture data" });
      return;
    }

    const capture = await storage.createCapture(result.data);
    res.json(capture);
  });

  app.delete("/api/captures/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid capture ID" });
      return;
    }

    await storage.deleteCapture(id);
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}
