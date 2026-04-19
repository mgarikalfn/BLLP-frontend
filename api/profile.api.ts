import { api } from "@/lib/api";
import { ProfileData, UpdateProfilePayload } from "@/types/ProfileData";

export const getProfileMe = async (): Promise<ProfileData> => {
  const res = await api.get<{ data: ProfileData } | ProfileData>("/profile/me");
  return "data" in res.data ? res.data.data : res.data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<ProfileData> => {
  const res = await api.patch<{ data: ProfileData } | ProfileData>("/profile/update", payload);
  return "data" in res.data ? res.data.data : res.data;
};
