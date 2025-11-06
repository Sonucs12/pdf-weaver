'use client';

import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'PDFWeaverDB';
const DB_VERSION = 1;
const STORE_NAME = 'settings';

interface IndexedDBHook {
  db: IDBDatabase | null;
  error: DOMException | null;
}

export function useIndexedDB(): IndexedDBHook {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [error, setError] = useState<DOMException | null>(null);

  useEffect(() => {
    if (!window.indexedDB) {
      console.warn("IndexedDB not supported");
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      setDb((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      setError((event.target as IDBOpenDBRequest).error);
    };

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  return { db, error };
}
