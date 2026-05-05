"use client";

import { useEffect, useState } from "react";
import { Copy, Check, X } from "lucide-react";
import { Transaction, CATEGORY_MAP, formatGBP, formatDate } from "@/lib/mock-data";

const TYPE_LABEL: Record<string, string> = {
  DEBIT: "Outgoing",
  CREDIT: "Incoming",
};

export default function TransactionModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const cat = CATEGORY_MAP[tx.category] ?? { label: tx.category, pill: "bg-gray-100 text-gray-600", avatar: "bg-gray-400", chart: "#9ca3af", soft: "bg-gray-100" };
  const initials = tx.description.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tx.counterparty);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isCredit = tx.type === "CREDIT";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Transaction detail: ${tx.description}`}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur flex items-center justify-center text-white transition-colors focus-visible:ring-2 focus-visible:ring-white/60 outline-none"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Coloured header with depth */}
        <div className={`relative ${cat.avatar} px-6 pt-9 pb-7 text-center overflow-hidden`}>
          <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 bg-white/15 rounded-full blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 w-44 h-44 bg-black/10 rounded-full blur-2xl" />

          <div className="relative w-16 h-16 rounded-2xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center mx-auto mb-4 backdrop-blur">
            <span className="text-white text-xl font-bold tracking-tight">{initials}</span>
          </div>
          <p className="relative text-white/70 text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5">
            {isCredit ? "Received from" : "Paid to"}
          </p>
          <button
            onClick={handleCopy}
            className="relative inline-flex items-center gap-1.5 text-white font-semibold text-sm mb-3 hover:text-white/85 transition-colors group focus-visible:ring-2 focus-visible:ring-white/60 rounded outline-none"
            title="Copy counterparty name"
          >
            {tx.counterparty}
            {copied
              ? <Check className="w-3.5 h-3.5 text-emerald-200" />
              : <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity" />
            }
          </button>
          <p className="relative text-[40px] leading-none font-bold text-white tabular-nums tracking-tight">
            {isCredit ? "+" : "−"}
            {formatGBP(tx.amount)}
          </p>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-1">
          <div className="flex justify-center mb-4">
            <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${cat.pill}`}>
              {cat.label}
            </span>
          </div>

          {[
            { label: "Date",      value: formatDate(tx.date) },
            { label: "Reference", value: tx.reference,        mono: true },
            { label: "Type",      value: TYPE_LABEL[tx.type] ?? tx.type },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex justify-between items-center text-sm py-3 border-b border-gray-100 last:border-0">
              <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">{label}</span>
              <span className={`font-semibold text-gray-900 text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
            </div>
          ))}

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 rounded-2xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 active:scale-[0.97] transition-all focus-visible:ring-2 focus-visible:ring-[#004a32]/50 outline-none"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
