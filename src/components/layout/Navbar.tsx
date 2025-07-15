'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserCircleIcon, ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Navbar({ onToggleSidebar, isSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md h-16 flex items-center justify-between px-4 md:px-6 relative z-30">
      {/* Left: Mobile Toggle & Logo */}
      <div className="flex items-center space-x-3">
        {/* Toggle Button for Mobile */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-700 focus:outline-none"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
        <h1 className="text-lg md:hidden block font-semibold text-gray-800">Tele-Health Dashboard</h1>
      </div>

      {/* Right: User Dropdown */}
      <div className="flex items-center space-x-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="p-1 rounded-full bg-gray-100">
              <UserCircleIcon className="w-8 h-8 text-gray-500" />
            </div>
            <ChevronDownIcon className="w-4 h-4 text-gray-500 hidden md:block" />
          </button>

          {/* Dropdown Content */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 animate-fade-in">
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
