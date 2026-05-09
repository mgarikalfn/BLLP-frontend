"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import {
  fetchUsers,
  toggleUserStatus,
  updateUserRole,
  type AdminPagination,
  type UserAdminView,
} from "@/api/admin.api";

interface ToastState {
  type: "success" | "error";
  message: string;
}

const roleOptions = [
  { label: "Learner", value: "LEARNER" },
  { label: "Expert", value: "EXPERT" },
  { label: "Admin", value: "ADMIN" },
];

const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAdminView[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const showToast = useCallback((type: ToastState["type"], message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchUsers(page, query || undefined);
        if (!active) return;
        setUsers(response.data);
        setPagination(response.pagination);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load users.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      active = false;
    };
  }, [page, query]);

  const totalPages = pagination?.pages ?? 1;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const handleRoleChange = async (userId: string, role: string) => {
    const previous = users.find((user) => user.id === userId);
    if (!previous || previous.role === role) return;

    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
    setBusyUserId(userId);

    try {
      const response = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((user) => (user.id === userId ? response.data : user)));
      showToast("success", response.message || "Role updated.");
    } catch (err) {
      setUsers((prev) => prev.map((user) => (user.id === userId ? previous : user)));
      showToast("error", err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setBusyUserId(userId);

    try {
      const response = await toggleUserStatus(userId);
      setUsers((prev) => prev.map((user) => (user.id === userId ? response.data : user)));
      showToast("success", response.message || "User status updated.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to toggle user status.");
    } finally {
      setBusyUserId(null);
    }
  };

  const isBusy = useMemo(() => busyUserId !== null, [busyUserId]);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Admin Dashboard</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">User Management</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Search, review, and manage learner access in one place.
        </p>
      </header>

      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by username or email"
            className="w-full text-sm font-semibold text-slate-700 outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
        >
          Search
        </button>
      </form>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Join Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isActive = user.userStatus === "ACTIVE";

                  return (
                    <tr key={user.id} className="text-slate-700">
                      <td className="px-4 py-3 font-semibold">{user.username}</td>
                      <td className="px-4 py-3 text-slate-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(event) => handleRoleChange(user.id, event.target.value)}
                          disabled={busyUserId === user.id}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-slate-400"
                        >
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {user.userStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user.id)}
                          disabled={busyUserId === user.id}
                          className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                            isActive
                              ? "bg-rose-600 text-white hover:bg-rose-700"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          } ${busyUserId === user.id ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {isActive ? "Ban" : "Unban"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
          <span>
            Page {pagination?.page ?? page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || isBusy}
              className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || isBusy}
              className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed right-6 top-6 z-50 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className={toast.type === "success" ? "text-emerald-600" : "text-rose-600"} />
            <span className={toast.type === "success" ? "text-emerald-700" : "text-rose-700"}>{toast.message}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
