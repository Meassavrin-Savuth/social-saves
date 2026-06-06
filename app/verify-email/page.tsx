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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl px-6 pb-14 pt-10 sm:px-10 lg:items-start lg:pt-14">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="lg:pt-6">
          <div className="app-surface mx-auto max-w-lg rounded-[28px] px-6 py-7 sm:px-8 sm:py-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border hairline bg-white/5">
                <div className="grid grid-cols-2 gap-1">
                  <span className="h-2.5 w-2.5 rounded-[4px] bg-[var(--accent)]" />
                  <span className="h-2.5 w-2.5 rounded-[4px] bg-white/80" />
                  <span className="h-2.5 w-2.5 rounded-[4px] bg-white/55" />
                  <span className="h-2.5 w-2.5 rounded-[4px] bg-[var(--accent-strong)]" />
                </div>
              </div>
              <div>
                <p className="editorial-label">SocialSave</p>
                <p className="mt-1 text-sm text-muted">Focused bookmark workspace</p>
              </div>
            </div>

            <div className="mb-7">
              <p className="editorial-label">Verification</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">
                Verify your email
              </h1>
            </div>

            {status === "loading" && <p className="status-info">Verifying your email...</p>}

            {status === "success" && (
              <div className="space-y-5">
                <p className="status-success">Email verified successfully.</p>
                <button
                  onClick={() => router.push("/login")}
                  className="button-primary w-full px-4 py-3.5 text-sm font-medium"
                >
                  Go to login
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-5">
                <p className="status-error">Invalid or expired verification link.</p>
                <button
                  onClick={() => router.push("/login")}
                  className="button-primary w-full px-4 py-3.5 text-sm font-medium"
                >
                  Go to login
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="hidden lg:flex lg:flex-col lg:justify-between lg:pl-8">
          <div>
            <p className="editorial-label">Account Ready</p>
            <h2 className="mt-4 max-w-xl text-5xl font-semibold tracking-[-0.04em] text-white">
              Confirm access and enter your workspace.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-strong">
              One quick step before login.
            </p>
          </div>

          <div className="app-panel mt-12 rounded-[24px] p-6">
            <p className="editorial-label">Secure</p>
            <p className="mt-3 text-sm leading-6 text-muted-strong">
              Verification keeps the account flow clean and trusted.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-start px-6 pb-14 pt-10 sm:px-10 lg:pt-14">
          <div className="app-surface mx-auto max-w-lg rounded-[28px] px-6 py-7 sm:px-8 sm:py-8">
            <p className="text-sm text-muted-strong">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
