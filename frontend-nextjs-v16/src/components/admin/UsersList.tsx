'use client';

import { AdminUser } from '@/lib/api';

interface UsersListProps {
  title: string;
  users: AdminUser[];
  type: 'active' | 'waiting';
  onKickUser: (sessionId: string) => void;
}

export default function UsersList({ title, users, type, onKickUser }: UsersListProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {users.length} {users.length === 1 ? 'user' : 'users'}
        </span>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <p>No {type} users</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                {type === 'waiting' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined At
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {type === 'active' ? 'Expires In' : 'Wait Time'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.full_session_id} className="hover:bg-gray-50">
                  {type === 'waiting' && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                        #{user.position}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                    {user.session_id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {user.joined_at}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {type === 'active' ? user.expires_in : user.wait_time}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onKickUser(user.full_session_id)}
                      className="text-red-600 hover:text-red-900 hover:underline"
                    >
                      Kick
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
