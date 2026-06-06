"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16 sm:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center">
          <div className="mb-8 inline-flex items-center gap-3">
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
              <p className="mt-1 text-sm text-muted">A calmer bookmark manager for deep work</p>
            </div>
          </div>

          <p className="editorial-label">Bookmarking, refined</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
            Save important links in a workspace that feels fast, focused, and premium.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-strong sm:text-lg">
            SocialSave keeps references, reading lists, and essential tools in one quiet
            dashboard with categories, secure access, and a clean interface that earns its place.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="button-primary inline-flex items-center justify-center px-5 py-3.5 text-sm font-medium"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="button-ghost inline-flex items-center justify-center px-5 py-3.5 text-sm font-medium"
            >
              Log in
            </Link>
          </div>
        </section>

        <section className="app-surface rounded-[28px] p-5 sm:p-6">
          <div className="flex items-center justify-between border-b hairline pb-4">
            <div>
              <p className="editorial-label">Preview</p>
              <h2 className="mt-2 text-lg font-medium text-white">Bookmarks at a glance</h2>
            </div>
            <span className="rounded-full border hairline bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
              Live feel
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {[
              {
                title: "Linear changelog",
                url: "linear.app/changelog",
                category: "Product",
              },
              {
                title: "Raycast extensions",
                url: "raycast.com/store",
                category: "Tools",
              },
              {
                title: "Design systems notes",
                url: "example.com/design-systems",
                category: "Research",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="grid gap-3 rounded-2xl border hairline bg-white/[0.025] px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-muted">{item.url}</p>
                </div>
                <div className="justify-self-start sm:justify-self-end">
                  <span className="rounded-full border hairline bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-strong">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Secure access", "Email verification, reset flow, Google login"],
              ["Compact layout", "Rows over cards for faster scanning"],
              ["Quiet by default", "Subtle depth, sharper typography, no clutter"],
            ].map(([title, description]) => (
              <div key={title} className="app-panel rounded-2xl p-4">
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
