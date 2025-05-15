export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Welcome</h2>
          <p className="text-gray-600">
            Welcome to your admin dashboard. Here you can manage your application.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
          <div className="space-y-2">
            <p className="text-gray-600">Total Users: 0</p>
            <p className="text-gray-600">Active Sessions: 0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
          <p className="text-gray-600">No recent activity</p>
        </div>
      </div>
    </div>
  );
} 