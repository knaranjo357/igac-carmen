import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, MapPin, Calendar, Filter, X } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { useCicaStats } from '../hooks/useCicaStats';
import { AnalyticsChart } from '../components/charts/AnalyticsChart';
import { DetailModal } from '../components/modals/DetailModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';

interface ModalState {
  isOpen: boolean;
  title: string;
  category: string;
  data: any[];
}

interface Filters {
  usuarios: string[];
  coordinadores: string[];
  tenencias: string[];
  etapas: string[];
}

export function CicaAnalytics() {
  const [cicaData, setCicaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    usuarios: [],
    coordinadores: [],
    tenencias: [],
    etapas: []
  });
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    category: '',
    data: []
  });

  const { fetchDatabase } = useDatabase();
  const { userStats, coordinatorStats, tenenciaStats, etapaStats, summary, uniqueValues } = useCicaStats(cicaData, filters);

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchDatabase('cica');
      if (response?.data) {
        setCicaData(response.data);
      }
      setLoading(false);
    };
    loadData();
  }, [fetchDatabase]);

  const handleDataClick = (title: string) => (data: any) => {
    setModalState({
      isOpen: true,
      title,
      category: data.name,
      data: data.details
    });
  };

  const handleFilterChange = (filterType: keyof Filters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      usuarios: [],
      coordinadores: [],
      tenencias: [],
      etapas: []
    });
  };

  const activeFiltersCount = Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0);

  if (loading) {
    return (
      <div className="h-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-600">Cargando datos de CICA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 overflow-y-auto">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Analíticas CICA</h1>
                <p className="text-slate-600">Análisis de datos catastrales</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="primary" className="text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Filtros de Datos</h3>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-slate-600 hover:text-slate-800"
                    >
                      Limpiar todos
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Usuarios Filter */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Usuarios</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {uniqueValues.usuarios.map(usuario => (
                      <label key={usuario} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.usuarios.includes(usuario)}
                          onChange={(e) => handleFilterChange('usuarios', usuario, e.target.checked)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="truncate" title={usuario}>{usuario}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Coordinadores Filter */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Coordinadores</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {uniqueValues.coordinadores.map(coordinador => (
                      <label key={coordinador} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.coordinadores.includes(coordinador)}
                          onChange={(e) => handleFilterChange('coordinadores', coordinador, e.target.checked)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="truncate" title={coordinador}>{coordinador}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tenencias Filter */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Tenencias</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {uniqueValues.tenencias.map(tenencia => (
                      <label key={tenencia} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.tenencias.includes(tenencia)}
                          onChange={(e) => handleFilterChange('tenencias', tenencia, e.target.checked)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="truncate" title={tenencia}>{tenencia}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Etapas Filter */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Etapas</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {uniqueValues.etapas.map(etapa => (
                      <label key={etapa} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.etapas.includes(etapa)}
                          onChange={(e) => handleFilterChange('etapas', etapa, e.target.checked)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="truncate" title={etapa}>{etapa}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-premium p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Predios Mostrados</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.totalRecords.toLocaleString()}</p>
                  {summary.totalRecords !== summary.originalTotal && (
                    <p className="text-xs text-slate-500">de {summary.originalTotal.toLocaleString()} totales</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card-premium p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="card-premium p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Coordinadores</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.totalCoordinators}</p>
                </div>
              </div>
            </div>

            <div className="card-premium p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Etapas de Trabajo</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.totalEtapas}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <AnalyticsChart
            title="Predios por Usuario"
            data={userStats}
            color="#4F46E5"
            onBarClick={handleDataClick("Predios por Usuario")}
          />

          <AnalyticsChart
            title="Predios por Coordinador"
            data={coordinatorStats}
            color="#2563EB"
            onBarClick={handleDataClick("Predios por Coordinador")}
          />

          <AnalyticsChart
            title="Predios por Tenencia"
            data={tenenciaStats}
            color="#0891B2"
            onBarClick={handleDataClick("Predios por Tenencia")}
          />

          <AnalyticsChart
            title="Predios por Etapa"
            data={etapaStats}
            color="#059669"
            onBarClick={handleDataClick("Predios por Etapa")}
          />
        </div>

        <DetailModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
          title={modalState.title}
          category={modalState.category}
          data={modalState.data}
          type="cica"
        />
      </div>
    </div>
  );
}