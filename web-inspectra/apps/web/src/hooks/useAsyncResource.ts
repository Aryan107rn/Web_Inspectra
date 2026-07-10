"use client";

import { useEffect, useState } from "react";

interface UseAsyncResourceResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Wraps a promise-returning loader with loading/error state. Used by every
 * dashboard module to fetch its slice of scan data through
 * `websiteScanService` without repeating boilerplate.
 */
export function useAsyncResource<T>(
  loader: () => Promise<T>,
  dependencies: unknown[],
  errorMessage = "Something went wrong loading this data."
): UseAsyncResourceResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (!isCancelled) setData(result);
      })
      .catch(() => {
        if (!isCancelled) setError(errorMessage);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, isLoading, error };
}
