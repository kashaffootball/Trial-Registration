import { useRef } from 'react';

interface HeaderProps {
  onOwnerTrigger: () => void;
}

export default function Header({ onOwnerTrigger }: HeaderProps) {
  const touchTimer = useRef<number | null>(null);

  const handleTouchStart = () => {
    touchTimer.current = window.setTimeout(() => {
      onOwnerTrigger();
      touchTimer.current = null;
    }, 650);
  };

  const clearTouchTimer = () => {
    if (touchTimer.current) {
      window.clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-bg/85 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Kashaf" className="h-10 w-10 rounded-xl object-cover ring-1 ring-primary/50" />
          <div>
            <p className="font-kashafBold text-sm tracking-wide text-primary">KASHAF</p>
            <p className="text-xs text-subtle">Trial Registration</p>
          </div>
        </div>

        <button
          type="button"
          onDoubleClick={onOwnerTrigger}
          onTouchStart={handleTouchStart}
          onTouchEnd={clearTouchTimer}
          onTouchCancel={clearTouchTimer}
          className="rounded-full border border-white/15 p-1 transition hover:border-primary/60"
          aria-label="Club owner access"
        >
          <img
            src="/Logo Transparent.png"
            alt="Kashaf"
            className="h-11 w-11 rounded-full object-contain bg-white p-0.5"
          />
        </button>
      </div>
    </header>
  );
}
