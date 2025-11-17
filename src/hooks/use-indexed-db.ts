"use client";

import { useState, useEffect, useCallback } from "react";

const DB_NAME = "PDFwriteDB";
const DB_VERSION = 2;

export function useIndexedDB<T>(storeName: string) {
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
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("uploadedPdfs")) {
        db.createObjectStore("uploadedPdfs", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      setDb((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      setError((event.target as IDBOpenDBRequest).error);
    };
  }, []);

  const performTransaction = useCallback(
    (
      mode: IDBTransactionMode,
      action: (store: IDBObjectStore) => IDBRequest
    ): Promise<any> => {
      // This function now assumes `db` is ready, guards are moved to the public methods.
      return new Promise((resolve, reject) => {
        try {
          const transaction = db!.transaction(storeName, mode);
          const store = transaction.objectStore(storeName);
          const request = action(store);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        } catch (err) {
          reject(err);
        }
      });
    },
    [db, storeName]
  );

  const add = useCallback(
    (item: T) => {
      if (!db) return Promise.reject(new Error("Database not available."));
      return performTransaction("readwrite", (store) => store.put(item));
    },
    [db, performTransaction]
  );

  const get = useCallback(
    (key: IDBValidKey) => {
      if (!db) return Promise.resolve(null);
      return performTransaction("readonly", (store) => store.get(key));
    },
    [db, performTransaction]
  );

  const getAll = useCallback(() => {
    if (!db) return Promise.resolve([]);
    return performTransaction("readonly", (store) => store.getAll());
  }, [db, performTransaction]);

  const remove = useCallback(
    (key: IDBValidKey) => {
      if (!db) return Promise.reject(new Error("Database not available."));
      return performTransaction("readwrite", (store) => store.delete(key));
    },
    [db, performTransaction]
  );

  return { add, get, getAll, remove, error };
}
