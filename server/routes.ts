import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCaptureSchema, insertWatchedPlateSchema } from "@shared/schema";
import { detectLicensePlate } from "./services/anpr";
import { resizeImage } from "./services/image";

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

    try {
      // Resize the image before saving
      const resizedImageData = await resizeImage(result.data.imageData, 50);

      // First create the capture with resized image
      const capture = await storage.createCapture({
        ...result.data,
        imageData: resizedImageData
      });

      // Then process it with ANPR
      const detection = await detectLicensePlate(resizedImageData);
      if (detection) {
        await storage.updateCapture(capture.id, {
          plateNumber: detection.plateNumber,
          confidence: detection.confidence.toString()
        });
      }

      res.json(capture);
    } catch (error) {
      console.error('Failed to process capture:', error);
      res.status(500).json({ message: "Failed to process capture" });
    }
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

  app.get("/api/watched-plates", async (_req, res) => {
    const plates = await storage.getWatchedPlates();
    res.json(plates);
  });

  app.post("/api/watched-plates", async (req, res) => {
    const result = insertWatchedPlateSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid plate data" });
      return;
    }

    try {
      const plate = await storage.addWatchedPlate(result.data);
      res.json(plate);
    } catch (error: any) {
      // Check for duplicate key violation
      if (error.code === '23505') {
        res.status(409).json({ 
          message: `Registreringsnummer ${result.data.plateNumber} er allerede i overvåkningslisten` 
        });
        return;
      }
      throw error;
    }
  });

  app.delete("/api/watched-plates/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid plate ID" });
      return;
    }

    await storage.removeWatchedPlate(id);
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}