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
  const { db, error } = useIndexedDB();
  const [generationCount, setGenerationCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getGenerationInfo = useCallback(async (): Promise<GenerationInfo | null> => {
    if (!db) return null;
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(COUNT_KEY);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }, [db]);

  const incrementGenerationCount = useCallback(async () => {
    if (!db) return;

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const generationInfo = await getGenerationInfo();

    let newCount = 1;
    if (generationInfo && now - generationInfo.timestamp < oneDay) {
      newCount = generationInfo.count + 1;
    }

    const newGenerationInfo: GenerationInfo = {
      count: newCount,
      timestamp: generationInfo && now - generationInfo.timestamp < oneDay ? generationInfo.timestamp : now,
    };

    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    store.put({ key: COUNT_KEY, value: newGenerationInfo });
    setGenerationCount(newCount);
  }, [db, getGenerationInfo]);

  useEffect(() => {
    if (db) {
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
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [db, getGenerationInfo]);

  useEffect(() => {
    if (error) {
      console.error("IndexedDB error:", error);
      setIsLoading(false);
    }
  }, [error]);

  return { generationCount, incrementGenerationCount, isLoading };
}
