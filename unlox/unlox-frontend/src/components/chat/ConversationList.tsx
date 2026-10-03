import React from 'react';
import { MessageSquare, User } from 'lucide-react';

interface ConversationListProps {
  conversations: any[];
  selectedConversationId: string | null;
  onSelectConversation: (conv: any) => void;
  userRole: 'therapist' | 'client';
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  userRole,
}) => {
  return (
    <div className="bg-[#fdfdfc] border border-[#e2dfd5] rounded shadow-xs overflow-hidden h-[520px] flex flex-col">
      <div className="p-3.5 border-b border-[#e7e5dc] bg-[#faf9f6]">
        <h4 className="font-serif-editorial text-base font-semibold text-[#1e2321]">
          {userRole === 'therapist' ? 'Active Client Channels' : 'Therapist Messages'}
        </h4>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#eeebe3]">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#7d8681]">
            No conversations active yet.
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = selectedConversationId === conv.conversationId;
            const name = userRole === 'therapist' ? conv.clientName : conv.therapistName;

            return (
              <div
                key={conv.conversationId}
                onClick={() => onSelectConversation(conv)}
                className={`p-3.5 cursor-pointer transition-colors text-xs flex items-start gap-3 ${
                  isSelected ? 'bg-[#f4f2ea]' : 'hover:bg-[#f8f7f2] bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#e8e4da] text-[#2c3831] flex items-center justify-center font-serif font-bold text-xs shrink-0 mt-0.5">
                  {name ? name.charAt(0) : 'U'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-semibold text-[#1e2321] truncate">{name}</span>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-[#838e87] shrink-0">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#5c6861] truncate">
                    {conv.lastMessage ? conv.lastMessage.text : 'Start of conversation...'}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#1e2321] text-white font-mono text-[9px] font-bold">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
