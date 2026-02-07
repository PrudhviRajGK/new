import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Users, MessageSquare, TrendingUp, Activity } from 'lucide-react';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data.data;
    },
  });

  const statCards = [
    { name: 'Total Leads', value: stats?.totalLeads || 0, icon: Users, color: 'bg-blue-500' },
    { name: 'Active Conversations', value: stats?.activeConversations || 0, icon: MessageSquare, color: 'bg-green-500' },
    { name: 'Conversion Rate', value: `${stats?.conversionRate || 0}%`, icon: TrendingUp, color: 'bg-purple-500' },
    { name: 'Active Workflows', value: stats?.activeWorkflows || 0, icon: Activity, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${item.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{item.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-500">No recent activity to display</p>
      </div>
    </div>
  );
}
