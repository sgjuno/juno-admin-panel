'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Admin Panel
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-800"
              >
                Dashboard
              </Link>
              <Link
                href="/clients"
                className="text-gray-600 hover:text-gray-800"
              >
                Clients
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 