"use client";

import { useCallback, useEffect, useState } from "react";
import type { ScanSummary } from "@/lib/types";
import { websiteScanService } from "@/lib/services/websiteScanService";

interface UseWebsiteScanStateResult {
  scanSummary: ScanSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Loads the summary for a given scan and exposes loading/error state so
 * dashboard screens can render skeletons or empty states consistently.
 */
export function useWebsiteScanState(scanId: string): UseWebsiteScanStateResult {
  const [scanSummary, setScanSummary] = useState<ScanSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    websiteScanService
      .getScanSummary(scanId)
      .then((summary) => {
        if (!isCancelled) setScanSummary(summary);
      })
      .catch(() => {
        if (!isCancelled) setError("Unable to load scan summary. Try running the scan again.");
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [scanId, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { scanSummary, isLoading, error, refetch };
}
