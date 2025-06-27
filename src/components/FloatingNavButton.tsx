import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation, Database, BarChart3, X } from 'lucide-react';
import { Modal } from './ui/Modal';
import { DATABASE_NAMES } from '../types/database';

export function FloatingNavButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const quickActions = [
    {
      id: 'databases',
      label: 'Bases de Datos',
      icon: Database,
      path: '/databases',
      description: 'Ver todas las bases de datos'
    },
    {
      id: 'analytics',
      label: 'Analíticas CICA',
      icon: BarChart3,
      path: '/analytics/cica',
      description: 'Análisis y reportes CICA'
    }
  ];

  const databaseSections = Object.entries(DATABASE_NAMES).map(([key, name]) => ({
    id: key,
    label: name,
    icon: Database,
    path: `/databases#${key}`,
    description: `Ir a ${name}`
  }));

  const handleNavigation = (path: string) => {
    if (path.includes('#')) {
      const [route, section] = path.split('#');
      navigate(route);
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(path);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-premium hover:shadow-lg transition-all duration-200 z-40 flex items-center justify-center group"
        title="Navegación rápida"
      >
        <Navigation className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Navegación Rápida"
        size="lg"
      >
        <div className="p-6 mobile-safe">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Acciones Rápidas</h3>
              <div className="grid gap-3">
                {quickActions.map((action) => {
                  const isActive = location.pathname === action.path;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleNavigation(action.path)}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all text-left w-full ${
                        isActive 
                          ? 'bg-primary-50 border border-primary-200 text-primary-700' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        isActive ? 'bg-primary-100 text-primary-600' : 'bg-white text-slate-500'
                      }`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{action.label}</p>
                        <p className="text-sm text-slate-500 truncate">{action.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Database Sections */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Bases de Datos</h3>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {databaseSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleNavigation(section.path)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-left w-full"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-slate-500">
                      <section.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{section.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}