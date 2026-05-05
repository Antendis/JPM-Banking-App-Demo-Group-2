"use client";

import { useRef, useState } from "react";

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}

export default function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [bouncing, setBouncing] = useState<Record<number, boolean>>({});
  const digits = value.padEnd(length, " ").split("").slice(0, length);

  const triggerBounce = (i: number) => {
    setBouncing((prev) => ({ ...prev, [i]: true }));
    setTimeout(() => setBouncing((prev) => ({ ...prev, [i]: false })), 300);
  };

  return (
    <div
      className="flex gap-2 justify-center"
      onPaste={(e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (pasted) {
          e.preventDefault();
          onChange(pasted);
          refs.current[Math.min(pasted.length, length - 1)]?.focus();
          // Bounce all filled digits in sequence
          pasted.split("").forEach((_, idx) => {
            setTimeout(() => triggerBounce(idx), idx * 60);
          });
        }
      }}
    >
      {digits.map((d, i) => {
        const filled = !!d.trim();
        return (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            inputMode="numeric"
            maxLength={1}
            value={d.trim()}
            autoFocus={i === 0}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              const next = value.padEnd(length, " ").split("");
              next[i] = v || " ";
              onChange(next.join("").trimEnd());
              if (v) {
                triggerBounce(i);
                if (i < length - 1) refs.current[i + 1]?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !d.trim() && i > 0) {
                refs.current[i - 1]?.focus();
              }
            }}
            className={`w-12 h-14 text-center text-2xl font-bold border rounded-xl focus:border-[#004a32] focus:ring-2 focus:ring-[#004a32]/20 outline-none text-gray-900 bg-white transition-all duration-200 ${filled ? "border-[#004a32] shadow-[0_0_0_3px_rgba(0,74,50,0.1)]" : "border-gray-300"} ${bouncing[i] ? "scale-110 -translate-y-1" : "scale-100 translate-y-0"}`}
          />
        );
      })}
    </div>
  );
}
