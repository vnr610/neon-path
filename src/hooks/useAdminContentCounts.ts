import { useQuery } from "@tanstack/react-query";
import { loadAdminContentCounts } from "@/lib/content";

const REFETCH_MS = 45_000;

export function useAdminContentCounts() {
  return useQuery({
    queryKey: ["admin", "content-counts"],
    queryFn: loadAdminContentCounts,
    refetchInterval: REFETCH_MS,
    refetchOnWindowFocus: true,
  });
}
