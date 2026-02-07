import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Phone, Mail } from 'lucide-react';
import type { Lead, LeadStage } from '../types';

export default function LeadsPipeline() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await api.get('/leads');
      const data = response.data.data;
      return (data.items || data) as Lead[];
    },
  });

  // Group leads by status (using status as stage for now)
  const stages = [
    { id: 'new', name: 'New', color: 'bg-gray-100' },
    { id: 'contacted', name: 'Contacted', color: 'bg-blue-100' },
    { id: 'qualified', name: 'Qualified', color: 'bg-green-100' },
    { id: 'converted', name: 'Converted', color: 'bg-purple-100' },
    { id: 'lost', name: 'Lost', color: 'bg-red-100' },
  ];

  const updateStageMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const response = await api.put(`/leads/${leadId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead stage updated');
    },
    onError: () => {
      toast.error('Failed to update lead stage');
    },
  });

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      updateStageMutation.mutate({ leadId, status: newStatus });
    }
  };

  if (leadsLoading) {
    return <div className="text-center py-12">Loading pipeline...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sales Pipeline</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageLeads = leads?.filter((lead) => lead.status === stage.id) || [];
          
          return (
            <div
              key={stage.id}
              className="bg-gray-50 rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{stage.name}</h2>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                  {stageLeads.length}
                </span>
              </div>

              <div className="space-y-3">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-medium text-gray-900 text-sm mb-2">
                        {lead.name || 'Unnamed Lead'}
                      </h3>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {lead.whatsapp_number}
                        </div>
                        {lead.email && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {lead.email}
                          </div>
                        )}
                      </div>

                      {lead.company && (
                        <p className="text-xs text-gray-500 mt-2">{lead.company}</p>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          Score: {lead.lead_score}/10
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${(lead.lead_score / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Drag and drop leads between stages to update their status. Click on a lead card to view details.
        </p>
      </div>
    </div>
  );
}
