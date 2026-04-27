import type { Trial } from '../services/types';

interface TrialDetailsCardProps {
  trial: Trial;
}

const formatDate = (value: number | null) => {
  if (!value) return 'TBD';
  return new Date(value).toLocaleString();
};

export default function TrialDetailsCard({ trial }: TrialDetailsCardProps) {
  return (
    <section className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-6 shadow-glow">
      <h2 className="mb-5 font-kashafBold text-2xl text-white">Trial Details</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-bg/70 p-4">
          <p className="text-xs uppercase text-subtle">Name</p>
          <p className="mt-1 text-lg text-white">{trial.trialName || '-'}</p>
        </div>
        <div className="rounded-2xl bg-bg/70 p-4">
          <p className="text-xs uppercase text-subtle">Date & Time</p>
          <p className="mt-1 text-lg text-white">{formatDate(trial.trialDateTime)}</p>
        </div>
        <div className="rounded-2xl bg-bg/70 p-4">
          <p className="text-xs uppercase text-subtle">Location</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-lg text-white">{trial.location || '-'}</p>
            {trial.mapsLink ? (
              <a
                href={trial.mapsLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg bg-primary/20 px-2 py-1 text-xs text-primary hover:bg-primary/30"
                title="Open in Maps"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {/* <span className="ml-1">Map</span> */}
              </a>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl bg-bg/70 p-4">
          <p className="text-xs uppercase text-subtle">Price</p>
          <p className="mt-1 text-lg text-white">EGP {Number(trial.price || 0).toLocaleString()}</p>
        </div>
      </div>
    </section>
  );
}
