"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfileMe, updateProfile } from "@/api/profile.api";
import { UpdateProfilePayload } from "@/types/ProfileData";

export const PROFILE_QUERY_KEY = ["profile", "me"] as const;

export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfileMe,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["topicWorkspace"] });
      
      // Optionally route to login or full refresh to apply new language contexts project-wide
      window.location.href = "/";
    },
  });
};
