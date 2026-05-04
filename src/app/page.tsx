import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">

      {/* ────────────────────────── HERO ────────────────────────── */}
      <section className="relative bg-[#faf8f3] overflow-hidden">
        {/* Geometric shapes — midcentury modern background */}
        <div className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full bg-[#1a6e3f]/10 pointer-events-none" />
        <div className="absolute top-1/2 -right-10 w-[180px] h-[180px] rounded-full border-2 border-[#1a6e3f]/20 pointer-events-none" />
        <div className="absolute bottom-0 left-[10%] w-[120px] h-[120px] rounded-full bg-[#c8a45a]/15 pointer-events-none" />
        <div className="absolute top-16 left-[5%] w-[60px] h-[60px] rounded-full bg-[#1a6e3f]/8 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-36 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#1a6e3f]/10 text-[#1a6e3f] px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a6e3f] inline-block" />
              The bank for shared lives
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black text-[#0d3d22] leading-[1.05] tracking-tight mb-6">
              Money that<br />
              <span className="italic text-[#1a6e3f]">moves</span><br />
              together.
            </h1>

            <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10 max-w-md">
              One account. Shared pots for rent, bills, and holidays.
              Zero friction between you and the people you share your life with.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#1a6e3f] text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#0d3d22] transition-all shadow-lg shadow-green-900/20 hover:shadow-none"
              >
                Open your account
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-7 py-3.5 rounded-xl font-semibold text-sm hover:border-[#1a6e3f] hover:text-[#1a6e3f] transition-all"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Hero card preview */}
          <div className="hidden md:flex justify-center">
            <div className="relative">
              {/* Back card */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 bg-[#1a6e3f]/30 rounded-3xl" />
              {/* Main card */}
              <div className="relative bg-[#0e1c2f] rounded-3xl p-7 w-80 shadow-2xl">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">Available balance</p>
                <p className="text-white text-4xl font-bold tracking-tight mb-5">£3,542.18</p>
                <div className="h-px bg-white/10 mb-4" />
                <div className="flex gap-6 text-sm mb-5">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Account</p>
                    <p className="font-semibold text-gray-200">10001001</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Sort code</p>
                    <p className="font-semibold text-gray-200">30-00-01</p>
                  </div>
                </div>
                {/* Mini pot preview */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-white text-xs font-semibold">House Rent - April</p>
                    <span className="text-emerald-400 text-xs font-bold">✓ Paid</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "100%" }} />
                  </div>
                  <p className="text-gray-400 text-xs mt-2">£1,800 / £1,800 · 3 members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────── FEATURES ────────────────────────── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-[#1a6e3f] text-xs font-semibold uppercase tracking-widest mb-2">What we do differently</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#0d3d22] leading-tight">
              Built for the way<br />you actually live.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-gray-100 rounded-2xl overflow-hidden">
            {[
              {
                num: "01",
                title: "Shared Pots",
                body: "Pool money with flatmates, friends, or family for rent, bills, holidays, or anything else. Every member contributes on their own terms.",
                accent: "bg-[#f0fdf4]",
              },
              {
                num: "02",
                title: "Instant Transfers",
                body: "Send money to any OnePot member in seconds. No sorting codes, no delays. Just a name and an amount.",
                accent: "bg-[#faf8f3]",
              },
              {
                num: "03",
                title: "Spending Insights",
                body: "See exactly where your money goes: groceries, eating out, bills, broken down clearly every month.",
                accent: "bg-white",
              },
            ].map(({ num, title, body, accent }) => (
              <div key={num} className={`${accent} p-8 md:p-10`}>
                <p className="font-serif text-6xl font-black text-[#1a6e3f]/20 leading-none mb-4">{num}</p>
                <h3 className="text-lg font-bold text-[#0d3d22] mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────── HOW IT WORKS ────────────────────────── */}
      <section className="bg-[#faf8f3] py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#1a6e3f] text-xs font-semibold uppercase tracking-widest mb-2">Simple by design</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#0d3d22] mb-16 leading-tight">
            Up and running<br />in three steps.
          </h2>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { step: "1", title: "Open your account", body: "Register in under two minutes. No branch visit, no paperwork." },
              { step: "2", title: "Create a shared pot", body: "Name it, set a target, invite your people. Everyone contributes at their own pace." },
              { step: "3", title: "Move money freely", body: "Transfer between your balance and pots, or send directly to any OnePot member." },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#1a6e3f] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-green-900/20">
                  {step}
                </div>
                <div>
                  <h3 className="font-bold text-[#0d3d22] mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#1a6e3f] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#0d3d22] transition-all shadow-lg shadow-green-900/20 hover:shadow-none"
            >
              Get started - it's free
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────────────── FOOTER ────────────────────────── */}
      <footer className="bg-[#0d3d22] text-gray-400 py-14 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-[#1a6e3f] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 11h16v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9z"/>
                  <path d="M8 11V7a4 4 0 018 0v4"/>
                </svg>
              </div>
              <span className="text-white font-bold text-base">OnePot</span>
            </div>
            <p className="text-xs text-gray-500">Banking for shared lives.</p>
          </div>
          <div className="text-right text-xs text-gray-600 space-y-1">
            <p>© 2026 OnePot Banking. All rights reserved.</p>
            <p className="italic">Demo application. Not a real bank. Educational purposes only.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
