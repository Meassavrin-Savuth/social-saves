"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-4xl rounded-3xl border border-black/10 bg-white p-10 shadow-sm">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          SocialSave
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Save your favorite links without losing track of them.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-600">
          Keep bookmarks in one place, group them by category, and access them
          with your own account from anywhere.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-medium text-white transition hover:bg-blue-700"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-300 px-5 py-3 text-center font-medium text-gray-900 transition hover:bg-gray-50"
          >
            Log In
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900">Organize Fast</h2>
            <p className="mt-2 text-sm text-gray-600">
              Add titles, URLs, and categories so your saved links stay tidy.
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900">Secure Access</h2>
            <p className="mt-2 text-sm text-gray-600">
              Use email verification, password reset, or Google login.
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900">Simple Workflow</h2>
            <p className="mt-2 text-sm text-gray-600">
              Open, manage, and remove bookmarks from a single dashboard.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
