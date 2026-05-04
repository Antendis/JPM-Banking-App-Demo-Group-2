"use client";

import { useState, useEffect } from "react";

interface MemberTotal {
  userId: number;
  name: string;
  total: number;
}

interface Pot {
  id: number;
  title: string;
  description: string | null;
  target: number;
  totalSaved: number;
  myContribution: number;
  memberTotals: MemberTotal[];
  creatorId: number | null;
  creatorName: string | null;
  isCreator: boolean;
  createdAt: string;
}

interface OtherUser { id: number; name: string; email: string; }

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}

const COLORS = ["bg-emerald-500", "bg-teal-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-blue-500"];

export default function PotsPage() {
  const [pots, setPots]           = useState<Pot[]>([]);
  const [loading, setLoading]     = useState(true);
  const [allUsers, setAllUsers]   = useState<OtherUser[]>([]);

  const [createOpen, setCreateOpen]         = useState(false);
  const [contributeTarget, setContTarget]   = useState<Pot | null>(null);
  const [dissolveTarget, setDissolveTarget] = useState<Pot | null>(null);

  const [creating, setCreating]     = useState(false);
  const [contributing, setContrib]  = useState(false);
  const [dissolving, setDissolving] = useState(false);

  const [contAmount, setContAmount] = useState("");
  const [createForm, setCreateForm] = useState({ title: "", description: "", target: "", memberIds: [] as number[] });

  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  const showFeedback = (msg: string, ok: boolean) => {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 3000);
  };

  const loadPots = () =>
    fetch("/api/pots").then((r) => r.json()).then((d) => {
      setPots(Array.isArray(d) ? d : []);
      setLoading(false);
    });

  useEffect(() => {
    loadPots();
    fetch("/api/users").then((r) => r.json()).then((d) => setAllUsers(Array.isArray(d) ? d : []));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/pots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createForm.title,
          description: createForm.description || null,
          target: parseFloat(createForm.target),
          memberIds: createForm.memberIds,
        }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setCreateForm({ title: "", description: "", target: "", memberIds: [] });
        showFeedback("Pot created!", true);
        loadPots();
      } else {
        const d = await res.json();
        showFeedback(d.message || "Failed to create pot.", false);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeTarget) return;
    setContrib(true);
    try {
      const res = await fetch(`/api/pots/${contributeTarget.id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(contAmount) }),
      });
      const d = await res.json();
      if (res.ok) {
        setContTarget(null);
        setContAmount("");
        showFeedback(`${fmt(parseFloat(contAmount))} added to pot!`, true);
        loadPots();
      } else {
        showFeedback(d.message || "Contribution failed.", false);
      }
    } finally {
      setContrib(false);
    }
  };

  const handleDissolve = async () => {
    if (!dissolveTarget) return;
    setDissolving(true);
    try {
      const res = await fetch(`/api/pots/${dissolveTarget.id}/dissolve`, { method: "POST" });
      const d   = await res.json();
      if (res.ok) {
        setDissolveTarget(null);
        showFeedback(d.message, true);
        loadPots();
      } else {
        showFeedback(d.message || "Could not dissolve pot.", false);
      }
    } finally {
      setDissolving(false);
    }
  };

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
            <h1 className="text-xl font-bold text-gray-900">Your Pots</h1>
            <p className="text-sm text-gray-400">Split costs, save together</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a6e3f] text-white rounded-xl text-sm font-semibold hover:bg-[#0d3d22] transition-colors shadow-sm cursor-pointer"
          >
            <span className="text-lg leading-none">+</span> New pot
          </button>
        </div>

        {/* Feedback banner */}
        {feedback && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            feedback.ok ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]" : "bg-red-50 border-red-100 text-red-700"
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Empty state */}
        {pots.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
            <p className="text-4xl mb-3">⬡</p>
            <p className="font-bold text-gray-700 mb-1">No pots yet</p>
            <p className="text-sm text-gray-400 mb-4">Create a pot to start pooling money with others.</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="px-5 py-2.5 bg-[#1a6e3f] text-white rounded-xl text-sm font-semibold hover:bg-[#0d3d22] transition-colors cursor-pointer"
            >
              Create your first pot
            </button>
          </div>
        )}

        {/* Pots list */}
        {pots.map((pot, idx) => {
          const progress = Math.min((pot.totalSaved / pot.target) * 100, 100);
          const color    = COLORS[idx % COLORS.length];
          const myShare  = pot.target / pot.memberTotals.length;
          const owes     = myShare - pot.myContribution;

          return (
            <div key={pot.id} className="bg-white rounded-3xl p-5 shadow-sm">
              {/* Title row */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="font-bold text-gray-900">{pot.title}</h2>
                  {pot.description && <p className="text-xs text-gray-400 mt-0.5">{pot.description}</p>}
                </div>
                <span className="text-sm font-semibold text-gray-500 tabular-nums">
                  {fmt(pot.totalSaved)} / {fmt(pot.target)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden my-3">
                <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${progress}%` }} />
              </div>

              {/* Members */}
              <div className="space-y-1.5 mb-4">
                {pot.memberTotals.map((m) => (
                  <div key={m.userId} className="flex justify-between text-sm">
                    <span className="text-gray-600">{m.name}</span>
                    <span className={`font-semibold tabular-nums ${m.total >= myShare ? "text-emerald-600" : "text-gray-900"}`}>
                      {fmt(m.total)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Your status */}
              <div className={`text-xs font-semibold mb-3 ${owes > 0.005 ? "text-orange-600" : "text-emerald-600"}`}>
                {owes > 0.005 ? `You still owe ${fmt(owes)}` : "✓ You're fully paid up"}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setContTarget(pot); setContAmount(""); }}
                  className="flex-1 py-2.5 rounded-2xl bg-[#1a6e3f] text-white text-sm font-semibold hover:bg-[#0d3d22] transition-colors cursor-pointer"
                >
                  Add money
                </button>
                {pot.isCreator && (
                  <button
                    onClick={() => setDissolveTarget(pot)}
                    className="px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Dissolve
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Create pot modal ── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setCreateOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#1a6e3f] px-6 py-5">
              <h2 className="text-white font-bold text-lg">Create a new pot</h2>
              <p className="text-green-200 text-xs mt-0.5">Members are locked after creation</p>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {[
                { name: "title",       label: "Pot name",      type: "text",   placeholder: "House Rent — May" },
                { name: "description", label: "Description",   type: "text",   placeholder: "Optional note…" },
                { name: "target",      label: "Target (£)",    type: "number", placeholder: "1800" },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
                  <input
                    type={type}
                    required={name !== "description"}
                    min={name === "target" ? "1" : undefined}
                    step={name === "target" ? "0.01" : undefined}
                    placeholder={placeholder}
                    value={(createForm as Record<string, string>)[name]}
                    onChange={(e) => setCreateForm((p) => ({ ...p, [name]: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                  />
                </div>
              ))}

              {/* Member selection */}
              {allUsers.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Invite members
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {allUsers.map((u) => (
                      <label key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-[#1a6e3f] w-4 h-4"
                          checked={createForm.memberIds.includes(u.id)}
                          onChange={(e) =>
                            setCreateForm((p) => ({
                              ...p,
                              memberIds: e.target.checked
                                ? [...p.memberIds, u.id]
                                : p.memberIds.filter((id) => id !== u.id),
                            }))
                          }
                        />
                        <span className="text-sm text-gray-700">{u.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{u.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setCreateOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 rounded-2xl bg-[#1a6e3f] text-white text-sm font-semibold hover:bg-[#0d3d22] transition-colors disabled:opacity-60 cursor-pointer">
                  {creating ? "Creating…" : "Create pot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Contribute modal ── */}
      {contributeTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setContTarget(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#1a6e3f] px-6 py-5">
              <h2 className="text-white font-bold text-lg">Add money</h2>
              <p className="text-green-200 text-xs mt-0.5">{contributeTarget.title}</p>
            </div>
            <form onSubmit={handleContribute} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Amount (£)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="50.00"
                  value={contAmount}
                  onChange={(e) => setContAmount(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-bold outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all text-center"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setContTarget(null)}
                  className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={contributing || !contAmount}
                  className="flex-1 py-2.5 rounded-2xl bg-[#1a6e3f] text-white text-sm font-semibold hover:bg-[#0d3d22] transition-colors disabled:opacity-60 cursor-pointer">
                  {contributing ? "Adding…" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Dissolve confirm modal ── */}
      {dissolveTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDissolveTarget(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-8 pb-5 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">Dissolve "{dissolveTarget.title}"?</h2>
              <p className="text-sm text-gray-500">
                All contributions ({fmt(dissolveTarget.totalSaved)}) will be returned to each member's balance. This cannot be undone.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-2">
              <button onClick={() => setDissolveTarget(null)}
                className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                Keep pot
              </button>
              <button onClick={handleDissolve} disabled={dissolving}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer">
                {dissolving ? "Dissolving…" : "Dissolve & refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
