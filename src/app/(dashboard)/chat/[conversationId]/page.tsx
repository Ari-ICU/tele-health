'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Message } from '@/types';

export default function ConversationPage() {
  const { user } = useAuth();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch initial data & setup socket
  useEffect(() => {
    if (!conversationId || !user) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/conversations/${conversationId}/messages`);
        setMessages(res.data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.emit('join-conversation', conversationId);

    socket.on('new-message', (message: Message) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !user) return;

    const messageData = {
      conversationId,
      senderId: user.id,
      content: newMessage,
      type: 'text',
    };

    socketRef.current.emit('send-message', messageData);
    setNewMessage('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100">
      {/* Messages Area */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm sm:text-base">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isSender = msg.sender._id === user?.id;
            return (
              <div key={msg._id} className={`flex ${isSender ? 'justify-end' : 'justify-start'} px-2 sm:px-4`}>
                <div
                  className={`max-w-[80%] sm:max-w-[60%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm ${
                    isSender ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'
                  }`}
                >
                  {!isSender && (
                    <p className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">
                      Dr. {msg.sender.profile.firstName} {msg.sender.profile.lastName}
                    </p>
                  )}
                  <p className="text-sm sm:text-base">{msg.content}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      isSender ? 'text-indigo-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Type a new message"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`px-4 sm:px-5 py-2 rounded-full text-white text-sm sm:text-base font-medium transition-colors ${
              newMessage.trim()
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-indigo-300 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}