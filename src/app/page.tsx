import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfcf9] overflow-x-hidden">
      {/* ────────────────────────── HERO ────────────────────────── */}
      <section className="relative min-h-[700px] flex items-center overflow-hidden px-6 py-20">
        {/* The Illustration Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt="Hero Background"
            fill
            className="object-cover object-right-bottom opacity-30 md:opacity-100"
            priority
          />
          {/* Gradient Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fdfcf9] via-[#fdfcf9]/90 to-transparent md:via-[#fdfcf9]/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side: Copy */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 mb-6 bg-[#1a6e3f]/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#1a6e3f]" />
              <span className="text-[#1a6e3f] text-xs font-bold uppercase tracking-widest">
                The bank for shared lives
              </span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl font-black text-[#0d3d22] leading-[1.1] mb-6">
              Money that
              <br />
              <span className="italic text-[#1a6e3f]">moves</span>
              <br />
              together.
            </h1>

            <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10 max-w-md">
              One account. Shared pots for rent, bills, and holidays. Zero
              friction between you and the people you share your life with.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="bg-[#1a6e3f] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#0d3d22] transition-all text-center shadow-lg shadow-green-900/20"
              >
                Open your account →
              </Link>
              <Link
                href="/login"
                className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all text-center"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Right Side: Floating Balance Card */}
          <div className="hidden md:flex justify-end pr-10">
            <div className="relative bg-[#0e1c2f] rounded-[2.5rem] p-9 w-[360px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] animate-float border border-white/5">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-4 font-medium">
                Available balance
              </p>
              <p className="text-white text-5xl font-bold tracking-tight mb-10">
                £3,542.18
              </p>

              <div className="flex gap-10 text-sm mb-10">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1 font-bold">
                    Account
                  </p>
                  <p className="font-mono text-gray-200 text-base">10001001</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1 font-bold">
                    Sort code
                  </p>
                  <p className="font-mono text-gray-200 text-base">30-00-01</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-white text-sm font-semibold">
                    House Rent - April
                  </p>
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Paid
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="flex justify-between mt-3">
                  <p className="text-gray-400 text-[11px]">£1,800 / £1,800</p>
                  <p className="text-gray-400 text-[11px]">3 members</p>
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
            <p className="text-[#1a6e3f] text-xs font-semibold uppercase tracking-widest mb-2">
              What we do differently
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#0d3d22] leading-tight">
              Built for the way
              <br />
              you actually live.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-gray-100 rounded-2xl overflow-hidden">
            {[
              {
                num: "01",
                title: "Shared Pots",
                body: "Pool money with flatmates, friends, or family for rent, bills, holidays, or anything else.",
                accent: "bg-[#f0fdf4]",
              },
              {
                num: "02",
                title: "Instant Transfers",
                body: "Send money to any OnePot member in seconds. No sorting codes, no delays.",
                accent: "bg-[#faf8f3]",
              },
              {
                num: "03",
                title: "Spending Insights",
                body: "See exactly where your money goes: groceries, eating out, bills, broken down clearly.",
                accent: "bg-white",
              },
            ].map(({ num, title, body, accent }) => (
              <div key={num} className={`${accent} p-8 md:p-10`}>
                <p className="font-serif text-6xl font-black text-[#1a6e3f]/20 leading-none mb-4">
                  {num}
                </p>
                <h3 className="text-lg font-bold text-[#0d3d22] mb-3">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────── FOOTER ────────────────────────── */}
      <footer className="bg-[#0d3d22] text-gray-400 py-14 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-bold text-xl tracking-tight">
                OnePot
              </span>
            </div>
            <p className="text-xs text-gray-500">Banking for shared lives.</p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>© 2026 OnePot Banking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
