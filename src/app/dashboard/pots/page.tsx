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
  totalSpent: number;
  availableBalance: number;
  myContribution: number;
  memberTotals: MemberTotal[];
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  creatorId: number | null;
  creatorName: string | null;
  isCreator: boolean;
  createdAt: string;
}

interface OtherUser { id: number; name: string; email: string; }

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}

function fmtCard(num: string) {
  return num.replace(/(.{4})/g, "$1 ").trim();
}

const COLORS = ["bg-emerald-500", "bg-teal-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-blue-500"];
const CARD_GRADIENTS = [
  "from-emerald-700 to-teal-900",
  "from-violet-700 to-indigo-900",
  "from-amber-600 to-orange-900",
  "from-rose-600 to-pink-900",
  "from-blue-700 to-cyan-900",
];

export default function PotsPage() {
  const [pots, setPots]           = useState<Pot[]>([]);
  const [loading, setLoading]     = useState(true);
  const [allUsers, setAllUsers]   = useState<OtherUser[]>([]);

  const [createOpen, setCreateOpen]         = useState(false);
  const [contributeTarget, setContTarget]   = useState<Pot | null>(null);
  const [dissolveTarget, setDissolveTarget] = useState<Pot | null>(null);
  const [leaveTarget, setLeaveTarget]       = useState<Pot | null>(null);
  const [spendTarget, setSpendTarget]       = useState<Pot | null>(null);

  const [creating, setCreating]     = useState(false);
  const [contributing, setContrib]  = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const [leaving, setLeaving]       = useState(false);
  const [spending, setSpending]     = useState(false);

  const [contAmount, setContAmount]   = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [spendDesc, setSpendDesc]     = useState("");
  const [createForm, setCreateForm]   = useState({ title: "", description: "", target: "", memberIds: [] as number[] });

  const [feedback, setFeedback]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [shownCards, setShownCards] = useState<Set<number>>(new Set());

  const showFeedback = (msg: string, ok: boolean) => {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 3500);
  };

  const toggleCard = (potId: number) =>
    setShownCards((prev) => {
      const next = new Set(prev);
      next.has(potId) ? next.delete(potId) : next.add(potId);
      return next;
    });

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

  const handleSpend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spendTarget) return;
    setSpending(true);
    try {
      const res = await fetch(`/api/pots/${spendTarget.id}/spend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(spendAmount), description: spendDesc }),
      });
      const d = await res.json();
      if (res.ok) {
        setSpendTarget(null);
        setSpendAmount("");
        setSpendDesc("");
        showFeedback(`${fmt(parseFloat(spendAmount))} spent from pot.`, true);
        loadPots();
      } else {
        showFeedback(d.message || "Payment failed.", false);
      }
    } finally {
      setSpending(false);
    }
  };

  const handleLeave = async () => {
    if (!leaveTarget) return;
    setLeaving(true);
    try {
      const res = await fetch(`/api/pots/${leaveTarget.id}/leave`, { method: "POST" });
      const d   = await res.json();
      if (res.ok) {
        setLeaveTarget(null);
        showFeedback(d.message, true);
        loadPots();
      } else {
        showFeedback(d.message || "Could not leave pot.", false);
      }
    } finally {
      setLeaving(false);
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

  const atLimit = pots.length >= 5;

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
            onClick={() => atLimit ? showFeedback("You can be in at most 5 active pots.", false) : setCreateOpen(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm cursor-pointer transition-colors ${
              atLimit
                ? "bg-gray-200 text-gray-400"
                : "bg-[#1a6e3f] text-white hover:bg-[#0d3d22]"
            }`}
          >
            <span className="text-lg leading-none">+</span> New pot
          </button>
        </div>

        {atLimit && (
          <div className="rounded-xl px-4 py-3 text-xs font-medium bg-amber-50 border border-amber-100 text-amber-700">
            5-pot limit reached. Leave or dissolve a pot to create a new one.
          </div>
        )}

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
          const progress  = Math.min((pot.totalSaved / pot.target) * 100, 100);
          const barColor  = COLORS[idx % COLORS.length];
          const cardGrad  = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
          const cardShown = shownCards.has(pot.id);

          return (
            <div key={pot.id} className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
              {/* Title + amounts — separate rows on mobile */}
              <div>
                <div className="flex items-start gap-2 justify-between">
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900 truncate">{pot.title}</h2>
                    {pot.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{pot.description}</p>}
                  </div>
                  {/* Show card toggle */}
                  <button
                    onClick={() => toggleCard(pot.id)}
                    className="shrink-0 text-xs font-semibold text-[#1a6e3f] hover:underline cursor-pointer"
                  >
                    {cardShown ? "Hide card" : "Show card"}
                  </button>
                </div>
                {/* Saved / target on its own row so it never squishes */}
                <p className="text-sm font-semibold text-gray-500 tabular-nums mt-1">
                  {fmt(pot.totalSaved)} saved &middot; {fmt(pot.target)} target
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${progress}%` }} />
              </div>

              {/* Virtual card (shown on toggle) */}
              {cardShown && (
                <div className={`bg-gradient-to-br ${cardGrad} rounded-2xl p-5 text-white shadow-lg`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">OnePot Shared</p>
                      <p className="font-bold text-sm truncate max-w-[160px]">{pot.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/60">Available</p>
                      <p className="font-bold tabular-nums">{fmt(pot.availableBalance)}</p>
                    </div>
                  </div>
                  <p className="font-mono text-lg tracking-widest mb-4">{fmtCard(pot.cardNumber)}</p>
                  <div className="flex gap-6 text-xs">
                    <div>
                      <p className="text-white/50 uppercase text-[9px] tracking-wider mb-0.5">Expires</p>
                      <p className="font-semibold">{pot.cardExpiry}</p>
                    </div>
                    <div>
                      <p className="text-white/50 uppercase text-[9px] tracking-wider mb-0.5">CVV</p>
                      <p className="font-semibold">{pot.cardCvv}</p>
                    </div>
                    <div className="ml-auto self-end">
                      <p className="font-bold text-lg italic tracking-wider text-white/80">VISA</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Members */}
              <div className="space-y-1.5">
                {pot.memberTotals.map((m) => (
                  <div key={m.userId} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate">{m.name}</span>
                    <span className="font-semibold tabular-nums text-gray-900 shrink-0 ml-2">{fmt(m.total)}</span>
                  </div>
                ))}
                {pot.totalSpent > 0 && (
                  <div className="flex justify-between text-sm pt-1 border-t border-gray-50">
                    <span className="text-gray-400">Spent from pot</span>
                    <span className="font-semibold tabular-nums text-rose-500 shrink-0 ml-2">−{fmt(pot.totalSpent)}</span>
                  </div>
                )}
              </div>

              {/* Your contribution */}
              <p className="text-xs font-semibold text-gray-400">
                Your contribution: <span className="text-gray-700">{fmt(pot.myContribution)}</span>
              </p>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setContTarget(pot); setContAmount(""); }}
                  className="flex-1 py-2.5 rounded-2xl bg-[#1a6e3f] text-white text-sm font-semibold hover:bg-[#0d3d22] transition-colors cursor-pointer"
                >
                  Add money
                </button>
                <button
                  onClick={() => { setSpendTarget(pot); setSpendAmount(""); setSpendDesc(""); }}
                  className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Pay with card
                </button>
                {pot.isCreator ? (
                  <button
                    onClick={() => setDissolveTarget(pot)}
                    className="px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Dissolve
                  </button>
                ) : (
                  <button
                    onClick={() => setLeaveTarget(pot)}
                    className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Leave
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
                { name: "title",       label: "Pot name",   type: "text",   placeholder: "House Rent - May" },
                { name: "description", label: "Description", type: "text",   placeholder: "Optional note…" },
                { name: "target",      label: "Target (£)", type: "number", placeholder: "1800" },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
                  <input
                    type={type}
                    required={name !== "description"}
                    min={name === "target" ? "1" : undefined}
                    step={name === "target" ? "0.01" : undefined}
                    placeholder={placeholder}
                    value={(createForm as Record<string, unknown>)[name] as string}
                    onChange={(e) => setCreateForm((p) => ({ ...p, [name]: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                  />
                </div>
              ))}

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
                  type="number" min="0.01" step="0.01" required placeholder="50.00"
                  value={contAmount} onChange={(e) => setContAmount(e.target.value)} autoFocus
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

      {/* ── Pay with card modal ── */}
      {spendTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSpendTarget(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0e1c2f] px-6 py-5">
              <h2 className="text-white font-bold text-lg">Pay with pot card</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {spendTarget.title} &middot; {fmt(spendTarget.availableBalance)} available
              </p>
            </div>
            <form onSubmit={handleSpend} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Amount (£)</label>
                <input
                  type="number" min="0.01" step="0.01" required placeholder="0.00"
                  value={spendAmount} onChange={(e) => setSpendAmount(e.target.value)} autoFocus
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-bold outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description / merchant</label>
                <input
                  type="text" required placeholder="e.g. Tesco, Rent, Dinner"
                  value={spendDesc} onChange={(e) => setSpendDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setSpendTarget(null)}
                  className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={spending || !spendAmount || !spendDesc}
                  className="flex-1 py-2.5 rounded-2xl bg-[#0e1c2f] text-white text-sm font-semibold hover:bg-black transition-colors disabled:opacity-60 cursor-pointer">
                  {spending ? "Processing…" : "Pay now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Leave confirm modal ── */}
      {leaveTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setLeaveTarget(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-8 pb-5 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚪</span>
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">Leave "{leaveTarget.title}"?</h2>
              <p className="text-sm text-gray-500">
                {leaveTarget.myContribution > 0
                  ? `Your contribution of ${fmt(leaveTarget.myContribution)} will be returned to your balance.`
                  : "You haven't contributed to this pot, so nothing will be refunded."}
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-2">
              <button onClick={() => setLeaveTarget(null)}
                className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                Stay
              </button>
              <button onClick={handleLeave} disabled={leaving}
                className="flex-1 py-2.5 rounded-2xl bg-gray-700 text-white text-sm font-semibold hover:bg-gray-900 transition-colors disabled:opacity-60 cursor-pointer">
                {leaving ? "Leaving…" : "Leave pot"}
              </button>
            </div>
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
