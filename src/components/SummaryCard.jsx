import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function SummaryCard({ title, value, icon: Icon, trend, trendUp, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200'
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg border ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          {trendUp ? (
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
          <span className="text-sm text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
