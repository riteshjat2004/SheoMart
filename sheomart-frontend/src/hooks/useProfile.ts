import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/services/profile";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}
