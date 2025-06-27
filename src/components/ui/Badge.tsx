import React from 'react';
import { ROLE_COLORS } from '../../types/auth';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  role?: keyof typeof ROLE_COLORS;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'primary', role, children, className = '' }: BadgeProps) {
  const getVariantClasses = () => {
    if (role) {
      return ROLE_COLORS[role];
    }

    switch (variant) {
      case 'primary':
        return 'bg-primary-100 text-primary-800';
      case 'secondary':
        return 'bg-slate-100 text-slate-800';
      case 'success':
        return 'bg-emerald-100 text-emerald-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariantClasses()} ${className}`}>
      {children}
    </span>
  );
}