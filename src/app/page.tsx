import {
  Bell,
  Camera,
  Download,
  Github,
  Leaf,
  Lock,
  Mail,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

// Set this to the App Store link once the app is live, e.g.
// 'https://apps.apple.com/app/id0000000000' — the badge switches automatically.
const APP_STORE_URL: string | null = null;

const CONTACT_EMAIL = 'mpreciado1997@gmail.com';
const GITHUB_URL = 'https://github.com/michaelpreciado/Planter';

function MarigoldMark({ size = 120 }: { size?: number }) {
  const petals = (count: number, inner: number, outer: number, width: number, fill: string, rotate = 0) =>
    Array.from({ length: count }, (_, i) => {
      const angle = rotate + (i * 360) / count;
      return (
        <path
          key={`${fill}-${i}`}
          d={`M 0 ${-inner} Q ${-width} ${-(inner + outer) / 2} 0 ${-outer} Q ${width} ${-(inner + outer) / 2} 0 ${-inner} Z`}
          fill={fill}
          transform={`rotate(${angle})`}
        />
      );
    });

  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" aria-hidden="true">
      <g>
        {petals(14, 22, 96, 26, '#D4661F')}
        {petals(14, 20, 82, 26, '#E89B2E', 360 / 28)}
        {petals(10, 14, 60, 30, '#D4661F')}
        {petals(10, 10, 46, 30, '#E8B84A', 18)}
        <circle r="15" fill="#D4661F" />
        <circle r="8.5" fill="#E8B84A" />
      </g>
    </svg>
  );
}

function DiamondBand() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center gap-3 py-4">
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={`inline-block rotate-45 ${i % 2 === 0 ? 'h-2.5 w-2.5 bg-terra/70' : 'h-1.5 w-1.5 bg-marigold'}`}
        />
      ))}
    </div>
  );
}

function AppStoreBadge() {
  if (APP_STORE_URL) {
    return (
      <a
        href={APP_STORE_URL}
        className="botanical-button inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 font-bold text-paper hover:bg-moss"
      >
        <Download className="h-5 w-5" />
        Download on the App Store
      </a>
    );
  }
  return (
    <span className="inline-flex items-center gap-3 rounded-full border border-ink/15 bg-paper/80 px-7 py-4 font-bold text-moss">
      <Sparkles className="h-5 w-5 text-marigold" />
      Coming soon to the App Store
    </span>
  );
}

const features = [
  {
    icon: Camera,
    title: 'Photo growth timeline',
    body: 'Photograph each plant as it grows. A before/after slider makes the progress impossible to miss.',
  },
  {
    icon: Bell,
    title: 'Care reminders',
    body: 'Set a watering cadence per plant and get a nudge on the day care is due — never before, never spammy.',
  },
  {
    icon: Sparkles,
    title: 'On-device AI help',
    body: 'Ask about watering, light, pests, or repotting. Powered by Apple Intelligence — answers grounded in your own plant journal, generated entirely on your device.',
  },
  {
    icon: Lock,
    title: 'Private by design',
    body: 'No account. No cloud. No analytics. Your plants, photos, and questions never leave your phone.',
  },
  {
    icon: Leaf,
    title: 'A backup you own',
    body: 'Export your whole journal — photos included — as a single file you control. Import it anywhere, anytime.',
  },
];

export default function HomePage() {
  return (
    <main className="ios-safe-shell min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <section className="botanical-card paper-texture rounded-[2.5rem] px-6 py-12 text-center md:px-14 md:py-16">
          <div className="mb-6 flex justify-center">
            <MarigoldMark size={130} />
          </div>
          <h1 className="font-serif text-[clamp(3rem,9vw,5.5rem)] leading-none tracking-[-0.03em]">Planter</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-ink/75">
            A private plant journal with marigold roots. Photo timelines, care reminders, and on-device AI help —
            for the plants you live with.
          </p>
          <div className="mt-8">
            <AppStoreBadge />
          </div>
          <p className="mt-4 text-sm text-ink/50">For iPhone · iOS 18 or later · Free</p>
        </section>

        <DiamondBand />

        {/* Features */}
        <section className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="botanical-card rounded-[2rem] p-6">
              <feature.icon className="mb-4 h-7 w-7 text-moss" aria-hidden="true" />
              <h2 className="font-serif text-2xl">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">{feature.body}</p>
            </article>
          ))}
          <article
            className="rounded-[2rem] border border-ink/10 bg-moss p-6 text-paper"
            style={{ boxShadow: '0 18px 50px rgba(30, 42, 28, 0.1)' }}
          >
            <h2 className="font-serif text-2xl">Marigold roots</h2>
            <p className="mt-2 text-sm leading-6 text-paper/85">
              Planter is inspired by the gardens of Punjab and Mexico — where the same marigold garlands weddings
              and welcomes home the remembered. One flower, two homes, and now a journal for yours.
            </p>
          </article>
        </section>

        <DiamondBand />

        {/* Footer */}
        <footer className="pb-6 pt-2 text-center text-sm text-ink/60">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="font-semibold text-moss underline-offset-4 hover:underline">
              Privacy policy
            </Link>
            <a href={GITHUB_URL} className="inline-flex items-center gap-1.5 hover:text-ink">
              <Github className="h-4 w-4" aria-hidden="true" /> Source
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-1.5 hover:text-ink">
              <Mail className="h-4 w-4" aria-hidden="true" /> Contact
            </a>
          </div>
          <p className="mt-4 text-xs text-ink/40">
            All plant data stays on your device. This site sets no cookies and runs no trackers beyond basic,
            anonymous page analytics.
          </p>
        </footer>
      </div>
    </main>
  );
}
