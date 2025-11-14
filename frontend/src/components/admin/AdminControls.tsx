'use client';

import { useState } from 'react';

interface AdminControlsProps {
  config: {
    max_concurrent_users: number;
    queue_enabled: boolean;
  };
  onClearQueue: () => void;
  onUpdateConfig: (config: { max_concurrent_users?: number; queue_enabled?: boolean }) => void;
}

export default function AdminControls({ config, onClearQueue, onUpdateConfig }: AdminControlsProps) {
  const [maxUsers, setMaxUsers] = useState(config.max_concurrent_users);
  const [queueEnabled, setQueueEnabled] = useState(config.queue_enabled);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearQueue = () => {
    if (showConfirm) {
      onClearQueue();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Controls</h3>

      <div className="space-y-6">
        {/* Queue Enabled Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Queue System</label>
            <p className="text-xs text-gray-500">Enable or disable the queue system</p>
          </div>
          <button
            onClick={() => {
              const newValue = !queueEnabled;
              setQueueEnabled(newValue);
              onUpdateConfig({ queue_enabled: newValue });
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              queueEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                queueEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Max Users Setting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Concurrent Users
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              min="0"
              max="10000"
              value={maxUsers}
              onChange={(e) => setMaxUsers(parseInt(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => onUpdateConfig({ max_concurrent_users: maxUsers })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Update
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Note: Requires server restart to take full effect
          </p>
        </div>

        {/* Clear Queue Button */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clear All Queues
          </label>
          <button
            onClick={handleClearQueue}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              showConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {showConfirm ? '⚠ Click Again to Confirm' : 'Clear All Users'}
          </button>
          <p className="text-xs text-gray-500 mt-1">
            This will remove all active and waiting users immediately
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Actions
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMaxUsers(1);
                onUpdateConfig({ max_concurrent_users: 1 });
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Test Mode (1)
            </button>
            <button
              onClick={() => {
                setMaxUsers(100);
                onUpdateConfig({ max_concurrent_users: 100 });
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Normal (100)
            </button>
            <button
              onClick={() => {
                setMaxUsers(1000);
                onUpdateConfig({ max_concurrent_users: 1000 });
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              High (1000)
            </button>
            <button
              onClick={() => {
                setMaxUsers(0);
                onUpdateConfig({ max_concurrent_users: 0 });
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Block All (0)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
