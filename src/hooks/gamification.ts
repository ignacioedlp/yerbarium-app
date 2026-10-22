import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { gamificationPath, getOwnGamification } from "@/api/gamification";
import { useSession } from "@/providers/session";

export function useGamification() {
  const { user, ready } = useSession();
  const enabled = ready && !!user;
  const query = useQuery({
    queryKey: ["private", gamificationPath, user?.username],
    queryFn: ({ signal }) => getOwnGamification(signal),
    enabled,
    staleTime: 0,
  });
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (enabled) void refetch();
    }, [enabled, refetch]),
  );
  return query;
}
