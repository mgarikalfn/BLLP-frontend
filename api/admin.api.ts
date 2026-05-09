import axios from "axios";
import { api } from "@/lib/api";

export interface UserAdminView {
  id: string;
  username: string;
  email: string;
  role: string;
  userStatus: string;
  createdAt: string;
}

export interface ContentStatsView {
  totalUsers: number;
  totalExperts: number;
  totalTopics: number;
  totalLessons: number;
  totalQuestions: number;
  lessonsPendingReview: number;
}

export interface WeakContentItem {
  _id: string;
  contentType: string;
  averageEaseFactor: number;
  numberOfReviews: number;
}

export interface AnalyticsView {
  dailyActiveUsers: number;
  usersJoinedToday: number;
  weakContent: WeakContentItem[];
}

export interface AdminPagination {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

export interface AdminUsersResponse {
  data: UserAdminView[];
  pagination: AdminPagination;
}

export interface AdminUserActionResponse {
  message: string;
  data: UserAdminView;
}

type AdminUserPayload = {
  _id: string;
  username: string;
  email: string;
  role: string;
  userStatus: string;
  createdAt: string;
};

type AdminUsersPayload = {
  data: AdminUserPayload[];
  pagination: AdminPagination;
};

type AdminUserActionPayload = {
  message: string;
  data: AdminUserPayload;
};

type AdminStatsPayload = {
  stats: ContentStatsView;
};

type WeakContentPayload = {
  contentId?: string;
  _id?: string;
  contentType: string;
  averageEaseFactor: number;
  numberOfReviews: number;
};

type AnalyticsPayload = {
  analytics: {
    dailyActiveUsers: number;
    usersJoinedToday: number;
    weakContent: WeakContentPayload[];
  };
};

const toUserAdminView = (user: AdminUserPayload): UserAdminView => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  userStatus: user.userStatus,
  createdAt: user.createdAt,
});

const getAdminBasePaths = () => {
  const baseUrl = (api.defaults.baseURL || "").replace(/\/+$/, "");
  const hasApiSuffix = baseUrl.endsWith("/api");

  if (!baseUrl) {
    return ["/api/admin"];
  }

  return hasApiSuffix ? ["/admin"] : ["/api/admin", "/admin"];
};

const buildAdminUrls = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return getAdminBasePaths().map((base) => `${base}${normalizedPath}`);
};

const requestAdmin = async <T>(path: string, makeRequest: (url: string) => Promise<T>): Promise<T> => {
  const urls = buildAdminUrls(path);
  let lastError: unknown;

  for (const url of urls) {
    try {
      return await makeRequest(url);
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      lastError = error;

      if (status === 404 && url !== urls[urls.length - 1]) {
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("Admin request failed");
};

const getAuthHeaders = () => {
  if (typeof window === "undefined") return undefined;

  const existing = api.defaults.headers.common?.Authorization;
  if (existing) {
    return { Authorization: String(existing) };
  }

  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};

const handleApiError = (error: unknown, fallbackMessage: string): never => {
  throw new Error(getErrorMessage(error, fallbackMessage));
};

export const fetchUsers = async (page: number, search?: string): Promise<AdminUsersResponse> => {
  try {
    const res = await requestAdmin("/users", (url) =>
      api.get<AdminUsersPayload>(url, {
        params: search ? { page, search } : { page },
        headers: getAuthHeaders(),
      })
    );

    return {
      data: res.data.data.map(toUserAdminView),
      pagination: res.data.pagination,
    };
  } catch (error) {
    return handleApiError(error, "Error fetching users");
  }
};

export const updateUserRole = async (userId: string, role: string): Promise<AdminUserActionResponse> => {
  try {
    const res = await requestAdmin(`/users/${userId}/role`, (url) =>
      api.patch<AdminUserActionPayload>(url, { role }, { headers: getAuthHeaders() })
    );

    return {
      message: res.data.message,
      data: toUserAdminView(res.data.data),
    };
  } catch (error) {
    return handleApiError(error, "Error updating role");
  }
};

export const toggleUserStatus = async (userId: string): Promise<AdminUserActionResponse> => {
  try {
    const res = await requestAdmin(`/users/${userId}/status`, (url) =>
      api.patch<AdminUserActionPayload>(url, {}, { headers: getAuthHeaders() })
    );

    return {
      message: res.data.message,
      data: toUserAdminView(res.data.data),
    };
  } catch (error) {
    return handleApiError(error, "Error toggling user status");
  }
};

export const fetchContentStats = async (): Promise<ContentStatsView> => {
  try {
    const res = await requestAdmin("/content-stats", (url) =>
      api.get<AdminStatsPayload>(url, {
        headers: getAuthHeaders(),
      })
    );

    return res.data.stats;
  } catch (error) {
    return handleApiError(error, "Error fetching content stats");
  }
};

export const fetchAnalytics = async (): Promise<AnalyticsView> => {
  try {
    const res = await requestAdmin("/analytics", (url) =>
      api.get<AnalyticsPayload>(url, {
        headers: getAuthHeaders(),
      })
    );

    const analytics = res.data.analytics;

    return {
      dailyActiveUsers: analytics.dailyActiveUsers ?? 0,
      usersJoinedToday: analytics.usersJoinedToday ?? 0,
      weakContent: (analytics.weakContent ?? []).map((item) => ({
        _id: item.contentId ?? item._id ?? "",
        contentType: item.contentType,
        averageEaseFactor: item.averageEaseFactor,
        numberOfReviews: item.numberOfReviews,
      })),
    };
  } catch (error) {
    return handleApiError(error, "Error fetching analytics");
  }
};
