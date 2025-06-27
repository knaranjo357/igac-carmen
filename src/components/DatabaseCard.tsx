import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search, ChevronLeft, ChevronRight, Database, ExternalLink, Settings, Eye, EyeOff } from 'lucide-react';
import { DatabaseRecord } from '../types/database';
import { useDatabase } from '../hooks/useDatabase';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Badge } from './ui/Badge';

interface DatabaseCardProps {
  title: string;
  dbKey: string;
  data: DatabaseRecord[];
  onRefresh: () => Promise<void>;
  globalSearch: string;
}

export function DatabaseCard({ title, dbKey, data, onRefresh, globalSearch }: DatabaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState('');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const ITEMS_PER_PAGE = 10;
  const { loading, hasPermission } = useDatabase();

  const canView = hasPermission('viewer');
  const canRefresh = hasPermission('recognizer');

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  // Load visible columns from localStorage
  useEffect(() => {
    const savedColumns = localStorage.getItem(`visibleColumns_${dbKey}`);
    if (savedColumns) {
      try {
        setVisibleColumns(JSON.parse(savedColumns));
      } catch (error) {
        console.warn('Error loading saved columns:', error);
      }
    } else if (columns.length > 0) {
      // Initialize with all columns visible
      const initialVisible = columns.reduce((acc, col) => {
        acc[col] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setVisibleColumns(initialVisible);
    }
  }, [columns, dbKey]);

  // Save visible columns to localStorage
  const saveVisibleColumns = (newVisibleColumns: Record<string, boolean>) => {
    setVisibleColumns(newVisibleColumns);
    localStorage.setItem(`visibleColumns_${dbKey}`, JSON.stringify(newVisibleColumns));
  };

  const filteredData = useMemo(() => {
    if (!canView) return [];

    const searchTerm = globalSearch || localSearch;
    if (!searchTerm) return data;

    return data.filter(record =>
      Object.values(record).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, localSearch, globalSearch, canView]);

  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, localSearch]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleMatriculaClick = (matricula: string) => {
    const formatted = matricula.replace(/^320-/, '');
    return `/matricula/${formatted}`;
  };

  const toggleColumn = (column: string) => {
    const newVisibleColumns = {
      ...visibleColumns,
      [column]: !visibleColumns[column]
    };
    saveVisibleColumns(newVisibleColumns);
  };

  const visibleColumnsList = columns.filter(col => visibleColumns[col]);
  const hiddenColumnsCount = columns.length - visibleColumnsList.length;

  if (!canView) return null;

  return (
    <div className="card-premium p-4 lg:p-6 mb-6 animate-fade-in" id={dbKey}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg lg:text-xl font-bold text-slate-900">{title}</h2>
          <Badge variant="info" className="text-xs">
            {filteredData.length.toLocaleString()} registros
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {canRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
              disabled={loading[dbKey]}
            >
              <RefreshCw className={`w-5 h-5 ${loading[dbKey] ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors text-left"
        >
          {isExpanded ? 'Ocultar datos' : 'Mostrar datos'}
        </button>

        {data.length > 0 && (
          <div className="text-sm text-slate-500">
            Última actualización: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-slide-in">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={`Buscar en ${title.toLowerCase()}...`}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="input-premium pl-10 w-full"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="btn-secondary flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden lg:inline">Columnas</span>
                {hiddenColumnsCount > 0 && (
                  <Badge variant="warning" className="text-xs">
                    {hiddenColumnsCount} ocultas
                  </Badge>
                )}
              </button>

              {showColumnSelector && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  <div className="p-3 border-b border-slate-200">
                    <h3 className="font-medium text-slate-900">Seleccionar columnas</h3>
                  </div>
                  <div className="p-2">
                    {columns.map((column) => (
                      <label
                        key={column}
                        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[column] || false}
                          onChange={() => toggleColumn(column)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-700 flex-1 truncate">{column}</span>
                        {visibleColumns[column] ? (
                          <Eye className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading[dbKey] ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mobile-safe">
                <table className="table-premium mobile-table">
                  <thead>
                    <tr>
                      {visibleColumnsList.map((column) => (
                        <th key={column} className="whitespace-nowrap">
                          <div className="truncate max-w-32" title={column}>
                            {column}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((record, index) => (
                      <tr key={index}>
                        {visibleColumnsList.map((column) => {
                          const value = record[column];
                          const isMatricula = column.toLowerCase().includes('matricula');

                          return (
                            <td key={column} className="whitespace-nowrap">
                              {isMatricula ? (
                                <Link
                                  to={handleMatriculaClick(String(value))}
                                  className="flex items-center gap-1 text-primary-600 hover:text-primary-800 hover:underline"
                                >
                                  <span className="truncate max-w-32" title={String(value)}>
                                    {String(value)}
                                  </span>
                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </Link>
                              ) : (
                                <span className="text-slate-600 truncate max-w-32 block" title={String(value)}>
                                  {String(value)}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-slate-600">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="text-sm text-slate-600">
                    Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length} registros
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}