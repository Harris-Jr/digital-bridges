import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WifiOff } from "lucide-react";
import { useOnline, flushProgress, queuedCount } from "@/lib/offline";
import { getToken } from "@/lib/api";

/**
 * App-wide sync: whenever the connection returns (and once on load), replay any
 * lesson completions that were saved while offline. Mounted once at the root so
 * it runs on every page, including the full-screen lesson player.
 */
export function OfflineSync() {
  const qc = useQueryClient();
  useEffect(() => {
    const sync = async () => {
      if (!getToken() || queuedCount() === 0) return;
      const synced = await flushProgress();
      if (synced > 0) {
        toast.success(synced === 1 ? "Synced 1 lesson you finished offline." : `Synced ${synced} lessons you finished offline.`);
        qc.invalidateQueries({ queryKey: ["progress"] });
        qc.invalidateQueries({ queryKey: ["my-badges"] });
        qc.invalidateQueries({ queryKey: ["certificates"] });
      }
    };
    void sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [qc]);
  return null;
}

/** A thin banner shown while the device is offline. */
export function OfflineBar() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-foreground px-4 py-2 text-center text-sm font-medium text-background">
      <WifiOff className="size-4" aria-hidden="true" />
      You are offline. Downloaded courses still work; your progress will sync when you reconnect.
    </div>
  );
}
