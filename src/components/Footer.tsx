const STORE_URLS = {
  ios: 'https://apps.apple.com/eg/app/kashaf-soccer/id6763345502',
  android: 'https://play.google.com/store/apps/details?id=com.Kashaf.Soccer',
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-xs text-subtle">
      <p className="mb-4 text-lg font-kashafBold text-white/70 tracking-wide uppercase">Download Now</p>
      <div className="flex flex-wrap items-center justify-center gap-8 mb-4">
        {/* App Store */}
        <a
          href={STORE_URLS.ios}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center overflow-hidden"
        >
          <img src="/App Store Apple Logo.png" alt="App Store" className="h-12 w-auto object-contain" />
        </a>

        {/* Google Play */}
        <a
          href={STORE_URLS.android}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center overflow-hidden"
        >
          <img src="/Google Play Android App Logo.png" alt="Google Play" className="h-12 w-auto object-contain" />
        </a>
      </div>

      <p>Kashaf © {new Date().getFullYear()} · Built for quick trial registration.</p>
    </footer>
  );
}
