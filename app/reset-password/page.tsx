"use client";

import { Suspense, useState } from "react";
import API from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      setError("Invalid reset link");
      return;
    }

    try {
      await API.post("/reset-password", { token, password });
      setSuccess(true);
    } catch {
      setError("Invalid or expired reset link");
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

      {success ? (
        <div>
          <p className="text-green-600 mb-4">Password reset successfully!</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-500 text-white px-4 py-2 w-full"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <>
          {error ? <p className="mb-2 text-red-600">{error}</p> : null}

          <input
            className="border p-2 w-full mb-2"
            type="password"
            placeholder="new password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-2"
            type="password"
            placeholder="confirm new password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            onClick={submit}
            className="bg-blue-500 text-white px-4 py-2 w-full"
          >
            Reset Password
          </button>
        </>
      )}
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="p-10 max-w-md mx-auto">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
