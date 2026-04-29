import { z } from 'zod';

// Priority levels
export const PrioritySchema = z.enum(['low', 'normal', 'high']);
export type Priority = z.infer<typeof PrioritySchema>;

// Plant health status
export const PlantStatusSchema = z.enum(['healthy', 'thirsty', 'overdue']);
export type PlantStatus = z.infer<typeof PlantStatusSchema>;

// Note entry for plant care logs
export const NoteEntrySchema = z.object({
  id: z.string().uuid(),
  plantId: z.string().uuid(),
  createdAt: z.string().datetime(),
  body: z.string(),
});
export type NoteEntry = z.infer<typeof NoteEntrySchema>;

// Main Plant schema
export const PlantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  nickname: z.string().optional(),
  species: z.string().optional(),
  wateringIntervalDays: z.number().int().positive(),
  lastWatered: z.string().datetime(),
  priority: PrioritySchema,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  notes: z.array(NoteEntrySchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Plant = z.infer<typeof PlantSchema>;

// Device schema for pairing
export const DeviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  publicKey: z.string(),
  boundIp: z.string(),
  createdAt: z.string().datetime(),
  lastSeenAt: z.string().datetime(),
});
export type Device = z.infer<typeof DeviceSchema>;

// Pairing request/response
export const PairRequestSchema = z.object({
  publicKey: z.string(),
  deviceName: z.string(),
});
export type PairRequest = z.infer<typeof PairRequestSchema>;

export const PairResponseSchema = z.object({
  token: z.string(),
  deviceId: z.string().uuid(),
  boundIp: z.string(),
});
export type PairResponse = z.infer<typeof PairResponseSchema>;

// Chat request for Flora AI
export const ChatHistoryEntrySchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const ChatRequestSchema = z.object({
  plantId: z.string().uuid().optional(),
  message: z.string(),
  history: z.array(ChatHistoryEntrySchema),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Helper function to check if a plant is overdue
export function isOverdue(plant: Plant): boolean {
  const now = new Date().getTime();
  const lastWatered = new Date(plant.lastWatered).getTime();
  const intervalMs = plant.wateringIntervalDays * 24 * 60 * 60 * 1000;
  return (now - lastWatered) > intervalMs;
}

// Helper to derive plant status
export function getPlantStatus(plant: Plant): PlantStatus {
  if (isOverdue(plant)) return 'overdue';
  
  const now = new Date().getTime();
  const lastWatered = new Date(plant.lastWatered).getTime();
  const intervalMs = plant.wateringIntervalDays * 24 * 60 * 60 * 1000;
  const daysSinceWatered = (now - lastWatered) / (24 * 60 * 60 * 1000);
  const threshold = plant.wateringIntervalDays * 0.75;
  
  if (daysSinceWatered >= threshold) return 'thirsty';
  return 'healthy';
}
