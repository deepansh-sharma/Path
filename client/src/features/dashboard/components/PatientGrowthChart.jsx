import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card } from '../../../components/ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const PatientGrowthChart = ({ 
  data = [], 
  title = "Patient Growth Metrics", 
  loading = false 
}) => {
  // Sample data if none provided
  const sampleData = [
    { month: 'Jan', newPatients: 45, totalPatients: 1200, target: 50 },
    { month: 'Feb', newPatients: 52, totalPatients: 1252, target: 55 },
    { month: 'Mar', newPatients: 48, totalPatients: 1300, target: 50 },
    { month: 'Apr', newPatients: 61, totalPatients: 1361, target: 60 },
    { month: 'May', newPatients: 55, totalPatients: 1416, target: 58 },
    { month: 'Jun', newPatients: 67, totalPatients: 1483, target: 65 },
    { month: 'Jul', newPatients: 72, totalPatients: 1555, target: 70 },
    { month: 'Aug', newPatients: 69, totalPatients: 1624, target: 72 },
    { month: 'Sep', newPatients: 78, totalPatients: 1702, target: 75 },
    { month: 'Oct', newPatients: 82, totalPatients: 1784, target: 80 },
    { month: 'Nov', newPatients: 85, totalPatients: 1869, target: 85 },
    { month: 'Dec', newPatients: 91, totalPatients: 1960, target: 90 }
  ];

  const chartData = data.length > 0 ? data : sampleData;
  
  // Calculate growth rate
  const currentMonth = chartData[chartData.length - 1];
  const previousMonth = chartData[chartData.length - 2];
  const growthRate = previousMonth ? 
    ((currentMonth.newPatients - previousMonth.newPatients) / previousMonth.newPatients * 100).toFixed(1) : 0;
  const isPositiveGrowth = growthRate > 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center mt-1 space-x-2">
            <span className="text-sm text-gray-600">Growth Rate:</span>
            <div className={`flex items-center space-x-1 ${
              isPositiveGrowth ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositiveGrowth ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{Math.abs(growthRate)}%</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {currentMonth?.newPatients || 0}
          </p>
          <p className="text-sm text-gray-600">New this month</p>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorNewPatients" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Target line */}
            <ReferenceLine 
              y={chartData[0]?.target || 50} 
              stroke="#10B981" 
              strokeDasharray="5 5"
              label={{ value: "Target", position: "topRight" }}
            />
            
            <Area
              type="monotone"
              dataKey="newPatients"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorNewPatients)"
              name="New Patients"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {chartData.reduce((sum, item) => sum + item.newPatients, 0)}
          </p>
          <p className="text-sm text-gray-600">Total New Patients</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {currentMonth?.totalPatients || 0}
          </p>
          <p className="text-sm text-gray-600">Total Patients</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {(chartData.reduce((sum, item) => sum + item.newPatients, 0) / chartData.length).toFixed(0)}
          </p>
          <p className="text-sm text-gray-600">Avg per Month</p>
        </div>
      </div>
    </Card>
  );
};

export default PatientGrowthChart;