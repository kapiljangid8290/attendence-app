"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      router.push("/login");
    }

    setLoading(false);
  };

  const inputClass =
    "w-full px-5 py-3 rounded-full bg-white/80 text-gray-800 " +
    "transition-all duration-200 " +
    "focus:outline-none focus:ring-4 focus:ring-black/20 " +
    "hover:bg-white";

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

        {/* FORM */}
        <form
          onSubmit={handleSignup}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <input
            className={inputClass}
            placeholder="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className={inputClass}
            placeholder="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <div className="relative">
            <input
              className={inputClass}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2
                text-gray-500 hover:text-black transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              className={inputClass}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2
                text-gray-500 hover:text-black transition"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 mt-4 w-full py-3 rounded-full bg-black text-white font-medium
              transition-all duration-300
              hover:bg-gray-900 hover:shadow-lg hover:scale-[1.02]
              active:scale-[0.98]"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-800 mt-6">
          Already have an account?{" "}
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
