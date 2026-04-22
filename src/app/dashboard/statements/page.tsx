"use client";

import { useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  date: string;
  reference: string;
  counterparty: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    description: "Tesco Express",
    category: "GROCERIES",
    amount: 12.45,
    type: "DEBIT",
    date: "2026-04-20T14:32:00Z",
    reference: "TESCO*EXPRESS",
    counterparty: "Tesco Stores Ltd",
  },
  {
    id: "2",
    description: "Salary",
    category: "INCOME",
    amount: 2850,
    type: "CREDIT",
    date: "2026-04-19T09:00:00Z",
    reference: "BACS SALARY APR26",
    counterparty: "Acme Corp Ltd",
  },
  {
    id: "3",
    description: "Netflix",
    category: "ENTERTAINMENT",
    amount: 17.99,
    type: "DEBIT",
    date: "2026-04-18T00:00:00Z",
    reference: "NETFLIX.COM",
    counterparty: "Netflix International",
  },
  {
    id: "4",
    description: "Pret A Manger",
    category: "EATING_OUT",
    amount: 8.1,
    type: "DEBIT",
    date: "2026-04-17T12:15:00Z",
    reference: "PRET A MANGER",
    counterparty: "Pret A Manger (Europe)",
  },
  {
    id: "5",
    description: "TfL Travel",
    category: "TRANSPORT",
    amount: 4.8,
    type: "DEBIT",
    date: "2026-04-16T08:44:00Z",
    reference: "TFL CONTACTLESS",
    counterparty: "Transport for London",
  },
  {
    id: "6",
    description: "Amazon",
    category: "SHOPPING",
    amount: 34.99,
    type: "DEBIT",
    date: "2026-04-15T18:10:00Z",
    reference: "AMZ*ORDER",
    counterparty: "Amazon UK",
  },
  {
    id: "7",
    description: "Starbucks",
    category: "EATING_OUT",
    amount: 5.6,
    type: "DEBIT",
    date: "2026-04-15T09:05:00Z",
    reference: "STARBUCKS",
    counterparty: "Starbucks UK",
  },
  {
    id: "8",
    description: "Gym Membership",
    category: "BILLS",
    amount: 25,
    type: "DEBIT",
    date: "2026-04-14T07:00:00Z",
    reference: "GYM MONTHLY",
    counterparty: "PureGym",
  },
  {
    id: "9",
    description: "Spotify",
    category: "ENTERTAINMENT",
    amount: 10.99,
    type: "DEBIT",
    date: "2026-04-13T00:00:00Z",
    reference: "SPOTIFY",
    counterparty: "Spotify Ltd",
  },
  {
    id: "10",
    description: "Freelance Payment",
    category: "INCOME",
    amount: 600,
    type: "CREDIT",
    date: "2026-04-12T11:30:00Z",
    reference: "CLIENT INV 104",
    counterparty: "Design Studio",
  },
  {
    id: "11",
    description: "Boots Pharmacy",
    category: "SHOPPING",
    amount: 14.2,
    type: "DEBIT",
    date: "2026-04-11T15:20:00Z",
    reference: "BOOTS STORE",
    counterparty: "Boots UK",
  },
  {
    id: "12",
    description: "Council Tax",
    category: "BILLS",
    amount: 140,
    type: "DEBIT",
    date: "2026-04-10T00:00:00Z",
    reference: "COUNCIL TAX",
    counterparty: "Southampton Council",
  },
];

function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StatementsPage() {
  const [selected, setSelected] = useState<Transaction | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6">
      <div className="max-w-xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Statements</h1>

          <Link href="/dashboard" className="text-sm text-blue-600">
            ← Back
          </Link>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {MOCK_TRANSACTIONS.map((tx) => (
            <button
              key={tx.id}
              onClick={() => setSelected(tx)}
              className="w-full flex justify-between items-center px-5 py-4 border-b last:border-b-0 hover:bg-gray-50"
            >
              <div className="text-left">
                <p className="font-semibold text-sm">{tx.description}</p>
                <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
              </div>

              <p
                className={`font-semibold text-sm ${
                  tx.type === "CREDIT" ? "text-green-600" : "text-gray-900"
                }`}
              >
                {tx.type === "DEBIT" ? "-" : "+"}
                {formatGBP(tx.amount)}
              </p>
            </button>
          ))}
        </div>

        {/* Modal */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-bold text-lg mb-2">
                {selected.description}
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                {formatDate(selected.date)}
              </p>

              <p className="text-xl font-bold mb-4">
                {selected.type === "DEBIT" ? "-" : "+"}
                {formatGBP(selected.amount)}
              </p>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p><strong>Reference:</strong> {selected.reference}</p>
                <p><strong>Counterparty:</strong> {selected.counterparty}</p>
                <p><strong>Category:</strong> {selected.category}</p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full bg-gray-100 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}