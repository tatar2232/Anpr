import { type Capture, type InsertCapture, type WatchedPlate, type InsertWatchedPlate } from "@shared/schema";
import { captures, watchedPlates } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCaptures(): Promise<Capture[]>;
  createCapture(capture: InsertCapture): Promise<Capture>;
  deleteCapture(id: number): Promise<void>;
  getWatchedPlates(): Promise<WatchedPlate[]>;
  addWatchedPlate(plate: InsertWatchedPlate): Promise<WatchedPlate>;
  removeWatchedPlate(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCaptures(): Promise<Capture[]> {
    return await db.select().from(captures).orderBy(captures.timestamp);
  }

  async createCapture(insertCapture: InsertCapture): Promise<Capture> {
    const [capture] = await db.insert(captures).values(insertCapture).returning();
    return capture;
  }

  async deleteCapture(id: number): Promise<void> {
    await db.delete(captures).where(eq(captures.id, id));
  }

  async getWatchedPlates(): Promise<WatchedPlate[]> {
    return await db.select().from(watchedPlates).orderBy(watchedPlates.addedAt);
  }

  async addWatchedPlate(plate: InsertWatchedPlate): Promise<WatchedPlate> {
    const [watchedPlate] = await db.insert(watchedPlates).values(plate).returning();
    return watchedPlate;
  }

  async removeWatchedPlate(id: number): Promise<void> {
    await db.delete(watchedPlates).where(eq(watchedPlates.id, id));
  }
}

export const storage = new DatabaseStorage();