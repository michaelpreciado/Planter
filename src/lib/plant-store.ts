'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AiMessage, OfflineModel, PlanterBackup, PlantEntry, PlantPhoto, PlantStatus } from '@/types/planter';

type NewPlantInput = {
  name: string;
  type: string;
  location: string;
  careGoal: string;
  photo?: { dataUrl: string; note: string };
};

type StoreState = {
  plants: PlantEntry[];
  messages: AiMessage[];
  model: OfflineModel;
  selectedPlantId?: string;
  addPlant: (input: NewPlantInput) => void;
  addPhoto: (plantId: string, photo: Omit<PlantPhoto, 'id' | 'createdAt' | 'aiSummary'>) => void;
  addNote: (plantId: string, note: string) => void;
  updateStatus: (plantId: string, status: PlantStatus) => void;
  updateReminder: (plantId: string, reminderDays?: number) => void;
  markCaredFor: (plantId: string) => void;
  toggleImportant: (plantId: string) => void;
  askAi: (prompt: string, plantId?: string) => void;
  setModelStatus: (status: OfflineModel['status']) => void;
  selectPlant: (plantId?: string) => void;
  exportBackup: () => PlanterBackup;
  importBackup: (backup: PlanterBackup) => void;
};

const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const starterPlants: PlantEntry[] = [
  {
    id: 'starter-monstera',
    name: 'Monstera Scout',
    type: 'Monstera deliciosa',
    location: 'Morning window',
    careGoal: 'Track new leaf unfurling, rotate weekly, and avoid watering before the top soil dries.',
    status: 'thriving',
    important: false,
    reminderDays: 7,
    lastCareAt: daysAgo(2),
    createdAt: daysAgo(42),
    updatedAt: daysAgo(1),
    photos: [
      { id: 'monstera-photo-latest', dataUrl: '/assets/demo-monstera.svg', note: 'New leaf opened cleanly after moving closer to the morning window.', createdAt: daysAgo(1), aiSummary: 'Growth looks stable. Keep the current light and watering rhythm.' },
      { id: 'monstera-photo-before', dataUrl: '/assets/demo-monstera.svg', note: 'Leaf was still curled; soil was lightly damp.', createdAt: daysAgo(12), aiSummary: 'Good baseline photo for comparing leaf posture and color.' },
    ],
    notes: ['Rotated pot one quarter turn after the new leaf leaned toward the window.', 'Skipped watering because the top inch was still damp.'],
  },
  {
    id: 'starter-rubber',
    name: 'Ruby Rubber Plant',
    type: 'Ficus elastica',
    location: 'East shelf',
    careGoal: 'Watch for dust buildup and keep watering consistent while new growth hardens.',
    status: 'watch',
    important: true,
    reminderDays: 4,
    lastCareAt: daysAgo(5),
    createdAt: daysAgo(31),
    updatedAt: daysAgo(2),
    photos: [
      { id: 'rubber-photo-latest', dataUrl: '/assets/demo-rubber.svg', note: 'Lower leaf edge looked slightly dry; moved away from vent.', createdAt: daysAgo(2), aiSummary: 'Watch airflow and humidity this week. No urgent action if new growth stays firm.' },
    ],
    notes: ['Moved 18 inches away from the vent.', 'Wiped leaves with a damp cloth.'],
  },
  {
    id: 'starter-calathea',
    name: 'Calathea Orbit',
    type: 'Calathea orbifolia',
    location: 'Bathroom ledge',
    careGoal: 'Use photos to catch curling early and keep humidity changes visible.',
    status: 'urgent',
    important: true,
    reminderDays: 2,
    lastCareAt: daysAgo(4),
    createdAt: daysAgo(24),
    updatedAt: daysAgo(1),
    photos: [
      { id: 'calathea-photo-latest', dataUrl: '/assets/demo-calathea.svg', note: 'Edges curled after two dry days; humidity tray refilled.', createdAt: daysAgo(1), aiSummary: 'Important: compare tomorrow. Curling plus dry edges suggests humidity or inconsistent moisture.' },
    ],
    notes: ['Refilled humidity tray.', 'Marked important until leaves flatten again.'],
  },
  {
    id: 'starter-pothos',
    name: 'Golden Pothos',
    type: 'Epipremnum aureum',
    location: 'Kitchen rail',
    careGoal: 'Track trailing growth and prune cuttings once vines reach the counter.',
    status: 'thriving',
    important: false,
    reminderDays: 14,
    lastCareAt: daysAgo(6),
    createdAt: daysAgo(56),
    updatedAt: daysAgo(3),
    photos: [
      { id: 'pothos-photo-latest', dataUrl: '/assets/demo-pothos.svg', note: 'Vines gained about two inches since last check.', createdAt: daysAgo(3), aiSummary: 'Healthy progress. Consider pruning one vine for propagation soon.' },
    ],
    notes: ['Added moss clip to guide the longest vine.', 'No yellow leaves this week.'],
  },
];

function photoFeedback(plant: PlantEntry, note?: string) {
  const latestNote = note ? ` You noted: “${note}”.` : '';
  const photoCount = plant.photos.length;
  const cadence = photoCount > 2 ? 'You have enough progress photos to compare posture, color, and new growth over time.' : 'Add 2–3 more progress photos from the same angle to make trend spotting easier.';
  return `${plant.name} is logged as a ${plant.type}.${latestNote} ${cadence} For now, check soil moisture before watering, rotate the pot weekly, and watch for yellowing lower leaves or crispy edges.`;
}

function answerQuestion(prompt: string, plant?: PlantEntry) {
  const lower = prompt.toLowerCase();
  if (!plant) {
    return 'I can help offline with care planning, symptom triage, watering cadence, and photo progress. Pick a plant or add one first so I can ground the answer in your local journal.';
  }
  if (lower.includes('water')) {
    return `${plant.name}: water only when the top 1–2 inches feel dry. If leaves droop but soil is wet, wait and improve airflow. If soil is bone dry and pulling from the pot, bottom-water for 15 minutes, then drain.`;
  }
  if (lower.includes('yellow') || lower.includes('brown') || lower.includes('spot')) {
    return `${plant.name}: yellowing/browning can come from water stress, low light, pests, or old leaves. Compare your latest photo with the previous one, inspect undersides for pests, and mark this important if it is spreading quickly.`;
  }
  if (lower.includes('light') || lower.includes('sun')) {
    return `${plant.name}: aim for bright indirect light unless this plant type prefers full sun. Rotate weekly and use photo progress to catch leaning or faded growth.`;
  }
  return `${plant.name}: based on your local notes, I’d focus on one observable change this week: soil moisture, new growth, leaf color, or posture. Add a progress photo after any care change so the journal can compare before/after.`;
}

export const usePlantStore = create<StoreState>()(
  persist(
    (set, get) => ({
      plants: starterPlants,
      messages: [
        {
          id: uuid(),
          role: 'assistant',
          content: 'Welcome to the new local-first Planter. Add a plant, attach progress photos, then ask me for care feedback offline.',
          createdAt: now(),
        },
      ],
      model: { id: 'gemma-4-0.8b', name: 'Gemma 4 0.8B', size: '0.8B', status: 'not-installed' },
      selectedPlantId: 'starter-monstera',
      addPlant: (input) => {
        const id = uuid();
        const createdAt = now();
        const plant: PlantEntry = {
          id,
          name: input.name.trim() || 'Unnamed plant',
          type: input.type.trim() || 'Unknown plant',
          location: input.location.trim() || 'Unassigned spot',
          careGoal: input.careGoal.trim() || 'Build a photo history and learn its rhythm.',
          status: 'thriving',
          important: false,
          reminderDays: 7,
          createdAt,
          updatedAt: createdAt,
          photos: input.photo?.dataUrl ? [{ id: uuid(), dataUrl: input.photo.dataUrl, note: input.photo.note, createdAt, aiSummary: 'First photo saved. Keep future photos from a similar angle for clearer progress comparison.' }] : [],
          notes: [],
        };
        set((state) => ({ plants: [plant, ...state.plants], selectedPlantId: id }));
      },
      addPhoto: (plantId, photo) => {
        set((state) => ({
          plants: state.plants.map((plant) => {
            if (plant.id !== plantId) return plant;
            const newPhoto: PlantPhoto = { id: uuid(), createdAt: now(), ...photo };
            const updated = { ...plant, photos: [newPhoto, ...plant.photos], updatedAt: now() };
            newPhoto.aiSummary = photoFeedback(updated, photo.note);
            return { ...updated, photos: [newPhoto, ...plant.photos] };
          }),
        }));
      },
      addNote: (plantId, note) => {
        if (!note.trim()) return;
        set((state) => ({
          plants: state.plants.map((plant) => plant.id === plantId ? { ...plant, notes: [note.trim(), ...plant.notes], updatedAt: now() } : plant),
        }));
      },
      updateStatus: (plantId, status) => {
        set((state) => ({ plants: state.plants.map((plant) => plant.id === plantId ? { ...plant, status, important: status === 'urgent' ? true : plant.important, updatedAt: now() } : plant) }));
      },
      updateReminder: (plantId, reminderDays) => {
        set((state) => ({
          plants: state.plants.map((plant) => plant.id === plantId ? { ...plant, reminderDays, updatedAt: now() } : plant),
        }));
      },
      markCaredFor: (plantId) => {
        set((state) => ({
          plants: state.plants.map((plant) => plant.id === plantId ? { ...plant, lastCareAt: now(), status: plant.status === 'urgent' ? 'watch' : plant.status, updatedAt: now() } : plant),
        }));
      },
      toggleImportant: (plantId) => {
        set((state) => ({ plants: state.plants.map((plant) => plant.id === plantId ? { ...plant, important: !plant.important, updatedAt: now() } : plant) }));
      },
      askAi: (prompt, plantId) => {
        const text = prompt.trim();
        if (!text) return;
        const plant = get().plants.find((item) => item.id === plantId);
        const userMessage: AiMessage = { id: uuid(), role: 'user', content: text, createdAt: now(), plantId };
        const assistantMessage: AiMessage = { id: uuid(), role: 'assistant', content: answerQuestion(text, plant), createdAt: now(), plantId };
        set((state) => ({ messages: [...state.messages, userMessage, assistantMessage] }));
      },
      setModelStatus: (status) => set((state) => ({ model: { ...state.model, status } })),
      selectPlant: (plantId) => set({ selectedPlantId: plantId }),
      exportBackup: () => {
        const state = get();
        return {
          schema: 'planter.local.v2',
          exportedAt: now(),
          plants: state.plants,
          messages: state.messages,
          model: state.model,
        };
      },
      importBackup: (backup) => {
        if (backup.schema !== 'planter.local.v2') {
          throw new Error('Unsupported Planter backup file');
        }
        set({
          plants: backup.plants,
          messages: backup.messages,
          model: backup.model,
          selectedPlantId: backup.plants[0]?.id,
        });
      },
    }),
    { name: 'planter-local-v2', version: 1 },
  ),
);
