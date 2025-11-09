
'use client';

import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'PDFwriteDB';
const DB_VERSION = 1; // If you change the schema, you must increment this version.

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
      // Create settings store if it doesn't exist
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      // Create uploadedPdfs store if it doesn't exist
      if (!db.objectStoreNames.contains('uploadedPdfs')) {
        db.createObjectStore('uploadedPdfs', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      setDb((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      setError((event.target as IDBOpenDBRequest).error);
    };

  }, []); // The setup effect should only run once.

  const performTransaction = useCallback(
    (
      mode: IDBTransactionMode,
      action: (store: IDBObjectStore) => IDBRequest
    ): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (!db) {
          reject(new Error('Database not initialized.'));
          return;
        }
        try {
          const transaction = db.transaction(storeName, mode);
          const store = transaction.objectStore(storeName);
          const request = action(store);

          request.onsuccess = () => {
            resolve(request.result);
          };
          request.onerror = () => {
            reject(request.error);
          };
        } catch (err) {
          reject(err);
        }
      });
    },
    [db, storeName]
  );

  const add = useCallback(
    (item: T) => {
      // Using `put` is safer than `add` as it will update if the key already exists.
      return performTransaction('readwrite', (store) => store.put(item));
    },
    [performTransaction]
  );

  const get = useCallback(
    (key: IDBValidKey) => {
      return performTransaction('readonly', (store) => store.get(key));
    },
    [performTransaction]
  );

  const getAll = useCallback(() => {
    return performTransaction('readonly', (store) => store.getAll());
  }, [performTransaction]);

  const remove = useCallback(
    (key: IDBValidKey) => {
      return performTransaction('readwrite', (store) => store.delete(key));
    },
    [performTransaction]
  );

  return { db, error, add, get, getAll, remove };
}
