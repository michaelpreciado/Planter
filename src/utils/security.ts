import type { Plant } from '@/lib/plant-store';

const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]/g;

function cleanString(value: string, maxLength: number): string {
  return value
    .replace(CONTROL_CHAR_REGEX, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function sanitizePlantInput(input: Partial<Plant>): Partial<Plant> {
  return {
    ...input,
    name: typeof input.name === 'string' ? cleanString(input.name, 80) : input.name,
    species: typeof input.species === 'string' ? cleanString(input.species, 80) : input.species,
    notes: typeof input.notes === 'string' ? cleanString(input.notes, 600) : input.notes,
    wateringFrequency:
      typeof input.wateringFrequency === 'number'
        ? Math.max(1, Math.min(60, Math.round(input.wateringFrequency)))
        : input.wateringFrequency,
  };
}

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}
