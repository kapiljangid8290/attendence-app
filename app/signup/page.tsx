"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) alert(error.message);
    else router.push("/login");

    setLoading(false);
  };

  const inputClass =
    "w-full px-5 py-3 rounded-full bg-white/80 text-gray-800 " +
    "transition-all duration-200 " +
    "focus:outline-none focus:bg-white " +
    "focus:ring-4 focus:ring-black/20";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden
      bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300">

      {/* Floating blobs */}
      <div className="absolute w-96 h-96 bg-pink-400/40 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
      <div className="absolute w-96 h-96 bg-purple-400/40 rounded-full blur-3xl bottom-0 right-0 animate-pulse" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl p-10 rounded-3xl
        bg-white/30 backdrop-blur-xl border border-white/30
        shadow-xl transition-all duration-300
        hover:shadow-2xl hover:-translate-y-1">

        <h1 className="text-3xl font-semibold text-center text-gray-900 mb-8">
          Sign up
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            className={inputClass}
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className={inputClass}
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className={inputClass}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className={inputClass}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="mt-8 w-full py-3 rounded-full bg-black text-white font-medium
            transition-all duration-300
            hover:bg-gray-900 hover:shadow-lg hover:scale-[1.02]
            active:scale-[0.98]"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-gray-800 mt-6">
          or{" "}
          <span
            onClick={() => router.push("/login")}
            className="underline cursor-pointer hover:text-black transition"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
