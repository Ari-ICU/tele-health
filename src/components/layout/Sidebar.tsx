'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'AI Assistant', href: '/ai-assistant' },
  { name: 'Appointments', href: '/appointments' },
  { name: 'Find Doctors', href: '/doctors' },
  { name: 'Chat', href: '/chat' },
  { name: 'My Profile', href: '/profile' },
];

interface SidebarProps {
  isSidebarOpen: boolean;
  onLinkClick: () => void; // Added prop to handle link clicks
}

export default function Sidebar({ isSidebarOpen, onLinkClick }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (isSidebarOpen && sidebarRef.current) {
      const focusableElements = sidebarRef.current.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Focus the first element when sidebar opens
      firstElement?.focus();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSidebarOpen]);

  return (
    <aside
      ref={sidebarRef}
      className="w-64 bg-gray-900 text-white flex flex-col h-full shadow-lg"
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 p-5 border-b border-gray-700">
        <div className="text-xl font-bold text-white tracking-wide">
          Tele-Health
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={`block px-4 py-3 rounded-lg transition-all duration-200 ease-in-out truncate ${
                isActive
                  ? 'bg-indigo-600 font-semibold text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={onLinkClick} // Call onLinkClick to close sidebar
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <p className="font-semibold truncate text-white">{user?.email}</p>
        <p className="text-sm text-gray-400 capitalize mt-1 truncate">
          {user?.role} view
        </p>
      </div>
    </aside>
  );
}