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
  const [weeklyTotal, setWeeklyTotal] = useState<number>(0);   // minutes
const [monthlyTotal, setMonthlyTotal] = useState<number>(0); // minutes
const isPunchedIn = !!todayRecord?.punch_in;
const isPunchedOut = !!todayRecord?.punch_out;




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
  const sumDurations = (records: any[]): number => {
  let totalMinutes = 0;

  records.forEach((r) => {
    if (r.punch_in && r.punch_out) {
      const start = new Date(r.punch_in).getTime();
      const end = new Date(r.punch_out).getTime();
      totalMinutes += Math.floor((end - start) / (1000 * 60));
    }
  });

  return totalMinutes;
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
              <div className="flex items-center gap-2">
  <span className="text-sm font-medium text-gray-600">Status</span>

  {todayRecord.punch_out ? (
    <span className="px-3 py-1 rounded-full text-sm font-semibold
      bg-red-500/10 text-red-600
      shadow-[0_0_15px_rgba(239,68,68,0.35)]">
      Checked Out
    </span>
  ) : (
    <span className="px-3 py-1 rounded-full text-sm font-semibold
      bg-green-500/10 text-green-600
      shadow-[0_0_15px_rgba(34,197,94,0.35)]">
      Working
    </span>
  )}
</div>


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
            <AnimatedCounter
  value={Math.floor(weeklyTotal / 60)}
  suffix="h"
/>
<span className="text-sm text-gray-500">
  {weeklyTotal % 60}m
</span>


          </p>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white/60 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-3xl font-semibold mt-2">
           <AnimatedCounter
  value={Math.floor(monthlyTotal / 60)}
  suffix="h"
/>
<span className="text-sm text-gray-500">
  {monthlyTotal % 60}m
</span>


          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4">
       <button
  onClick={punchIn}
  disabled={isPunchedIn}
  className={`flex-1 py-4 rounded-full font-semibold text-white transition-all
    ${
      isPunchedIn
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-black hover:scale-[1.02] active:scale-[0.98]"
    }`}
>
  {isPunchedIn ? "Already Punched In" : "Punch In"}
</button>


       <button
  onClick={punchOut}
  disabled={!isPunchedIn || isPunchedOut}
  className={`flex-1 py-4 rounded-full font-semibold text-white transition-all
    ${
      !isPunchedIn || isPunchedOut
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-slate-900 hover:scale-[1.02] active:scale-[0.98]"
    }`}
>
  {isPunchedOut ? "Already Punched Out" : "Punch Out"}
</button>

      </div>

    </div>
  </div>
);

}
