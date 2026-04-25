'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Droplet,
  Sun,
  Sprout,
  Bell,
  Sparkles,
  Settings,
  Plus,
  Camera,
  ChevronLeft,
  Send,
  Wifi,
  Shield,
  Leaf,
  Clock,
  BookOpen,
} from 'lucide-react';

const T = {
  cream: '#F5EFE0',
  paper: '#FBF6E9',
  ink: '#1E2A1C',
  moss: '#355E3B',
  fern: '#4A7C59',
  sage: '#8BA888',
  earth: '#8B6F47',
  terra: '#C8724D',
  sun: '#E8B84A',
  marigold: '#E89B2E',
  saffron: '#D4661F',
  shadow: 'rgba(30,42,28,0.08)',
  line: 'rgba(30,42,28,0.10)',
};

type PlantStatus = 'healthy' | 'thirsty' | 'overdue';
type Priority = 'low' | 'normal' | 'high';
type Screen = 'garden' | 'ai' | 'alerts' | 'settings';

type Plant = {
  id: string;
  name: string;
  nickname: string;
  species: string;
  days: number;
  nextWater: number;
  status: PlantStatus;
  priority: Priority;
  color: string;
  notes: string;
};

type ChatMessage = {
  role: 'ai' | 'me';
  text: string;
};

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,300..900,0..100&family=Geist:wght@300..700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Gurmukhi:wght@400;500;600&display=swap');
    .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; font-optical-sizing: auto; font-variation-settings: 'SOFT' 50; }
    .font-body { font-family: 'Geist', ui-sans-serif, system-ui, sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    .font-punjabi { font-family: 'Noto Sans Gurmukhi', 'Geist', sans-serif; }
    @keyframes planter-blink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
    @keyframes planter-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
    @keyframes planter-sway { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
    @keyframes planter-pulse-ring { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.6); opacity: 0; } }
    .blink-eye { transform-origin: center; animation: planter-blink 4s infinite; }
    .mascot-bob { animation: planter-bob 2.4s ease-in-out infinite; }
    .leaf-sway { transform-origin: bottom center; animation: planter-sway 3s ease-in-out infinite; }
    .ring-pulse { animation: planter-pulse-ring 1.6s cubic-bezier(0.16,1,0.3,1) infinite; }
    .grain { background-image: radial-gradient(circle at 1px 1px, rgba(30,42,28,0.06) 1px, transparent 0); background-size: 3px 3px; }
    .scroll-hide::-webkit-scrollbar { display: none; }
    .scroll-hide { scrollbar-width: none; }
    .gpu { transform: translateZ(0); will-change: transform; backface-visibility: hidden; }
  `}</style>
);

const Mascot = ({ size = 72, mood = 'happy' }: { size?: number; mood?: 'happy' | 'sad' }) => {
  const eyeY = mood === 'sad' ? 40 : 36;

  return (
    <div className="mascot-bob gpu" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
        <path d="M22 54 L58 54 L54 72 Q54 76 50 76 L30 76 Q26 76 26 72 Z" fill={T.earth} />
        <rect x="20" y="50" width="40" height="6" rx="2" fill="#A0815A" />
        <ellipse cx="40" cy="52" rx="18" ry="3" fill={T.ink} opacity="0.5" />
        <g className="leaf-sway">
          <path d="M40 52 Q28 40 22 28 Q30 30 36 38 Q38 30 40 22 Q42 30 44 38 Q50 30 58 28 Q52 40 40 52 Z" fill={T.fern} />
          <path d="M40 52 Q34 44 30 36 Q36 38 40 44 Q44 38 50 36 Q46 44 40 52 Z" fill={T.moss} />
        </g>
        <circle cx="34" cy={eyeY} r="2" fill={T.ink} className="blink-eye" />
        <circle cx="46" cy={eyeY} r="2" fill={T.ink} className="blink-eye" />
        <path
          d={mood === 'happy' ? 'M36 44 Q40 47 44 44' : 'M36 46 Q40 43 44 46'}
          stroke={T.ink}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="31" cy={eyeY + 4} r="1.8" fill={T.terra} opacity="0.5" />
        <circle cx="49" cy={eyeY + 4} r="1.8" fill={T.terra} opacity="0.5" />
        <g transform="translate(54 30)">
          <circle cx="0" cy="0" r="3" fill={T.marigold} />
          <circle cx="-2" cy="-1.5" r="1.8" fill={T.saffron} opacity="0.9" />
          <circle cx="2" cy="-1.5" r="1.8" fill={T.saffron} opacity="0.9" />
          <circle cx="0" cy="2" r="1.8" fill={T.saffron} opacity="0.9" />
          <circle cx="0" cy="0" r="1.2" fill={T.sun} />
        </g>
      </svg>
    </div>
  );
};

const FolkBand = ({ color = T.marigold, height = 14 }: { color?: string; height?: number }) => (
  <svg width="100%" height={height} viewBox="0 0 240 14" preserveAspectRatio="none" style={{ display: 'block' }} aria-hidden="true">
    <defs>
      <pattern id={`folk-${color.replace('#', '')}`} x="0" y="0" width="24" height="14" patternUnits="userSpaceOnUse">
        <path d="M12 2 L16 7 L12 12 L8 7 Z" fill={color} opacity="0.85" />
        <circle cx="2" cy="7" r="1.2" fill={color} opacity="0.55" />
        <circle cx="22" cy="7" r="1.2" fill={color} opacity="0.55" />
        <line x1="12" y1="0" x2="12" y2="2" stroke={color} strokeWidth="0.6" opacity="0.5" />
        <line x1="12" y1="12" x2="12" y2="14" stroke={color} strokeWidth="0.6" opacity="0.5" />
      </pattern>
    </defs>
    <rect width="240" height="14" fill={`url(#folk-${color.replace('#', '')})`} />
  </svg>
);

const PLANTS: Plant[] = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    nickname: 'Big Green',
    species: 'Swiss cheese plant',
    days: 1,
    nextWater: 2,
    status: 'healthy',
    priority: 'normal',
    color: T.fern,
    notes: 'New leaf unfurling on the left side. Rotating weekly.',
  },
  {
    id: '2',
    name: 'Ficus Lyrata',
    nickname: 'Luna',
    species: 'Fiddle leaf fig',
    days: 3,
    nextWater: -2,
    status: 'overdue',
    priority: 'high',
    color: T.moss,
    notes: 'Drooping slightly. Water today. Consider humidifier.',
  },
  {
    id: '3',
    name: 'Tagetes erecta',
    nickname: 'Cempasúchil',
    species: 'Marigold · ਗੇਂਦਾ',
    days: 6,
    nextWater: 8,
    status: 'healthy',
    priority: 'low',
    color: T.marigold,
    notes: 'In full bloom. Deadheading spent flowers every 3 days.',
  },
  {
    id: '4',
    name: 'Pothos Golden',
    nickname: 'Trailer',
    species: 'Epipremnum aureum',
    days: 4,
    nextWater: 1,
    status: 'thirsty',
    priority: 'normal',
    color: T.fern,
    notes: 'Leaves curling a bit. Check soil tomorrow.',
  },
];

const PillButton = ({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="font-body text-xs tracking-wide transition-all gpu"
    style={{
      padding: '8px 14px',
      borderRadius: 999,
      background: active ? T.ink : 'transparent',
      color: active ? T.cream : T.ink,
      border: `1px solid ${active ? T.ink : T.line}`,
      fontWeight: 500,
    }}
  >
    {children}
  </button>
);

const StatusDot = ({ status }: { status: PlantStatus }) => {
  const map: Record<PlantStatus, string> = {
    healthy: T.fern,
    thirsty: T.sun,
    overdue: T.terra,
  };

  return (
    <span className="relative inline-flex items-center justify-center" aria-label={status}>
      {status === 'overdue' && <span className="absolute inset-0 rounded-full ring-pulse" style={{ background: T.terra, width: 10, height: 10 }} />}
      <span className="relative rounded-full" style={{ background: map[status], width: 10, height: 10 }} />
    </span>
  );
};

const GardenScreen = ({ onPick }: { onPick: (plant: Plant) => void }) => {
  const overdue = PLANTS.filter((p) => p.status === 'overdue').length;

  return (
    <div className="pb-24">
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.22em]" style={{ color: T.fern }}>
              Thursday · Jueves · <span className="font-punjabi">ਵੀਰਵਾਰ</span>
            </p>
            <h1
              className="font-display leading-none mt-1"
              style={{ color: T.ink, fontSize: 38, fontWeight: 400, fontVariationSettings: "'opsz' 144, 'SOFT' 80" }}
            >
              Buenos días,
              <br />
              <em style={{ fontStyle: 'italic', fontWeight: 300 }}>jardinero</em>
            </h1>
            <p className="font-punjabi text-[12px] mt-1" style={{ color: T.saffron, fontWeight: 500 }}>
              ਸਤ ਸ੍ਰੀ ਅਕਾਲ · sat sri akal
            </p>
          </div>
          <Mascot size={56} mood={overdue > 0 ? 'sad' : 'happy'} />
        </div>

        {overdue > 0 && (
          <div className="mt-4 rounded-2xl p-3 flex items-center gap-3 gpu" style={{ background: 'rgba(200,114,77,0.10)', border: `1px solid ${T.terra}33` }}>
            <div className="rounded-full flex items-center justify-center" style={{ background: T.terra, width: 34, height: 34 }}>
              <Droplet size={16} color={T.cream} fill={T.cream} />
            </div>
            <div className="flex-1">
              <p className="font-body text-[13px] font-medium" style={{ color: T.ink }}>{overdue} plant needs water</p>
              <p className="font-body text-[11px]" style={{ color: T.ink, opacity: 0.6 }}>High-priority · overdue by 2 days</p>
            </div>
            <button type="button" className="font-body text-[11px] px-3 py-1.5 rounded-full" style={{ background: T.ink, color: T.cream, fontWeight: 500 }}>
              Water now
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 px-6 mt-5 overflow-x-auto scroll-hide">
        {[
          { k: 'Plants', v: PLANTS.length, icon: Sprout },
          { k: 'Healthy', v: PLANTS.filter((p) => p.status === 'healthy').length, icon: Leaf },
          { k: 'Tasks today', v: 3, icon: Clock },
        ].map(({ k, v, icon: Icon }) => (
          <div key={k} className="flex-shrink-0 rounded-2xl px-4 py-3" style={{ background: T.paper, border: `1px solid ${T.line}`, minWidth: 112 }}>
            <Icon size={14} color={T.fern} />
            <p className="font-display mt-1.5" style={{ color: T.ink, fontSize: 24, fontWeight: 500 }}>{v}</p>
            <p className="font-body text-[10px] uppercase tracking-wider" style={{ color: T.ink, opacity: 0.55 }}>{k}</p>
          </div>
        ))}
      </div>

      <div className="px-6 mt-7 mb-3 flex items-end justify-between">
        <h2 className="font-display" style={{ color: T.ink, fontSize: 22, fontWeight: 500 }}>The Garden</h2>
        <span className="font-body text-[11px]" style={{ color: T.ink, opacity: 0.55 }}>{PLANTS.length} entries</span>
      </div>

      <div className="px-6 space-y-3">
        {PLANTS.map((p) => (
          <button
            type="button"
            key={p.id}
            onClick={() => onPick(p)}
            className="w-full text-left rounded-2xl p-4 flex items-center gap-4 transition-transform gpu active:scale-[0.985]"
            style={{ background: T.paper, border: `1px solid ${T.line}`, transitionDuration: '180ms', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
          >
            <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 56, height: 56, background: `linear-gradient(135deg, ${p.color}22, ${p.color}44)`, border: `1px solid ${p.color}33` }}>
              <Sprout size={24} color={p.color} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <StatusDot status={p.status} />
                <h3 className="font-display truncate" style={{ color: T.ink, fontSize: 17, fontWeight: 500, fontStyle: 'italic' }}>{p.nickname}</h3>
                {p.priority === 'high' && (
                  <span className="font-body text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: T.terra, border: `1px solid ${T.terra}66`, fontWeight: 600 }}>High</span>
                )}
              </div>
              <p className="font-body text-[12px] truncate" style={{ color: T.ink, opacity: 0.55 }}>{p.species}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="font-body text-[11px] flex items-center gap-1" style={{ color: p.status === 'overdue' ? T.terra : T.fern }}>
                  <Droplet size={10} /> {p.nextWater < 0 ? `${Math.abs(p.nextWater)}d overdue` : p.nextWater === 0 ? 'Today' : `In ${p.nextWater}d`}
                </span>
                <span className="font-body text-[11px] flex items-center gap-1" style={{ color: T.ink, opacity: 0.5 }}>
                  <BookOpen size={10} /> {p.days} entries
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const PlantDetail = ({ plant, onBack }: { plant: Plant; onBack: () => void }) => (
  <div className="pb-24">
    <div className="px-4 pt-3 flex items-center justify-between">
      <button type="button" onClick={onBack} className="rounded-full flex items-center justify-center gpu active:scale-95 transition-transform" style={{ width: 38, height: 38, background: T.paper, border: `1px solid ${T.line}` }}>
        <ChevronLeft size={18} color={T.ink} />
      </button>
      <button type="button" className="rounded-full flex items-center justify-center" style={{ width: 38, height: 38, background: T.paper, border: `1px solid ${T.line}` }}>
        <Camera size={16} color={T.ink} />
      </button>
    </div>

    <div className="px-6 mt-4">
      <div className="rounded-3xl relative overflow-hidden grain" style={{ background: `linear-gradient(160deg, ${plant.color}33, ${plant.color}11)`, border: `1px solid ${plant.color}33` }}>
        <FolkBand color={plant.color === T.marigold ? T.saffron : T.marigold} />
        <div className="p-8 flex items-start gap-4">
          <Mascot size={80} mood={plant.status === 'overdue' ? 'sad' : 'happy'} />
          <div className="flex-1 pt-2">
            <p className="font-body text-[10px] uppercase tracking-[0.2em]" style={{ color: T.ink, opacity: 0.55 }}>{plant.species}</p>
            <h1 className="font-display leading-tight mt-1" style={{ color: T.ink, fontSize: 28, fontStyle: 'italic', fontWeight: 400 }}>{plant.nickname}</h1>
            <p className="font-body text-[12px] mt-0.5" style={{ color: T.ink, opacity: 0.7 }}>{plant.name}</p>
          </div>
        </div>
        <FolkBand color={plant.color === T.marigold ? T.saffron : T.marigold} />
      </div>
    </div>

    <div className="px-6 mt-4 grid grid-cols-3 gap-2">
      {[
        { icon: Droplet, label: 'Water', sub: 'agua · ਪਾਣੀ', val: plant.nextWater < 0 ? `${Math.abs(plant.nextWater)}d late` : `${plant.nextWater}d`, tint: plant.status === 'overdue' ? T.terra : T.fern },
        { icon: Sun, label: 'Light', sub: 'sol · ਧੁੱਪ', val: 'Bright', tint: T.sun },
        { icon: Sparkles, label: 'Health', sub: 'salud · ਸਿਹਤ', val: plant.status, tint: T.moss },
      ].map(({ icon: Icon, label, sub, val, tint }) => (
        <div key={label} className="rounded-2xl p-3" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
          <Icon size={14} color={tint} />
          <p className="font-body text-[10px] uppercase tracking-wider mt-2" style={{ color: T.ink, opacity: 0.5 }}>{label}</p>
          <p className="font-punjabi text-[9px]" style={{ color: T.ink, opacity: 0.4 }}>{sub}</p>
          <p className="font-display mt-0.5 capitalize" style={{ color: T.ink, fontSize: 14, fontWeight: 500 }}>{val}</p>
        </div>
      ))}
    </div>

    <div className="px-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display" style={{ color: T.ink, fontSize: 18, fontWeight: 500 }}>Field notes</h3>
        <button type="button" className="font-body text-[11px] flex items-center gap-1" style={{ color: T.fern, fontWeight: 500 }}><Plus size={12} /> Entry</button>
      </div>
      <div className="space-y-3">
        {[
          { date: 'Today', text: plant.notes },
          { date: 'Apr 20', text: 'Repotted into terracotta. Used gritty mix, 1 part perlite.' },
          { date: 'Apr 14', text: 'New leaf spotted. Measured 4cm.' },
        ].map((entry) => (
          <div key={entry.date} className="rounded-2xl p-4 relative" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
            <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r" style={{ background: plant.color, opacity: 0.5 }} />
            <p className="font-body text-[10px] uppercase tracking-wider" style={{ color: T.fern, fontWeight: 600 }}>{entry.date}</p>
            <p className="font-body text-[13px] mt-1 leading-relaxed" style={{ color: T.ink }}>{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AiScreen = () => {
  const [msg, setMsg] = useState('');
  const [log, setLog] = useState<ChatMessage[]>([
    { role: 'ai', text: '¡Buenos días! I noticed Luna has been overdue for 2 days — her fiddle leaf tends to drop leaves under drought stress. Want to adjust her reminder to every 6 days instead of 8?' },
    { role: 'me', text: 'Yes, and why are her edges browning?' },
    { role: 'ai', text: 'Crispy edges on a fiddle leaf usually mean low humidity or inconsistent watering. Your log shows 3d, then 8d gaps. Try a pebble tray and aim for weekly. I’ll prep a 3-week recovery plan in her notebook — paani dena zaroori hai.' },
  ]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    setLog((current) => [...current, { role: 'me', text: msg }]);
    setMsg('');
  };

  return (
    <div className="pb-24 flex flex-col" style={{ minHeight: '100%' }}>
      <div className="px-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center gpu" style={{ width: 44, height: 44, background: `linear-gradient(135deg, ${T.moss}, ${T.fern})` }}>
            <Sparkles size={18} color={T.cream} />
          </div>
          <div>
            <h1 className="font-display" style={{ color: T.ink, fontSize: 22, fontWeight: 500 }}>Flora</h1>
            <p className="font-body text-[11px]" style={{ color: T.fern, fontWeight: 500 }}>● Local model · tu jardinera · <span className="font-punjabi">ਮਾਲੀ</span></p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-3 flex-1">
        {log.map((m, index) => (
          <div key={`${m.role}-${index}`} className={`flex ${m.role === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className="rounded-2xl p-3 max-w-[80%] gpu" style={{ background: m.role === 'me' ? T.ink : T.paper, color: m.role === 'me' ? T.cream : T.ink, border: m.role === 'me' ? 'none' : `1px solid ${T.line}`, borderBottomRightRadius: m.role === 'me' ? 6 : 16, borderBottomLeftRadius: m.role === 'me' ? 16 : 6 }}>
              <p className="font-body text-[13px] leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 mt-3 flex gap-2 overflow-x-auto scroll-hide">
        {['Make recovery plan', 'Best light for Luna?', 'Identify by photo'].map((suggestion) => (
          <button type="button" key={suggestion} onClick={() => setMsg(suggestion)} className="flex-shrink-0 rounded-full px-3 py-1.5 font-body text-[11px]" style={{ background: T.paper, border: `1px solid ${T.line}`, color: T.ink }}>
            {suggestion}
          </button>
        ))}
      </div>

      <div className="px-6 mt-3">
        <div className="rounded-full flex items-center gap-2 pl-4 pr-1 py-1" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
            placeholder="Ask Flora…"
            className="flex-1 bg-transparent outline-none font-body text-[13px] py-2"
            style={{ color: T.ink }}
          />
          <button type="button" onClick={sendMessage} className="rounded-full flex items-center justify-center gpu active:scale-95 transition-transform" style={{ width: 36, height: 36, background: T.ink }}>
            <Send size={14} color={T.cream} />
          </button>
        </div>
      </div>
    </div>
  );
};

const RemindersScreen = () => (
  <div className="pb-24">
    <div className="px-6 pt-4">
      <h1 className="font-display" style={{ color: T.ink, fontSize: 30, fontWeight: 400 }}>Alerts</h1>
      <p className="font-body text-[12px] mt-0.5" style={{ color: T.ink, opacity: 0.55 }}>Priority-weighted care schedule</p>
    </div>

    <div className="px-6 mt-5">
      <div className="flex gap-2 mb-4">
        {['Overdue', 'Today', 'Week'].map((tab, index) => <PillButton key={tab} active={index === 0}>{tab}</PillButton>)}
      </div>

      {[
        { plant: 'Luna', task: 'Water · 2 days overdue', high: true, color: T.terra },
        { plant: 'Trailer', task: 'Check soil moisture', high: false, color: T.sun },
        { plant: 'Big Green', task: 'Rotate toward light', high: false, color: T.fern },
      ].map((r) => (
        <div key={r.task} className="rounded-2xl p-4 mb-3 flex items-center gap-3" style={{ background: r.high ? `${T.terra}0D` : T.paper, border: `1px solid ${r.high ? `${T.terra}44` : T.line}` }}>
          <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: r.color }}>
            {r.high ? <Bell size={16} color={T.cream} fill={T.cream} /> : <Droplet size={16} color={T.cream} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display" style={{ color: T.ink, fontSize: 15, fontWeight: 500, fontStyle: 'italic' }}>{r.plant}</h3>
              {r.high && <span className="font-body text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: T.terra, border: `1px solid ${T.terra}66`, fontWeight: 600 }}>High</span>}
            </div>
            <p className="font-body text-[12px] mt-0.5" style={{ color: T.ink, opacity: 0.7 }}>{r.task}</p>
          </div>
          <button type="button" className="font-body text-[11px] px-3 py-1.5 rounded-full gpu active:scale-95 transition-transform" style={{ background: T.ink, color: T.cream, fontWeight: 500 }}>Done</button>
        </div>
      ))}
    </div>
  </div>
);

const SettingsScreen = () => (
  <div className="pb-24">
    <div className="px-6 pt-4">
      <h1 className="font-display" style={{ color: T.ink, fontSize: 30, fontWeight: 400 }}>Device</h1>
    </div>

    <div className="px-6 mt-5">
      <div className="rounded-2xl relative overflow-hidden grain" style={{ background: `linear-gradient(160deg, ${T.moss}, ${T.fern})` }}>
        <FolkBand color={T.marigold} />
        <div className="p-5">
          <div className="flex items-center gap-2">
            <Shield size={14} color={T.cream} />
            <p className="font-body text-[10px] uppercase tracking-wider" style={{ color: T.cream, opacity: 0.8, fontWeight: 600 }}>Paired · local-first · <span className="font-punjabi">ਸੁਰੱਖਿਅਤ</span></p>
          </div>
          <p className="font-mono text-[18px] mt-3" style={{ color: T.cream, fontWeight: 500, letterSpacing: 1 }}>192.168.1.47</p>
          <p className="font-body text-[12px] mt-1" style={{ color: T.cream, opacity: 0.75 }}>iPhone · Michael&apos;s network</p>
          <div className="mt-4 flex items-center gap-2">
            <Wifi size={12} color={T.cream} />
            <span className="font-body text-[11px]" style={{ color: T.cream, opacity: 0.85 }}>Sin cuenta. Tu data se queda contigo.</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {[
          { label: 'Pair another device', sub: 'Share across phone + web', icon: Plus },
          { label: 'Sync over iCloud', sub: 'Optional, end-to-end', icon: Wifi },
          { label: 'Export notebook', sub: 'Markdown or PDF', icon: BookOpen },
        ].map(({ label, sub, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
            <div className="rounded-xl flex items-center justify-center" style={{ width: 36, height: 36, background: `${T.fern}22` }}>
              <Icon size={15} color={T.fern} />
            </div>
            <div className="flex-1">
              <p className="font-body text-[13px]" style={{ color: T.ink, fontWeight: 500 }}>{label}</p>
              <p className="font-body text-[11px]" style={{ color: T.ink, opacity: 0.55 }}>{sub}</p>
            </div>
            <ChevronLeft size={16} color={T.ink} style={{ transform: 'rotate(180deg)', opacity: 0.4 }} />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl p-3 flex items-center gap-3" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
        <div className="rounded-full" style={{ background: T.fern, width: 6, height: 6 }} />
        <span className="font-body text-[11px]" style={{ color: T.ink, opacity: 0.7 }}>ProMotion · rendering at 120fps</span>
      </div>
    </div>
  </div>
);

const NavBar = ({ screen, setScreen }: { screen: Screen; setScreen: (screen: Screen) => void }) => {
  const items: { key: Screen; icon: typeof Sprout; label: string }[] = [
    { key: 'garden', icon: Sprout, label: 'Garden' },
    { key: 'ai', icon: Sparkles, label: 'Flora' },
    { key: 'alerts', icon: Bell, label: 'Alerts' },
    { key: 'settings', icon: Settings, label: 'Device' },
  ];

  return (
    <div className="absolute left-0 right-0 bottom-0 px-4 pb-4 pt-2 gpu" style={{ background: `linear-gradient(to top, ${T.cream} 70%, ${T.cream}00)` }}>
      <div className="rounded-full flex items-center justify-around p-1.5" style={{ background: T.ink, boxShadow: `0 10px 30px ${T.shadow}` }}>
        {items.map(({ key, icon: Icon, label }) => {
          const active = screen === key;
          return (
            <button
              type="button"
              key={key}
              onClick={() => setScreen(key)}
              className="relative flex items-center gap-1.5 rounded-full transition-all gpu"
              style={{ padding: active ? '8px 14px' : '8px 10px', background: active ? T.cream : 'transparent', transitionDuration: '260ms', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
            >
              <Icon size={16} color={active ? T.ink : T.cream} strokeWidth={active ? 2 : 1.75} />
              {active && <span className="font-body text-[11px]" style={{ color: T.ink, fontWeight: 600 }}>{label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function BotanicalJournalPrototype() {
  const [screen, setScreen] = useState<Screen>('garden');
  const [plant, setPlant] = useState<Plant | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [screen, plant]);

  const renderScreen = () => {
    if (plant) return <PlantDetail plant={plant} onBack={() => setPlant(null)} />;
    if (screen === 'garden') return <GardenScreen onPick={setPlant} />;
    if (screen === 'ai') return <AiScreen />;
    if (screen === 'alerts') return <RemindersScreen />;
    return <SettingsScreen />;
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative"
      style={{ background: 'radial-gradient(ellipse at top, #EFE7D2 0%, #D9CFB8 100%)' }}
    >
      <FontLoader />
      <div
        className="relative rounded-[48px] overflow-hidden gpu"
        style={{
          width: 390,
          height: 780,
          maxHeight: '95vh',
          background: T.cream,
          border: `8px solid ${T.ink}`,
          boxShadow: '0 40px 80px rgba(30,42,28,0.25), 0 0 0 2px rgba(30,42,28,0.4)',
        }}
      >
        <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full z-20" style={{ width: 110, height: 28, background: T.ink }} />

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 pt-3 z-10">
          <span className="font-body text-[12px]" style={{ color: T.ink, fontWeight: 600 }}>9:41</span>
          <div className="flex items-center gap-1">
            <span className="font-body text-[10px]" style={{ color: T.fern, fontWeight: 600 }}>120Hz</span>
          </div>
        </div>

        <div ref={scrollRef} className="absolute inset-0 overflow-y-auto overflow-x-hidden scroll-hide" style={{ paddingTop: 48, background: T.cream }}>
          {renderScreen()}
        </div>

        {!plant && <NavBar screen={screen} setScreen={setScreen} />}

        {!plant && screen === 'garden' && (
          <button
            type="button"
            className="absolute rounded-full flex items-center justify-center gpu active:scale-90 transition-transform"
            style={{ right: 20, bottom: 96, width: 54, height: 54, background: T.terra, boxShadow: `0 8px 20px ${T.terra}66`, transitionDuration: '200ms' }}
          >
            <Plus size={22} color={T.cream} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center font-body text-[11px]" style={{ color: T.ink, opacity: 0.5 }}>
        Planter · redesign prototype · tap cards + nav to explore
      </div>
    </div>
  );
}
