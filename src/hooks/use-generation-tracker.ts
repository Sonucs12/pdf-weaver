'use client';

import { useIndexedDB } from './use-indexed-db';
import { useCallback, useState, useEffect } from 'react';

const COUNT_KEY = 'pdfGenerationInfo';

interface GenerationInfo {
  count: number;
  timestamp: number;
}

interface GenerationTrackerHook {
  generationCount: number | null;
  incrementGenerationCount: () => Promise<void>;
  isLoading: boolean;
}

export function useGenerationTracker(): GenerationTrackerHook {
  const { get, add, error } = useIndexedDB<{ key: string, value: GenerationInfo }>('settings');
  const [generationCount, setGenerationCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getGenerationInfo = useCallback(async (): Promise<GenerationInfo | null> => {
    // The `get` function from the hook is now guarded and will reject if the DB is not ready.
    const result = await get(COUNT_KEY);
    return result?.value || null;
  }, [get]);

  const incrementGenerationCount = useCallback(async () => {
    if (!add || !getGenerationInfo) return;

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const generationInfo = await getGenerationInfo();

    let newCount = 1;
    let newTimestamp = now;

    if (generationInfo && now - generationInfo.timestamp < oneDay) {
      newCount = generationInfo.count + 1;
      newTimestamp = generationInfo.timestamp; // Keep the original timestamp for the 24h period
    }

    const newGenerationInfo: GenerationInfo = {
      count: newCount,
      timestamp: newTimestamp,
    };

    await add({ key: COUNT_KEY, value: newGenerationInfo });
    setGenerationCount(newCount);
  }, [add, getGenerationInfo]);

  useEffect(() => {
    // The `get` function's availability implies the DB is ready or will be handled by the hook.
    setIsLoading(true);
    getGenerationInfo()
      .then(info => {
        if (info && Date.now() - info.timestamp < 24 * 60 * 60 * 1000) {
          setGenerationCount(info.count);
        } else {
          setGenerationCount(0);
        }
      })
      .catch(err => {
        console.error("Error fetching generation count:", err);
        setGenerationCount(0);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [getGenerationInfo]);

  useEffect(() => {
    if (error) {
      console.error("IndexedDB error in generation tracker:", error);
      setIsLoading(false);
      setGenerationCount(0);
    }
  }, [error]);

  return { generationCount, incrementGenerationCount, isLoading };
}
