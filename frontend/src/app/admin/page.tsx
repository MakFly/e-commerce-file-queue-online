'use client';

import { useState, useEffect } from 'react';
import { adminApi, AdminDashboard, HistoryData } from '@/lib/api';
import StatsCard from '@/components/admin/StatsCard';
import UsersChart from '@/components/admin/UsersChart';
import UsersList from '@/components/admin/UsersList';
import SystemStatus from '@/components/admin/SystemStatus';
import AdminControls from '@/components/admin/AdminControls';

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      const [dashboardData, historyData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getHistory(60),
      ]);
      setDashboard(dashboardData);
      setHistory(historyData);
      setError(null);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Handle kick user
  const handleKickUser = async (sessionId: string) => {
    try {
      await adminApi.kickUser(sessionId);
      await fetchData();
    } catch (err: any) {
      alert('Failed to kick user: ' + err.message);
    }
  };

  // Handle clear queue
  const handleClearQueue = async () => {
    try {
      await adminApi.clearQueue();
      await fetchData();
    } catch (err: any) {
      alert('Failed to clear queue: ' + err.message);
    }
  };

  // Handle update config
  const handleUpdateConfig = async (config: { max_concurrent_users?: number; queue_enabled?: boolean }) => {
    try {
      await adminApi.updateConfig(config);
      await fetchData();
    } catch (err: any) {
      alert('Failed to update config: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { summary, active_users, waiting_users, config } = dashboard;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Queue Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time monitoring and management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Auto-refresh</span>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Last update</p>
                <p className="text-sm font-medium text-gray-900">{lastUpdate.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Active Users"
            value={summary.active_users}
            subtitle={`${summary.available_slots} slots available`}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />

          <StatsCard
            title="Waiting Users"
            value={summary.waiting_users}
            subtitle="In queue"
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatsCard
            title="Total Users"
            value={summary.total_users}
            subtitle="Active + Waiting"
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />

          <StatsCard
            title="Capacity"
            value={`${summary.usage_percentage.toFixed(0)}%`}
            subtitle={`${summary.max_concurrent_users} max users`}
            color={
              summary.usage_percentage >= 90
                ? 'red'
                : summary.usage_percentage >= 70
                ? 'yellow'
                : 'green'
            }
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>

        {/* Chart and Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <UsersChart data={history} />
          </div>
          <div>
            <SystemStatus status={summary.status} usagePercentage={summary.usage_percentage} />
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8">
          <AdminControls
            config={config}
            onClearQueue={handleClearQueue}
            onUpdateConfig={handleUpdateConfig}
          />
        </div>

        {/* Users Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsersList
            title="Active Users"
            users={active_users}
            type="active"
            onKickUser={handleKickUser}
          />
          <UsersList
            title="Waiting Users"
            users={waiting_users}
            type="waiting"
            onKickUser={handleKickUser}
          />
        </div>
      </div>
    </div>
  );
}
