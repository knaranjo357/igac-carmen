import { useMemo } from 'react';
import { DatabaseRecord, ChartData } from '../types/database';

interface CicaRecord extends DatabaseRecord {
  Usuario: string;
  Coordinador: string;
  Tenencia: string;
  Etapa: string;
  'Numero Predial': string;
  Matricula: string;
}

export function useCicaStats(cicaData: CicaRecord[], filters: any = {}) {
  const filteredData = useMemo(() => {
    if (!cicaData.length) return [];
    
    return cicaData.filter(record => {
      if (filters.usuarios && filters.usuarios.length > 0) {
        if (!filters.usuarios.includes(record.Usuario)) return false;
      }
      if (filters.coordinadores && filters.coordinadores.length > 0) {
        if (!filters.coordinadores.includes(record.Coordinador)) return false;
      }
      if (filters.tenencias && filters.tenencias.length > 0) {
        if (!filters.tenencias.includes(record.Tenencia)) return false;
      }
      if (filters.etapas && filters.etapas.length > 0) {
        if (!filters.etapas.includes(record.Etapa)) return false;
      }
      return true;
    });
  }, [cicaData, filters]);

  const userStats = useMemo((): ChartData[] => {
    const stats = filteredData.reduce((acc: { [key: string]: CicaRecord[] }, record) => {
      const user = record.Usuario || 'No asignado';
      if (!acc[user]) acc[user] = [];
      acc[user].push(record);
      return acc;
    }, {});

    return Object.entries(stats)
      .map(([name, records]) => ({
        name,
        count: records.length,
        details: records
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  const coordinatorStats = useMemo((): ChartData[] => {
    const stats = filteredData.reduce((acc: { [key: string]: CicaRecord[] }, record) => {
      const coordinator = record.Coordinador || 'No asignado';
      if (!acc[coordinator]) acc[coordinator] = [];
      acc[coordinator].push(record);
      return acc;
    }, {});

    return Object.entries(stats)
      .map(([name, records]) => ({
        name,
        count: records.length,
        details: records
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  const tenenciaStats = useMemo((): ChartData[] => {
    const stats = filteredData.reduce((acc: { [key: string]: CicaRecord[] }, record) => {
      const tenencia = record.Tenencia || 'No especificado';
      if (!acc[tenencia]) acc[tenencia] = [];
      acc[tenencia].push(record);
      return acc;
    }, {});

    return Object.entries(stats)
      .map(([name, records]) => ({
        name,
        count: records.length,
        details: records
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  const etapaStats = useMemo((): ChartData[] => {
    const stats = filteredData.reduce((acc: { [key: string]: CicaRecord[] }, record) => {
      const etapa = record.Etapa || 'No especificado';
      if (!acc[etapa]) acc[etapa] = [];
      acc[etapa].push(record);
      return acc;
    }, {});

    return Object.entries(stats)
      .map(([name, records]) => ({
        name,
        count: records.length,
        details: records
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  const uniqueValues = useMemo(() => ({
    usuarios: [...new Set(cicaData.map(r => r.Usuario).filter(Boolean))],
    coordinadores: [...new Set(cicaData.map(r => r.Coordinador).filter(Boolean))],
    tenencias: [...new Set(cicaData.map(r => r.Tenencia).filter(Boolean))],
    etapas: [...new Set(cicaData.map(r => r.Etapa).filter(Boolean))]
  }), [cicaData]);

  const summary = useMemo(() => ({
    totalRecords: filteredData.length,
    originalTotal: cicaData.length,
    totalUsers: userStats.length,
    totalCoordinators: coordinatorStats.length,
    totalTenencias: tenenciaStats.length,
    totalEtapas: etapaStats.length
  }), [filteredData.length, cicaData.length, userStats.length, coordinatorStats.length, tenenciaStats.length, etapaStats.length]);

  return {
    userStats,
    coordinatorStats,
    tenenciaStats,
    etapaStats,
    summary,
    uniqueValues
  };
}