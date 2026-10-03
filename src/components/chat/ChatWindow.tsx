import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/axiosInstance';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Send, Clock, CheckCheck, User } from 'lucide-react';

interface ChatWindowProps {
  conversationId: string;
  counterpartName: string;
  counterpartRole: 'therapist' | 'client';
  therapistId: string;
  clientId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  counterpartName,
  counterpartRole,
  therapistId,
  clientId,
}) => {
  const { user } = useAuth();
  const { socket, joinConversation, leaveConversation } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [counterpartTyping, setCounterpartTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data: any = await api.get(`/messages/${conversationId}`);
      setMessages(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      joinConversation(conversationId);
    }

    return () => {
      if (conversationId) leaveConversation(conversationId);
    };
  }, [conversationId]);

  // Listen for real-time messages via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleUserTyping = () => {
      setCounterpartTyping(true);
    };

    const handleUserStopTyping = () => {
      setCounterpartTyping(false);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, counterpartTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const sendContent = text.trim();
    setText('');

    if (socket) {
      socket.emit('stop_typing', { conversationId });
    }

    try {
      const newMsg: any = await api.post('/messages', {
        conversationId,
        therapistId,
        clientId,
        text: sendContent,
      });
      // Append if socket did not already broadcast
      setMessages((prev) => {
        if (prev.some((m) => (m._id || m.id) === (newMsg._id || newMsg.id))) return prev;
        return [...prev, newMsg];
      });
    } catch (err: any) {
      alert(err.message || 'Failed to deliver message.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (socket) {
      socket.emit('typing', { conversationId, senderName: user?.name });
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-[#fdfdfc] border border-[#e2dfd5] rounded shadow-xs overflow-hidden">
      {/* Thread Header */}
      <div className="p-3.5 border-b border-[#e7e5dc] bg-[#faf9f6] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1e2321] text-white flex items-center justify-center font-serif font-bold text-xs">
            {counterpartName.charAt(0)}
          </div>
          <div>
            <span className="font-serif-editorial text-base font-semibold text-[#1e2321] block leading-tight">
              {counterpartName}
            </span>
            <span className="text-[10px] text-[#717c76] capitalize tracking-wide">
              {counterpartRole === 'therapist' ? 'Licensed Therapist' : 'Client Record'}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-[#6b7771] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
          <span>Real-time Protected</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fcfbf9]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-[#717b75]">
            Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-[#717b75]">
            <p className="font-serif-editorial text-base text-[#1e2321] mb-1">Secure Therapeutic Channel</p>
            <p className="max-w-xs text-[#636f68]">
              Send session logistical updates, scheduling coordination, or intake questions here.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === user?.role;
            return (
              <div
                key={msg._id || msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#1e2321] text-[#fbfbf9] rounded-br-xs'
                      : 'bg-[#f0ece2] text-[#1e2321] border border-[#ded8cb] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[9px] text-[#86918a] mt-0.5 px-1 font-mono">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        {counterpartTyping && (
          <div className="text-[11px] text-[#6d7972] italic pl-2">
            {counterpartName} is composing a message...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#e7e5dc] bg-white flex items-center gap-2">
        <input
          type="text"
          placeholder={`Message ${counterpartName}...`}
          value={text}
          onChange={handleInputChange}
          className="flex-1 px-3 py-2 text-xs bg-[#fbfbf9] border border-[#cfcbc0] rounded text-[#1e2321] focus:border-[#38483e] focus:ring-1 focus:ring-[#38483e]"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-4 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2e3732] disabled:opacity-40 rounded shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
