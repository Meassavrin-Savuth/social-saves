"use client";

import { useState } from "react";
import API from "@/lib/api";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await API.post("/register", {
        email,
        password,
      });

      setSuccess(true);
    } catch (err: any) {
      const errMsg = err.response?.data || "Unable to create account";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl px-6 pb-14 pt-10 sm:px-10 lg:items-start lg:pt-16">
      <div className="grid w-full gap-8 lg:grid-cols-[0.94fr_1.06fr]">
        <section className="lg:pt-6">
          <div className="app-surface mx-auto max-w-xl rounded-[28px] px-6 py-7 sm:px-8 sm:py-9">
            <div className="mb-10 flex items-center gap-3">
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

            <div className="mb-8">
              <p className="editorial-label">Get Started</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">
                Create your account
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-strong">
                Start your bookmark workspace.
              </p>
            </div>

            {success ? (
              <div className="space-y-5">
                <div className="status-success">
                  Account created successfully. Check your inbox for a verification link.
                </div>
                <div className="app-panel rounded-3xl p-5">
                  <p className="editorial-label">Next Step</p>
                  <p className="mt-3 text-sm leading-6 text-muted-strong">
                    Open the verification email, confirm your address, then sign in to
                    access your dashboard.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="button-primary inline-flex w-full items-center justify-center px-4 py-3.5 text-sm font-medium"
                >
                  Continue to login
                </Link>
              </div>
            ) : (
              <>
                {error ? <p className="status-error">{error}</p> : null}

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

                  <label className="block">
                    <span className="editorial-label">Password</span>
                    <input
                      className="field-input"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    onClick={register}
                    disabled={loading}
                    className="button-primary w-full px-4 py-3.5 text-sm font-medium"
                  >
                    {loading ? "Creating account..." : "Create account"}
                  </button>

                  <p className="text-sm text-muted">
                    Already have access?{" "}
                    <Link href="/login" className="text-white transition hover:text-[var(--accent)]">
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="hidden lg:flex lg:flex-col lg:justify-between lg:pl-8">
          <div>
            <p className="editorial-label">Why SocialSave</p>
            <h2 className="mt-4 max-w-xl text-5xl font-semibold tracking-[-0.04em] text-white">
              A premium link vault built for deep work, not busywork.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-strong">
              Save, organize, and find links faster.
            </p>
          </div>

          <div className="app-panel mt-12 rounded-[24px] p-6">
            <p className="editorial-label">Simple</p>
            <p className="mt-3 text-sm leading-6 text-muted-strong">
              Clean design, secure access, fast retrieval.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
