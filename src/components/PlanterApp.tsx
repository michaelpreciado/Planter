'use client';

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Cpu,
  Download,
  Droplet,
  ImagePlus,
  Leaf,
  MessageCircle,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Upload,
} from 'lucide-react';
import { fileToDataUrl } from '@/lib/image';
import { healthLabel, healthScore, reminderCopy } from '@/lib/plant-insights';
import { usePlantStore } from '@/lib/plant-store';
import type { PlantEntry, PlantStatus } from '@/types/planter';

type Screen = 'garden' | 'add' | 'plant' | 'ai' | 'settings';

const statusCopy: Record<PlantStatus, { label: string; className: string }> = {
  thriving: { label: 'Thriving', className: 'bg-fern/15 text-moss border-fern/20' },
  watch: { label: 'Watch', className: 'bg-sun/20 text-earth border-sun/30' },
  urgent: { label: 'Important', className: 'bg-terra/15 text-terra border-terra/20' },
};

function ShellButton({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`botanical-button flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold ${
        active ? 'bg-moss text-paper' : 'bg-paper/70 text-ink hover:bg-paper'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyPhoto() {
  return (
    <div className="flex h-full min-h-44 items-center justify-center rounded-[2rem] border border-dashed border-moss/20 bg-sage/10 text-center text-moss">
      <div>
        <Leaf className="mx-auto mb-2 h-7 w-7" />
        <p className="text-sm font-semibold">No photo yet</p>
      </div>
    </div>
  );
}

function PlantHero({ plant }: { plant: PlantEntry }) {
  const latest = plant.photos[0];
  const score = healthScore(plant);
  return (
    <section className="botanical-card overflow-hidden rounded-[2rem]">
      <div className="relative h-72 bg-moss/10">
        {latest ? (
          <Image src={latest.dataUrl} alt={plant.name} fill className="object-cover" unoptimized />
        ) : (
          <EmptyPhoto />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-5 text-paper">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.24em] text-paper/75">{plant.type}</p>
              <h2 className="font-serif text-4xl leading-none">{plant.name}</h2>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusCopy[plant.status].className}`}>{statusCopy[plant.status].label}</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl bg-paper/15 p-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-paper/70">Health score</p>
              <p className="text-2xl font-bold">{score}/100 <span className="text-sm font-semibold text-paper/75">{healthLabel(score)}</span></p>
            </div>
            <div className="rounded-2xl bg-paper/15 p-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-paper/70">Care reminder</p>
              <p className="text-lg font-bold">{reminderCopy(plant)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GardenScreen({ openPlant, goAdd }: { openPlant: (id: string) => void; goAdd: () => void }) {
  const { plants, messages } = usePlantStore();
  const importantCount = plants.filter((plant) => plant.important || plant.status === 'urgent').length + messages.filter((message) => message.important).length;
  const totalPhotos = plants.reduce((sum, plant) => sum + plant.photos.length, 0);

  return (
    <div className="space-y-6">
      <section className="botanical-card paper-texture rounded-[2.25rem] p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.26em] text-earth"><Sparkles className="h-4 w-4" /> Local-first garden journal</p>
            <h1 className="max-w-2xl font-serif text-5xl leading-[0.95] md:text-7xl">Planter got its fresh start.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-ink/70">Log plants offline, save progress photos, and ask the built-in care companion for practical next steps without dragging the old app along.</p>
          </div>
          <button type="button" onClick={goAdd} className="botanical-button inline-flex items-center justify-center gap-2 rounded-full bg-moss px-5 py-4 font-bold text-paper hover:bg-fern">
            <Plus className="h-5 w-5" /> Add plant
          </button>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat icon={<Sprout />} label="Plants" value={plants.length} />
          <Stat icon={<Camera />} label="Progress photos" value={totalPhotos} />
          <Stat icon={<Bell />} label="Important" value={importantCount} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plants.map((plant) => (
          <button key={plant.id} type="button" onClick={() => openPlant(plant.id)} className="botanical-card group overflow-hidden rounded-[2rem] text-left transition hover:-translate-y-1 hover:shadow-botanical">
            <div className="relative h-52 bg-sage/10">
              {plant.photos[0] ? <Image src={plant.photos[0].dataUrl} alt={plant.name} fill className="object-cover" unoptimized /> : <EmptyPhoto />}
              {plant.important && <span className="absolute right-4 top-4 rounded-full bg-terra px-3 py-1 text-xs font-bold text-paper">Important</span>}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-2xl">{plant.name}</h3>
                  <p className="text-sm text-ink/60">{plant.type} · {plant.location}</p>
                </div>
                <ChevronRight className="mt-2 h-5 w-5 text-moss transition group-hover:translate-x-1" />
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-ink/70">{plant.careGoal}</p>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-paper/70 px-3 py-2 text-xs font-bold text-moss">
                <span>{healthScore(plant)}/100 · {healthLabel(healthScore(plant))}</span>
                <span>{reminderCopy(plant)}</span>
              </div>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-ink/10 bg-paper/60 p-4">
      <div className="mb-3 text-moss [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">{label}</p>
    </div>
  );
}

function AddPlantScreen({ done }: { done: () => void }) {
  const addPlant = usePlantStore((state) => state.addPlant);
  const [image, setImage] = useState('');
  const [form, setForm] = useState({ name: '', type: '', location: '', careGoal: '', photoNote: '' });

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setImage(await fileToDataUrl(file));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    addPlant({ ...form, photo: image ? { dataUrl: image, note: form.photoNote } : undefined });
    done();
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="botanical-card rounded-[2rem] p-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-earth">New plant</p>
        <h2 className="font-serif text-4xl">Start a local record</h2>
        <div className="mt-6 grid gap-4">
          <Field label="Plant name" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="Ruby Rubber Plant" required />
          <Field label="Plant type" value={form.type} onChange={(type) => setForm({ ...form, type })} placeholder="Ficus elastica" required />
          <Field label="Location" value={form.location} onChange={(location) => setForm({ ...form, location })} placeholder="East window shelf" />
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-moss">Care goal</span>
            <textarea value={form.careGoal} onChange={(event) => setForm({ ...form, careGoal: event.target.value })} rows={4} className="w-full rounded-3xl border border-ink/10 bg-paper/70 px-4 py-3 outline-none ring-moss/20 focus:ring-4" placeholder="What do you want to watch or improve?" />
          </label>
        </div>
      </section>
      <section className="botanical-card rounded-[2rem] p-6">
        <h3 className="mb-4 flex items-center gap-2 font-serif text-3xl"><ImagePlus className="h-6 w-6 text-terra" /> First photo</h3>
        <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-dashed border-moss/25 bg-sage/10 text-center">
          {image ? <Image src={image} alt="Selected plant" width={800} height={700} className="h-72 w-full object-cover" unoptimized /> : <><Camera className="mb-3 h-10 w-10 text-moss" /><span className="font-bold text-moss">Attach image</span><span className="mt-1 text-sm text-ink/55">Saved locally in this browser</span></>}
          <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
        </label>
        <Field label="Photo note" value={form.photoNote} onChange={(photoNote) => setForm({ ...form, photoNote })} placeholder="Freshly watered, new leaf emerging…" />
        <button className="botanical-button mt-5 w-full rounded-full bg-moss px-5 py-4 font-bold text-paper hover:bg-fern">Create plant</button>
      </section>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-moss">{label}</span>
      <input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-full border border-ink/10 bg-paper/70 px-4 py-3 outline-none ring-moss/20 focus:ring-4" />
    </label>
  );
}

function PlantScreen({ plant }: { plant: PlantEntry }) {
  const { addPhoto, addNote, toggleImportant, updateStatus, updateReminder, markCaredFor, askAi } = usePlantStore();
  const [note, setNote] = useState('');
  const [photoNote, setPhotoNote] = useState('');
  const [comparison, setComparison] = useState(50);

  async function addProgressPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    addPhoto(plant.id, { dataUrl: await fileToDataUrl(file), note: photoNote });
    setPhotoNote('');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <PlantHero plant={plant} />
        <section className="botanical-card rounded-[2rem] p-5">
          <div className="flex flex-wrap gap-2">
            {(['thriving', 'watch', 'urgent'] as PlantStatus[]).map((status) => <button key={status} onClick={() => updateStatus(plant.id, status)} className={`rounded-full border px-4 py-2 text-sm font-bold ${plant.status === status ? 'bg-moss text-paper' : 'bg-paper/70 text-moss'}`}>{statusCopy[status].label}</button>)}
            <button onClick={() => toggleImportant(plant.id)} className={`rounded-full border px-4 py-2 text-sm font-bold ${plant.important ? 'bg-terra text-paper' : 'bg-paper/70 text-terra'}`}><Bell className="mr-1 inline h-4 w-4" /> Important</button>
            <button onClick={() => markCaredFor(plant.id)} className="rounded-full border bg-paper/70 px-4 py-2 text-sm font-bold text-moss"><Check className="mr-1 inline h-4 w-4" /> Mark cared for</button>
          </div>
          <p className="mt-4 text-sm leading-6 text-ink/70">{plant.careGoal}</p>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-moss">Care reminder cadence</span>
            <select value={plant.reminderDays ?? ''} onChange={(event) => updateReminder(plant.id, event.target.value ? Number(event.target.value) : undefined)} className="w-full rounded-full border border-ink/10 bg-paper/70 px-4 py-3 font-semibold text-moss outline-none">
              <option value="">No reminder</option>
              <option value="2">Every 2 days</option>
              <option value="4">Every 4 days</option>
              <option value="7">Weekly</option>
              <option value="14">Every 2 weeks</option>
            </select>
          </label>
        </section>
      </div>
      <div className="space-y-6">
        {plant.photos.length >= 2 && (
          <section className="botanical-card rounded-[2rem] p-5">
            <h3 className="mb-4 font-serif text-3xl">Photo comparison</h3>
            <div className="relative h-72 overflow-hidden rounded-[1.75rem] bg-sage/10">
              <Image src={plant.photos[1].dataUrl} alt={`${plant.name} earlier`} fill className="object-cover" unoptimized />
              <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${comparison}%` }}>
                <Image src={plant.photos[0].dataUrl} alt={`${plant.name} latest`} fill className="object-cover" unoptimized />
              </div>
              <div className="absolute inset-x-4 bottom-4 rounded-full bg-ink/45 px-4 py-3 text-paper backdrop-blur">
                <input aria-label="Compare latest photo with previous photo" type="range" min="0" max="100" value={comparison} onChange={(event) => setComparison(Number(event.target.value))} className="w-full accent-sun" />
                <div className="mt-1 flex justify-between text-xs font-bold uppercase tracking-[0.16em]"><span>Previous</span><span>Latest</span></div>
              </div>
            </div>
          </section>
        )}
        <section className="botanical-card rounded-[2rem] p-5">
          <h3 className="mb-4 font-serif text-3xl">Progress timeline</h3>
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input value={photoNote} onChange={(event) => setPhotoNote(event.target.value)} placeholder="What changed in this photo?" className="rounded-full border border-ink/10 bg-paper/70 px-4 py-3 outline-none" />
            <label className="botanical-button cursor-pointer rounded-full bg-moss px-5 py-3 text-center font-bold text-paper"><Camera className="mr-2 inline h-5 w-5" /> Add photo<input type="file" accept="image/*" onChange={addProgressPhoto} className="sr-only" /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {plant.photos.map((photo) => <article key={photo.id} className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-paper/70"><Image src={photo.dataUrl} alt={photo.note || plant.name} width={700} height={560} className="h-44 w-full object-cover" unoptimized /><div className="p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-earth">{formatDistanceToNow(new Date(photo.createdAt), { addSuffix: true })}</p><p className="mt-2 text-sm text-ink/70">{photo.note || 'Progress photo saved.'}</p>{photo.aiSummary && <p className="mt-3 rounded-2xl bg-sage/15 p-3 text-sm leading-6 text-moss">{photo.aiSummary}</p>}</div></article>)}
          </div>
        </section>
        <section className="botanical-card rounded-[2rem] p-5">
          <h3 className="mb-3 font-serif text-3xl">Care notes</h3>
          <div className="flex gap-2"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an observation…" className="min-w-0 flex-1 rounded-full border border-ink/10 bg-paper/70 px-4 py-3 outline-none" /><button onClick={() => { addNote(plant.id, note); setNote(''); }} className="botanical-button rounded-full bg-moss px-4 text-paper"><Check className="h-5 w-5" /></button></div>
          <div className="mt-4 space-y-2">{plant.notes.map((item, index) => <p key={`${item}-${index}`} className="rounded-2xl bg-paper/70 p-3 text-sm text-ink/70">{item}</p>)}</div>
          <button onClick={() => askAi('What should I check next based on this plant history?', plant.id)} className="mt-4 rounded-full bg-sun/25 px-4 py-2 text-sm font-bold text-earth">Ask AI for next check</button>
        </section>
      </div>
    </div>
  );
}

function AiScreen() {
  const { plants, messages, selectedPlantId, selectPlant, askAi } = usePlantStore();
  const [prompt, setPrompt] = useState('');
  const visibleMessages = messages.filter((message) => !message.plantId || message.plantId === selectedPlantId);

  function submit(event: FormEvent) {
    event.preventDefault();
    askAi(prompt, selectedPlantId);
    setPrompt('');
  }

  return (
    <section className="botanical-card rounded-[2rem] p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-earth">Offline care companion</p><h2 className="font-serif text-4xl">Ask Planter AI</h2></div><select value={selectedPlantId ?? ''} onChange={(event) => selectPlant(event.target.value || undefined)} className="rounded-full border border-ink/10 bg-paper px-4 py-3 font-semibold text-moss"><option value="">General question</option>{plants.map((plant) => <option key={plant.id} value={plant.id}>{plant.name}</option>)}</select></div>
      <div className="max-h-[55vh] space-y-3 overflow-y-auto rounded-[1.75rem] bg-paper/45 p-3">
        {visibleMessages.map((message) => <div key={message.id} className={`max-w-[86%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto bg-moss text-paper' : 'bg-sage/15 text-ink'}`}>{message.content}</div>)}
      </div>
      <form onSubmit={submit} className="mt-4 flex gap-2"><input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask about watering, light, yellow leaves…" className="min-w-0 flex-1 rounded-full border border-ink/10 bg-paper px-4 py-3 outline-none" /><button className="botanical-button rounded-full bg-moss px-5 text-paper"><Send className="h-5 w-5" /></button></form>
    </section>
  );
}

function SettingsScreen() {
  const { model, setModelStatus, plants, exportBackup, importBackup } = usePlantStore();
  const importRef = useRef<HTMLInputElement>(null);
  const important = plants.filter((plant) => plant.important || plant.status === 'urgent').length;

  function downloadBackup() {
    const backup = exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planter-backup-${backup.exportedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importFromFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const backup = JSON.parse(await file.text());
    importBackup(backup);
    event.target.value = '';
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="botanical-card rounded-[2rem] p-6"><p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-earth">Offline model</p><h2 className="font-serif text-4xl">{model.name}</h2><p className="mt-3 text-ink/70">Planter is designed around local-first data. This setting prepares the UI for installing a small offline model like Gemma 4 0.8B when the runtime is wired in.</p><div className="mt-5 rounded-[1.5rem] bg-paper/70 p-4"><p className="text-sm font-bold text-moss">Status: {model.status.replace('-', ' ')}</p><p className="mt-1 text-sm text-ink/60">Model size target: {model.size}</p></div><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => setModelStatus('queued')} className="botanical-button rounded-full bg-sun px-4 py-3 font-bold text-ink">Queue install</button><button onClick={() => setModelStatus('ready')} className="botanical-button rounded-full bg-moss px-4 py-3 font-bold text-paper">Mark ready</button></div></section>
      <section className="botanical-card rounded-[2rem] p-6"><p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-earth">Local data</p><h2 className="font-serif text-4xl">Private by default</h2><div className="mt-5 space-y-3"><SettingRow icon={<ShieldCheck />} label="Storage" value="Browser local storage" /><SettingRow icon={<Bell />} label="Important badges" value={`${important} active`} /><SettingRow icon={<Cpu />} label="Sync" value="Not enabled" /></div><div className="mt-5 flex flex-wrap gap-2"><button onClick={downloadBackup} className="botanical-button rounded-full bg-moss px-4 py-3 font-bold text-paper"><Download className="mr-2 inline h-5 w-5" /> Export backup</button><button onClick={() => importRef.current?.click()} className="botanical-button rounded-full bg-paper px-4 py-3 font-bold text-moss"><Upload className="mr-2 inline h-5 w-5" /> Import backup</button><input ref={importRef} type="file" accept="application/json" onChange={importFromFile} className="sr-only" /></div><p className="mt-5 rounded-[1.5rem] bg-terra/10 p-4 text-sm leading-6 text-terra">Portfolio note: export/import proves the local-first architecture has a user-owned data path before online sync is added.</p></section>
      <section className="botanical-card rounded-[2rem] p-6 lg:col-span-2"><p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-earth">AI engineering showcase</p><h2 className="font-serif text-4xl">Built to demonstrate real AI product work</h2><div className="mt-5 grid gap-3 md:grid-cols-3"><SettingRow icon={<Cpu />} label="Model lifecycle" value="Install state ready" /><SettingRow icon={<Camera />} label="Vision path" value="Photo timeline + compare" /><SettingRow icon={<ShieldCheck />} label="Privacy" value="Local-first by design" /></div><p className="mt-5 text-sm leading-6 text-ink/70">Next engineering milestone: wire this UI to a real on-device model runtime, then add an eval harness that checks care advice quality, safety, and hallucination resistance.</p></section>
    </div>
  );
}

function SettingRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl bg-paper/70 p-4"><span className="flex items-center gap-3 font-bold text-moss"><span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>{label}</span><span className="text-sm text-ink/60">{value}</span></div>;
}

export function PlanterApp() {
  const { plants, selectedPlantId, selectPlant } = usePlantStore();
  const [screen, setScreen] = useState<Screen>('garden');
  const selectedPlant = useMemo(() => plants.find((plant) => plant.id === selectedPlantId) ?? plants[0], [plants, selectedPlantId]);
  const importantCount = plants.filter((plant) => plant.important || plant.status === 'urgent').length;

  function openPlant(id: string) {
    selectPlant(id);
    setScreen('plant');
  }

  return (
    <main className="min-h-screen px-4 py-4 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-ink/10 bg-paper/60 p-3 backdrop-blur md:flex-row md:items-center md:justify-between">
          <button type="button" onClick={() => setScreen('garden')} className="flex items-center gap-3 px-2 text-left"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-moss text-paper"><Leaf className="h-6 w-6" /></span><span><span className="block font-serif text-3xl leading-none">Planter</span><span className="text-xs font-bold uppercase tracking-[0.22em] text-earth">Botanical OS</span></span></button>
          <nav className="flex flex-wrap gap-2">
            <ShellButton active={screen === 'garden'} onClick={() => setScreen('garden')}><BookOpen className="h-4 w-4" /> Garden</ShellButton>
            <ShellButton active={screen === 'add'} onClick={() => setScreen('add')}><Plus className="h-4 w-4" /> Add</ShellButton>
            <ShellButton active={screen === 'ai'} onClick={() => setScreen('ai')}><MessageCircle className="h-4 w-4" /> AI</ShellButton>
            <ShellButton active={screen === 'settings'} onClick={() => setScreen('settings')}><Settings className="h-4 w-4" /> Settings</ShellButton>
          </nav>
        </header>
        <div className="mb-5 flex items-center justify-between rounded-full border border-ink/10 bg-paper/45 px-4 py-2 text-sm text-ink/65"><span className="flex items-center gap-2"><Sun className="h-4 w-4 text-marigold" /> Offline-ready · local journal</span><span className="flex items-center gap-2"><Droplet className="h-4 w-4 text-moss" /> {importantCount} important</span></div>
        {screen === 'garden' && <GardenScreen openPlant={openPlant} goAdd={() => setScreen('add')} />}
        {screen === 'add' && <AddPlantScreen done={() => setScreen('garden')} />}
        {screen === 'plant' && selectedPlant && <PlantScreen plant={selectedPlant} />}
        {screen === 'ai' && <AiScreen />}
        {screen === 'settings' && <SettingsScreen />}
      </div>
    </main>
  );
}
