import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Database, BarChart3, LogOut, Building2, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './ui/Badge';

export function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/databases',
      icon: Database,
      label: 'Bases de Datos',
      description: 'Gestión de datos'
    },
    {
      to: '/analytics/cica',
      icon: BarChart3,
      label: 'Analíticas CICA',
      description: 'Análisis CICA'
    }
  ];

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className={`p-6 border-b border-slate-200 ${isCollapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-xl">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-slate-900">IGAC</h1>
              <p className="text-sm text-slate-600">Carmen de Chucurí</p>
            </div>
          )}
        </div>

        {/* User info */}
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {currentUser?.name || currentUser?.email}
              </p>
              <div className="flex items-center gap-2">
                <Badge role={currentUser?.role} className="text-xs">
                  {currentUser?.role?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  isActive ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${
                      isActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-500'
                    }`} />
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex items-center justify-center w-10 h-10 bg-slate-100 group-hover:bg-red-100 rounded-lg transition-colors">
            <LogOut className="h-5 w-5" />
          </div>
          {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex ${isCollapsed ? 'w-20' : 'w-80'} bg-white h-full shadow-premium fixed left-0 top-0 flex-col border-r border-slate-200 transition-all duration-300 z-30`}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          <ChevronRight className={`h-3 w-3 text-slate-600 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
        </button>

        <SidebarContent />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-premium z-30">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-slate-600'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-slate-600"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs font-medium">Salir</span>
          </button>
        </div>
      </div>
    </>
  );
}