import { useState, useCallback } from 'react';
import { DatabaseResponse, ENDPOINTS, findMatchingR2Record } from '../types/database';
import { useAuth } from '../context/AuthContext';

const dbName = 'igacDB';
const dbVersion = 1;
const storeName = 'databases';

const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  });
};

const getFromDB = async (key: string): Promise<any> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const setInDB = async (key: string, value: any): Promise<any> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const clearFromDB = async (key?: string): Promise<any> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const request = key ? store.delete(key) : store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const MAX_LOCAL_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB

const getFromLocalStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
    return null;
  }
};

const setInLocalStorage = (key: string, value: any): boolean => {
  try {
    const serializedValue = JSON.stringify(value);
    if (serializedValue.length > MAX_LOCAL_STORAGE_SIZE) {
      console.warn(`Data for ${key} exceeds localStorage size limit`);
      return false;
    }
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.warn(`Failed to store ${key} in localStorage:`, error);
    return false;
  }
};

export function useDatabase() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});
  const [databases, setDatabases] = useState<Record<string, DatabaseResponse>>({});
  const { hasPermission } = useAuth();

  const fetchDatabase = useCallback(async (key: string): Promise<DatabaseResponse | null> => {
    // Check if data is already in memory
    if (databases[key] && databases[key].timestamp && Date.now() - databases[key].timestamp! < 5 * 60 * 1000) {
      return databases[key];
    }

    // Check localStorage first
    const localData = getFromLocalStorage(`database_${key}`);
    if (localData?.data && localData.timestamp && Date.now() - localData.timestamp < 5 * 60 * 1000) {
      setDatabases(prev => ({ ...prev, [key]: localData }));
      return localData;
    }

    // Check IndexedDB
    try {
      const cachedData = await getFromDB(`database_${key}`);
      if (cachedData?.data && cachedData.timestamp && Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
        setInLocalStorage(`database_${key}`, cachedData);
        setDatabases(prev => ({ ...prev, [key]: cachedData }));
        return cachedData;
      }
    } catch (dbError) {
      console.warn('IndexedDB error:', dbError);
    }

    setLoading(prev => ({ ...prev, [key]: true }));
    setError(prev => ({ ...prev, [key]: '' }));

    try {
      const response = await fetch(ENDPOINTS[key as keyof typeof ENDPOINTS]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add timestamp and metadata
      const enrichedData = {
        ...data,
        timestamp: Date.now(),
        metadata: {
          total: data.data?.length || 0,
          lastUpdated: new Date().toISOString()
        }
      };

      // Handle R1 special case
      if (key === 'r1' && data.data) {
        try {
          const r2Response = await fetch(ENDPOINTS.r2);
          if (r2Response.ok) {
            const r2Data = await r2Response.json();
            enrichedData.data = data.data.map((record: any) => {
              const matchingR2 = findMatchingR2Record(record, r2Data.data);
              return {
                ...record,
                MATRICULA_INMOBILIARIA: matchingR2?.MATRICULA_INMOBILIARIA || ''
              };
            });
          }
        } catch (r2Error) {
          console.warn('Error fetching R2 data for R1:', r2Error);
        }
      }

      // Store in all caches
      await setInDB(`database_${key}`, enrichedData);
      setInLocalStorage(`database_${key}`, enrichedData);
      setDatabases(prev => ({ ...prev, [key]: enrichedData }));

      return enrichedData;
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      console.error(`Error fetching ${key}:`, fetchError);
      setError(prev => ({ ...prev, [key]: errorMessage }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [databases]);

  const clearCache = useCallback(async (key?: string) => {
    try {
      if (key) {
        await clearFromDB(`database_${key}`);
        localStorage.removeItem(`database_${key}`);
        setDatabases(prev => {
          const newDatabases = { ...prev };
          delete newDatabases[key];
          return newDatabases;
        });
      } else {
        await clearFromDB();
        // Clear only database-related items
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.startsWith('database_')) {
            localStorage.removeItem(storageKey);
          }
        });
        setDatabases({});
      }
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }, []);

  const refreshDatabase = useCallback(async (key: string) => {
    await clearCache(key);
    return await fetchDatabase(key);
  }, [clearCache, fetchDatabase]);

  return {
    loading,
    error,
    databases,
    fetchDatabase,
    refreshDatabase,
    clearCache,
    hasPermission
  };
}