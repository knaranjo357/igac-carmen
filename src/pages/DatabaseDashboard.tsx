import React, { useState, useEffect } from 'react';
import { DatabaseResponse, ENDPOINTS } from '../types/database';
import { DatabaseCard } from '../components/DatabaseCard';
import { RefreshCw, Search, Database as DatabaseIcon } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function DatabaseDashboard() {
  const [globalSearch, setGlobalSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { fetchDatabase, clearCache, hasPermission, databases } = useDatabase();

  const canRefreshAll = hasPermission('admin');

  const loadDatabase = async (key: string) => {
    await fetchDatabase(key);
  };

  const refreshAll = async () => {
    setRefreshing(true);
    await clearCache();
    const promises = Object.keys(ENDPOINTS).map(key => loadDatabase(key));
    await Promise.all(promises);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadAllDatabases = async () => {
      const promises = Object.keys(ENDPOINTS).map(key => loadDatabase(key));
      await Promise.all(promises);
    };
    loadAllDatabases();
  }, []);

  const totalRecords = Object.values(databases).reduce((sum, db) => sum + (db.data?.length || 0), 0);

  return (
    <div className="h-full bg-slate-50 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <DatabaseIcon className="h-6 w-6 text-primary-600" />
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Bases de Datos</h1>
              </div>
              <div className="text-sm text-slate-500">
                {totalRecords.toLocaleString()} registros totales
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              <div className="relative flex-1 lg:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar en todas las bases de datos..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="input-premium pl-10 w-full"
                />
              </div>

              {canRefreshAll && (
                <button
                  onClick={refreshAll}
                  disabled={refreshing}
                  className="btn-primary whitespace-nowrap"
                >
                  {refreshing ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <RefreshCw className="w-5 h-5 mr-2" />
                  )}
                  Actualizar Todo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(ENDPOINTS).map(([key, _]) => (
            <DatabaseCard
              key={key}
              dbKey={key}
              title={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              data={databases[key]?.data || []}
              onRefresh={() => loadDatabase(key)}
              globalSearch={globalSearch}
            />
          ))}
        </div>
      </div>
    </div>
  );
}