"use client";

import { useState, useEffect } from "react";
import { Settings, ChevronDown, CreditCard, LogOut, Trash2 } from "lucide-react";

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
  sparkline: number[];
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

const PROGRESS_COLORS   = ["bg-emerald-500", "bg-teal-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-blue-500"];
const SPARKLINE_COLORS  = ["#10b981",        "#14b8a6",    "#8b5cf6",       "#f59e0b",       "#f43f5e",     "#3b82f6"   ];
const BUTTON_COLORS   = ["bg-emerald-600 hover:bg-emerald-700", "bg-teal-600 hover:bg-teal-700", "bg-violet-600 hover:bg-violet-700", "bg-amber-500 hover:bg-amber-600", "bg-rose-600 hover:bg-rose-700", "bg-blue-600 hover:bg-blue-700"];
const PLANT_COLORS    = [
  { bg: "bg-emerald-50",  icon: "text-emerald-600" },
  { bg: "bg-teal-50",     icon: "text-teal-600"    },
  { bg: "bg-violet-50",   icon: "text-violet-600"  },
  { bg: "bg-amber-50",    icon: "text-amber-600"   },
  { bg: "bg-rose-50",     icon: "text-rose-600"    },
  { bg: "bg-blue-50",     icon: "text-blue-600"    },
];
const CARD_GRADIENTS = [
  "from-emerald-700 to-teal-900",
  "from-violet-700 to-indigo-900",
  "from-amber-600 to-orange-900",
  "from-rose-600 to-pink-900",
  "from-blue-700 to-cyan-900",
];

function PlantIcon({ index, className }: { index: number; className?: string }) {
  const pot = (
    <>
      <rect x="5" y="23" width="22" height="3" rx="1.5" fill="currentColor" opacity="0.45"/>
      <path d="M7 26L6.5 31H25.5L25 26Z" fill="currentColor" opacity="0.3"/>
    </>
  );

  const plants = [
    // monstera
    <g key="monstera">
      <path d="M16 23V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 17C13 15.5 9 10 11 5C12.5 1.5 16.5 3.5 16 12" fill="currentColor" opacity="0.9"/>
      <path d="M16 17C19 15.5 23 10 21 5C19.5 1.5 15.5 3.5 16 12" fill="currentColor" opacity="0.7"/>
    </g>,
    // cactus
    <g key="cactus">
      <rect x="13" y="6" width="6" height="17" rx="3" fill="currentColor"/>
      <rect x="7"  y="10" width="7" height="5"  rx="2.5" fill="currentColor" opacity="0.85"/>
      <rect x="18" y="13" width="7" height="5"  rx="2.5" fill="currentColor" opacity="0.85"/>
      <rect x="6"  y="9"  width="2" height="7"  rx="1"   fill="currentColor"/>
      <rect x="24" y="12" width="2" height="7"  rx="1"   fill="currentColor"/>
    </g>,
    // fern
    <g key="fern">
      <path d="M16 23V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 16C13 13 8  7 11 3"  stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" fill="none"/>
      <path d="M16 18C19 15 24 9 21 5"  stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" fill="none"/>
      <path d="M16 20C14 17 11 13 13 9" stroke="currentColor" strokeWidth="1.5"  strokeLinecap="round" fill="none"/>
      <path d="M16 20C18 17 21 13 19 9" stroke="currentColor" strokeWidth="1.5"  strokeLinecap="round" fill="none"/>
      <circle cx="11" cy="3"  r="2"   fill="currentColor"/>
      <circle cx="21" cy="5"  r="2"   fill="currentColor"/>
      <circle cx="13" cy="9"  r="1.5" fill="currentColor"/>
      <circle cx="19" cy="9"  r="1.5" fill="currentColor"/>
    </g>,
    // succulent
    <g key="succulent">
      <ellipse cx="16" cy="18" rx="4"   ry="5.5" fill="currentColor"/>
      <ellipse cx="10" cy="20" rx="3"   ry="5"   fill="currentColor" opacity="0.8" transform="rotate(-25 10 20)"/>
      <ellipse cx="22" cy="20" rx="3"   ry="5"   fill="currentColor" opacity="0.8" transform="rotate(25 22 20)"/>
      <ellipse cx="7"  cy="21" rx="2.5" ry="4"   fill="currentColor" opacity="0.6" transform="rotate(-40 7 21)"/>
      <ellipse cx="25" cy="21" rx="2.5" ry="4"   fill="currentColor" opacity="0.6" transform="rotate(40 25 21)"/>
    </g>,
    // snake plant
    <g key="snake">
      <path d="M16 23 L14.5 7C14.5 5.5 15.2 4.5 16 4.5C16.8 4.5 17.5 5.5 17.5 7Z" fill="currentColor"/>
      <path d="M11 23 L10 12C10 10.5 10.8 9.5 11.8 10.5C12.5 11.5 12.5 14 11 23Z" fill="currentColor" opacity="0.8"/>
      <path d="M21 23 L22 12C22 10.5 21.2 9.5 20.2 10.5C19.5 11.5 19.5 14 21 23Z" fill="currentColor" opacity="0.8"/>
    </g>,
  ];

  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {plants[index % plants.length]}
      {pot}
    </svg>
  );
}

function SparkLine({ data, color, id }: { data: number[]; color: string; id: string }) {
  if (data.length < 2) return null;

  const W = 300;
  const H = 36;
  const max = Math.max(...data);
  if (max === 0) return null;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (v / max) * (H * 0.85),
  }));

  const line = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  const area = `${line} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-9" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} stroke={color} strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2.5" fill={color} />
    </svg>
  );
}

export default function PotsPage() {
  const [pots, setPots]           = useState<Pot[]>([]);
  const [loading, setLoading]     = useState(true);
  const [allUsers, setAllUsers]   = useState<OtherUser[]>([]);

  const [createOpen, setCreateOpen]         = useState(false);
  const [contributeTarget, setContTarget]   = useState<Pot | null>(null);
  const [dissolveTarget, setDissolveTarget] = useState<Pot | null>(null);
  const [leaveTarget, setLeaveTarget]       = useState<Pot | null>(null);
  const [spendTarget, setSpendTarget]       = useState<Pot | null>(null);
  const [managePotId, setManagePotId]       = useState<number | null>(null);

  const [dissolveOtp, setDissolveOtp]             = useState<string | null>(null);
  const [dissolveOtpInput, setDissolveOtpInput]   = useState("");

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
    fetch("/api/pots", { cache: "no-store" }).then((r) => r.json()).then((d) => {
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
            <h1 className="text-xl font-bold text-gray-900">Your pots</h1>
            <p className="text-sm text-gray-400">Save, share and grow together.</p>
          </div>
          <button
            onClick={() => atLimit ? showFeedback("You can be in at most 5 active pots.", false) : setCreateOpen(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm cursor-pointer transition-colors ${
              atLimit ? "bg-gray-200 text-gray-400" : "bg-[#1a6e3f] text-white hover:bg-[#0d3d22]"
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
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <PlantIcon index={0} className="w-10 h-10 text-emerald-600" />
            </div>
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

        {/* Click-outside overlay for manage dropdown */}
        {managePotId !== null && (
          <div className="fixed inset-0 z-[5]" onClick={() => setManagePotId(null)} />
        )}

        {/* Pots list */}
        {pots.map((pot, idx) => {
          const progress  = Math.min((pot.totalSaved / pot.target) * 100, 100);
          const barColor  = PROGRESS_COLORS[idx % PROGRESS_COLORS.length];
          const cardGrad  = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
          const btnColor  = BUTTON_COLORS[idx % BUTTON_COLORS.length];
          const plantCol  = PLANT_COLORS[idx % PLANT_COLORS.length];
          const cardShown = shownCards.has(pot.id);
          const manageOpen = managePotId === pot.id;

          return (
            <div key={pot.id} className="bg-white rounded-3xl p-5 shadow-sm space-y-3">

              {/* Header: plant icon + title + show-card toggle */}
              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 rounded-2xl ${plantCol.bg} flex items-center justify-center shrink-0`}>
                  <PlantIcon index={idx} className={`w-9 h-9 ${plantCol.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-bold text-gray-900 truncate">{pot.title}</h2>
                      {pot.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{pot.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleCard(pot.id)}
                      className="shrink-0 text-xs font-semibold text-[#1a6e3f] hover:underline cursor-pointer"
                    >
                      {cardShown ? "Hide card ↑" : "Show card ↓"}
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-500 tabular-nums mt-1">
                    {fmt(pot.totalSaved)} saved &middot;{" "}
                    {pot.totalSpent > 0 && (
                      <span className="text-rose-500">{fmt(pot.availableBalance)} available &middot; </span>
                    )}
                    {fmt(pot.target)} target
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${progress}%` }} />
              </div>

              {/* Sparkline */}
              <SparkLine
                data={pot.sparkline}
                color={SPARKLINE_COLORS[idx % SPARKLINE_COLORS.length]}
                id={`spark-${pot.id}`}
              />

              {/* Virtual card */}
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
              <div className="flex gap-2">
                <button
                  onClick={() => { setContTarget(pot); setContAmount(""); }}
                  className={`flex-1 py-2.5 rounded-2xl ${btnColor} text-white text-sm font-semibold transition-colors cursor-pointer`}
                >
                  Add money
                </button>

                {/* Manage pot dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setManagePotId(manageOpen ? null : pot.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors cursor-pointer ${
                      manageOpen ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Settings size={14} />
                    <span>Manage pot</span>
                    <ChevronDown size={13} className={`transition-transform duration-200 ${manageOpen ? "rotate-180" : ""}`} />
                  </button>

                  {manageOpen && (
                    <div className="absolute right-0 bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10 w-48">
                      <button
                        onClick={() => { setSpendTarget(pot); setSpendAmount(""); setSpendDesc(""); setManagePotId(null); }}
                        className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                      >
                        <CreditCard size={15} className="text-gray-400 shrink-0" />
                        Spend from pot
                      </button>
                      <div className="border-t border-gray-100 mx-3" />
                      {pot.isCreator ? (
                        <button
                          onClick={() => {
                            const otp = String(Math.floor(100000 + Math.random() * 900000));
                            setDissolveOtp(otp);
                            setDissolveOtpInput("");
                            setDissolveTarget(pot);
                            setManagePotId(null);
                          }}
                          className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                        >
                          <Trash2 size={15} className="shrink-0" />
                          Dissolve pot
                        </button>
                      ) : (
                        <button
                          onClick={() => { setLeaveTarget(pot); setManagePotId(null); }}
                          className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                        >
                          <LogOut size={15} className="shrink-0" />
                          Leave pot
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
                { name: "title",       label: "Pot name",    type: "text",   placeholder: "House Rent - May" },
                { name: "description", label: "Description", type: "text",   placeholder: "Optional note…"  },
                { name: "target",      label: "Target (£)",  type: "number", placeholder: "1800"             },
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

      {/* ── Contribute / Add money modal ── */}
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

      {/* ── Spend from pot modal ── */}
      {spendTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSpendTarget(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0e1c2f] px-6 py-5">
              <h2 className="text-white font-bold text-lg">Spend from pot</h2>
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
                  {spending ? "Processing…" : "Confirm spend"}
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
                <LogOut size={24} className="text-gray-500" />
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => { setDissolveTarget(null); setDissolveOtp(null); setDissolveOtpInput(""); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-8 pb-5 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">Dissolve &ldquo;{dissolveTarget.title}&rdquo;?</h2>
              <p className="text-sm text-gray-500">
                All contributions ({fmt(dissolveTarget.totalSaved)}) will be returned to each member&apos;s balance. This cannot be undone.
              </p>

              {dissolveOtp && (
                <div className="mt-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] px-4 py-3 text-left">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#166534] mb-1">Demo verification</p>
                  <p className="text-[#166534] text-sm">Your code: <span className="font-bold text-xl tracking-[0.25em]">{dissolveOtp}</span></p>
                </div>
              )}

              <div className="mt-4 text-left">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Enter code to confirm
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={dissolveOtpInput}
                  onChange={(e) => setDissolveOtpInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl tracking-[0.4em] font-mono outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-2">
              <button onClick={() => { setDissolveTarget(null); setDissolveOtp(null); setDissolveOtpInput(""); }}
                className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                Keep pot
              </button>
              <button onClick={handleDissolve} disabled={dissolving || dissolveOtpInput !== dissolveOtp}
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
