import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const captures = pgTable("captures", {
  id: serial("id").primaryKey(),
  imageData: text("image_data").notNull(), // Base64 encoded image
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  plateNumber: text("plate_number"), // Will be populated by YOLO model later
  confidence: text("confidence"), // Will be populated by YOLO model later
});

export const insertCaptureSchema = createInsertSchema(captures).pick({
  imageData: true,
});

export type InsertCapture = z.infer<typeof insertCaptureSchema>;
export type Capture = typeof captures.$inferSelect;
