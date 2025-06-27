import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { ExternalLink, Database } from 'lucide-react';
import { formatMatricula } from '../../types/database';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: string;
  data: any[];
  type?: 'cica' | 'reconocedores';
}

export function DetailModal({ isOpen, onClose, title, category, data, type = 'cica' }: DetailModalProps) {
  const columns = useMemo(() => {
    if (!data.length) return [];

    const baseColumns = [
      { key: 'Matricula', label: 'Matrícula', width: 'w-48', isMatricula: true },
      { key: 'Numero Predial', label: 'Número Predial', width: 'w-48' }
    ];

    const additionalColumns = (() => {
      if (type === 'reconocedores') {
        return [
          { key: 'RECONOCEDOR', label: 'Reconocedor', width: 'w-48' },
          { key: 'MUTACIONES', label: 'Mutaciones', width: 'w-32' },
          { key: 'MUTACIONES2', label: 'Mutaciones 2', width: 'w-32' },
          { key: 'SOLICITUDES TRAMITADAS', label: 'Solicitudes', width: 'w-48' }
        ];
      } else {
        switch (title) {
          case 'Predios por Usuario':
            return [
              { key: 'Usuario', label: 'Usuario', width: 'w-48', highlight: true },
              { key: 'Coordinador', label: 'Coordinador', width: 'w-48' },
              { key: 'Tenencia', label: 'Tenencia', width: 'w-48' },
              { key: 'Etapa', label: 'Etapa', width: 'w-48' }
            ];
          case 'Predios por Coordinador':
            return [
              { key: 'Usuario', label: 'Usuario', width: 'w-48' },
              { key: 'Coordinador', label: 'Coordinador', width: 'w-48', highlight: true },
              { key: 'Tenencia', label: 'Tenencia', width: 'w-48' },
              { key: 'Etapa', label: 'Etapa', width: 'w-48' }
            ];
          case 'Predios por Tenencia':
            return [
              { key: 'Usuario', label: 'Usuario', width: 'w-48' },
              { key: 'Coordinador', label: 'Coordinador', width: 'w-48' },
              { key: 'Tenencia', label: 'Tenencia', width: 'w-48', highlight: true },
              { key: 'Etapa', label: 'Etapa', width: 'w-48' }
            ];
          case 'Predios por Etapa':
            return [
              { key: 'Usuario', label: 'Usuario', width: 'w-48' },
              { key: 'Coordinador', label: 'Coordinador', width: 'w-48' },
              { key: 'Tenencia', label: 'Tenencia', width: 'w-48' },
              { key: 'Etapa', label: 'Etapa', width: 'w-48', highlight: true }
            ];
          default:
            return [
              { key: 'RECONOCEDOR', label: 'Reconocedor', width: 'w-48' },
              { key: 'MUTACIONES', label: 'Mutaciones', width: 'w-32' },
              { key: 'MUTACIONES2', label: 'Mutaciones 2', width: 'w-32' }
            ];
        }
      }
    })();

    return [...baseColumns, ...additionalColumns];
  }, [data, title, type]);

  const matriculaKey = type === 'reconocedores' ? 'Matricula CICA' : 'Matricula';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-primary-600" />
          <span className="truncate">{title}</span>
          <Badge variant="info" className="ml-2">
            {category}
          </Badge>
        </div>
      }
    >
      <div className="p-6 mobile-safe">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">
            Mostrando {data.length} registro{data.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="overflow-x-auto mobile-safe">
          <table className="table-premium mobile-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`whitespace-nowrap ${
                      col.highlight
                        ? 'bg-primary-100 text-primary-800'
                        : ''
                    }`}
                  >
                    <div className="truncate max-w-32" title={col.label}>
                      {col.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((record, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`whitespace-nowrap ${
                        col.highlight
                          ? 'bg-primary-50 font-medium text-primary-900'
                          : 'text-slate-600'
                      } ${
                        col.isMatricula
                          ? 'text-primary-600 hover:text-primary-800'
                          : ''
                      }`}
                    >
                      {col.isMatricula ? (
                        <Link
                          to={`/matricula/${formatMatricula(record[matriculaKey])}`}
                          className="flex items-center gap-1 hover:underline"
                        >
                          <span className="truncate max-w-32" title={record[matriculaKey] || '-'}>
                            {record[matriculaKey] || '-'}
                          </span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </Link>
                      ) : (
                        <div className="truncate max-w-32" title={record[col.key]}>
                          {record[col.key] || '-'}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}