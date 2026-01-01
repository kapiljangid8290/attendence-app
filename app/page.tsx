"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [mounted, setMounted] = useState(false);
const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  fetchTodayStatus();
}, []);

  

  
  const fetchTodayStatus = async () => {
  const today = new Date().toISOString().split("T")[0];
  const userId = "00000000-0000-0000-0000-000000000001";

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (!error) {
    setTodayRecord(data);
  }
};

  const punchIn = async () => {
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];
    const userId = "00000000-0000-0000-0000-000000000001";

    // 1️⃣ Check if already punched in today
    const { data: existing, error: checkError } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today);

    if (checkError) {
      console.error("CHECK ERROR:", checkError);
      alert(checkError.message);
      setLoading(false);
      return;
    }

    if (existing && existing.length > 0) {
      alert("You have already punched in today.");
      setLoading(false);
      return;
    }

    // 2️⃣ Insert punch-in record
    const { data, error } = await supabase
      .from("attendance")
      .insert({
        user_id: userId,
        punch_in: new Date().toISOString(),
        date: today,
      })
      .select();

    if (error) {
      console.error("INSERT ERROR:", error);
      alert(error.message);
    } else {
      console.log("Inserted row:", data);
      alert("Punch-in successful!");
    }

    setLoading(false);
  };
const punchOut = async () => {
  setLoading(true);

  const today = new Date().toISOString().split("T")[0];
  const userId = "00000000-0000-0000-0000-000000000001";

  // Find today's record
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
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
    .update({
      punch_out: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (updateError) {
    alert("Error punching out");
    console.error(updateError);
  } else {
    alert("Punch-out successful!");
  }

  setLoading(false);
};
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
  ? todayRecord.punch_in.slice(11, 19)
  : "-"}

      </p>

      <p>
        Punch Out:{" "}
       {todayRecord.punch_out
  ? todayRecord.punch_out.slice(11, 19)
  : "-"}

      </p>
    </>
  )}
</div>

      <button onClick={punchIn} disabled={loading}>
        {loading ? "Punching in..." : "Punch In"}
      </button>
      <button onClick={punchOut} disabled={loading} style={{ marginLeft: 10 }}>
  Punch Out
</button>

    </main>
  );

}
