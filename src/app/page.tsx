import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="bg-[#004a32] text-white py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            OnePot <br /> Many Possibilities.
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-10 max-w-2xl">
            Experience the next generation of secure digital banking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="bg-white text-[#004a32] px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors"
            >
              Open an Account
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-md font-bold hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS SECTION */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 border border-gray-200 rounded-xl hover:shadow-xl transition-shadow group">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-6 font-bold text-xl group-hover:bg-[#004a32] group-hover:text-white transition-colors">
              $
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Checking Accounts
            </h3>
            <p className="text-gray-600 mb-4">
              Get paid up to two days early and enjoy no monthly fees with a
              qualifying deposit.
            </p>
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Learn more &rarr;
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-8 border border-gray-200 rounded-xl hover:shadow-xl transition-shadow group">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-6 font-bold text-xl group-hover:bg-[#004a32] group-hover:text-white transition-colors">
              %
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              High Yield Savings
            </h3>
            <p className="text-gray-600 mb-4">
              Watch your wealth grow with an industry leading APY and zero
              minimum balance requirements.
            </p>
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Learn more &rarr;
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-8 border border-gray-200 rounded-xl hover:shadow-xl transition-shadow group">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-6 font-bold text-xl group-hover:bg-[#004a32] group-hover:text-white transition-colors">
              💳
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Credit Cards
            </h3>
            <p className="text-gray-600 mb-4">
              Earn rewards on every purchase with a OnePot card.
            </p>
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Learn more &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER-LIKE CALLOUT */}
      <section className="bg-gray-50 py-16 px-6 text-center border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to get started?
        </h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Join over 1 million members who trust OnePot Banking for their
          financial future.
        </p>
        <Link
          href="/register"
          className="text-blue-600 font-bold hover:underline"
        >
          See all products and services
        </Link>
      </section>
    </div>
  );
}
