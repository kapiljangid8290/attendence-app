"use client";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LeaveModal({ open, onClose }: Props) {
  const [type, setType] = useState<"paid" | "sick" | "unpaid">("paid");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
const [loading, setLoading] = useState(false);

const submitLeave = async () => {
  if (!fromDate || !toDate) {
    alert("Please select dates");
    return;
  }

  setLoading(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Not logged in");
    setLoading(false);
    return;
  }

  const { error } = await supabase.from("leave_requests").insert({
    user_id: user.id,
    leave_type: type,        // paid | sick | unpaid
    start_date: fromDate,
    end_date: toDate,
    reason,
    status: "pending",
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Leave request submitted");
    onClose();
    setFromDate("");
    setToDate("");
    setReason("");
    setType("paid");
  }

  setLoading(false);
};


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-xl rounded-3xl
          bg-white/40 backdrop-blur-xl border border-white/30
          shadow-2xl p-8"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Request Leave
        </h2>

        {/* Leave Type */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Leave Type
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { key: "paid", label: "Paid", emoji: "💼" },
              { key: "sick", label: "Sick", emoji: "🤒" },
              { key: "unpaid", label: "Unpaid", emoji: "🚫" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key as any)}
                className={`rounded-2xl py-4 text-center font-medium transition-all
                  ${
                    type === t.key
                      ? "bg-black text-white shadow-lg scale-[1.02]"
                      : "bg-white/70 hover:bg-white"
                  }`}
              >
                <div className="text-2xl mb-1">{t.emoji}</div>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/80
              focus:outline-none focus:ring-4 focus:ring-black/20"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/80
              focus:outline-none focus:ring-4 focus:ring-black/20"
          />
        </div>

        {/* Reason */}
        <textarea
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full mb-6 px-4 py-3 rounded-2xl bg-white/80
            focus:outline-none focus:ring-4 focus:ring-black/20"
        />

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-black/20
              bg-white/60 hover:bg-white transition"
          >
            Cancel
          </button>

         <button
  onClick={submitLeave}
  disabled={loading}
  className="flex-1 py-3 rounded-full bg-black text-white font-medium
    hover:scale-[1.02] hover:shadow-lg transition
    disabled:opacity-50"
>
  {loading ? "Submitting..." : "Submit Request"}
</button>

        </div>
      </motion.div>
    </div>
  );
}
