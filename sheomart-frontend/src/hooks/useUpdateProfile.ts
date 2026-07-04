import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/services/profile";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser } from "@/types/auth";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["profile"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setUser(updatedUser as AuthUser);
    },
  });
}
