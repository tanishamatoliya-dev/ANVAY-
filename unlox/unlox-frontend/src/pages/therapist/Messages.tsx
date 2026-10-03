import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { ConversationList } from '../../components/chat/ConversationList';
import { ChatWindow } from '../../components/chat/ChatWindow';

export const MessagesPage: React.FC = () => {
  const { user, therapist } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);

  const fetchConversations = async () => {
    try {
      const data: any = await api.get('/messages/conversations');
      setConversations(data || []);
      if (!selectedConv && data && data.length > 0) {
        setSelectedConv(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#e7e5dc] pb-6">
        <span className="text-[11px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
          Communications
        </span>
        <h1 className="font-serif-editorial text-3xl font-medium tracking-tight text-[#1e2321]">
          Real-Time Client Messages
        </h1>
        <p className="text-xs text-[#5e6b63] mt-1">
          Protected therapeutic communication channel backed by Socket.io.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConv?.conversationId || null}
            onSelectConversation={(conv) => setSelectedConv(conv)}
            userRole="therapist"
          />
        </div>

        <div className="md:col-span-2">
          {selectedConv && therapist ? (
            <ChatWindow
              conversationId={selectedConv.conversationId}
              counterpartName={selectedConv.clientName}
              counterpartRole="client"
              therapistId={therapist.id}
              clientId={selectedConv.clientId}
            />
          ) : (
            <div className="h-[520px] bg-[#fdfdfc] border border-[#e2dfd5] rounded flex items-center justify-center text-xs text-[#717b75]">
              Select a client channel to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
