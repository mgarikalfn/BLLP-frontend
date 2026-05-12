import { api } from "@/lib/api";
import { ProfileData, UpdateProfilePayload } from "@/types/ProfileData";

export const getProfileMe = async (): Promise<ProfileData> => {
  const res = await api.get<{ data: ProfileData } | ProfileData>("/profile/me");
  return "data" in res.data ? res.data.data : res.data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<ProfileData> => {
  let data: any = payload;
  let headers = {};

  if (payload.avatarFile) {
    const formData = new FormData();
    formData.append("avatar", payload.avatarFile);
    if (payload.bio !== undefined) formData.append("bio", payload.bio);
    if (payload.learningDirection) formData.append("learningDirection", payload.learningDirection);
    if (payload.targetLanguage) formData.append("targetLanguage", payload.targetLanguage);
    data = formData;
    headers = { "Content-Type": "multipart/form-data" };
  }

  const res = await api.patch<{ data: ProfileData } | ProfileData>("/profile/update", data, { headers });
  return "data" in res.data ? res.data.data : res.data;
};
