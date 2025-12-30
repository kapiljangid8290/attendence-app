"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  useEffect(() => {
  fetchTodayStatus();
}, []);

  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  
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

  return (
    <main style={{ padding: 40 }}>
      <h1>Attendance App</h1>

      <button onClick={punchIn} disabled={loading}>
        {loading ? "Punching in..." : "Punch In"}
      </button>
      <button onClick={punchOut} disabled={loading} style={{ marginLeft: 10 }}>
  Punch Out
</button>

    </main>
  );

}
