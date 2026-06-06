"use client";

import { useState } from "react";
import API from "@/lib/api";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setMessage("");

    try {
      const res = await API.post("/forgot-password", { email });
      setMessage(res.data.message);
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>

      {message ? <p className="mb-2 text-green-600">{message}</p> : null}
      {error ? <p className="mb-2 text-red-600">{error}</p> : null}

      <input
        className="border p-2 w-full mb-2"
        type="email"
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={submit}
        className="bg-blue-500 text-white px-4 py-2 w-full mb-2"
      >
        Send Reset Link
      </button>

      <p className="mt-4 text-sm text-center text-gray-600">
        Remember your password?{" "}
        <Link href="/login" className="text-blue-600 underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
