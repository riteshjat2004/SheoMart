"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSearchResults, type SearchResults } from "@/services/search";

export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  return useQuery<SearchResults, Error>({
    queryKey: ["marketplace-search", debouncedQuery],
    queryFn: () => fetchSearchResults(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 30,
    retry: 1,
  });
}
