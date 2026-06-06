"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Bookmark = {
  id: number;
  title: string;
  url: string;
  category: string;
  description?: string;
};

type Profile = {
  email: string;
  name?: string;
};

function getInitials(profile: Profile | null) {
  const source = profile?.name?.trim() || profile?.email?.trim() || "SS";
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getHostname(rawUrl: string) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return rawUrl;
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(bookmarks.map((item) => item.category))).sort()],
    [bookmarks],
  );

  const filteredBookmarks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bookmarks.filter((bookmark) => {
      const matchesCategory =
        selectedCategory === "All" || bookmark.category === selectedCategory;
      const matchesQuery =
        query === "" ||
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.category.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [bookmarks, searchQuery, selectedCategory]);

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setCategory("");
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEditModal = (bookmark: Bookmark) => {
    setEditingId(bookmark.id);
    setTitle(bookmark.title);
    setUrl(bookmark.url);
    setCategory(bookmark.category);
    setIsAddOpen(true);
  };

  const closeModal = () => {
    setIsAddOpen(false);
    resetForm();
  };

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/bookmarks");
      setBookmarks(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err: any) {
      setBookmarks([]);
      setError(err.response?.data || "Please log in again to view bookmarks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const verifySession = async () => {
      try {
        const profileRes = await API.get("/profile");
        setProfile(profileRes.data);
        await fetchBookmarks();
      } catch {
        localStorage.removeItem("token");
        router.replace("/login");
      }
    };

    verifySession();
  }, [fetchBookmarks, router]);

  const saveBookmark = async () => {
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        id: editingId ?? undefined,
        title,
        url,
        category,
        description: "",
      };

      if (editingId === null) {
        await API.post("/bookmarks", payload);
        setSuccess("Bookmark added successfully.");
      } else {
        await API.put("/bookmarks", payload);
        setSuccess("Bookmark updated successfully.");
      }

      closeModal();
      await fetchBookmarks();
    } catch (err: any) {
      setError(err.response?.data || "Unable to save bookmark. Please log in again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBookmark = async (id: number) => {
    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      await API.delete(`/bookmarks?id=${id}`);
      setSuccess("Bookmark deleted.");
      await fetchBookmarks();
    } catch {
      setError("Unable to delete bookmark.");
    } finally {
      setDeletingId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b hairline bg-[var(--panel)]/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border hairline bg-white/5">
                  <div className="grid grid-cols-2 gap-1">
                    <span className="h-2 w-2 rounded-[3px] bg-[var(--accent)]" />
                    <span className="h-2 w-2 rounded-[3px] bg-white/80" />
                    <span className="h-2 w-2 rounded-[3px] bg-white/55" />
                    <span className="h-2 w-2 rounded-[3px] bg-[var(--accent-strong)]" />
                  </div>
                </div>
                <span className="text-lg font-semibold text-white">SocialSave</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                {getInitials(profile)}
              </div>
              <button
                onClick={logout}
                className="button-ghost px-4 py-2.5 text-sm font-medium"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                  My Bookmarks
                </h1>
                <p className="mt-1 text-sm text-muted-strong">
                  A focused library for the links you want to find again.
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="button-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
              >
                <span className="text-base leading-none">+</span>
                Add bookmark
              </button>
            </div>

            {/* Status messages */}
            <div className="space-y-3">
              {error ? <p className="status-error">{error}</p> : null}
              {success ? <p className="status-success">{success}</p> : null}
            </div>

            {/* Search and filter */}
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="min-w-0 flex-1">
                <input
                  className="field-input"
                  placeholder="Search bookmarks"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="md:w-[220px]">
                <select
                  className="w-full rounded-lg border hairline bg-white/[0.03] px-3 py-3 text-sm text-white outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((item) => (
                    <option key={item} value={item} className="bg-[#17171b] text-white">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bookmarks */}
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
                  <p className="mt-4 text-sm text-muted-strong">Loading bookmarks...</p>
                </div>
              ) : filteredBookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] border hairline bg-white/[0.04]">
                    <svg viewBox="0 0 64 64" className="h-10 w-10 text-[var(--accent)]" aria-hidden="true">
                      <path
                        d="M17 18.5A5.5 5.5 0 0 1 22.5 13h19A5.5 5.5 0 0 1 47 18.5v29.14c0 2.43-2.79 3.8-4.71 2.31L32 42.04l-10.29 7.91c-1.92 1.48-4.71.11-4.71-2.31V18.5Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-white">📚 No bookmarks yet</p>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-muted-strong">
                    {bookmarks.length === 0
                      ? "Save your first website, article, or video."
                      : "No bookmarks match your search right now."}
                  </p>
                  {bookmarks.length === 0 && (
                    <button
                      onClick={openCreateModal}
                      className="button-primary mt-6 px-5 py-2.5 text-sm font-medium"
                    >
                      Add Bookmark
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="app-surface rounded-2xl p-5 flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(bookmark.url)}&sz=64`}
                            alt=""
                            className="h-10 w-10 rounded-lg border hairline bg-white/5 p-2 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-medium text-white">
                              {bookmark.title}
                            </h3>
                            <p className="truncate text-sm text-muted">
                              {getHostname(bookmark.url)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="rounded-full border hairline bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-strong">
                          {bookmark.category}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="button-ghost flex-1 px-3 py-2 text-sm font-medium text-center flex items-center justify-center gap-1.5"
                        >
                          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                            <path
                              d="M5 5h5.5a4.5 4.5 0 0 1 0 9H7.5A2.5 2.5 0 0 1 5 11.5V5zm4.5 2.5a2.5 2.5 0 0 0 0 5h3.5A2.5 2.5 0 0 0 15 10V5.5h-4.5v2z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Open
                        </a>
                        <button
                          onClick={() => openEditModal(bookmark)}
                          className="button-ghost px-3 py-2 text-sm font-medium flex items-center justify-center"
                          aria-label={`Edit ${bookmark.title}`}
                        >
                          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                            <path
                              d="M4.17 13.96V15.83h1.87l7.7-7.71-1.87-1.87-7.7 7.71Zm10.81-6.94a.99.99 0 0 0 0-1.4l-.6-.61a.99.99 0 0 0-1.4 0l-.72.72 1.87 1.87.85-.58Z"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteBookmark(bookmark.id)}
                          disabled={deletingId === bookmark.id}
                          className="button-danger px-3 py-2 text-sm font-medium flex items-center justify-center"
                          aria-label={`Delete ${bookmark.title}`}
                        >
                          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                            <path
                              d="M5.83 5.83 14.17 14.17M14.17 5.83 5.83 14.17"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isAddOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b]/70 px-4 backdrop-blur-sm">
          <div className="app-surface w-full max-w-xl rounded-[28px] px-6 py-6 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="editorial-label">{editingId === null ? "New Bookmark" : "Edit Bookmark"}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {editingId === null ? "Save a useful link" : "Update bookmark"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-strong">
                  Keep the title clear, the URL valid, and the category simple.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="button-ghost inline-flex h-10 w-10 items-center justify-center"
                aria-label="Close add bookmark modal"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path
                    d="M5.83 5.83 14.17 14.17M14.17 5.83 5.83 14.17"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-8 space-y-7">
              <label className="block">
                <span className="editorial-label">Title</span>
                <input
                  className="field-input"
                  placeholder="Design systems handbook"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="editorial-label">URL</span>
                <input
                  className="field-input"
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="editorial-label">Category</span>
                <input
                  className="field-input"
                  placeholder="Design"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={closeModal}
                className="button-ghost px-4 py-3 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveBookmark}
                disabled={submitting}
                className="button-primary px-4 py-3 text-sm font-medium"
              >
                {submitting ? "Saving..." : editingId === null ? "Save bookmark" : "Update bookmark"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
