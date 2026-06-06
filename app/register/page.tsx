"use client";

import { useState } from "react";
import API from "@/lib/api";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const register = async () => {
    setError("");
    setSuccess(false);

    try {
      await API.post("/register", {
        email,
        password,
      });

      setSuccess(true);
    } catch (err: any) {
      const errMsg = err.response?.data || "Unable to create account";
      setError(errMsg);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 sm:p-10">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Create Account</h1>

        {!success && (
          <p className="mb-6 text-sm text-gray-600">
            You&apos;ll need to verify your email before you can log in.
          </p>
        )}

        {success ? (
          <div>
            <p className="mb-2 text-green-600">Account created successfully!</p>
            <p className="mb-4 text-gray-700">
              Check your email inbox for a verification link to activate your
              account.
            </p>
            <Link href="/login" className="text-blue-600 underline">
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            {error ? <p className="mb-2 text-red-600">{error}</p> : null}

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

            <p className="mb-3 text-xs text-gray-500">
              Use a strong password you do not reuse elsewhere.
            </p>

            <button
              onClick={register}
              className="w-full rounded-xl bg-green-600 px-4 py-3 text-white"
            >
              Register
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 underline">
                Login here
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
