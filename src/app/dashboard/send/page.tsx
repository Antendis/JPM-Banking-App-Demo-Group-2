"use client";

import { useState } from "react";
import Link from "next/link";
import { useDelayedLoading } from "@/lib/useDelayedLoading";

type Status = { type: "success" | "error" | ""; message: string };

export default function SendPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState<Status>({ type: "", message: "" });
  const [done, setDone]       = useState(false);
  const spinner = useDelayedLoading(loading);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    const form      = new FormData(e.currentTarget);
    const toEmail   = form.get("toEmail") as string;
    const amount    = parseFloat(form.get("amount") as string);
    const reference = form.get("reference") as string;

    try {
      const res  = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail, amount, reference }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: data.message });
        setDone(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus({ type: "error", message: data.message || "Transfer failed." });
      }
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-24 sm:pb-8">
      <div className="max-w-sm mx-auto px-4 pt-6 space-y-4">

        <div className="px-1">
          <Link href="/dashboard" className="text-sm text-[#1a6e3f] font-semibold hover:underline">← Dashboard</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Send money</h1>
          <p className="text-sm text-gray-400">Instant transfer to any OnePot member</p>
        </div>

        {status.message && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            status.type === "success"
              ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]"
              : "bg-red-50 border-red-100 text-red-700"
          }`}>
            {status.message}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="bg-[#0e1c2f] px-6 py-5">
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-1">Sending from</p>
            <p className="text-white font-bold text-lg">Your OnePot account</p>
          </div>

          {done ? (
            <div className="px-6 py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[#f0fdf4] flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <p className="font-bold text-gray-900 mb-1">Transfer sent</p>
              <p className="text-sm text-gray-500 mb-6">{status.message}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setDone(false); setStatus({ type: "", message: "" }); }}
                  className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Send again
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 py-2.5 rounded-2xl bg-[#1a6e3f] text-white text-sm font-semibold hover:bg-[#0d3d22] transition-colors text-center"
                >
                  Back home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Recipient email
                </label>
                <input
                  name="toEmail"
                  type="email"
                  required
                  placeholder="friend@onepot.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Amount (£)
                </label>
                <input
                  name="amount"
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-3xl font-bold text-center outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Reference <span className="text-gray-300 normal-case font-normal">(optional)</span>
                </label>
                <input
                  name="reference"
                  type="text"
                  placeholder="e.g. Dinner last night"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#1a6e3f] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3d22] disabled:opacity-60 transition-all shadow-lg shadow-green-900/20 hover:shadow-none cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                {spinner && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {loading ? "Sending…" : "Send money"}
              </button>

              <p className="text-[11px] text-gray-400 text-center pb-1">
                Transfers are instant and cannot be reversed. Demo use only.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
