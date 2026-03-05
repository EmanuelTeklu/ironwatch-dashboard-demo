import { useRealtimeSubscriptions } from "@/hooks/use-realtime";

interface RealtimeProviderProps {
  readonly children: React.ReactNode;
}

/**
 * Activates Supabase realtime subscriptions within the authenticated
 * portion of the app. Place inside both QueryClientProvider and AuthProvider.
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  useRealtimeSubscriptions();
  return <>{children}</>;
}
