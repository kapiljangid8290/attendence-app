"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";



export default function Home() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  

    const fetchTodayStatus = async () => {
  const today = new Date().toISOString().split("T")[0];

  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) return;

const userId = user.id;


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


 useEffect(() => {
  setMounted(true);

  const checkAuthAndFetch = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    await fetchTodayStatus();
  };

  checkAuthAndFetch();
}, []);

  

  


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

  const userId = user.id;

  const { data: existing, error: checkError } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today);

  if (checkError) {
    alert(checkError.message);
    setLoading(false);
    return;
  }

  if (existing && existing.length > 0) {
    alert("You have already punched in today.");
    setLoading(false);
    return;
  }

  const { error } = await supabase.from("attendance").insert({
    user_id: userId,
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

  const userId = user.id;

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
  } else {
    alert("Punch-out successful!");
    fetchTodayStatus();
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
