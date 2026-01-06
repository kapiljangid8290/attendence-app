"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Leave = {
  id: string;
  type: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: string;
};

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    const { data } = await supabase
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setLeaves(data);
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setLoading(true);

    await supabase
      .from("leave_requests")
      .update({ status })
      .eq("id", id);

    await fetchLeaves();
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200">
      <h1 className="text-3xl font-semibold mb-8">Leave Requests</h1>

      <div className="space-y-4">
        {leaves.map((leave) => (
          <div
  key={leave.id}
  className="bg-white/70 backdrop-blur-xl rounded-xl p-5 shadow-sm border
             hover:shadow-md transition"
>
  {/* Header */}
  <div className="flex justify-between items-start mb-3">
    <div>
      <p className="font-semibold capitalize">
        {leave.type} Leave
      </p>
      <p className="text-sm text-gray-600">
        {leave.from_date} → {leave.to_date}
      </p>
    </div>

    <span
      className={`px-3 py-1 rounded-full text-xs font-medium capitalize
        ${
          leave.status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : leave.status === "approved"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
    >
      {leave.status}
    </span>
  </div>

  {/* Reason */}
  {leave.reason && (
    <p className="text-sm text-gray-700 mb-4">
      {leave.reason}
    </p>
  )}

  {/* Actions */}
  {leave.status === "pending" && (
    <div className="flex gap-3 justify-end">
      <button
        onClick={() => updateStatus(leave.id, "approved")}
        className="px-5 py-2 rounded-lg bg-green-600 text-white
                   hover:bg-green-700 transition cursor-pointer"
      >
        Approve
      </button>

      <button
        onClick={() => updateStatus(leave.id, "rejected")}
        className="px-5 py-2 rounded-lg bg-red-500 text-white
                   hover:bg-red-600 transition cursor-pointer"
      >
        Reject
      </button>
    </div>
  )}
</div>
        ))}
      </div>
    </div>
  );
}
