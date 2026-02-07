import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { TrendingUp, Users, CheckCircle, Activity, Target, Zap } from 'lucide-react';

export default function Analytics() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Leads',
      value: dashboard?.totalLeads || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      name: 'Qualified Leads',
      value: dashboard?.qualifiedLeads || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      name: 'Converted',
      value: dashboard?.convertedLeads || 0,
      icon: Target,
      color: 'bg-purple-500',
      change: '+15%',
    },
    {
      name: 'Active Conversations',
      value: dashboard?.activeConversations || 0,
      icon: Activity,
      color: 'bg-orange-500',
      change: '+5%',
    },
    {
      name: 'Workflow Executions',
      value: dashboard?.workflowExecutions || 0,
      icon: Zap,
      color: 'bg-indigo-500',
      change: '+23%',
    },
    {
      name: 'Avg Lead Score',
      value: dashboard?.averageLeadScore || '0.00',
      icon: TrendingUp,
      color: 'bg-pink-500',
      change: '+3%',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your sales performance and AI insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion Rate Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.conversionRate || 0}%
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${dashboard?.conversionRate || 0}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Workflows</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.activeWorkflows || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">Automating your sales process</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">New Leads</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.newLeads || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">Awaiting qualification</p>
          </div>
        </div>
      </div>

      {/* Lead Stage Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Distribution</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">New Leads</span>
              <span className="font-medium">{dashboard?.newLeads || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{
                  width: `${
                    dashboard?.totalLeads
                      ? ((dashboard.newLeads / dashboard.totalLeads) * 100).toFixed(0)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Qualified Leads</span>
              <span className="font-medium">{dashboard?.qualifiedLeads || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{
                  width: `${
                    dashboard?.totalLeads
                      ? ((dashboard.qualifiedLeads / dashboard.totalLeads) * 100).toFixed(0)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Converted Leads</span>
              <span className="font-medium">{dashboard?.convertedLeads || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all"
                style={{
                  width: `${
                    dashboard?.totalLeads
                      ? ((dashboard.convertedLeads / dashboard.totalLeads) * 100).toFixed(0)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
