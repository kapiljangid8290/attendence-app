"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ManagerRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [managerId, setManagerId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      console.log("MANAGER UID:", data.user?.id);
    });
  }, []);

  const fetchRequests = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) return;

    setManagerId(user.id);

    console.log("LOGGED IN MANAGER ID:", user.id);

    const { data, error } = await supabase
      .from("attendance_regularizations")
      .select(`
        id,
        date,
        punch_in,
        punch_out,
        reason,
        status,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    console.log("FETCH ERROR:", error);
    console.log("FETCH DATA:", data);
    console.log("DATA COUNT:", data?.length);
    
    if (error) {
      console.error("DETAILED ERROR:", error.message, error.code, error.details);
    }

    if (!error) setRequests(data || []);
    setLoading(false);
  };

  const approve = async (requestId: string) => {
    const { error } = await supabase
      .from("attendance_regularizations")
      .update({ status: "approved" })
      .eq("id", requestId);

    if (!error) {
      await fetchRequests();
    } else {
      alert("Error approving request");
    }
  };

  const reject = async (requestId: string) => {
    const { error } = await supabase
      .from("attendance_regularizations")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (!error) {
      await fetchRequests();
    } else {
      alert("Error rejecting request");
    }
  };

  const formatTime = (t?: string) => (t ? t.slice(0, 5) : "-");

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">
        Attendance Requests
      </h1>

      {loading && <p>Loading...</p>}

      {!loading && requests.length === 0 && (
        <p>No pending requests</p>
      )}

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-xl p-6 shadow"
          >
            <p><b>Employee:</b> {req.profiles?.full_name || "Unknown"} ({req.profiles?.email})</p>
            <p><b>Date:</b> {req.date}</p>
            <p><b>Punch In:</b> {formatTime(req.punch_in)}</p>
            <p><b>Punch Out:</b> {formatTime(req.punch_out)}</p>
            <p><b>Reason:</b> {req.reason || "-"}</p>

            {req.status === "pending" && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => approve(req.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => reject(req.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
//hellop