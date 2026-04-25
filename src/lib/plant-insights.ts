import type { PlantEntry } from '@/types/planter';

const dayMs = 24 * 60 * 60 * 1000;

export function daysSince(date?: string) {
  if (!date) return undefined;
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / dayMs));
}

export function nextCareDue(plant: PlantEntry) {
  if (!plant.reminderDays) return undefined;
  const anchor = plant.lastCareAt ?? plant.createdAt;
  const elapsed = daysSince(anchor) ?? 0;
  return plant.reminderDays - elapsed;
}

export function healthScore(plant: PlantEntry) {
  let score = 88;
  if (plant.status === 'watch') score -= 14;
  if (plant.status === 'urgent') score -= 32;
  if (plant.important) score -= 8;
  if (plant.photos.length === 0) score -= 10;
  if (plant.photos.length >= 3) score += 5;
  const due = nextCareDue(plant);
  if (typeof due === 'number' && due < 0) score -= Math.min(20, Math.abs(due) * 4);
  if (plant.notes.length >= 2) score += 4;
  return Math.max(0, Math.min(100, score));
}

export function healthLabel(score: number) {
  if (score >= 82) return 'Stable';
  if (score >= 62) return 'Needs watch';
  return 'High attention';
}

export function reminderCopy(plant: PlantEntry) {
  const due = nextCareDue(plant);
  if (typeof due !== 'number') return 'No reminder set';
  if (due < 0) return `${Math.abs(due)} day${Math.abs(due) === 1 ? '' : 's'} overdue`;
  if (due === 0) return 'Due today';
  return `Due in ${due} day${due === 1 ? '' : 's'}`;
}
