// lib/data/data-reader.ts
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export function readJSON<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) throw new Error(`Data file not found: ${filename}`);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

export function writeJSON(filename: string, data: unknown): void {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}