import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, ExternalLink, Save, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface AIPrompt {
  id: string;
  prompt_type: string;
  prompt_text: string;
  context?: string;
  is_active: boolean;
}

export default function KnowledgeBase() {
  const queryClient = useQueryClient();
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newPromptType, setNewPromptType] = useState('qualification');
  const [newPromptText, setNewPromptText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['ai-prompts'],
    queryFn: async () => {
      const response = await api.get('/ai-prompts');
      return response.data.data as AIPrompt[];
    },
  });

  const updatePromptMutation = useMutation({
    mutationFn: async ({ id, prompt_text }: { id: string; prompt_text: string }) => {
      await api.put(`/ai-prompts/${id}`, { prompt_text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      toast.success('Prompt updated successfully');
      setEditingPrompt(null);
    },
    onError: () => {
      toast.error('Failed to update prompt');
    },
  });

  const createPromptMutation = useMutation({
    mutationFn: async (data: { prompt_type: string; prompt_text: string }) => {
      await api.post('/ai-prompts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      toast.success('Prompt created successfully');
      setShowAddForm(false);
      setNewPromptText('');
    },
    onError: () => {
      toast.error('Failed to create prompt');
    },
  });

  const deletePromptMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ai-prompts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      toast.success('Prompt deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete prompt');
    },
  });

  const togglePromptMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await api.put(`/ai-prompts/${id}`, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      toast.success('Prompt status updated');
    },
    onError: () => {
      toast.error('Failed to update prompt status');
    },
  });

  const handleEdit = (prompt: AIPrompt) => {
    setEditingPrompt(prompt.id);
    setEditText(prompt.prompt_text);
  };

  const handleSave = (id: string) => {
    updatePromptMutation.mutate({ id, prompt_text: editText });
  };

  const handleCreate = () => {
    if (!newPromptText.trim()) {
      toast.error('Prompt text is required');
      return;
    }
    createPromptMutation.mutate({
      prompt_type: newPromptType,
      prompt_text: newPromptText,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const promptTypes = [
    { value: 'qualification', label: 'Lead Qualification' },
    { value: 'intent_detection', label: 'Intent Detection' },
    { value: 'response_generation', label: 'Response Generation' },
    { value: 'scoring', label: 'Lead Scoring' },
    { value: 'summarization', label: 'Conversation Summary' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">AI Knowledge Base</h1>
        <p className="text-gray-600 mt-1">
          Configure AI prompts and behavior for lead qualification and conversations
        </p>
      </div>

      {/* Add New Prompt */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">AI Prompts</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Prompt
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Type
              </label>
              <select
                value={newPromptType}
                onChange={(e) => setNewPromptType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {promptTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Text
              </label>
              <textarea
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the AI prompt..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewPromptText('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createPromptMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createPromptMutation.isPending ? 'Creating...' : 'Create Prompt'}
              </button>
            </div>
          </div>
        )}

        {/* Prompts List */}
        <div className="space-y-4">
          {prompts?.map((prompt) => (
            <div key={prompt.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {promptTypes.find((t) => t.value === prompt.prompt_type)?.label ||
                        prompt.prompt_type}
                    </span>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prompt.is_active}
                        onChange={(e) =>
                          togglePromptMutation.mutate({
                            id: prompt.id,
                            is_active: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Active</span>
                    </label>
                  </div>
                  {editingPrompt === prompt.id ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">{prompt.prompt_text}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {editingPrompt === prompt.id ? (
                    <>
                      <button
                        onClick={() => handleSave(prompt.id)}
                        disabled={updatePromptMutation.isPending}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                        title="Save"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingPrompt(null)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(prompt)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this prompt?')) {
                            deletePromptMutation.mutate(prompt.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!prompts?.length && (
            <div className="text-center py-12 text-gray-500">
              <p>No AI prompts configured yet.</p>
              <p className="text-sm mt-2">Click "Add Prompt" to create your first prompt.</p>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">About AI Prompts</h3>
        <p className="text-blue-800 text-sm mb-4">
          AI prompts control how the system qualifies leads, detects intent, generates responses,
          and scores conversations. Each prompt type serves a specific purpose:
        </p>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            <strong>Lead Qualification:</strong> Questions and criteria for qualifying leads
          </li>
          <li>
            <strong>Intent Detection:</strong> Patterns to identify customer intent
          </li>
          <li>
            <strong>Response Generation:</strong> Templates for AI-generated responses
          </li>
          <li>
            <strong>Lead Scoring:</strong> Criteria for scoring lead quality
          </li>
          <li>
            <strong>Conversation Summary:</strong> Format for summarizing conversations
          </li>
        </ul>
      </div>
    </div>
  );
}
