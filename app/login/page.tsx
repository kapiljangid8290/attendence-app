"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 relative overflow-hidden">
    
    {/* Floating blobs */}
    <div className="absolute w-72 h-72 bg-pink-400 rounded-full blur-3xl opacity-40 -top-10 -left-10 animate-pulse" />
    <div className="absolute w-72 h-72 bg-purple-400 rounded-full blur-3xl opacity-40 bottom-10 right-10 animate-pulse" />

    {/* Glass Card */}
    <div className="relative z-10 w-full max-w-md p-8 rounded-2xl 
      bg-white/30 backdrop-blur-xl border border-white/30
      shadow-xl transition-all duration-300
      hover:shadow-2xl hover:-translate-y-1"
    >
      
      <h1 className="text-3xl font-semibold text-center text-gray-900 mb-6">
        Log in
      </h1>

      {/* Email */}
      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-3 rounded-full bg-white/80 text-gray-800
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-black/20
            hover:bg-white"
        />
      </div>

      {/* Password */}
      <div className="mb-3">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-5 py-3 rounded-full bg-white/80 text-gray-800
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-black/20
            hover:bg-white"
        />
      </div>

      {/* Options */}
      <div className="flex items-center justify-between text-sm text-gray-700 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" />
          Remember me
        </label>
        <span className="cursor-pointer hover:underline hover:text-black transition">
          Forgot password?
        </span>
      </div>

      {/* Button */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-3 rounded-full bg-black text-white font-medium
          transition-all duration-300
          hover:bg-gray-900 hover:shadow-lg hover:scale-[1.02]
          active:scale-[0.98]"
      >
        {loading ? "Logging in..." : "Log in"}
      </button>

      {/* Signup */}
      <p className="text-center text-sm text-gray-800 mt-6">
        Don’t have an account?{" "}
        <span
          onClick={() => router.push("/signup")}
          className="font-medium underline cursor-pointer
            hover:text-black transition"
        >
          Sign up
        </span>
      </p>
    </div>
  </div>
  );
}
