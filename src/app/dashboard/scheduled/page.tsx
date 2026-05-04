"use client";

import { useState, useEffect } from "react";
import { useDelayedLoading } from "@/lib/useDelayedLoading";

interface ScheduledPayment {
  id: number;
  amount: number;
  description: string;
  recipientEmail: string | null;
  potId: number | null;
  sourceType: string;
  scheduledFor: string;
  status: string;
  createdAt: string;
  pot: { id: number; title: string } | null;
}

interface Pot { id: number; title: string; availableBalance: number; }

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED:    "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

function minDateTimeLocal() {
  const d = new Date(Date.now() + 60_000);
  return d.toISOString().slice(0, 16);
}

export default function ScheduledPage() {
  const [payments, setPayments]   = useState<ScheduledPayment[]>([]);
  const [pots, setPots]           = useState<Pot[]>([]);
  const [loading, setLoading]     = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating]   = useState(false);
  const spinner = useDelayedLoading(creating);
  const [feedback, setFeedback]   = useState<{ msg: string; ok: boolean } | null>(null);

  const [form, setForm] = useState({
    sourceType: "ACCOUNT",
    potId: "",
    recipientEmail: "",
    amount: "",
    description: "",
    scheduledFor: "",
  });

  const showFeedback = (msg: string, ok: boolean) => {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 3500);
  };

  const load = async () => {
    const [p, potData] = await Promise.all([
      fetch("/api/scheduled").then((r) => r.json()),
      fetch("/api/pots").then((r) => r.json()),
    ]);
    setPayments(Array.isArray(p) ? p : []);
    setPots(Array.isArray(potData) ? potData : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: form.sourceType,
          potId: form.sourceType === "POT" ? parseInt(form.potId, 10) : undefined,
          recipientEmail: form.recipientEmail || undefined,
          amount: parseFloat(form.amount),
          description: form.description,
          scheduledFor: form.scheduledFor,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setCreateOpen(false);
        setForm({ sourceType: "ACCOUNT", potId: "", recipientEmail: "", amount: "", description: "", scheduledFor: "" });
        showFeedback("Payment scheduled.", true);
        load();
      } else {
        showFeedback(d.message || "Failed to schedule payment.", false);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (id: number) => {
    const res = await fetch(`/api/scheduled/${id}`, { method: "DELETE" });
    const d   = await res.json();
    if (res.ok) {
      showFeedback(d.message, true);
      load();
    } else {
      showFeedback(d.message || "Could not cancel.", false);
    }
  };

  const pending   = payments.filter((p) => p.status === "PENDING");
  const past      = payments.filter((p) => p.status !== "PENDING");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1a6e3f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-24 sm:pb-8">
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Scheduled Payments</h1>
            <p className="text-sm text-gray-400">Pay later from your account or a pot</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a6e3f] text-white rounded-xl text-sm font-semibold hover:bg-[#0d3d22] transition-colors shadow-sm cursor-pointer"
          >
            <span className="text-lg leading-none">+</span> Schedule
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            feedback.ok ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]" : "bg-red-50 border-red-100 text-red-700"
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Upcoming */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">Upcoming</h2>
          {pending.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
              <p className="text-3xl mb-2">📅</p>
              <p className="font-semibold text-gray-700 mb-1">No scheduled payments</p>
              <p className="text-sm text-gray-400">Schedule a future payment from your account or a shared pot.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-lg">📅</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.description}</p>
                    {p.sourceType === "POT" ? (
                      <>
                        <p className="text-xs text-gray-400 mt-0.5">From pot: {p.pot?.title ?? "—"}</p>
                        {p.recipientEmail && <p className="text-xs text-gray-400">To: {p.recipientEmail}</p>}
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">To: {p.recipientEmail ?? "—"}</p>
                    )}
                    <p className="text-xs text-gray-400">Due: {fmtDateTime(p.scheduledFor)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 tabular-nums">{fmt(p.amount)}</p>
                    <button
                      onClick={() => handleCancel(p.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold mt-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">History</h2>
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-50">
              {past.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.description}</p>
                    <p className="text-xs text-gray-400">
                      {p.sourceType === "POT"
                        ? `Pot: ${p.pot?.title ?? "—"}${p.recipientEmail ? ` → ${p.recipientEmail}` : ""}`
                        : `To: ${p.recipientEmail ?? "—"}`}
                      &nbsp;&middot;&nbsp;{fmtDate(p.scheduledFor)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 tabular-nums text-sm">{fmt(p.amount)}</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Create modal ── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setCreateOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#1a6e3f] px-6 py-5">
              <h2 className="text-white font-bold text-lg">Schedule a payment</h2>
              <p className="text-green-200 text-xs mt-0.5">Executes automatically on the chosen date</p>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">

              {/* Source type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Pay from</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["ACCOUNT", "POT"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, sourceType: type, potId: "", recipientEmail: "" }))}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                        form.sourceType === type
                          ? "bg-[#1a6e3f] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {type === "ACCOUNT" ? "My account" : "A pot"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pot selector */}
              {form.sourceType === "POT" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Select pot</label>
                  <select
                    required
                    value={form.potId}
                    onChange={(e) => setForm((f) => ({ ...f, potId: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                  >
                    <option value="">Choose a pot…</option>
                    {pots.map((p) => (
                      <option key={p.id} value={p.id}>{p.title} ({fmt(p.availableBalance)} available)</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Recipient email — required for account, optional for pot */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Recipient email{form.sourceType === "POT" && <span className="text-gray-300 normal-case font-normal ml-1">(optional — credits them if on OnePot)</span>}
                </label>
                <input
                  type="email"
                  required={form.sourceType === "ACCOUNT"}
                  placeholder="friend@onepot.com"
                  value={form.recipientEmail}
                  onChange={(e) => setForm((f) => ({ ...f, recipientEmail: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Amount (£)</label>
                <input
                  type="number" required min="0.01" step="0.01" placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {form.sourceType === "POT" ? "Description / merchant" : "Reference"}
                </label>
                <input
                  type="text" required placeholder={form.sourceType === "POT" ? "e.g. Monthly rent" : "e.g. Rent share"}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                />
              </div>

              {/* Date/time */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Scheduled date & time</label>
                <input
                  type="datetime-local" required min={minDateTimeLocal()}
                  value={form.scheduledFor}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledFor: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setCreateOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 rounded-2xl bg-[#1a6e3f] text-white text-sm font-semibold hover:bg-[#0d3d22] transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5">
                  {spinner && <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {creating ? "Scheduling…" : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
