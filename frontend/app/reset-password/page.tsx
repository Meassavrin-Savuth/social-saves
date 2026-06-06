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
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      setError("Invalid reset link");
      setLoading(false);
      return;
    }

    try {
      await API.post("/reset-password", { token, password });
      setSuccess(true);
    } catch {
      setError("Invalid or expired reset link");
    } finally {
      setLoading(false);
    }
  };

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
              <p className="editorial-label">New Password</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">
                Choose a new password
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-strong">
                Keep it simple and secure.
              </p>
            </div>

            {success ? (
              <div className="space-y-5">
                <div className="status-success">Password reset successfully.</div>
                <button
                  onClick={() => router.push("/login")}
                  className="button-primary w-full px-4 py-3.5 text-sm font-medium"
                >
                  Go to login
                </button>
              </div>
            ) : (
              <>
                {error ? <p className="status-error">{error}</p> : null}

                <div className="mt-8 space-y-7">
                  <label className="block">
                    <span className="editorial-label">Password</span>
                    <input
                      className="field-input"
                      type="password"
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>

                  <label className="block">
                    <span className="editorial-label">Confirm</span>
                    <input
                      className="field-input"
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </label>
                </div>

                <div className="mt-8">
                  <button
                    onClick={submit}
                    disabled={loading}
                    className="button-primary w-full px-4 py-3.5 text-sm font-medium"
                  >
                    {loading ? "Resetting..." : "Reset password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="hidden lg:flex lg:flex-col lg:justify-between lg:pl-8">
          <div>
            <p className="editorial-label">Secure Access</p>
            <h2 className="mt-4 max-w-xl text-5xl font-semibold tracking-[-0.04em] text-white">
              Set a new password and continue.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-strong">
              Quick recovery, same quiet workflow.
            </p>
          </div>

          <div className="app-panel mt-12 rounded-[24px] p-6">
            <p className="editorial-label">Reset Link</p>
            <p className="mt-3 text-sm leading-6 text-muted-strong">
              This screen only works with a valid reset token.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ResetPassword() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}
