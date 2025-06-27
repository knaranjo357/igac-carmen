import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, FileText, AlertCircle, CheckCircle, List, X } from 'lucide-react';
import { ENDPOINTS, MATRICULA_COLUMNS, normalizeMatricula, DATABASE_NAMES } from '../types/database';
import { useDatabase } from '../hooks/useDatabase';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';

interface ParsedAnnotation {
  number: string;
  date: string;
  radicacion: string;
  document: string;
  value: string;
  specification: string;
  from?: string;
  to?: string;
}

export function MatriculaDetail() {
  const { matricula } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const { databases, fetchDatabase } = useDatabase();

  const parseAnnotation = (annotation: string): ParsedAnnotation | null => {
    if (!annotation) return null;

    const parts = annotation.split(';').map(part => part.trim());
    const parsed: Partial<ParsedAnnotation> = {};

    parts.forEach(part => {
      if (part.startsWith('Nro:')) parsed.number = part.replace('Nro:', '').trim();
      else if (part.startsWith('Fecha:')) parsed.date = part.replace('Fecha:', '').trim();
      else if (part.startsWith('Radicación:')) parsed.radicacion = part.replace('Radicación:', '').trim();
      else if (part.startsWith('Doc:')) parsed.document = part.replace('Doc:', '').trim();
      else if (part.startsWith('Valor_Acto:')) parsed.value = part.replace('Valor_Acto:', '').trim();
      else if (part.startsWith('Especificacion:')) parsed.specification = part.replace('Especificacion:', '').trim();
      else if (part.startsWith('De:')) parsed.from = part.replace('De:', '').trim();
      else if (part.startsWith('A:')) parsed.to = part.replace('A:', '').trim();
    });

    return parsed as ParsedAnnotation;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load all databases if not already loaded
      const promises = Object.keys(ENDPOINTS).map(async (key) => {
        if (!databases[key]) {
          await fetchDatabase(key);
        }
      });
      
      await Promise.all(promises);
      setLoading(false);
    };

    loadData();
  }, [matricula, fetchDatabase, databases]);

  const findMatchingRecords = () => {
    const matches: Record<string, any[]> = {};
    const normalizedSearchMatricula = normalizeMatricula(matricula || '');

    Object.entries(databases).forEach(([dbName, dbResponse]) => {
      if (!dbResponse?.data) {
        matches[dbName] = [];
        return;
      }

      const matchingRecords = dbResponse.data.filter((record: any) => {
        const matriculaColumn = MATRICULA_COLUMNS[dbName as keyof typeof MATRICULA_COLUMNS];
        const recordMatricula = normalizeMatricula(String(record[matriculaColumn] || ''));
        return recordMatricula === normalizedSearchMatricula;
      });

      matches[dbName] = matchingRecords;
    });

    return matches;
  };

  const renderAnnotations = (record: any) => {
    const annotations: { [key: string]: string } = {};
    Object.entries(record).forEach(([key, value]) => {
      if (key.startsWith('Anotacion_') && value) {
        annotations[key] = value as string;
      }
    });

    if (Object.keys(annotations).length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No hay anotaciones disponibles</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto mobile-safe">
        <table className="table-premium mobile-table">
          <thead>
            <tr>
              <th>Nro</th>
              <th>Fecha</th>
              <th>Radicación</th>
              <th>Documento</th>
              <th>Valor</th>
              <th>Especificación</th>
              <th>De</th>
              <th>A</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(annotations).map(([key, value]) => {
              const parsed = parseAnnotation(value);
              if (!parsed) return null;

              return (
                <tr key={key}>
                  <td className="font-medium">
                    <div className="truncate max-w-20" title={parsed.number}>
                      {parsed.number}
                    </div>
                  </td>
                  <td>
                    <div className="truncate max-w-24" title={parsed.date}>
                      {parsed.date}
                    </div>
                  </td>
                  <td>
                    <div className="truncate max-w-24" title={parsed.radicacion}>
                      {parsed.radicacion}
                    </div>
                  </td>
                  <td>
                    <div className="truncate max-w-32" title={parsed.document}>
                      {parsed.document}
                    </div>
                  </td>
                  <td>
                    <div className="truncate max-w-24" title={parsed.value}>
                      {parsed.value}
                    </div>
                  </td>
                  <td>
                    <div className="truncate max-w-40" title={parsed.specification}>
                      {parsed.specification}
                    </div>
                  </td>
                  <td>
                    <div className="truncate max-w-24" title={parsed.from || '-'}>
                      {parsed.from || '-'}
                    </div>
                  </td>
                  <td>
                    <div className="truncate max-w-24" title={parsed.to || '-'}>
                      {parsed.to || '-'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSalvedades = (records: any[]) => {
    return records.map((record, index) => (
      <div key={index} className="card-premium p-4 lg:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Salvedad #{record['NÚMERO DE ANOTACIÓN']}
          </h3>
        </div>
        <div className="overflow-x-auto mobile-safe">
          <table className="table-premium mobile-table">
            <tbody>
              {Object.entries(record).map(([key, value]) => (
                <tr key={key}>
                  <td className="font-medium bg-slate-50 w-1/3 max-w-32">
                    <div className="truncate" title={key}>{key}</div>
                  </td>
                  <td className="max-w-64">
                    <div className="whitespace-pre-wrap break-words" title={String(value)}>
                      {String(value)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ));
  };

  const renderRegularData = (records: any[]) => {
    return records.map((record, recordIndex) => (
      <div key={recordIndex} className="overflow-x-auto mobile-safe">
        <table className="table-premium mobile-table">
          <tbody>
            {Object.entries(record).map(([key, value]) => (
              <tr key={key}>
                <td className="font-medium bg-slate-50 w-1/3 max-w-32">
                  <div className="truncate" title={key}>{key}</div>
                </td>
                <td className="max-w-64">
                  <div className="whitespace-pre-wrap break-words" title={String(value)}>
                    {String(value)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="h-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-600">Cargando información de la matrícula...</p>
        </div>
      </div>
    );
  }

  const matchingRecords = findMatchingRecords();
  const hasAnyData = Object.values(matchingRecords).some(records => records.length > 0);
  const sectionsWithData = Object.entries(matchingRecords).filter(([_, records]) => records.length > 0);
  const totalSections = Object.keys(DATABASE_NAMES).length;
  const sectionsWithDataCount = sectionsWithData.length;

  return (
    <div className="h-full bg-slate-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl lg:text-3xl font-bold text-slate-900 truncate">
                Matrícula: {matricula}
              </h1>
              <p className="text-slate-600">Información detallada del predio</p>
            </div>

            {/* Mobile Navigation Toggle */}
            <button
              onClick={() => setShowNavigation(!showNavigation)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {/* Data Summary */}
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="info">
              {sectionsWithDataCount}/{totalSections} bases con datos
            </Badge>
            {!hasAnyData && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex-1">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <p className="text-amber-800 text-sm">No se encontraron datos para esta matrícula.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Navigation Overlay */}
        {showNavigation && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowNavigation(false)} />
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Navegación</h2>
                <button
                  onClick={() => setShowNavigation(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {Object.entries(DATABASE_NAMES).map(([dbName, fullName]) => {
                  const hasData = matchingRecords[dbName]?.length > 0;
                  const isActive = activeSection === dbName;
                  return (
                    <button
                      key={dbName}
                      onClick={() => {
                        setActiveSection(dbName);
                        setShowNavigation(false);
                        document.getElementById(dbName)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary-50 border border-primary-200 text-primary-900'
                          : hasData
                            ? 'hover:bg-emerald-50 text-slate-700'
                            : 'hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate pr-2">{fullName}</span>
                        {hasData ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Database className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={hasData ? 'success' : 'secondary'}
                          className="text-xs"
                        >
                          {hasData ? `${matchingRecords[dbName].length} registro${matchingRecords[dbName].length !== 1 ? 's' : ''}` : 'Sin datos'}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar Navigation */}
        <div className="hidden lg:block w-80 bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Bases de Datos</h2>
              <Badge variant="info" className="text-xs">
                {sectionsWithDataCount}/{totalSections}
              </Badge>
            </div>
            <div className="space-y-2">
              {Object.entries(DATABASE_NAMES).map(([dbName, fullName]) => {
                const hasData = matchingRecords[dbName]?.length > 0;
                const isActive = activeSection === dbName;
                return (
                  <button
                    key={dbName}
                    onClick={() => {
                      setActiveSection(dbName);
                      document.getElementById(dbName)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary-50 border border-primary-200 text-primary-900'
                        : hasData
                          ? 'hover:bg-emerald-50 text-slate-700'
                          : 'hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate pr-2">{fullName}</span>
                      {hasData ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Database className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={hasData ? 'success' : 'secondary'}
                        className="text-xs"
                      >
                        {hasData ? `${matchingRecords[dbName].length} registro${matchingRecords[dbName].length !== 1 ? 's' : ''}` : 'Sin datos'}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-8">
            {Object.entries(matchingRecords).map(([dbName, records]) => {
              if (records.length === 0) return null;

              return (
                <div key={dbName} id={dbName} className="card-premium p-4 lg:p-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="h-6 w-6 text-primary-600 flex-shrink-0" />
                    <h2 className="text-lg lg:text-xl font-semibold text-slate-900 truncate">
                      {DATABASE_NAMES[dbName as keyof typeof DATABASE_NAMES]}
                    </h2>
                    <Badge variant="info" className="ml-2 flex-shrink-0">
                      {records.length} registro{records.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="space-y-6">
                    {dbName === 'vurSalvedades' ? (
                      renderSalvedades(records)
                    ) : dbName === 'vurAnotaciones' ? (
                      renderAnnotations(records[0])
                    ) : (
                      renderRegularData(records)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}