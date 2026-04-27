export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-xs text-subtle">
      <p className="mb-5 text-sm font-kashafBold text-white/70 tracking-wide uppercase">Coming Soon On</p>
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        {/* App Store */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 opacity-60 cursor-not-allowed select-none">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <div className="text-left">
            <p className="text-[10px] text-white/50 leading-none">Download on the</p>
            <p className="text-sm font-kashafBold text-white leading-tight">App Store</p>
          </div>
        </div>

        {/* Google Play */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 opacity-60 cursor-not-allowed select-none">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.18 23.76c.3.17.64.22.99.16l13.1-7.37-2.84-2.84-11.25 10.05zM.5 1.4C.19 1.74 0 2.27 0 2.96v18.08c0 .69.19 1.22.51 1.56l.08.08 10.13-10.13v-.24L.58 1.32.5 1.4zM20.65 10.2l-2.83-1.59-3.18 3.18 3.18 3.18 2.85-1.6c.81-.46.81-1.2-.02-1.17zM4.17.24l13.1 7.37-2.84 2.84L3.18.4C3.52.17 3.86.1 4.17.24z"/>
          </svg>
          <div className="text-left">
            <p className="text-[10px] text-white/50 leading-none">Get it on</p>
            <p className="text-sm font-kashafBold text-white leading-tight">Google Play</p>
          </div>
        </div>
      </div>

      <p>Kashaf © {new Date().getFullYear()} · Built for quick trial registration.</p>
    </footer>
  );
}
