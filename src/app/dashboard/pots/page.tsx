"use client";

import { useState } from "react";

interface Member {
  name: string;
  paid: number;
}

interface Pot {
  id: string;
  name: string;
  totalTarget: number;
  members: Member[];
  color: string;
}

const MOCK_POTS: Pot[] = [
  {
    id: "1",
    name: "April Rent 🏠",
    totalTarget: 1800,
    color: "bg-blue-500",
    members: [
      { name: "You", paid: 450 },
      { name: "Alex", paid: 450 },
      { name: "Sam", paid: 300 },
      { name: "Jordan", paid: 0 },
    ],
  },
  {
    id: "2",
    name: "Bills ⚡",
    totalTarget: 300,
    color: "bg-purple-500",
    members: [
      { name: "You", paid: 75 },
      { name: "Alex", paid: 75 },
      { name: "Sam", paid: 75 },
      { name: "Jordan", paid: 0 },
    ],
  },
];

function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n);
}

function getTotalPaid(pot: Pot) {
  return pot.members.reduce((sum, m) => sum + m.paid, 0);
}

export default function PotsPage() {
  const [pots, setPots] = useState(MOCK_POTS);

  const handleAddMoney = (potId: string) => {
    setPots((prev) =>
      prev.map((pot) =>
        pot.id === potId
          ? {
              ...pot,
              members: pot.members.map((m) =>
                m.name === "You" ? { ...m, paid: m.paid + 50 } : m
              ),
            }
          : pot
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="max-w-xl mx-auto px-4 pt-8 pb-16 space-y-5">

        {/* Header */}
        <div className="px-1">
          <h1 className="text-2xl font-bold text-gray-900">Your Pots</h1>
          <p className="text-sm text-gray-400">Split rent, bills & shared goals</p>
        </div>

        {/* Pots */}
        <div className="space-y-4">
          {pots.map((pot) => {
            const totalPaid = getTotalPaid(pot);
            const progress = (totalPaid / pot.totalTarget) * 100;

            const you = pot.members.find((m) => m.name === "You");
            const share = pot.totalTarget / pot.members.length;
            const remaining = share - (you?.paid ?? 0);

            return (
              <div
                key={pot.id}
                className="bg-white rounded-3xl p-5 shadow-sm"
              >
                {/* Title */}
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-bold text-gray-900">{pot.name}</h2>
                  <span className="text-sm text-gray-400">
                    {formatGBP(totalPaid)} / {formatGBP(pot.totalTarget)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className={`${pot.color} h-full`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Members */}
                <div className="space-y-2 mb-4">
                  {pot.members.map((m) => (
                    <div key={m.name} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {m.name === "You" ? "You" : m.name}
                      </span>
                      <span
                        className={`font-semibold ${
                          m.paid >= share
                            ? "text-emerald-600"
                            : "text-gray-900"
                        }`}
                      >
                        {formatGBP(m.paid)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Your status */}
                <div className="mb-4">
                  {remaining > 0 ? (
                    <p className="text-sm text-red-500 font-medium">
                      You still owe {formatGBP(remaining)}
                    </p>
                  ) : (
                    <p className="text-sm text-emerald-600 font-medium">
                      ✓ You're fully paid
                    </p>
                  )}
                </div>

                {/* Action */}
                <button
                  onClick={() => handleAddMoney(pot.id)}
                  className="w-full py-3 rounded-2xl bg-[#004a32] text-white font-semibold hover:bg-[#003824] transition-colors"
                >
                  Add £50
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}