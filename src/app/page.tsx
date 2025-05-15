import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Admin Panel</h1>
        <Link 
          href="/dashboard" 
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
