"use client";

import { useCallback, useEffect, useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");

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
        await API.get("/profile");
        await fetchBookmarks();
      } catch {
        localStorage.removeItem("token");
        router.replace("/login");
      }
    };

    verifySession();
  }, [fetchBookmarks, router]);

  const addBookmark = async () => {
    setError("");
    setSuccess("");

    try {
      await API.post("/bookmarks", {
        title,
        url,
        category,
        description: "",
      });

      setTitle("");
      setUrl("");
      setCategory("");
      setSuccess("Bookmark added successfully.");

      fetchBookmarks(); // refresh list
    } catch (err: any) {
      setError(err.response?.data || "Unable to add bookmark. Please log in again.");
    }
  };

  const deleteBookmark = async (id: number) => {
    setError("");
    setSuccess("");

    try {
      await API.delete(`/bookmarks?id=${id}`);
      setSuccess("Bookmark deleted.");
      fetchBookmarks();
    } catch {
      setError("Unable to delete bookmark.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
          <p className="mt-1 text-sm text-gray-600">
            Save and organize the links you want to keep.
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
        >
          Log out
        </button>
      </div>

      {error ? <p className="mb-4 text-red-600">{error}</p> : null}
      {success ? <p className="mb-4 text-green-600">{success}</p> : null}

      {/* CREATE FORM */}
      <div className="mb-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Add Bookmark</h2>

        <input
          className="mb-2 w-full rounded-xl border p-3"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="mb-2 w-full rounded-xl border p-3"
          type="url"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <input
          className="mb-3 w-full rounded-xl border p-3"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button
          onClick={addBookmark}
          className="rounded-xl bg-blue-600 px-4 py-3 text-white"
        >
          Add Bookmark
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-gray-600">Loading bookmarks...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No bookmarks yet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Add your first bookmark above to start building your collection.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b: any) => (
            <div
              key={b.id}
              className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{b.title}</h3>
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="break-all text-blue-600 underline"
                  >
                    {b.url}
                  </a>
                  <p className="mt-2 text-sm text-gray-500">{b.category}</p>
                </div>

                <button
                  onClick={() => deleteBookmark(b.id)}
                  className="text-sm font-medium text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
