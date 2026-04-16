import Link from "next/link";
import { redirect } from "next/navigation";
// import { getServerSession } from "next-auth"; // Uncomment when auth is ready

export default function HomePage() {
  // CRITERIA 6: Redirect if logged in (Pseudo-code for now)
  // const session = await getServerSession();
  // if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HERO SECTION */}
      <section className="bg-[#1a6e3f] text-white py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Banking that works for you
          </h1>
          <p className="text-xl md:text-2xl text-green-50 mb-10 max-w-2xl">
            Experience the next generation of secure digital banking with
            OnePot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="bg-white text-[#1a6e3f] px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Open an account
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-md font-bold hover:bg-white/10 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4 text-[#1a6e3f]">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Instant Transfers
            </h3>
            <p className="text-gray-600">
              Move money between pots or to friends instantly with zero fees.
            </p>
          </div>
          {/* Card 2 */}
          <div className="p-8 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4 text-[#1a6e3f]">🛡️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Virtual Cards
            </h3>
            <p className="text-gray-600">
              Bank securely with disposable cards that keep your account safe.
            </p>
          </div>
          {/* Card 3 */}
          <div className="p-8 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4 text-[#1a6e3f]">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Spending Insights
            </h3>
            <p className="text-gray-600">
              Track every penny with AI powered insights.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-white font-bold text-xl">OnePot Bank</div>
          <div className="text-sm text-center md:text-right text-gray-500">
            <p>© 2026 OnePot Banking. All rights reserved.</p>
            <p className="mt-1 italic font-medium">
              Demo app — not a real bank. For educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
