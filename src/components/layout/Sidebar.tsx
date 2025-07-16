"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import api from "@/lib/api";

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Appointments", href: "/appointments" },
  { name: "Find Doctors", href: "/doctors" },
  { name: "Medical Records", href: "/medical-records" },
  { name: "Health Metrics", href: "/health-metrics" },
  { name: "AI Assistant", href: "/ai-assistant" },
  { name: "Chat", href: "/chat" },
  { name: "My Profile", href: "/profile" },
];

interface SidebarProps {
  isSidebarOpen: boolean;
  onLinkClick: () => void;
}

export default function Sidebar({ isSidebarOpen, onLinkClick }: SidebarProps) {
  const { user, token } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (isSidebarOpen && sidebarRef.current) {
      const focusableElements = sidebarRef.current.querySelectorAll(
        'a[href], button, input, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      firstElement?.focus();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Tab") {
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          } else if (
            !event.shiftKey &&
            document.activeElement === lastElement
          ) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isSidebarOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (searchQuery.trim()) handleSearch();
      else {
        setSearchResults(null);
        setSearchError(null);
      }
    }, 300);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchQuery]);

  // Handle search API call
  const handleSearch = async () => {
    if (!token) {
      setSearchError("Please log in to search.");
      setSearchResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    try {
      const response = await api.get("/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          keyword: searchQuery,
          type: "all",
          page: 1,
          limit: 5, // Limited for sidebar display
          sortBy: "score",
          order: "desc",
        },
      });
      setSearchResults(response.data.data);
    } catch (error: any) {
      console.error("Search error:", error);
      setSearchError(
        error.response?.data?.error || "Failed to perform search."
      );
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search submit (redirect to /search)
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setSearchResults(null);
      setSearchError(null);
      router.push(`/search?keyword=${encodeURIComponent(searchQuery)}`);
      onLinkClick(); // Close sidebar on mobile
    }
  };

  // Filtered nav links
  const filteredLinks = navLinks.filter((link) =>
    link.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      ref={sidebarRef}
      className={`w-64 bg-gray-900 text-white flex flex-col h-full shadow-lg transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 fixed md:static z-40`}
      aria-hidden={!isSidebarOpen}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 p-5 border-b border-gray-700">
        <div className="text-xl font-bold text-white tracking-wide">
          Tele-Health
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pt-4 md:hidden block">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Search telehealth dashboard"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        {isLoading && <p className="text-sm text-gray-400 mt-2">Loading...</p>}
        {searchError && (
          <p className="text-sm text-red-400 mt-2">{searchError}</p>
        )}
      </div>

      {/* Navigation or Search Results */}
      <nav
        className="flex-1 px-2 py-4 space-y-1 overflow-y-auto"
        role="navigation"
        aria-label="Sidebar navigation"
      >
        {searchResults ? (
          <>
            <div role="list" aria-label="Search results">
              {Object.keys(searchResults).map((type) =>
                searchResults[type].data.length > 0 ? (
                  <div
                    key={type}
                    className="border-b border-gray-700 last:border-b-0 mb-3"
                  >
                    <h3 className="px-4 py-2 text-sm font-semibold text-gray-300 capitalize">
                      {type.replace(/-/g, " ")}
                    </h3>
                    <div className="space-y-1">
                      {searchResults[type].data.map(
                        (item: any, index: number) => (
                          <Link
                            key={index}
                            href={`/${type}/${item._id}`}
                            className="block px-4 py-2 bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all truncate"
                            onClick={onLinkClick}
                            role="listitem"
                          >
                            {type === "patients" || type === "doctors" ? (
                              <div className="flex flex-col">
                                <span className="font-medium break-words">
                                  {item.email}
                                </span>
                                <span className="text-xs text-gray-400 capitalize">
                                  {item.role}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="font-medium break-words">
                                  {item.title || item.description || "Result"}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {type === "appointments" && item.dateTime
                                    ? new Date(item.dateTime).toLocaleString()
                                    : type === "medical-records" &&
                                      item.createdAt
                                    ? new Date(item.createdAt).toLocaleString()
                                    : ""}
                                </span>
                              </div>
                            )}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                ) : null
              )}
              {Object.values(searchResults).every(
                (result: any) => result.data.length === 0
              ) && (
                <p className="px-4 py-2 text-sm text-gray-400">
                  No results found
                </p>
              )}
            </div>
            <button
              onClick={handleSearchSubmit}
              className="block w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-gray-700 hover:text-indigo-300"
            >
              View all results
            </button>
          </>
        ) : filteredLinks.length > 0 ? (
          filteredLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`block px-4 py-3 rounded-lg transition-all duration-200 ease-in-out truncate ${
                  isActive
                    ? "bg-indigo-600 font-semibold text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={onLinkClick}
                role="link"
              >
                {link.name}
              </Link>
            );
          })
        ) : (
          <p className="px-4 py-2 text-sm text-gray-400">No results found</p>
        )}
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
