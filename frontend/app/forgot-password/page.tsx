"use client";

import { useState } from "react";
import API from "@/lib/api";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post("/forgot-password", { email });
      setMessage(res.data.message);
    } catch {
      setError("Something went wrong");
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
              <p className="editorial-label">Recovery</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">
                Reset your password
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-strong">
                Enter your email to get a reset link.
              </p>
            </div>

            <div className="space-y-3">
              {message ? <p className="status-success">{message}</p> : null}
              {error ? <p className="status-error">{error}</p> : null}
            </div>

            <div className="mt-8 space-y-7">
              <label className="block">
                <span className="editorial-label">Email</span>
                <input
                  className="field-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={submit}
                disabled={loading}
                className="button-primary w-full px-4 py-3.5 text-sm font-medium"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>

              <p className="text-sm text-muted">
                Remember your password?{" "}
                <Link href="/login" className="text-white transition hover:text-[var(--accent)]">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="hidden lg:flex lg:flex-col lg:justify-between lg:pl-8">
          <div>
            <p className="editorial-label">Simple Recovery</p>
            <h2 className="mt-4 max-w-xl text-5xl font-semibold tracking-[-0.04em] text-white">
              Get back in without the clutter.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-strong">
              Clean flow, quick reset, and back to your links.
            </p>
          </div>

          <div className="app-panel mt-12 rounded-[24px] p-6">
            <p className="editorial-label">Secure</p>
            <p className="mt-3 text-sm leading-6 text-muted-strong">
              We send a short-lived reset link to your email.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
