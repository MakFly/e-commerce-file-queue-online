'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminButton() {
  const pathname = usePathname();

  // Don't show button on admin page
  if (pathname === '/admin') return null;

  return (
    <Link href="/admin">
      <button className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-50 group">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Admin Dashboard
        </span>
      </button>
    </Link>
  );
}
