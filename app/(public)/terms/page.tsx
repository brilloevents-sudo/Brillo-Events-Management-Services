export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8 text-xs text-slate-300 leading-relaxed">
      <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-200 text-xs">
        <strong>Legal Notice:</strong> These terms represent the operational framework for Brillo Events Management Service and must undergo Philippine legal counsel review before commercial launch.
      </div>

      <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
      <p className="text-slate-400">Effective Date: October 2026</p>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">1. Quotation &amp; Estimate Nature</h2>
        <p>
          Starting prices (e.g. ₱18,000 for Metro Manila corporate blocks, +30% provincial starting calculation, or Dec 24/25 ranges) displayed on our public website are planning estimates. Official binding terms are established only upon execution of an approved Service Agreement.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">2. Temporary Holds</h2>
        <p>
          A temporary 24-hour soft hold reserves a calendar slot temporarily but does not constitute a secured booking. Soft holds automatically release upon expiration unless a signed agreement and verified payment are completed.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">3. Standard 50% Downpayment Policy</h2>
        <p>
          Unless an executed contract explicitly contains an approved alternate arrangement (such as an institutional government or corporate no-downpayment clause), a non-refundable 50% reservation downpayment is required to lock dates.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">4. Governing Law</h2>
        <p>
          These service engagements are governed by the laws of the Republic of the Philippines.
        </p>
      </section>
    </div>
  );
}
