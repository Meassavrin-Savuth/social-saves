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
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
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
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setResending(true);
    setError("");
    try {
      const res = await API.post("/resend-verification", { email });
      setMessage(res.data.message);
    } catch {
      setError("Failed to resend verification");
    } finally {
      setResending(false);
    }
  };

  const googleLogin = () => {
    window.location.href = `${apiBaseUrl}/auth/google/login`;
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl px-6 pb-14 pt-8 sm:px-10 lg:items-start lg:pt-12">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section className="hidden lg:flex lg:flex-col lg:justify-between lg:pr-8">
          <div>
            <div className="mb-12 inline-flex items-center gap-3">
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
                <p className="mt-1 text-sm text-muted">Focused bookmark workspace.</p>
              </div>
            </div>
            <p className="editorial-label">Workflow</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold tracking-[-0.04em] text-white xl:text-[3.25rem]">
              Bookmarks that feel as sharp as the work around them.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted-strong">
              Save links in one quiet workspace.
            </p>
          </div>

          <div className="app-panel mt-10 grid gap-4 rounded-[24px] p-5">
            <div className="flex items-center justify-between text-sm text-muted-strong">
              <span>Today</span>
              <span>Focused mode</span>
            </div>
            <div className="grid gap-3">
              {[
                "Searchable link library without clutter",
                "Secure sign in",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border hairline bg-white/[0.025] px-4 py-3"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                  <p className="text-sm leading-6 text-muted-strong">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:pt-6">
          <div className="app-surface mx-auto max-w-lg rounded-[28px] px-6 py-7 sm:px-8 sm:py-8">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
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
              <p className="editorial-label">Welcome Back</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">
                Sign in to your library
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-strong">
                Access saved links.
              </p>
            </div>

            <div className="space-y-3">
              {error ? <p className="status-error">{error}</p> : null}
              {message ? <p className="status-success">{message}</p> : null}
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

              <label className="block">
                <div className="flex items-center justify-between gap-4">
                  <span className="editorial-label">Password</span>
                  <Link href="/forgot-password" className="text-xs text-muted transition hover:text-white">
                    Forgot password?
                  </Link>
                </div>
                <input
                  className="field-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-9 space-y-3">
              <button
                onClick={login}
                disabled={loading}
                className="button-primary w-full px-4 py-3.5 text-sm font-medium"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {showResend && (
                <button
                  onClick={resendVerification}
                  disabled={resending}
                  className="button-ghost w-full px-4 py-3.5 text-sm font-medium"
                >
                  {resending ? "Sending link..." : "Resend verification email"}
                </button>
              )}

              <button
                onClick={googleLogin}
                className="button-ghost flex w-full items-center justify-center gap-3 px-4 py-3.5 text-sm font-medium"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M21.8 12.23c0-.73-.06-1.25-.2-1.79H12v3.48h5.64c-.11.86-.72 2.16-2.08 3.03l-.02.12 3.02 2.29.21.02c1.92-1.73 3.03-4.28 3.03-7.15Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 22c2.76 0 5.08-.89 6.77-2.41l-3.22-2.43c-.86.59-2.01 1-3.55 1-2.7 0-4.99-1.73-5.81-4.13l-.12.01-3.14 2.38-.04.11C4.57 19.81 8.02 22 12 22Z"
                    fill="#34A853"
                  />
                  <path
                    d="M6.19 14.03A5.9 5.9 0 0 1 5.85 12c0-.71.13-1.39.33-2.03l-.01-.14-3.18-2.42-.1.05A9.74 9.74 0 0 0 2 12c0 1.56.38 3.03 1.04 4.33l3.15-2.3Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.84c1.94 0 3.25.82 3.99 1.5l2.91-2.76C17.07 2.92 14.76 2 12 2 8.02 2 4.57 4.19 2.9 7.47l3.29 2.5c.83-2.4 3.11-4.13 5.81-4.13Z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t hairline pt-5 text-sm">
              <p className="text-muted">
                New here?{" "}
                <Link href="/register" className="text-white transition hover:text-[var(--accent)]">
                  Create an account
                </Link>
              </p>
              <span className="text-xs uppercase tracking-[0.24em] text-muted">Secure access</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
