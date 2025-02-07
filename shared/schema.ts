import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const captures = pgTable("captures", {
  id: serial("id").primaryKey(),
  imageData: text("image_data").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  plateNumber: text("plate_number"),
  confidence: text("confidence"),
});

export const watchedPlates = pgTable("watched_plates", {
  id: serial("id").primaryKey(),
  plateNumber: text("plate_number").notNull().unique(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  description: text("description"),
});

export const insertCaptureSchema = createInsertSchema(captures).pick({
  imageData: true,
});

export const insertWatchedPlateSchema = createInsertSchema(watchedPlates).pick({
  plateNumber: true,
  description: true,
});

export type InsertCapture = z.infer<typeof insertCaptureSchema>;
export type Capture = typeof captures.$inferSelect;
export type InsertWatchedPlate = z.infer<typeof insertWatchedPlateSchema>;
export type WatchedPlate = typeof watchedPlates.$inferSelect;