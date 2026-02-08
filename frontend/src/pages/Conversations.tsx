import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MessageSquare, Search, Clock } from 'lucide-react';
import type { Conversation } from '../types';

export default function Conversations() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/conversations');
      return res.data.data;
    },
  });

  // Backend returns array directly
  const conversations = Array.isArray(response) ? response : (response?.items ?? []);

  const filteredConversations = conversations?.filter((conv) =>
    conv.whatsapp_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center py-12">Loading conversations...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Conversations</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {!filteredConversations || filteredConversations.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {searchTerm ? 'No conversations found matching your search.' : 'No conversations yet. Start engaging with your leads!'}
            </li>
          ) : (
            filteredConversations.map((conversation) => {
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              return (
                <li
                  key={conversation._id}
                  onClick={() => navigate(`/conversations/${conversation.lead_id}`)}
                  className="cursor-pointer"
                >
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-blue-600">
                            {conversation.whatsapp_number}
                          </p>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            conversation.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {conversation.status}
                          </span>
                        </div>
                        {lastMessage && (
                          <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                            {lastMessage.direction === 'outbound' ? 'You: ' : ''}
                            {lastMessage.content}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>{conversation.messages.length} messages</span>
                          {lastMessage && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(lastMessage.timestamp).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
