import { FormEvent, useState } from 'react';
import type { Trial } from '../services/types';

interface TrialDetailsEditorProps {
  trial: Trial;
  clubWhatsappNumber?: string;
  loading?: boolean;
  onSave: (payload: {
    trialName: string;
    trialDateTime: string;
    location: string;
    mapsLink: string;
    price: number;
    minAge: number;
    maxAge: number;
    maxParticipants: number;
    remainingSeats: number;
    clubWhatsappNumber: string;
  }) => Promise<void>;
}

const toDateTimeLocal = (value: number | null): string => {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function TrialDetailsEditor({ trial, clubWhatsappNumber = '', loading = false, onSave }: TrialDetailsEditorProps) {
  const [trialName, setTrialName] = useState(trial.trialName || '');
  const [trialDateTime, setTrialDateTime] = useState(toDateTimeLocal(trial.trialDateTime));
  const [location, setLocation] = useState(trial.location || '');
  const [mapsLink, setMapsLink] = useState(trial.mapsLink || '');
  const [price, setPrice] = useState(String(trial.price || 0));
  const [minAge, setMinAge] = useState(String(trial.minAge ?? ''));
  const [maxAge, setMaxAge] = useState(String(trial.maxAge ?? ''));
  const [maxParticipants, setMaxParticipants] = useState(String(trial.maxParticipants ?? ''));
  const cleanNumber = (n: string) => n.startsWith('2') ? n.slice(1) : n;
  const [whatsappNumber, setWhatsappNumber] = useState(cleanNumber(clubWhatsappNumber));
  const [whatsappError, setWhatsappError] = useState('');

  const inputClass =
    'w-full rounded-xl border border-white/15 bg-bg px-4 py-3 text-white outline-none focus:border-primary';
  const labelClass = 'block text-sm text-subtle mb-1.5';
  const errorClass = 'sm:col-span-2 text-xs text-error';

  const isValidWhatsapp = (n: string) => /^\d{11}$/.test(n);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValidWhatsapp(whatsappNumber)) {
      setWhatsappError('Mobile number must be exactly 11 digits (e.g. 01066306638).');
      return;
    }
    setWhatsappError('');

    const newMax = Number(maxParticipants || 0);
    const appliedSpots = trial.maxParticipants - (trial.remainingSeats ?? 0);
    const newRemainingSeats = Math.max(0, newMax - appliedSpots);

    await onSave({
      trialName,
      trialDateTime: trialDateTime ? new Date(trialDateTime).toISOString() : '',
      location,
      mapsLink,
      price: Number(price || 0),
      minAge: Number(minAge || 0),
      maxAge: Number(maxAge || 0),
      maxParticipants: newMax,
      remainingSeats: newRemainingSeats,
      clubWhatsappNumber: '2' + whatsappNumber,
    });
  };

  return (
    <section className="rounded-3xl border border-primary/35 bg-surface p-6">
      <h3 className="mb-4 font-kashafBold text-xl text-white">Edit Trial Details</h3>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Trial Name</label>
          <input className={inputClass} value={trialName} onChange={(e) => setTrialName(e.target.value)} placeholder="Trial name" />
        </div>
        <div>
          <label className={labelClass}>Trial Date & Time</label>
          <input
            className={`${inputClass} [color-scheme:dark]`}
            type="datetime-local"
            value={trialDateTime}
            onChange={(e) => setTrialDateTime(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
        </div>
        <div>
          <label className={labelClass}>Google Maps Link (optional)</label>
          <input className={inputClass} value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} placeholder="https://maps.app.goo.gl/..." />
        </div>
        <div>
          <label className={labelClass}>Price (EGP)</label>
          <input className={inputClass} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (EGP)" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Min Age</label>
            <input className={inputClass} type="number" min={0} value={minAge} onChange={(e) => setMinAge(e.target.value)} placeholder="Min age" />
          </div>
          <div>
            <label className={labelClass}>Max Age</label>
            <input className={inputClass} type="number" min={0} value={maxAge} onChange={(e) => setMaxAge(e.target.value)} placeholder="Max age" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Max Participants (total spots)</label>
          <input className={inputClass} type="number" min={1} value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} placeholder="Max participants (total spots)" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Club WhatsApp / InstaPay Number</label>
          <input
            className={`${inputClass} ${whatsappError ? 'border-error focus:border-error' : ''}`}
            type="tel"
            value={whatsappNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 11);
              setWhatsappNumber(val);
              if (whatsappError && isValidWhatsapp(val)) setWhatsappError('');
            }}
            placeholder="01XXXXXXXXX (11 digits)"
          />
        </div>
        {whatsappError && <p className={errorClass}>{whatsappError}</p>}

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
