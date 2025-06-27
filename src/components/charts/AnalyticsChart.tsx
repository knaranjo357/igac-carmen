import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartData } from '../../types/database';

interface AnalyticsChartProps {
  title: string;
  data: ChartData[];
  color: string;
  onBarClick: (data: ChartData) => void;
  className?: string;
}

export function AnalyticsChart({ title, data, color, onBarClick, className = '' }: AnalyticsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="card-premium p-4 shadow-premium">
          <p className="font-semibold text-slate-900">{label}</p>
          <p className="text-primary-600 font-medium">
            Predios: {payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Clic para ver detalles</p>
        </div>
      );
    }
    return null;
  };

  // Truncate long labels for better display
  const formatLabel = (label: string) => {
    if (label.length > 15) {
      return label.substring(0, 12) + '...';
    }
    return label;
  };

  const processedData = data.map(item => ({
    ...item,
    displayName: formatLabel(item.name),
    fullName: item.name
  }));

  return (
    <div className={`card-premium p-6 animate-fade-in ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <div className="text-sm text-slate-500">
          Total: {data.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="displayName"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 11, fill: '#64748b' }}
              stroke="#cbd5e1"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              stroke="#cbd5e1"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="count"
              name="Número de Predios"
              fill={color}
              onClick={(data) => onBarClick(data as ChartData)}
              cursor="pointer"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}