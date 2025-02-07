import { type Capture, type InsertCapture } from "@shared/schema";

export interface IStorage {
  getCaptures(): Promise<Capture[]>;
  createCapture(capture: InsertCapture): Promise<Capture>;
  deleteCapture(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private captures: Map<number, Capture>;
  private currentId: number;

  constructor() {
    this.captures = new Map();
    this.currentId = 1;
  }

  async getCaptures(): Promise<Capture[]> {
    return Array.from(this.captures.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async createCapture(insertCapture: InsertCapture): Promise<Capture> {
    const id = this.currentId++;
    const capture: Capture = {
      ...insertCapture,
      id,
      timestamp: new Date(),
      plateNumber: null,
      confidence: null,
    };
    this.captures.set(id, capture);
    return capture;
  }

  async deleteCapture(id: number): Promise<void> {
    this.captures.delete(id);
  }
}

export const storage = new MemStorage();
