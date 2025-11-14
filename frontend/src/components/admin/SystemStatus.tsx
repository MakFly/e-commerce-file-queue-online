'use client';

interface SystemStatusProps {
  status: 'healthy' | 'moderate' | 'warning' | 'critical';
  usagePercentage: number;
}

const statusConfig = {
  healthy: {
    label: 'Healthy',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✓',
  },
  moderate: {
    label: 'Moderate Load',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '◐',
  },
  warning: {
    label: 'High Load',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⚠',
  },
  critical: {
    label: 'Critical',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '!',
  },
};

export default function SystemStatus({ status, usagePercentage }: SystemStatusProps) {
  const config = statusConfig[status];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>

      <div className="flex items-center justify-between mb-6">
        <div className={`px-4 py-2 rounded-lg border-2 ${config.color} font-semibold flex items-center`}>
          <span className="text-2xl mr-2">{config.icon}</span>
          {config.label}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{usagePercentage.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Capacity Used</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              usagePercentage >= 90
                ? 'bg-red-500'
                : usagePercentage >= 70
                ? 'bg-yellow-500'
                : usagePercentage >= 50
                ? 'bg-blue-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-6 space-y-2">
        {usagePercentage >= 90 && (
          <div className="flex items-start text-sm text-red-600 bg-red-50 p-3 rounded">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">Critical Load</p>
              <p className="mt-1">System is at capacity. Consider increasing max concurrent users.</p>
            </div>
          </div>
        )}
        {usagePercentage >= 70 && usagePercentage < 90 && (
          <div className="flex items-start text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">High Load</p>
              <p className="mt-1">System is experiencing high traffic. Monitor closely.</p>
            </div>
          </div>
        )}
        {usagePercentage < 70 && (
          <div className="flex items-start text-sm text-green-600 bg-green-50 p-3 rounded">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">System Operating Normally</p>
              <p className="mt-1">All systems are functioning within normal parameters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
