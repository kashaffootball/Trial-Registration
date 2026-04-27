import { FormEvent, useState } from 'react';

interface LoginModalProps {
  open: boolean;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
}

export default function LoginModal({
  open,
  loading = false,
  error,
  onClose,
  onSubmit,
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-primary/30 bg-surface p-5 shadow-glow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-kashafBold text-xl text-white">Club Login</h2>
          <button onClick={onClose} className="text-sm text-subtle hover:text-white" type="button">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full rounded-xl border border-white/15 bg-bg px-4 py-3 text-white outline-none focus:border-primary"
            placeholder="Club email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-white/15 bg-bg px-4 py-3 text-white outline-none focus:border-primary"
            placeholder="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? <p className="text-sm text-error">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 font-kashafBold text-bg transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
