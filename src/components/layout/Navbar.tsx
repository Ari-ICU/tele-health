'use client';

import { useAuth } from '@/hooks/useAuth';
import {
  UserCircleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; // your axios instance
import { useDebounce } from '@/utils/useDebounce';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Navbar({ onToggleSidebar, isSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Debounce the search query input to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setSearchResults(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results when debounced search query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults(null);
        return;
      }

      try {
        const response = await api.get('/search', {
          params: {
            keyword: debouncedSearchQuery,
            type: 'all',
            page: 1,
            limit: 5,
          },
        });
        setSearchResults(response.data.data);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults(null);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);

  // Navigate to full search results page on Enter key press
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setSearchResults(null); // Clear dropdown
      router.push(`/search?keyword=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-md h-16 flex items-center justify-between px-4 md:px-6 relative z-30">
      {/* Left: Sidebar Toggle & Logo */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-700 focus:outline-none"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
        <h1 className="text-lg md:hidden block font-semibold text-gray-800">Tele-Health Dashboard</h1>
      </div>

      {/* Center: Search Input (Desktop Only) */}
      <div className="hidden md:flex flex-1 justify-center px-6">
        <div className="relative w-full max-w-md" ref={searchDropdownRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit();
            }}
            placeholder="Search anything..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

          {/* {searchResults && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-md shadow-lg max-h-96 overflow-y-auto z-40">
              {Object.keys(searchResults).map((type) =>
                searchResults[type].data.length > 0 ? (
                  <div key={type} className="border-b border-gray-200 last:border-b-0">
                    <h3 className="px-4 py-2 text-sm font-semibold text-gray-700 capitalize">{type}</h3>
                    {searchResults[type].data.map((item: any, index: number) => (
                      <a
                        key={index}
                        href={`/${type}/${item._id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setSearchResults(null)} // close dropdown on click
                      >
                        {type === 'patients' || type === 'doctors'
                          ? item.email
                          : item.title || item.description || 'Result'}
                      </a>
                    ))}
                  </div>
                ) : null
              )}
              {Object.values(searchResults).every((result: any) => result.data.length === 0) && (
                <p className="px-4 py-2 text-sm text-gray-500">No results found</p>
              )}
            </div>
          )} */}
        </div>
      </div>

      {/* Right: User Profile Dropdown */}
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
