'use client';

import { useEffect } from 'react';
import { QueueStatus } from '@/lib/api';

interface QueueWaitingRoomProps {
  queueStatus: QueueStatus;
  onRetry: () => void;
}

export default function QueueWaitingRoom({ queueStatus, onRetry }: QueueWaitingRoomProps) {
  const { position, queue_length, estimated_wait_seconds, active_users, max_users } = queueStatus;

  const formatTime = (seconds: number | undefined) => {
    if (!seconds) return '0s';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getProgressPercentage = () => {
    if (!queue_length || !position) return 0;
    return ((queue_length - position) / queue_length) * 100;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-blue-600 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              You're in the waiting room
            </h1>
            <p className="text-gray-600">
              We're experiencing high traffic. You'll be redirected automatically when it's your turn.
            </p>
          </div>

          {/* Position Info */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90">Your position in queue</p>
                <p className="text-4xl font-bold">{position || '...'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Estimated wait time</p>
                <p className="text-2xl font-semibold">{formatTime(estimated_wait_seconds)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">People in queue</p>
              <p className="text-2xl font-bold text-gray-900">{queue_length || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Active users</p>
              <p className="text-2xl font-bold text-gray-900">
                {active_users || 0} / {max_users || 0}
              </p>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">Please keep this page open</p>
                <p className="text-sm text-blue-700 mt-1">
                  This page will automatically refresh and redirect you when it's your turn.
                  Closing or refreshing this page may lose your position.
                </p>
              </div>
            </div>
          </div>

          {/* Auto-refresh indicator */}
          <div className="flex items-center justify-center text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Auto-refreshing every 5 seconds
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Thank you for your patience!</p>
        </div>
      </div>
    </div>
  );
}
