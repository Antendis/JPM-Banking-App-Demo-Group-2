"use client";

import { useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  date: string;
  reference: string;
  counterparty: string;
}

const MOCK_ACCOUNT = {
  firstName: "Jamie",
  balance: 4218.63,
  accountNumber: "12345678",
  sortCode: "60-00-01",
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    description: "Tesco Express",
    category: "GROCERIES",
    amount: 12.45,
    type: "DEBIT",
    date: "2026-04-20T14:32:00Z",
    reference: "TESCO*EXPRESS",
    counterparty: "Tesco Stores Ltd",
  },
  {
    id: "2",
    description: "Salary",
    category: "INCOME",
    amount: 2850.0,
    type: "CREDIT",
    date: "2026-04-19T09:00:00Z",
    reference: "BACS SALARY APR26",
    counterparty: "Acme Corp Ltd",
  },
  {
    id: "3",
    description: "Netflix",
    category: "ENTERTAINMENT",
    amount: 17.99,
    type: "DEBIT",
    date: "2026-04-18T00:00:00Z",
    reference: "NETFLIX.COM",
    counterparty: "Netflix International",
  },
  {
    id: "4",
    description: "Pret A Manger",
    category: "EATING_OUT",
    amount: 8.1,
    type: "DEBIT",
    date: "2026-04-17T12:15:00Z",
    reference: "PRET A MANGER",
    counterparty: "Pret A Manger (Europe)",
  },
  {
    id: "5",
    description: "TfL Travel",
    category: "TRANSPORT",
    amount: 4.8,
    type: "DEBIT",
    date: "2026-04-16T08:44:00Z",
    reference: "TFL CONTACTLESS",
    counterparty: "Transport for London",
  },
  {
    id: "6",
    description: "Amazon Marketplace",
    category: "SHOPPING",
    amount: 34.99,
    type: "DEBIT",
    date: "2026-04-15T18:22:00Z",
    reference: "AMZ*MARKETPLACE",
    counterparty: "Amazon EU Sarl",
  },
  {
    id: "7",
    description: "Spotify",
    category: "ENTERTAINMENT",
    amount: 11.99,
    type: "DEBIT",
    date: "2026-04-14T09:00:00Z",
    reference: "SPOTIFY",
    counterparty: "Spotify Ltd",
  },
  {
    id: "8",
    description: "Starbucks",
    category: "EATING_OUT",
    amount: 5.45,
    type: "DEBIT",
    date: "2026-04-13T10:12:00Z",
    reference: "STARBUCKS STORE",
    counterparty: "Starbucks UK",
  },
  {
    id: "9",
    description: "Council Tax",
    category: "BILLS",
    amount: 140.0,
    type: "DEBIT",
    date: "2026-04-12T00:00:00Z",
    reference: "COUNCIL TAX APR",
    counterparty: "Southampton City Council",
  },
  {
    id: "10",
    description: "Refund - Amazon",
    category: "SHOPPING",
    amount: 19.99,
    type: "CREDIT",
    date: "2026-04-11T15:30:00Z",
    reference: "REFUND AMAZON",
    counterparty: "Amazon EU Sarl",
  },
];

const CATEGORY_MAP: Record<string, { label: string; pill: string; avatar: string }> = {
  GROCERIES:     { label: "Groceries",     pill: "bg-emerald-100 text-emerald-700", avatar: "bg-emerald-500" },
  INCOME:        { label: "Income",        pill: "bg-green-100 text-green-700",     avatar: "bg-green-500" },
  ENTERTAINMENT: { label: "Entertainment", pill: "bg-purple-100 text-purple-700",   avatar: "bg-purple-500" },
  EATING_OUT:    { label: "Eating Out",    pill: "bg-orange-100 text-orange-700",   avatar: "bg-orange-400" },
  TRANSPORT:     { label: "Transport",     pill: "bg-blue-100 text-blue-700",       avatar: "bg-blue-500" },
  BILLS:         { label: "Bills",         pill: "bg-red-100 text-red-700",         avatar: "bg-red-500" },
  SHOPPING:      { label: "Shopping",      pill: "bg-pink-100 text-pink-700",       avatar: "bg-pink-500" },
};

function formatGBP(n: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return `Good ${part}, ${name}`;
}

function MerchantAvatar({ description, category }: { description: string; category: string }) {
  const cat = CATEGORY_MAP[category] ?? { avatar: "bg-gray-400", label: "", pill: "" };
  const initials = description
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className={`w-11 h-11 rounded-full ${cat.avatar} flex items-center justify-center shrink-0`}>
      <span className="text-white text-sm font-bold">{initials}</span>
    </div>
  );
}

function TransactionModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const cat = CATEGORY_MAP[tx.category] ?? { label: tx.category, pill: "bg-gray-100 text-gray-600", avatar: "bg-gray-400" };
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Coloured top strip */}
        <div className={`${cat.avatar} px-6 pt-8 pb-6 text-center`}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">
              {tx.description.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
            </span>
          </div>
          <p
            className={`text-3xl font-bold text-white`}
          >
            {tx.type === "DEBIT" ? "−" : "+"}
            {formatGBP(tx.amount)}
          </p>
          <p className="text-white/80 text-sm mt-1">{tx.description}</p>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cat.pill}`}>
              {cat.label}
            </span>
          </div>
          {[
            { label: "Date",         value: formatDate(tx.date) },
            { label: "Counterparty", value: tx.counterparty },
            { label: "Reference",    value: tx.reference },
            { label: "Type",         value: tx.type },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <span className="text-gray-400 font-medium">{label}</span>
              <span className="font-semibold text-gray-800">{value}</span>
            </div>
          ))}
          <button
            onClick={onClose}
            className="w-full mt-2 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [balance, setBalance]           = useState(MOCK_ACCOUNT.balance);
  const [toppingUp, setToppingUp]       = useState(false);
  const [topupSuccess, setTopupSuccess] = useState(false);
  const [selectedTx, setSelectedTx]     = useState<Transaction | null>(null);

  const handleTopup = async () => {
    setToppingUp(true);
    setTopupSuccess(false);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setBalance((prev) => prev + 100);
    setToppingUp(false);
    setTopupSuccess(true);
    setTimeout(() => setTopupSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="max-w-xl mx-auto px-4 pt-8 pb-16 space-y-5">

        {/* Greeting */}
        <div className="px-1">
          <p className="text-gray-400 text-sm font-medium">{getGreeting(MOCK_ACCOUNT.firstName)}</p>
        </div>

        {/* Balance card — dark like Starling */}
        <div className="bg-[#0e1c2f] rounded-3xl p-6 text-white shadow-lg">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Available balance
          </p>
          <p className="text-5xl font-bold tracking-tight mb-5">
            {formatGBP(balance)}
          </p>

          <div className="h-px bg-white/10 mb-4" />

          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Account</p>
              <p className="font-semibold text-gray-200">{MOCK_ACCOUNT.accountNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Sort code</p>
              <p className="font-semibold text-gray-200">{MOCK_ACCOUNT.sortCode}</p>
            </div>
          </div>

          {topupSuccess && (
            <p className="mt-4 text-sm text-emerald-400 font-medium">
              ✓ £100.00 added to your account
            </p>
          )}
        </div>

        {/* Quick actions — circular buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Send",       icon: "↑",  href: "/payments",   onClick: undefined },
            { label: "Request",    icon: "↓",  href: "/payments",   onClick: undefined },
            { label: toppingUp ? "Adding…" : "Top up", icon: toppingUp ? "⏳" : "+", href: undefined, onClick: handleTopup },
            { label: "Statements", icon: "≡",  href: "/dashboard/statements", onClick: undefined },
          ].map(({ label, icon, href, onClick }) => {
            const inner = (
              <>
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-xl text-[#0e1c2f] group-hover:bg-[#004a32] group-hover:text-white transition-colors mb-2">
                  {icon}
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-[#004a32] transition-colors">
                  {label}
                </span>
              </>
            );

            return href ? (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center py-3 group"
              >
                {inner}
              </Link>
            ) : (
              <button
                key={label}
                onClick={onClick}
                disabled={toppingUp}
                className="flex flex-col items-center py-3 group disabled:opacity-60 cursor-pointer"
              >
                {inner}
              </button>
            );
          })}
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base">Recent transactions</h2>
            <span className="text-xs text-[#004a32] font-semibold cursor-pointer hover:underline">
              See all
            </span>
          </div>

          <ul className="divide-y divide-gray-50">
            {MOCK_TRANSACTIONS.map((tx) => {
              const cat = CATEGORY_MAP[tx.category] ?? { label: tx.category, pill: "bg-gray-100 text-gray-600", avatar: "bg-gray-400" };
              return (
                <li
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <MerchantAvatar description={tx.description} category={tx.category} />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cat.pill}`}>
                        {cat.label}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(tx.date)}</span>
                    </div>
                  </div>

                  <p className={`text-sm font-bold tabular-nums shrink-0 ${tx.type === "CREDIT" ? "text-emerald-600" : "text-gray-900"}`}>
                    {tx.type === "DEBIT" ? "−" : "+"}
                    {formatGBP(tx.amount)}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="px-5 py-4 border-t border-gray-50">
            <Link href="/dashboard/statements" className="text-sm text-[#004a32] font-semibold hover:underline">
              View all transactions →
            </Link>
          </div>
        </div>

      </div>

      {selectedTx && (
        <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
}
