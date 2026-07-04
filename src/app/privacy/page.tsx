import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Planter',
  description: 'Planter keeps everything on your device. No accounts, no analytics, no tracking.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-ink/75">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="ios-safe-shell min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-2xl">
        <article className="botanical-card rounded-[2.5rem] px-6 py-10 md:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-earth">Planter for iOS</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-ink/55">Last updated: July 2026</p>
          <p className="mt-6 text-base leading-7 text-ink/75">
            Planter is a plant-care journal that keeps everything on your device. This policy is short because
            there isn&apos;t much to disclose.
          </p>

          <Section title="What Planter stores">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Plants, notes, and reminders</strong> you create are stored in the app&apos;s private
                database on your device.
              </li>
              <li>
                <strong>Photos</strong> you take or pick are copied into the app&apos;s private storage on your
                device. Planter never writes to your photo library.
              </li>
              <li>
                <strong>Assistant conversations</strong> are stored on your device alongside your plant journal.
              </li>
            </ul>
          </Section>

          <Section title="What leaves your device">
            <p>Nothing, unless you explicitly send it:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Backups</strong> are files you create with the Export button. You choose where they go
                (Files, iCloud Drive, AirDrop, etc.), and you can delete them at any time.
              </li>
            </ul>
            <p>That&apos;s the complete list. Planter has:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>No user accounts</li>
              <li>No analytics or telemetry</li>
              <li>No advertising or tracking</li>
              <li>No third-party SDKs that collect data</li>
              <li>No server — the app works fully offline</li>
            </ul>
          </Section>

          <Section title="AI features">
            <p>
              The assistant runs entirely on your device. On iPhones with Apple Intelligence, answers are generated
              by Apple&apos;s on-device model; on other devices, answers come from a built-in plant-care guide
              bundled inside the app. Your questions, plant details, and photos are never sent to Planter,
              Apple&apos;s servers, or any third party by this app.
            </p>
          </Section>

          <Section title="Permissions Planter asks for">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Camera</strong> — only when you take a progress photo. Photos stay in the app.
              </li>
              <li>
                <strong>Photo library picker</strong> — uses Apple&apos;s out-of-process picker, so Planter only
                receives the specific photos you choose.
              </li>
              <li>
                <strong>Notifications</strong> — only if you set a care reminder, so the app can remind you on the
                day care is due.
              </li>
            </ul>
          </Section>

          <Section title="Data deletion">
            <p>
              Deleting a plant deletes its photos and notes. Deleting the app deletes everything the app stored on
              the device (backups you exported elsewhere remain wherever you put them).
            </p>
          </Section>

          <Section title="Children">
            <p>Planter does not collect data from anyone, including children.</p>
          </Section>

          <Section title="Changes">
            <p>
              If a future version of Planter ever changes what data is handled (for example, optional cloud sync),
              this policy will be updated first and the change will be opt-in.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions? Email{' '}
              <a href="mailto:mpreciado1997@gmail.com" className="font-semibold text-moss underline underline-offset-4">
                mpreciado1997@gmail.com
              </a>
              .
            </p>
          </Section>

          <p className="mt-10">
            <Link href="/" className="text-sm font-bold text-moss underline-offset-4 hover:underline">
              ← Back to Planter
            </Link>
          </p>
        </article>
      </div>
    </main>
  );
}
