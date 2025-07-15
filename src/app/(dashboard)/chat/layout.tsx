'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { Conversation } from '@/types';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/conversations');
        setConversations(res.data);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Close sidebar on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  // Auto-close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-[calc(100vh-100px)] border rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 shadow-lg">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Conversations List */}
      <aside
        ref={sidebarRef}
        className={`fixed md:static z-30 top-0 left-0 h-full w-64 md:w-80 bg-white border-r flex flex-col transform transition-transform duration-300 ease-in-out shadow-md ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        aria-label="Conversations Sidebar"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
          <h2 className="font-semibold text-xl text-gray-800 tracking-tight">Conversations</h2>
          <button
            className="md:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close conversations sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-center text-gray-500 p-4 text-sm sm:text-base">No conversations yet.</p>
          ) : (
            <ul>
              {conversations.map((convo) => {
                const isActive = pathname === `/chat/${convo._id}`;
                const otherUser = convo.participants[1];

                return (
                  <li key={convo._id}>
                    <Link
                      href={`/chat/${convo._id}`}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`block p-4 border-b border-gray-100 transition-all duration-200 ease-in-out ${
                        isActive
                          ? 'bg-indigo-100 border-l-4 border-indigo-600 text-indigo-900'
                          : 'hover:bg-indigo-50 hover:text-indigo-800'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-medium shadow-sm">
                          {otherUser?.profile.firstName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                            {otherUser?.profile.firstName} {otherUser?.profile.lastName}
                          </p>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {convo.lastMessage?.content || 'Start a new conversation'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden p-4 border-b bg-white flex items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Open conversations sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="ml-4 font-semibold text-lg text-gray-800 tracking-tight">Chat</h2>
        </header>
        <main className="flex-1 bg-gradient-to-b from-gray-50 to-blue-50">{children}</main>
      </div>
    </div>
  );
}