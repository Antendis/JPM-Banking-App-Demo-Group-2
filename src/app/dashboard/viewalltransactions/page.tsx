"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Transaction {
  id: number;
  description: string;
  category: string;
  amount: number;
  type: string;
  createdAt: string;
  reference: string;
  counterparty: string;
}

const CATEGORY_MAP: Record<string, { label: string; pill: string; avatar: string }> = {
  GROCERIES:        { label: "Groceries",     pill: "bg-emerald-100 text-emerald-700", avatar: "bg-emerald-500" },
  INCOME:           { label: "Income",        pill: "bg-green-100 text-green-700",     avatar: "bg-green-500"   },
  ENTERTAINMENT:    { label: "Entertainment", pill: "bg-purple-100 text-purple-700",   avatar: "bg-purple-500"  },
  EATING_OUT:       { label: "Eating Out",    pill: "bg-orange-100 text-orange-700",   avatar: "bg-orange-400"  },
  TRANSPORT:        { label: "Transport",     pill: "bg-blue-100 text-blue-700",       avatar: "bg-blue-500"    },
  BILLS:            { label: "Bills",         pill: "bg-red-100 text-red-700",         avatar: "bg-red-500"     },
  SHOPPING:         { label: "Shopping",      pill: "bg-pink-100 text-pink-700",       avatar: "bg-pink-500"    },
  POT_CONTRIBUTION: { label: "Pot",           pill: "bg-teal-100 text-teal-700",       avatar: "bg-teal-500"    },
  POT_DISSOLUTION:  { label: "Pot Returned",  pill: "bg-teal-100 text-teal-700",       avatar: "bg-teal-400"    },
  TRANSFER:         { label: "Transfer",      pill: "bg-indigo-100 text-indigo-700",   avatar: "bg-indigo-500"  },
};

function fmt(n: number) { return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }

function Avatar({ description, category }: { description: string; category: string }) {
  const cat = CATEGORY_MAP[category] ?? { avatar: "bg-gray-400" };
  const initials = description.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={`w-10 h-10 rounded-full ${cat.avatar} flex items-center justify-center shrink-0`}>
      <span className="text-white text-xs font-bold">{initials}</span>
    </div>
  );
}

function TxModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const cat = CATEGORY_MAP[tx.category] ?? { label: tx.category, pill: "bg-gray-100 text-gray-600", avatar: "bg-gray-400" };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className={`${cat.avatar} px-6 pt-8 pb-6 text-center`}>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl font-bold">
              {tx.description.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
            </span>
          </div>
          <p className="text-3xl font-bold text-white">{tx.type === "DEBIT" ? "−" : "+"}{fmt(tx.amount)}</p>
          <p className="text-white/70 text-sm mt-1">{tx.description}</p>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="flex justify-center mb-1">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cat.pill}`}>{cat.label}</span>
          </div>
          {[
            { label: "Date",         value: new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
            { label: "Counterparty", value: tx.counterparty ?? "—" },
            { label: "Reference",    value: tx.reference ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-2.5 last:border-0">
              <span className="text-gray-400">{label}</span>
              <span className="font-semibold text-gray-800 text-right max-w-[60%] truncate">{value}</span>
            </div>
          ))}
          <button onClick={onClose} className="w-full mt-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ViewAllTransactionsPage() {
  const [transactions, setTxs]   = useState<Transaction[]>([]);
  const [loading, setLoading]    = useState(true);
  const [filter, setFilter]      = useState("ALL");
  const [search, setSearch]      = useState("");
  const [selected, setSelected]  = useState<Transaction | null>(null);

  useEffect(() => {
    fetch("/api/transactions").then((r) => r.json()).then((d) => {
      setTxs(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1a6e3f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = transactions
    .filter((t) => filter === "ALL" || t.category === filter)
    .filter((t) => !q || t.description.toLowerCase().includes(q) || t.counterparty?.toLowerCase().includes(q) || t.reference?.toLowerCase().includes(q));
  const totalIn  = transactions.filter((t) => t.type === "CREDIT").reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === "DEBIT").reduce((s, t) => s + t.amount, 0);
  const net      = totalIn - totalOut;
  const categories = ["ALL", ...Object.keys(CATEGORY_MAP)];

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-24 sm:pb-8">
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-4">

        <div className="px-1">
          <Link href="/dashboard" className="text-sm text-[#1a6e3f] font-semibold hover:underline">← Dashboard</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">All transactions</h1>
        </div>

        {/* Summary card */}
        <div className="bg-[#0e1c2f] rounded-3xl p-5 text-white shadow-lg">
          <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-3">This month</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Money in</p>
              <p className="text-base font-bold text-emerald-400 tabular-nums">{fmt(totalIn)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Money out</p>
              <p className="text-base font-bold text-white tabular-nums">{fmt(totalOut)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Net</p>
              <p className={`text-base font-bold tabular-nums ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(net)}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none">
              ×
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const label = cat === "ALL" ? "All" : (CATEGORY_MAP[cat]?.label ?? cat);
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                  filter === cat
                    ? "bg-[#1a6e3f] text-white border-[#1a6e3f]"
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
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <p className="font-bold text-gray-900 text-sm">
              {filter === "ALL" ? "All transactions" : CATEGORY_MAP[filter]?.label ?? filter}
            </p>
            <span className="text-xs text-gray-400">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {filtered.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-gray-400">No transactions in this category.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {filtered.map((tx) => {
                const cat = CATEGORY_MAP[tx.category] ?? { label: tx.category, pill: "bg-gray-100 text-gray-600", avatar: "bg-gray-400" };
                return (
                  <li
                    key={tx.id}
                    onClick={() => setSelected(tx)}
                    className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Avatar description={tx.description} category={tx.category} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cat.pill}`}>{cat.label}</span>
                        <span className="text-[11px] text-gray-400">{fmtDate(tx.createdAt)}</span>
                      </div>
                    </div>
                    <p className={`text-sm font-bold tabular-nums shrink-0 ${tx.type === "CREDIT" ? "text-emerald-600" : "text-gray-900"}`}>
                      {tx.type === "DEBIT" ? "−" : "+"}{fmt(tx.amount)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>

      {selected && <TxModal tx={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
