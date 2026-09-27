import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPosCatalog, type PosCatalogResponse } from "@/services/billing";

export const POS_CATALOG_QUERY_KEY = ["pos-catalog"] as const;

export function usePosCatalog() {
  return useQuery<PosCatalogResponse, Error>({
    queryKey: POS_CATALOG_QUERY_KEY,
    queryFn: fetchPosCatalog,
    staleTime: 1000 * 60 * 3, // 3 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useInvalidatePosCatalog() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: POS_CATALOG_QUERY_KEY });
}
