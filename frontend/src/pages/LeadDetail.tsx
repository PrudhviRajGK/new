import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Phone, Mail, Building, Calendar, 
  User, MessageSquare, TrendingUp, Edit, Trash2, 
  Send, Sparkles 
} from 'lucide-react';
import type { Lead, Message } from '../types';

export default function LeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch lead details
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const response = await api.get(`/leads/${leadId}`);
      return response.data.data as Lead;
    },
    enabled: !!leadId,
  });

  // Fetch conversation messages
  const { data: messages } = useQuery({
    queryKey: ['messages', leadId],
    queryFn: async () => {
      const response = await api.get(`/conversations/lead/${leadId}/messages`);
      return response.data.data as Message[];
    },
    enabled: !!leadId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(`/conversations/lead/${leadId}/messages`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', leadId] });
      setMessage('');
      toast.success('Message sent successfully');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Qualify lead mutation
  const qualifyMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/leads/${leadId}/qualify`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      toast.success('Lead qualification started');
    },
    onError: () => {
      toast.error('Failed to qualify lead');
    },
  });

  // Delete lead mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/leads/${leadId}`);
    },
    onSuccess: () => {
      toast.success('Lead deleted successfully');
      navigate('/leads');
    },
    onError: () => {
      toast.error('Failed to delete lead');
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading lead details...</div>;
  }

  if (!lead) {
    return <div className="text-center py-12">Lead not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/leads')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{lead.name || 'Unnamed Lead'}</h1>
            <p className="text-sm text-gray-500 mt-1">Lead ID: {lead.id}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => qualifyMutation.mutate()}
              disabled={qualifyMutation.isPending}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {qualifyMutation.isPending ? 'Qualifying...' : 'AI Qualify'}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Information */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Lead Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-900">{lead.whatsapp_number}</span>
              </div>
              
              {lead.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-900">{lead.email}</span>
                </div>
              )}
              
              {lead.company && (
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-900">{lead.company}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-900">
                  Created {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Lead Score & Status */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Qualification</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Lead Score</span>
                  <span className="text-2xl font-bold text-blue-600">{lead.lead_score}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(lead.lead_score / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600">Status</span>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                    lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                    lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600">Qualification Status</span>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    lead.qualification_status === 'qualified' ? 'bg-green-100 text-green-800' :
                    lead.qualification_status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    lead.qualification_status === 'unqualified' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.qualification_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BANT Scores - backend returns { budget: { value, confidence }, ... } */}
          {lead.bant && typeof lead.bant === 'object' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">BANT Analysis</h2>
              
              <div className="space-y-3">
                {Object.entries(lead.bant).map(([key, val]) => {
                  const value = typeof val === 'object' && val !== null && 'value' in val
                    ? (val as { value?: number }).value
                    : val;
                  const numVal = typeof value === 'number' ? value : 0;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 capitalize">{key}</span>
                        <span className="text-sm font-medium">
                          {typeof value === 'string' ? value : `${numVal}/10`}
                        </span>
                      </div>
                      {typeof value === 'number' && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-600 h-1.5 rounded-full"
                            style={{ width: `${(numVal / 10) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Conversation */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg h-[calc(100vh-12rem)] flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Conversation
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages && messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id ?? msg.message_id ?? msg.timestamp}
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.direction === 'outbound'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-12">
                  No messages yet. Start a conversation!
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sendMessageMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {lead.ai_summary && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">AI Summary</h2>
          <p className="text-gray-700">{lead.ai_summary}</p>
          {lead.ai_next_action && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Recommended Next Action</h3>
              <p className="text-sm text-gray-600">{lead.ai_next_action}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
