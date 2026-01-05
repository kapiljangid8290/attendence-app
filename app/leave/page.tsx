"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeavePage() {
  const router = useRouter();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300">

      <div className="w-full max-w-xl rounded-3xl
        bg-white/40 backdrop-blur-xl border border-white/30
        shadow-xl p-10">

        <h1 className="text-3xl font-semibold mb-8 text-center">
          Request Leave
        </h1>

        <div className="space-y-5">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-5 py-3 rounded-full bg-white/80
              focus:outline-none focus:ring-4 focus:ring-black/20"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-5 py-3 rounded-full bg-white/80
              focus:outline-none focus:ring-4 focus:ring-black/20"
          />

          <textarea
            placeholder="Reason for leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl bg-white/80
              focus:outline-none focus:ring-4 focus:ring-black/20"
            rows={4}
          />

          <button
            className="w-full py-3 rounded-full bg-black text-white font-medium
              hover:scale-[1.02] hover:shadow-lg transition"
          >
            Submit Leave Request
          </button>

          <button
            onClick={() => router.back()}
            className="w-full text-sm underline text-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
