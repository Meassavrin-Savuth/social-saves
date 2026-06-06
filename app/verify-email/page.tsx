"use client";

import { Suspense, useEffect, useState } from "react";
import API from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        await API.get(`/verify-email?token=${token}`);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Email Verification</h1>

      {status === "loading" && <p>Verifying your email...</p>}

      {status === "success" && (
        <div>
          <p className="text-green-600 mb-4">Email verified successfully!</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-500 text-white px-4 py-2 w-full"
          >
            Go to Login
          </button>
        </div>
      )}

      {status === "error" && (
        <div>
          <p className="text-red-600 mb-4">Invalid or expired verification link</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-500 text-white px-4 py-2 w-full"
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="p-10 max-w-md mx-auto">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
