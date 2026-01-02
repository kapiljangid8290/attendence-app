"use client";

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
    <main style={{ padding: 40 }}>
      <h1>Attendance App</h1>

      <div style={{ marginBottom: 20 }}>
        <h3>Today's Status</h3>

        {!todayRecord && <p>❌ Not punched in yet</p>}

        {todayRecord && (
          <>
            <p>
              Status:{" "}
              {todayRecord.punch_out ? "✅ Checked out" : "🟢 Working"}
            </p>

            <p>
              Punch In:{" "}
              {todayRecord.punch_in
                ? new Date(todayRecord.punch_in).toLocaleTimeString()
                : "-"}
            </p>

            <p>
              Punch Out:{" "}
              {todayRecord.punch_out
                ? new Date(todayRecord.punch_out).toLocaleTimeString()
                : "-"}
            </p>

            {todayRecord.punch_out && (
              <p>
                ⏱️ <strong>Total Hours:</strong>{" "}
                {calculateDuration(
                  todayRecord.punch_in,
                  todayRecord.punch_out
                )}
              </p>
            )}
          </>
        )}
      </div>
<div style={{ marginTop: 30 }}>
  <h3>📊 Summary</h3>

  <p>
    <strong>This Week:</strong> {weeklyTotal}
  </p>

  <p>
    <strong>This Month:</strong> {monthlyTotal}
  </p>
</div>

      <button onClick={punchIn} disabled={loading}>
        {loading ? "Punching in..." : "Punch In"}
      </button>

      <button
        onClick={punchOut}
        disabled={loading}
        style={{ marginLeft: 10 }}
      >
        Punch Out
      </button>
    </main>
  );
}
