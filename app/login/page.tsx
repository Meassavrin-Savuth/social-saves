"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showResend, setShowResend] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (token) {
      localStorage.setItem("token", token);
      router.replace("/dashboard");
    }
  }, [router]);

  const login = async () => {
    setError("");
    setMessage("");
    setShowResend(false);

    try {
      const res = await API.post("/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      const errMsg = err.response?.data || "Invalid email or password";
      setError(errMsg);
      if (errMsg === "email not verified") {
        setShowResend(true);
      }
    }
  };

  const resendVerification = async () => {
    try {
      const res = await API.post("/resend-verification", { email });
      setMessage(res.data.message);
    } catch {
      setError("Failed to resend verification");
    }
  };

  const googleLogin = () => {
    window.location.href = `${apiBaseUrl}/auth/google/login`;
  };

  return (
    <div className="mx-auto max-w-md p-6 sm:p-10">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Login</h1>
        <p className="mb-6 text-sm text-gray-600">
          Access your saved bookmarks from your account.
        </p>

        {error ? <p className="mb-2 text-red-600">{error}</p> : null}
        {message ? <p className="mb-2 text-green-600">{message}</p> : null}

        <input
          className="mb-2 w-full rounded-xl border p-3"
          type="email"
          placeholder="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mb-2 w-full rounded-xl border p-3"
          type="password"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="mb-2 w-full rounded-xl bg-blue-600 px-4 py-3 text-white"
        >
          Login
        </button>

        {showResend && (
          <button
            onClick={resendVerification}
            className="mb-2 w-full rounded-xl bg-gray-100 px-4 py-3 text-gray-800"
          >
            Resend verification email
          </button>
        )}

        <button
          onClick={googleLogin}
          className="w-full rounded-xl border px-4 py-3"
        >
          Continue with Google
        </button>

        <div className="mt-4 space-y-2 text-center text-sm text-gray-600">
          <p>
            <Link href="/forgot-password" className="text-blue-600 underline">
              Forgot your password?
            </Link>
          </p>
          <p>
            Don’t have an account?{" "}
            <Link href="/register" className="text-blue-600 underline">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
