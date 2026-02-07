import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Workflow as WorkflowIcon, Play, Pause, Trash2, X, Plus } from 'lucide-react';
import type { Workflow, CreateWorkflowInput } from '../types';

export default function Workflows() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateWorkflowInput>({
    name: '',
    description: '',
    trigger_type: 'message_received',
  });

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const response = await api.get('/workflows');
      return response.data.data as Workflow[];
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (data: CreateWorkflowInput) => {
      const response = await api.post('/workflows', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setShowCreateModal(false);
      setFormData({ name: '', description: '', trigger_type: 'message_received' });
      toast.success('Workflow created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create workflow');
    },
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const response = await api.put(`/workflows/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow status updated');
    },
    onError: () => {
      toast.error('Failed to update workflow');
    },
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/workflows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete workflow');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Workflow name is required');
      return;
    }
    createWorkflowMutation.mutate(formData);
  };

  const handleToggle = (workflow: Workflow) => {
    const newStatus = workflow.status === 'active' ? 'inactive' : 'active';
    toggleWorkflowMutation.mutate({ id: workflow.id, status: newStatus });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete workflow "${name}"?`)) {
      deleteWorkflowMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading workflows...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Workflows</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!workflows || workflows.length === 0 ? (
          <div className="col-span-full px-6 py-12 text-center text-gray-500 bg-white rounded-lg shadow">
            <WorkflowIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            No workflows created yet. Create your first workflow to automate lead management.
          </div>
        ) : (
          workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{workflow.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{workflow.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(workflow)}
                    disabled={toggleWorkflowMutation.isPending}
                    className="ml-2"
                  >
                    {workflow.status === 'active' ? (
                      <Play className="h-5 w-5 text-green-500" />
                    ) : (
                      <Pause className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Trigger:</span>
                    <span className="text-gray-900 font-medium">
                      {workflow.trigger_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Executions:</span>
                    <span className="text-gray-900">{workflow.execution_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="text-gray-900">
                      {workflow.execution_count > 0
                        ? Math.round((workflow.success_count / workflow.execution_count) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                    workflow.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.status}
                  </span>
                  <button
                    onClick={() => handleDelete(workflow.id, workflow.name)}
                    disabled={deleteWorkflowMutation.isPending}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create Workflow</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Welcome New Leads"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this workflow does..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trigger Type *
                </label>
                <select
                  value={formData.trigger_type}
                  onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="message_received">Message Received</option>
                  <option value="no_reply">No Reply</option>
                  <option value="stage_change">Stage Change</option>
                  <option value="qualification_complete">Qualification Complete</option>
                  <option value="manual">Manual</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createWorkflowMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createWorkflowMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
