const DEFAULT_PAYMENT_NUMBER = '01066306638';

interface ThankYouPanelProps {
  whatsappNumber?: string;
}

export default function ThankYouPanel({ whatsappNumber }: ThankYouPanelProps) {
  const rawNumber = whatsappNumber || DEFAULT_PAYMENT_NUMBER;
  const paymentNumber = rawNumber.startsWith('2') ? rawNumber.slice(1) : rawNumber;
  const waLink = `https://wa.me/2${paymentNumber}`;

  return (
    <section className="rounded-3xl border border-primary/30 bg-surface p-6 shadow-glow">
      <h2 className="font-kashafBold text-2xl text-white">You're Almost There! 🎉</h2>
      <p className="mt-2 text-subtle">
        Your application has been submitted successfully. Complete your payment to confirm your spot at the trial.
      </p>

      <div className="mt-6 flex flex-col items-center gap-5 rounded-2xl bg-bg/70 p-6 text-center">
        <div className="flex items-center gap-4">
          <img src="/instapay-logo.png" alt="InstaPay" className="h-32 object-contain" />
          <img src="/Vodafone Cash Icon.webp" alt="Vodafone Cash" className="h-20 object-contain" />
        </div>

        <div className="w-full rounded-xl border border-primary/40 bg-primary/10 px-5 py-4">
          <p className="text-sm text-subtle">Pay via InstaPay or Vodafone Cash to the wallet number below</p>
          <p className="mt-1 font-kashafBold text-3xl tracking-widest text-primary">{paymentNumber}</p>
        </div>

        <div className="w-full space-y-2 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm text-subtle">
          <p className="font-kashafBold text-white">Next Steps:</p>
          <p>1. Open your bank app and transfer the trial fee to {paymentNumber} mobile wallet using InstaPay or Vodafone Cash.</p>
          <p>2. Save a screenshot of your payment confirmation.</p>
          <p>3. Send the screenshot via WhatsApp to the same number to complete your registration.</p>
        </div>

        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-kashafBold text-white transition hover:opacity-90"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.529 5.845L.057 23.887a.5.5 0 00.609.61l6.101-1.459A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.877 9.877 0 01-5.034-1.377l-.36-.214-3.733.893.924-3.639-.234-.374A9.856 9.856 0 012.118 12C2.118 6.533 6.533 2.118 12 2.118S21.882 6.533 21.882 12 17.467 21.882 12 21.882z"/>
          </svg>
          Send Payment Screenshot on WhatsApp
        </a>

        <div className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center">
          <p className="text-sm text-subtle">
            Want to track your application status? Download the app and login to your account to stay updated.
          </p>
        </div>
      </div>
    </section>
  );
}
