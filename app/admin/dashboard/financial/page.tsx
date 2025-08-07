export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#783121]">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to your farm management dashboard
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Dashboard content goes here */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold text-[#783121] mb-2">Total Fields</h3>
          <p className="text-3xl font-bold text-[#39883E]">12</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold text-[#783121] mb-2">Active Crops</h3>
          <p className="text-3xl font-bold text-[#39883E]">8</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold text-[#783121] mb-2">Water Usage</h3>
          <p className="text-3xl font-bold text-[#39883E]">2.4k L</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibor text-[#783121] mb-2">Equipment</h3>
          <p className="text-3xl font-bold text-[#39883E]">15</p>
        </div>
      </div>
    </div>
  )
}