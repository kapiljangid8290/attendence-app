"use client";

import AnimatedCounter from "@/app/components/AnimatedCounter"
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [weeklyTotal, setWeeklyTotal] = useState("0h 0m");
const [monthlyTotal, setMonthlyTotal] = useState("0h 0m");


  // ✅ Calculate total duration
  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;

    if (diffMs <= 0) return "0h 0m";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${hours}h ${minutes}m`;
  };
  const sumDurations = (records: any[]) => {
  let totalMs = 0;

  records.forEach((r) => {
    if (r.punch_in && r.punch_out) {
      totalMs +=
        new Date(r.punch_out).getTime() -
        new Date(r.punch_in).getTime();
    }
  });

  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor(
    (totalMs % (1000 * 60 * 60)) / (1000 * 60)
  );

  return `${hours}h ${minutes}m`;
};


  // ✅ Fetch today's record
  const fetchTodayStatus = async () => {
    const today = new Date().toISOString().split("T")[0];

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (!error) {
      setTodayRecord(data);
    }
  };

  const fetchWeeklyMonthlyTotals = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", user.id);

  if (error || !data) return;

  const now = new Date();

  // 🟢 Week (Monday → Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  // 🟢 Month
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const weeklyRecords = data.filter(
    (r) => new Date(r.punch_in) >= startOfWeek
  );

  const monthlyRecords = data.filter(
    (r) => new Date(r.punch_in) >= startOfMonth
  );

  setWeeklyTotal(sumDurations(weeklyRecords));
  setMonthlyTotal(sumDurations(monthlyRecords));
};


  // ✅ Auth check + fetch
  useEffect(() => {
    setMounted(true);

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      await fetchTodayStatus();
await fetchWeeklyMonthlyTotals();

    };

    init();
  }, []);

  // ✅ Punch in
  const punchIn = async () => {
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today);

    if (existing && existing.length > 0) {
      alert("You have already punched in today.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("attendance").insert({
      user_id: user.id,
      punch_in: new Date().toISOString(),
      date: today,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Punch-in successful!");
      fetchTodayStatus();
    }

    setLoading(false);
  };

  // ✅ Punch out
  const punchOut = async () => {
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (error || !data) {
      alert("You must punch in first.");
      setLoading(false);
      return;
    }

    if (data.punch_out) {
      alert("You have already punched out.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("attendance")
      .update({ punch_out: new Date().toISOString() })
      .eq("id", data.id);

    if (updateError) {
      alert("Error punching out");
    } else {
      alert("Punch-out successful!");
      fetchTodayStatus();
    }

    setLoading(false);
  };
fetchWeeklyMonthlyTotals();

  if (!mounted) return null;

  return (
  <div className="min-h-screen relative overflow-hidden
    bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300
    flex items-center justify-center px-4">

    {/* Floating blobs */}
    <div className="absolute w-96 h-96 bg-pink-400/40 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
    <div className="absolute w-96 h-96 bg-purple-400/40 rounded-full blur-3xl bottom-0 right-0 animate-pulse" />

    {/* Dashboard Card */}
    <div className="relative z-10 w-full max-w-5xl p-8 md:p-10 rounded-3xl
      bg-white/30 backdrop-blur-xl border border-white/30
      shadow-xl space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Attendance Dashboard
        </h1>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="text-sm underline hover:text-black transition"
        >
          Logout
        </button>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Today Status */}
        <div className="bg-white/60 rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="font-medium text-gray-800">Today</h2>

          {!todayRecord && (
            <p className="text-sm text-gray-500">
              ❌ Not punched in yet
            </p>
          )}

          {todayRecord && (
            <>
              <p className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                {todayRecord.punch_out ? (
                  <span className="text-green-600">Checked out</span>
                ) : (
                  <span className="text-blue-600">Working</span>
                )}
              </p>

              <p className="text-sm">
                <span className="font-medium">Punch In:</span>{" "}
                {new Date(todayRecord.punch_in).toLocaleTimeString()}
              </p>

              <p className="text-sm">
                <span className="font-medium">Punch Out:</span>{" "}
                {todayRecord.punch_out
                  ? new Date(todayRecord.punch_out).toLocaleTimeString()
                  : "-"}
              </p>

              {todayRecord.punch_out && (
                <p className="pt-2 text-sm">
                  ⏱️ <span className="font-medium">Total:</span>{" "}
                  {calculateDuration(
                    todayRecord.punch_in,
                    todayRecord.punch_out
                  )}
                </p>
              )}
            </>
          )}
        </div>

        {/* Weekly Summary */}
        <div className="bg-white/60 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">This Week</p>
          <p className="text-3xl font-semibold mt-2">
            <AnimatedCounter value={parseInt(weeklyTotal)} suffix="h" />
          </p>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white/60 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-3xl font-semibold mt-2">
            <AnimatedCounter value={parseInt(monthlyTotal)} suffix="h" />
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={punchIn}
          disabled={loading}
          className="flex-1 py-3 rounded-full bg-black text-white font-medium
            transition-all duration-300
            hover:bg-gray-900 hover:shadow-lg hover:scale-[1.02]
            disabled:opacity-50"
        >
          Punch In
        </button>

        <button
          onClick={punchOut}
          disabled={loading}
          className="flex-1 py-3 rounded-full bg-gray-800 text-white font-medium
            transition-all duration-300
            hover:bg-black hover:shadow-lg hover:scale-[1.02]
            disabled:opacity-50"
        >
          Punch Out
        </button>
      </div>

    </div>
  </div>
);

}
