"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  balance: number;
  accountNumber: string;
  sortCode: string;
}

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

const CATEGORY_MAP: Record<string, { label: string; pill: string; avatar: string; color: string }> = {
  GROCERIES:        { label: "Groceries",     pill: "bg-emerald-100 text-emerald-700", avatar: "bg-emerald-500", color: "#10b981" },
  INCOME:           { label: "Income",        pill: "bg-green-100 text-green-700",     avatar: "bg-green-500",   color: "#22c55e" },
  ENTERTAINMENT:    { label: "Entertainment", pill: "bg-purple-100 text-purple-700",   avatar: "bg-purple-500",  color: "#a855f7" },
  EATING_OUT:       { label: "Eating Out",    pill: "bg-orange-100 text-orange-700",   avatar: "bg-orange-400",  color: "#fb923c" },
  TRANSPORT:        { label: "Transport",     pill: "bg-blue-100 text-blue-700",       avatar: "bg-blue-500",    color: "#3b82f6" },
  BILLS:            { label: "Bills",         pill: "bg-red-100 text-red-700",         avatar: "bg-red-500",     color: "#ef4444" },
  SHOPPING:         { label: "Shopping",      pill: "bg-pink-100 text-pink-700",       avatar: "bg-pink-500",    color: "#ec4899" },
  POT_CONTRIBUTION: { label: "Pot",           pill: "bg-teal-100 text-teal-700",       avatar: "bg-teal-500",    color: "#14b8a6" },
  POT_DISSOLUTION:  { label: "Pot Returned",  pill: "bg-teal-100 text-teal-700",       avatar: "bg-teal-400",    color: "#2dd4bf" },
  POT_WITHDRAWAL:   { label: "Pot Refund",    pill: "bg-teal-100 text-teal-700",       avatar: "bg-teal-300",    color: "#5eead4" },
  TRANSFER:         { label: "Transfer",      pill: "bg-indigo-100 text-indigo-700",   avatar: "bg-indigo-500",  color: "#6366f1" },
};

const SPEND_CATS = ["GROCERIES", "EATING_OUT", "ENTERTAINMENT", "TRANSPORT", "BILLS", "SHOPPING"];

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function greeting(name: string) {
  const h = new Date().getHours();
  return `Good ${h < 12 ? "morning" : h < 18 ? "afternoon" : "evening"}, ${name.split(" ")[0]}`;
}

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

function SpendingDonut({ transactions }: { transactions: Transaction[] }) {
  const debits = transactions.filter((t) => t.type === "DEBIT" && SPEND_CATS.includes(t.category));
  const totals = SPEND_CATS.map((cat) => ({
    cat,
    amount: debits.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0),
    color: CATEGORY_MAP[cat].color,
    label: CATEGORY_MAP[cat].label,
  })).filter((x) => x.amount > 0);

  const total = totals.reduce((s, x) => s + x.amount, 0);
  if (total === 0) return null;

  let cumulative = 0;
  const segments = totals.map(({ amount, color }) => {
    const pct = (amount / total) * 100;
    const seg = { start: cumulative, end: cumulative + pct, color };
    cumulative += pct;
    return seg;
  });

  const gradient = segments.map((s) => `${s.color} ${s.start.toFixed(1)}% ${s.end.toFixed(1)}%`).join(", ");

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <p className="font-bold text-gray-900 text-sm mb-4">Spending this month</p>
      <div className="flex items-center gap-5">
        <div className="shrink-0 relative w-20 h-20">
          <div className="w-20 h-20 rounded-full" style={{ background: `conic-gradient(${gradient})` }} />
          <div className="absolute inset-[14px] bg-white rounded-full" />
        </div>
        <div className="flex-1 space-y-1.5">
          {totals.slice(0, 5).map(({ cat, amount, color, label }) => (
            <div key={cat} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-xs text-gray-500 flex-1">{label}</span>
              <span className="text-xs font-semibold text-gray-800 tabular-nums">{fmt(amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "Send",      icon: "↑",  href: "/dashboard/send" },
  { label: "Pots",      icon: "⬡",  href: "/dashboard/pots" },
  { label: "Scheduled", icon: "📅", href: "/dashboard/scheduled" },
  { label: "History",   icon: "≡",  href: "/dashboard/viewalltransactions" },
];

const NUDGE_KEY = "onepot_nudge_date";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [user, setUser]          = useState<User | null>(null);
  const [transactions, setTxs]  = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [loading, setLoading]   = useState(true);
  const [nudge, setNudge]       = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/me").then((r) => r.json()),
      fetch("/api/transactions?limit=50").then((r) => r.json()),
      fetch("/api/pots").then((r) => r.json()),
    ]).then(([u, txs, pots]) => {
      setUser(u);
      setTxs(Array.isArray(txs) ? txs : []);

      // Show nudge if user is in pots but hasn't contributed to any of them,
      // and hasn't been nudged today
      if (Array.isArray(pots) && pots.length > 0) {
        const hasUncontributed = pots.some((p: { myContribution: number }) => p.myContribution === 0);
        const lastNudge = localStorage.getItem(NUDGE_KEY);
        if (hasUncontributed && lastNudge !== todayStr()) {
          setNudge(true);
        }
      }

      setLoading(false);
    });
  }, []);

  const dismissNudge = () => {
    localStorage.setItem(NUDGE_KEY, todayStr());
    setNudge(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1a6e3f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const recent = transactions.slice(0, 20);

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto px-4 pt-6">

        {/* Greeting — full width */}
        <p className="text-gray-400 text-sm font-medium px-1 mb-4">
          {user ? greeting(user.name) : "Welcome back"}
        </p>

        {/* Pot nudge */}
        {nudge && (
          <div className="mb-4 flex items-start gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl px-4 py-3.5 shadow-sm">
            <span className="text-xl shrink-0">⬡</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#166534]">Your pot is waiting for you</p>
              <p className="text-xs text-[#166534]/70 mt-0.5">You&apos;re in a pot but haven&apos;t added anything yet - chip in and get the ball rolling!</p>
              <Link href="/dashboard/pots" onClick={dismissNudge}
                className="inline-block mt-2 text-xs font-semibold text-[#1a6e3f] underline underline-offset-2">
                Go to pots →
              </Link>
            </div>
            <button onClick={dismissNudge} className="text-[#166534]/50 hover:text-[#166534] text-lg leading-none shrink-0 cursor-pointer">×</button>
          </div>
        )}

        {/* ── Two-column on desktop, single on mobile ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-4">

            {/* Balance card */}
            <div className="bg-[#0e1c2f] rounded-3xl p-6 text-white shadow-xl">
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">
                Available balance
              </p>
              <p className="text-5xl font-bold tracking-tight mb-5 tabular-nums">
                {user ? fmt(user.balance) : "—"}
              </p>
              <div className="h-px bg-white/10 mb-4" />
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-gray-600 text-[10px] uppercase tracking-wide mb-0.5">Account</p>
                  <p className="font-semibold text-gray-300 tracking-wider">{user?.accountNumber ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-[10px] uppercase tracking-wide mb-0.5">Sort code</p>
                  <p className="font-semibold text-gray-300">{user?.sortCode ?? "—"}</p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ACTIONS.map(({ label, icon, href }) => (
                <Link key={label} href={href} className="flex flex-col items-center py-3 group">
                  <div className="w-[52px] h-[52px] rounded-full bg-white shadow-sm flex items-center justify-center text-xl text-[#0e1c2f] group-hover:bg-[#1a6e3f] group-hover:text-white transition-all mb-1.5">
                    {icon}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 group-hover:text-[#1a6e3f] transition-colors">
                    {label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Spending donut */}
            {transactions.length > 0 && <SpendingDonut transactions={transactions} />}
          </div>

          {/* ── RIGHT COLUMN — Recent transactions ── */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Recent transactions</h2>
              <Link href="/dashboard/viewalltransactions" className="text-xs text-[#1a6e3f] font-semibold hover:underline">
                See all
              </Link>
            </div>

            {recent.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No transactions yet.</p>
            ) : (
              <ul className="divide-y divide-gray-50 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto">
                {recent.map((tx) => {
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
      </div>

      {selected && <TxModal tx={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
