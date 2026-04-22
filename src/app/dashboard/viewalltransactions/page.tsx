"use client";

import { useState } from "react";
import Link from "next/link";

interface ViewTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  date: string;
  reference: string;
  counterparty: string;
}

const VIEW_TRANSACTIONS: ViewTransaction[] = [
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
    amount: 2850,
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
    description: "Amazon",
    category: "SHOPPING",
    amount: 34.99,
    type: "DEBIT",
    date: "2026-04-15T18:10:00Z",
    reference: "AMZ*ORDER",
    counterparty: "Amazon UK",
  },
  {
    id: "7",
    description: "Starbucks",
    category: "EATING_OUT",
    amount: 5.6,
    type: "DEBIT",
    date: "2026-04-15T09:05:00Z",
    reference: "STARBUCKS",
    counterparty: "Starbucks UK",
  },
  {
    id: "8",
    description: "Gym Membership",
    category: "BILLS",
    amount: 25,
    type: "DEBIT",
    date: "2026-04-14T07:00:00Z",
    reference: "GYM MONTHLY",
    counterparty: "PureGym",
  },
  {
    id: "9",
    description: "Spotify",
    category: "ENTERTAINMENT",
    amount: 10.99,
    type: "DEBIT",
    date: "2026-04-13T00:00:00Z",
    reference: "SPOTIFY",
    counterparty: "Spotify Ltd",
  },
  {
    id: "10",
    description: "Freelance Payment",
    category: "INCOME",
    amount: 600,
    type: "CREDIT",
    date: "2026-04-12T11:30:00Z",
    reference: "CLIENT INV 104",
    counterparty: "Design Studio",
  },
  {
    id: "11",
    description: "Boots Pharmacy",
    category: "SHOPPING",
    amount: 14.2,
    type: "DEBIT",
    date: "2026-04-11T15:20:00Z",
    reference: "BOOTS STORE",
    counterparty: "Boots UK",
  },
  {
    id: "12",
    description: "Council Tax",
    category: "BILLS",
    amount: 140,
    type: "DEBIT",
    date: "2026-04-10T00:00:00Z",
    reference: "COUNCIL TAX",
    counterparty: "Bournemouth Council",
  },
  {
    id: "13",
    description: "Sainsbury's",
    category: "GROCERIES",
    amount: 47.82,
    type: "DEBIT",
    date: "2026-04-09T17:05:00Z",
    reference: "SAINSBURYS SUPERSTORE",
    counterparty: "Sainsbury's Supermarkets Ltd",
  },
  {
    id: "14",
    description: "McDonald's",
    category: "EATING_OUT",
    amount: 7.49,
    type: "DEBIT",
    date: "2026-04-09T13:22:00Z",
    reference: "MCDONALDS",
    counterparty: "McDonald's UK",
  },
  {
    id: "15",
    description: "National Rail",
    category: "TRANSPORT",
    amount: 28.5,
    type: "DEBIT",
    date: "2026-04-08T08:10:00Z",
    reference: "NATL RAIL TICKET",
    counterparty: "National Rail Enquiries",
  },
  {
    id: "16",
    description: "Apple iCloud",
    category: "BILLS",
    amount: 2.99,
    type: "DEBIT",
    date: "2026-04-08T00:00:00Z",
    reference: "APPLE.COM/BILL",
    counterparty: "Apple Inc",
  },
  {
    id: "17",
    description: "ASOS",
    category: "SHOPPING",
    amount: 62.0,
    type: "DEBIT",
    date: "2026-04-07T19:44:00Z",
    reference: "ASOS.COM",
    counterparty: "ASOS PLC",
  },
  {
    id: "18",
    description: "Costa Coffee",
    category: "EATING_OUT",
    amount: 4.75,
    type: "DEBIT",
    date: "2026-04-07T08:55:00Z",
    reference: "COSTA COFFEE",
    counterparty: "Costa Ltd",
  },
  {
    id: "19",
    description: "Uber",
    category: "TRANSPORT",
    amount: 11.2,
    type: "DEBIT",
    date: "2026-04-06T23:30:00Z",
    reference: "UBER* TRIP",
    counterparty: "Uber BV",
  },
  {
    id: "20",
    description: "Disney+",
    category: "ENTERTAINMENT",
    amount: 4.99,
    type: "DEBIT",
    date: "2026-04-06T00:00:00Z",
    reference: "DISNEYPLUS",
    counterparty: "Disney Streaming Ltd",
  },
  {
    id: "21",
    description: "Waitrose",
    category: "GROCERIES",
    amount: 33.6,
    type: "DEBIT",
    date: "2026-04-05T16:20:00Z",
    reference: "WAITROSE",
    counterparty: "Waitrose Ltd",
  },
  {
    id: "22",
    description: "Electric Bill",
    category: "BILLS",
    amount: 87.0,
    type: "DEBIT",
    date: "2026-04-05T00:00:00Z",
    reference: "OCTOPUS ENERGY",
    counterparty: "Octopus Energy Ltd",
  },
  {
    id: "23",
    description: "Bank Transfer In",
    category: "INCOME",
    amount: 250.0,
    type: "CREDIT",
    date: "2026-04-04T14:00:00Z",
    reference: "FASTER PAYMENT",
    counterparty: "James Wilson",
  },
  {
    id: "24",
    description: "H&M",
    category: "SHOPPING",
    amount: 29.99,
    type: "DEBIT",
    date: "2026-04-03T12:40:00Z",
    reference: "H&M STORE",
    counterparty: "H & M Hennes & Mauritz UK",
  },
  {
    id: "25",
    description: "Nando's",
    category: "EATING_OUT",
    amount: 18.9,
    type: "DEBIT",
    date: "2026-04-02T19:15:00Z",
    reference: "NANDOS",
    counterparty: "Nando's Chickenland Ltd",
  },
  {
    id: "26",
    description: "Water Bill",
    category: "BILLS",
    amount: 34.0,
    type: "DEBIT",
    date: "2026-04-02T00:00:00Z",
    reference: "WESSEX WATER",
    counterparty: "Wessex Water Services Ltd",
  },
  {
    id: "27",
    description: "Deliveroo",
    category: "EATING_OUT",
    amount: 22.49,
    type: "DEBIT",
    date: "2026-04-01T20:05:00Z",
    reference: "DELIVEROO",
    counterparty: "Deliveroo UK Ltd",
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
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

function TransactionModal({ tx, onClose }: { tx: ViewTransaction; onClose: () => void }) {
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
        <div className={`${cat.avatar} px-6 pt-8 pb-6 text-center`}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">
              {tx.description.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
            </span>
          </div>
          <p className="text-3xl font-bold text-white">
            {tx.type === "DEBIT" ? "−" : "+"}
            {formatGBP(tx.amount)}
          </p>
          <p className="text-white/80 text-sm mt-1">{tx.description}</p>
        </div>

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

export default function ViewAllTransactionsPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedTx, setSelectedTx] = useState<ViewTransaction | null>(null);

  const filtered =
    activeFilter === "ALL"
      ? VIEW_TRANSACTIONS
      : VIEW_TRANSACTIONS.filter((t) => t.category === activeFilter);

  const totalIn = VIEW_TRANSACTIONS.filter((t) => t.type === "CREDIT").reduce(
    (s, t) => s + t.amount,
    0
  );
  const totalOut = VIEW_TRANSACTIONS.filter((t) => t.type === "DEBIT").reduce(
    (s, t) => s + t.amount,
    0
  );
  const net = totalIn - totalOut;

  const categories = ["ALL", ...Object.keys(CATEGORY_MAP)];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="max-w-xl mx-auto px-4 pt-8 pb-16 space-y-5">

        {/* Back link */}
        <div className="px-1">
          <Link href="/dashboard" className="text-sm text-[#004a32] font-semibold hover:underline">
            ← Back to dashboard
          </Link>
        </div>

        {/* Summary card */}
        <div className="bg-[#0e1c2f] rounded-3xl p-6 text-white shadow-lg">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
            This month
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Money in</p>
              <p className="text-lg font-bold text-emerald-400">{formatGBP(totalIn)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Money out</p>
              <p className="text-lg font-bold text-white">{formatGBP(totalOut)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Net</p>
              <p className={`text-lg font-bold ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatGBP(net)}
              </p>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const label = cat === "ALL" ? "All" : CATEGORY_MAP[cat]?.label ?? cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`text-xs px-4 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                  activeFilter === cat
                    ? "bg-[#004a32] text-white border-[#004a32]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Transaction list */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base">
              {activeFilter === "ALL" ? "All transactions" : CATEGORY_MAP[activeFilter]?.label}
            </h2>
            <span className="text-xs text-gray-400">{filtered.length} transactions</span>
          </div>

          <ul className="divide-y divide-gray-50">
            {filtered.map((tx) => {
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
        </div>

      </div>

      {selectedTx && (
        <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
}
