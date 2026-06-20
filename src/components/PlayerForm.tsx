import { FormEvent, useState } from 'react';
import type { PlayerFormInput } from '../lib/submitApplication';

interface PlayerFormProps {
  loading?: boolean;
  error?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  onSubmit: (values: PlayerFormInput) => Promise<void>;
}

interface PlayerFormState {
  email: string;
  mobileNumber: string;
  fullName: string;
  dateOfBirth: string;
  city: string;
  height: string;
  weight: string;
  preferredFoot: 'left' | 'right' | 'both';
  position: string;
  password: string;
  confirmPassword: string;
}

const cities = [
  'Cairo',
  'Alexandria',
  'Giza',
  'Dakahlia',
  'Red Sea',
  'Beheira',
  'Fayoum',
  'Gharbia',
  'Ismailia',
  'Menofia',
  'Minya',
  'Qalyubia',
  'New Valley',
  'Suez',
  'Aswan',
  'Assiut',
  'Beni Suef',
  'Port Said',
  'Damietta',
  'Sharkia',
  'South Sinai',
  'Kafr El Sheikh',
  'Matrouh',
  'Luxor',
  'Qena',
  'North Sinai',
  'Sohag',
];

const calcAge = (dob: string): number => {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const normalizeArabicNumerals = (text: string): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let normalized = text;
  arabicNumerals.forEach((arabic, index) => {
    normalized = normalized.replace(new RegExp(arabic, 'g'), englishNumerals[index]);
  });
  return normalized;
};

const normalizeToEgypt12 = (value: string): string => {
  const digits = normalizeArabicNumerals(value).replace(/[^\d]/g, '');

  if (digits.startsWith('0020')) return digits.slice(2);
  if (digits.startsWith('20') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 11) return `20${digits.slice(1)}`;
  if (digits.startsWith('1') && digits.length === 10) return `20${digits}`;

  return digits;
};

const validateMobileNumber = (value: string): boolean => {
  const normalized = normalizeToEgypt12(value);
  return /^20\d{10}$/.test(normalized);
};

export default function PlayerForm({ loading = false, error, minAge, maxAge, onSubmit }: PlayerFormProps) {
  const [values, setValues] = useState<PlayerFormState>({
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    city: 'Cairo',
    height: '',
    weight: '',
    preferredFoot: 'right' as const,
    position: 'Midfielder',
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);

  const handleDobChange = (dob: string) => {
    setValues((prev) => ({ ...prev, dateOfBirth: dob }));
    if (!dob) { setAgeError(null); return; }
    const age = calcAge(dob);
    if (minAge != null && age < minAge) {
      setAgeError(`You must be at least ${minAge} years old to apply.`);
    } else if (maxAge != null && age > maxAge) {
      setAgeError(`You must be ${maxAge} years old or younger to apply.`);
    } else {
      setAgeError(null);
    }
  };

  const handleMobileChange = (value: string) => {
    setValues((prev) => ({ ...prev, mobileNumber: value }));
    if (!value) {
      setMobileError(null);
      return;
    }
    if (!validateMobileNumber(value)) {
      setMobileError('Please enter a valid Egyptian mobile number');
    } else {
      setMobileError(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profilePic || ageError || mobileError) return;

    if (values.password !== values.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (values.password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordError(null);

    const normalizedMobile = normalizeToEgypt12(values.mobileNumber);

    await onSubmit({
      email: values.email.trim(),
      mobileNumber: normalizedMobile,
      password: values.password,
      fullName: values.fullName.trim(),
      dateOfBirth: values.dateOfBirth,
      city: values.city,
      height: Number(values.height || 0),
      weight: Number(values.weight || 0),
      preferredFoot: values.preferredFoot,
      position: values.position,
      profilePic,
    });
  };

  const inputClass =
    'w-full rounded-xl border border-white/15 bg-bg px-4 py-3 text-white outline-none focus:border-primary';
  const selectClass = `${inputClass} pr-10 appearance-none`;
  const dateClass = `${inputClass} [color-scheme:dark]`;

  const Chevron = () => (
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6">
      <h2 className="mb-2 font-kashafBold text-2xl text-white">Apply Now</h2>
      <p className="mb-6 text-sm text-subtle">Fill your profile info and submit to secure your trial spot.</p>

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 items-start">
        <div className="flex flex-col">
          <label className="mb-2 block text-sm text-subtle">Email</label>
          <input
            className={inputClass}
            type="email"
            placeholder="Email"
            required
            value={values.email}
            onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-sm text-subtle">Mobile number</label>
          <div className="flex gap-2">
            <div className="flex h-12 w-24 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3">
              <span className="text-sm text-white">🇪🇬 +20</span>
            </div>
            <input
              className={`${inputClass} flex-1 ${mobileError ? ' border-error' : ''}`}
              type="tel"
              placeholder="1xxxxxxxxx"
              required
              value={values.mobileNumber}
              onChange={(e) => handleMobileChange(e.target.value)}
              maxLength={11}
            />
          </div>
          {mobileError && <p className="mt-1 text-xs text-error">{mobileError}</p>}
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-sm text-subtle">Password</label>
          <input
            className={inputClass}
            type="password"
            placeholder="Password"
            required
            value={values.password}
            onChange={(e) => setValues((prev) => ({ ...prev, password: e.target.value }))}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-sm text-subtle">Confirm password</label>
          <input
            className={inputClass}
            type="password"
            placeholder="Confirm password"
            required
            value={values.confirmPassword}
            onChange={(e) => setValues((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-sm text-subtle">Full name</label>
          <input
            className={inputClass}
            type="text"
            placeholder="Full name"
            required
            value={values.fullName}
            onChange={(e) => setValues((prev) => ({ ...prev, fullName: e.target.value }))}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-sm text-subtle">Date of birth</label>
          <input
            className={`${dateClass}${ageError ? ' border-error' : ''}`}
            type="date"
            required
            value={values.dateOfBirth}
            onChange={(e) => handleDobChange(e.target.value)}
          />
          {(minAge != null || maxAge != null) && (
            <p className={`mt-1 text-xs ${ageError ? 'text-error' : 'text-subtle'}`}>
              {ageError ?? `Age requirement: ${minAge ?? '?'}–${maxAge ?? '?'} years old`}
            </p>
          )}
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-sm text-subtle">City</label>
          <div className="relative">
            <select
              className={selectClass}
              value={values.city}
              onChange={(e) => setValues((prev) => ({ ...prev, city: e.target.value }))}
            >
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-sm text-subtle">Height (cm)</label>
          <input
            className={inputClass}
            type="number"
            placeholder="Height (cm)"
            required
            value={values.height}
            onChange={(e) => setValues((prev) => ({ ...prev, height: e.target.value }))}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-sm text-subtle">Weight (kg)</label>
          <input
            className={inputClass}
            type="number"
            placeholder="Weight (kg)"
            required
            value={values.weight}
            onChange={(e) => setValues((prev) => ({ ...prev, weight: e.target.value }))}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-sm text-subtle">Preferred foot</label>
          <div className="relative">
            <select
              className={selectClass}
              value={values.preferredFoot}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, preferredFoot: e.target.value as 'left' | 'right' | 'both' }))
              }
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="both">Both</option>
            </select>
            <Chevron />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-sm text-subtle">Position</label>
          <div className="relative">
            <select
              className={selectClass}
              value={values.position}
              onChange={(e) => setValues((prev) => ({ ...prev, position: e.target.value }))}
            >
              <option>Goalkeeper</option>
              <option>Defender</option>
              <option>Midfielder</option>
              <option>Winger</option>
              <option>Forward</option>
            </select>
            <Chevron />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm text-subtle">Profile picture</label>
          <input
            className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-bg`}
            type="file"
            accept="image/*"
            required
            onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
          />
        </div>

        {error ? <p className="sm:col-span-2 text-sm text-error">{error}</p> : null}
        {passwordError ? <p className="sm:col-span-2 text-sm text-error">{passwordError}</p> : null}

        <button
          type="submit"
          className="sm:col-span-2 rounded-xl bg-primary px-4 py-3 font-kashafBold text-bg transition hover:opacity-90 disabled:opacity-60"
          disabled={loading || !profilePic || !!ageError}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </section>
  );
}
