import { FormEvent, useState } from 'react';
import type { Trial } from '../services/types';

interface TrialDetailsEditorProps {
  trial: Trial;
  loading?: boolean;
  onSave: (payload: {
    trialName: string;
    trialDateTime: string;
    location: string;
    price: number;
    minAge: number;
    maxAge: number;
    maxParticipants: number;
  }) => Promise<void>;
}

const toDateTimeLocal = (value: number | null): string => {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function TrialDetailsEditor({ trial, loading = false, onSave }: TrialDetailsEditorProps) {
  const [trialName, setTrialName] = useState(trial.trialName || '');
  const [trialDateTime, setTrialDateTime] = useState(toDateTimeLocal(trial.trialDateTime));
  const [location, setLocation] = useState(trial.location || '');
  const [price, setPrice] = useState(String(trial.price || 0));
  const [minAge, setMinAge] = useState(String(trial.minAge ?? ''));
  const [maxAge, setMaxAge] = useState(String(trial.maxAge ?? ''));
  const [maxParticipants, setMaxParticipants] = useState(String(trial.maxParticipants ?? ''));

  const inputClass =
    'w-full rounded-xl border border-white/15 bg-bg px-4 py-3 text-white outline-none focus:border-primary';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSave({
      trialName,
      trialDateTime: trialDateTime ? new Date(trialDateTime).toISOString() : '',
      location,
      price: Number(price || 0),
      minAge: Number(minAge || 0),
      maxAge: Number(maxAge || 0),
      maxParticipants: Number(maxParticipants || 0),
    });
  };

  return (
    <section className="rounded-3xl border border-primary/35 bg-surface p-6">
      <h3 className="mb-4 font-kashafBold text-xl text-white">Edit Trial Details</h3>
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <input className={inputClass} value={trialName} onChange={(e) => setTrialName(e.target.value)} placeholder="Trial name" />
        <input
          className={`${inputClass} [color-scheme:dark]`}
          type="datetime-local"
          value={trialDateTime}
          onChange={(e) => setTrialDateTime(e.target.value)}
        />
        <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
        <input className={inputClass} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (EGP)" />
        <input className={inputClass} type="number" min={0} value={minAge} onChange={(e) => setMinAge(e.target.value)} placeholder="Min age" />
        <input className={inputClass} type="number" min={0} value={maxAge} onChange={(e) => setMaxAge(e.target.value)} placeholder="Max age" />
        <input className={`${inputClass} sm:col-span-2`} type="number" min={1} value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} placeholder="Max participants (total spots)" />

        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 rounded-xl bg-primary px-4 py-3 font-kashafBold text-bg"
        >
          {loading ? 'Saving...' : 'Save Trial'}
        </button>
      </form>
    </section>
  );
}
