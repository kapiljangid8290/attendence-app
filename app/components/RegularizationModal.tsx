"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RegularizationModal({
  open,
  onClose,
  fetchRegularizations,
}: {
  open: boolean;
  onClose: () => void;
  fetchRegularizations?: () => Promise<void>;
}) {
  const [date, setDate] = useState("");
  const [punchIn, setPunchIn] = useState("");
  const [punchOut, setPunchOut] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submitRequest = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("manager_id")
      .eq("id", user.id)
      .single();

    const { error } = await supabase
      .from("attendance_regularizations")
      .insert({
        user_id: user.id,
        manager_id: profile?.manager_id,
        date,
        punch_in: punchIn || null,
        punch_out: punchOut || null,
        reason,
        status: "pending",
      });

    if (error) {
      alert(error.message);
    } else {
      alert("Regularization request sent");
      if (fetchRegularizations) {
        await fetchRegularizations();
      }
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Attendance Regularization
        </h2>

        <input
          type="date"
          className="w-full mb-3 p-3 rounded-lg border"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          className="w-full mb-3 p-3 rounded-lg border"
          value={punchIn}
          onChange={(e) => setPunchIn(e.target.value)}
          placeholder="Punch In"
        />

        <input
          type="time"
          className="w-full mb-3 p-3 rounded-lg border"
          value={punchOut}
          onChange={(e) => setPunchOut(e.target.value)}
          placeholder="Punch Out"
        />

        <textarea
          className="w-full mb-4 p-3 rounded-lg border"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            onClick={submitRequest}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-black text-white"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
