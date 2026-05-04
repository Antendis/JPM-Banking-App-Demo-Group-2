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
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function StatementsPage() {
  const [transactions, setTxs]  = useState<Transaction[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Transaction | null>(null);

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

  // Group by month
  const months: Record<string, Transaction[]> = {};
  transactions.forEach((tx) => {
    const key = new Date(tx.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (!months[key]) months[key] = [];
    months[key].push(tx);
  });

  const totalIn  = transactions.filter((t) => t.type === "CREDIT").reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === "DEBIT").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-24 sm:pb-8">
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-4">

        <div className="flex items-center justify-between px-1">
          <div>
            <Link href="/dashboard" className="text-sm text-[#1a6e3f] font-semibold hover:underline">← Dashboard</Link>
            <h1 className="text-xl font-bold text-gray-900 mt-2">Statements</h1>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#0e1c2f] rounded-3xl p-5 text-white shadow-lg">
          <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-3">All time summary</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Total income</p>
              <p className="text-xl font-bold text-emerald-400 tabular-nums">{fmt(totalIn)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Total spending</p>
              <p className="text-xl font-bold text-white tabular-nums">{fmt(totalOut)}</p>
            </div>
          </div>
        </div>

        {/* Monthly statements */}
        {Object.entries(months).map(([month, txs]) => {
          const mIn  = txs.filter((t) => t.type === "CREDIT").reduce((s, t) => s + t.amount, 0);
          const mOut = txs.filter((t) => t.type === "DEBIT").reduce((s, t) => s + t.amount, 0);
          return (
            <div key={month} className="bg-white rounded-3xl overflow-hidden shadow-sm">
              {/* Month header */}
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-sm">{month}</h2>
                <div className="flex gap-3 text-xs tabular-nums">
                  <span className="text-emerald-600 font-semibold">+{fmt(mIn)}</span>
                  <span className="text-gray-500 font-semibold">−{fmt(mOut)}</span>
                </div>
              </div>
              <ul className="divide-y divide-gray-50">
                {txs.map((tx) => {
                  const cat = CATEGORY_MAP[tx.category] ?? { label: tx.category, pill: "bg-gray-100 text-gray-600" };
                  return (
                    <li
                      key={tx.id}
                      onClick={() => setSelected(tx)}
                      className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{tx.description}</p>
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
            </div>
          );
        })}

      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg text-gray-900 mb-1">{selected.description}</h2>
            <p className="text-sm text-gray-400 mb-3">{fmtDate(selected.createdAt)}</p>
            <p className={`text-2xl font-bold mb-4 ${selected.type === "CREDIT" ? "text-emerald-600" : "text-gray-900"}`}>
              {selected.type === "DEBIT" ? "−" : "+"}{fmt(selected.amount)}
            </p>
            <div className="text-sm space-y-2 text-gray-600 mb-4">
              <p><span className="font-semibold text-gray-800">Reference:</span> {selected.reference ?? "—"}</p>
              <p><span className="font-semibold text-gray-800">Counterparty:</span> {selected.counterparty ?? "—"}</p>
              <p><span className="font-semibold text-gray-800">Category:</span> {CATEGORY_MAP[selected.category]?.label ?? selected.category}</p>
            </div>
            <button onClick={() => setSelected(null)} className="w-full bg-gray-100 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors cursor-pointer">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
