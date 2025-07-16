'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/lib/api';
import { useDebounce } from '@/utils/useDebounce';

type SearchResultType = {
  data: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type SearchResults = Record<string, SearchResultType>;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const rawKeyword = searchParams.get('keyword') || '';
  const keyword = rawKeyword.trim();

  const debouncedKeyword = useDebounce(keyword, 300);

  const { token } = useAuth();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedKeyword || !token) {
        setResults(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/search`, {
          params: {
            keyword: debouncedKeyword,
            type: 'all',
            page: 1,
            limit: 10,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setResults(res.data.data || null);
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch search results');
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedKeyword, token]);

  const hasResults = useMemo(() => {
    if (!results) return false;
    return Object.values(results).some((result) => result.data.length > 0);
  }, [results]);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Search Results {keyword ? `for "${keyword}"` : ''}
        </h1>
        <p className="text-gray-500 mt-2">
          {keyword ? `Found results across multiple categories.` : `Enter a keyword to begin searching.`}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Searching...</p>
        </div>
      )}

      {/* Error Message */}
      {!loading && error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* No Keyword */}
      {!loading && !error && !keyword && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-600 text-lg">Please enter a keyword to search.</p>
        </div>
      )}

      {/* Search Results */}
      {!loading && !error && keyword && results && (
        <>
          {hasResults ? (
            Object.entries(results).map(([type, result]) => (
              <section key={type} className="mb-8">
                <h2 className="text-lg sm:text-xl font-semibold capitalize flex items-center mb-3 text-gray-800">
                  <span className="mr-2">
                    {type === 'patients' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                    {type === 'doctors' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    )}
                    {type === 'appointments' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    {type === 'medical-records' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                    {type === 'health-metrics' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14z"
                        />
                      </svg>
                    )}
                  </span>
                  {type.replace('-', ' ')}
                </h2>

                {result.data.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.data.map((item: any) => {
                      const key = item._id || item.email || Math.random().toString();
                      const title =
                        item.title ||
                        item.description ||
                        `${item.profile?.firstName} ${item.profile?.lastName}` ||
                        item.email ||
                        'Result';

                      const subtitle =
                        item.dateTime
                          ? new Date(item.dateTime).toLocaleString()
                          : item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : item.role
                          ? item.role
                          : '';

                      return (
                        <div
                          key={key}
                          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition border border-gray-100"
                        >
                          <Link
                            href={`/${type}/${item._id}`}
                            className="block text-gray-800 hover:text-blue-600 focus:outline-none"
                            aria-label={`View ${type} details: ${title}`}
                          >
                            <h3 className="font-medium text-sm sm:text-base truncate">{title}</h3>
                            {subtitle && (
                              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No results found.</p>
                )}
              </section>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-gray-600">No results found for your search.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}