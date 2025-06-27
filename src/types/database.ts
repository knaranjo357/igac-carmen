export interface DatabaseRecord {
  [key: string]: string | number | null | undefined;
}

export interface DatabaseResponse {
  data: DatabaseRecord[];
  metadata?: {
    total: number;
    lastUpdated: string;
  };
  timestamp?: number;
}

export interface ChartData {
  name: string;
  count: number;
  details: DatabaseRecord[];
}

export interface AnalyticsData {
  userStats: ChartData[];
  coordinatorStats: ChartData[];
  tenenciaStats: ChartData[];
  etapaStats: ChartData[];
}

export interface MutacionesData {
  mutaciones: { [key: string]: number };
  mutaciones2: { [key: string]: number };
  details: { [key: string]: DatabaseRecord[] };
}

// Mapping of database names to their matricula column names
export const MATRICULA_COLUMNS = {
  reconocedores: 'Matricula CICA',
  vurGeneral: 'Matricula',
  vurPropietarios: 'Matricula',
  vurSalvedades: 'Matricula',
  vurAnotaciones: 'Matricula',
  vurTramites: 'Matricula',
  r1: 'MATRICULA_INMOBILIARIA',
  r2: 'MATRICULA_INMOBILIARIA',
  cica: 'Matricula'
} as const;

export const DATABASE_NAMES = {
  reconocedores: 'Reconocedores',
  vurGeneral: 'VUR General',
  vurPropietarios: 'VUR Propietarios',
  vurSalvedades: 'VUR Salvedades',
  vurAnotaciones: 'VUR Anotaciones',
  vurTramites: 'VUR Trámites',
  r1: 'Registro 1',
  r2: 'Registro 2',
  cica: 'CICA'
} as const;

const BASE_URL = 'https://n8n.alliasoft.com/webhook';

export const ENDPOINTS = {
  reconocedores: `${BASE_URL}/reconocedores`,
  vurGeneral: `${BASE_URL}/vur-general`,
  vurPropietarios: `${BASE_URL}/vur-propietarios`,
  vurSalvedades: `${BASE_URL}/vur-salvedades`,
  vurAnotaciones: `${BASE_URL}/vur-anotaciones`,
  vurTramites: `${BASE_URL}/vur-tramites`,
  r1: `${BASE_URL}/r1`,
  r2: `${BASE_URL}/r2`,
  cica: `${BASE_URL}/cica`
} as const;

// Helper functions
export const normalizeMatricula = (matricula: string): string => {
  if (!matricula) return '';
  return matricula
    .replace(/^320-/, '')
    .replace(/\./g, '')
    .trim();
};

export const findMatchingR2Record = (
  r1Record: DatabaseRecord,
  r2Data: DatabaseRecord[]
): DatabaseRecord | undefined => {
  return r2Data.find(r2Record =>
    r2Record.NUMERO_PREDIAL === r1Record.NUMERO_PREDIAL
  );
};

export const formatMatricula = (matricula: string | number | null | undefined): string => {
  if (matricula === null || matricula === undefined) return '';
  const strMatricula = String(matricula);
  return strMatricula.replace(/^320-/, '');
};