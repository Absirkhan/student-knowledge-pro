'use client';

import { useState, useEffect } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

interface VectorStore {
  id: string;
  vector_db: string;
  embedding_model: string;
  display_name: string;
}

interface SearchResult {
  rank: number;
  content: string;
  source_file: string;
  similarity_score: number;
}

interface SearchResponse {
  query: string;
  total_results: number;
  vector_store_used: string;
  time_taken_seconds: number;
  results: SearchResult[];
}

interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultCount: number;
}

// ============================================================================
// Main Component
// ============================================================================

export default function SearchPage() {
  // State management
  const [vectorStores, setVectorStores] = useState<VectorStore[]>([]);
  const [selectedVectorStore, setSelectedVectorStore] = useState<string>('');
  const [topK, setTopK] = useState<number>(5);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchMetadata, setSearchMetadata] = useState<{
    timeTaken: number;
    totalResults: number;
  } | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  // ============================================================================
  // Load Vector Stores on Mount
  // ============================================================================

  useEffect(() => {
    fetchVectorStores();
  }, []);

  const fetchVectorStores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/vectorstores`);
      if (!response.ok) throw new Error('Failed to fetch vector stores');

      const data: VectorStore[] = await response.json();
      setVectorStores(data);

      // Auto-select first vector store if available
      if (data.length > 0 && !selectedVectorStore) {
        setSelectedVectorStore(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching vector stores:', error);
      setErrorMessage('Failed to load vector stores. Please refresh the page.');
    }
  };

  // ============================================================================
  // Search Handler
  // ============================================================================

  const handleSearch = async () => {
    if (!query.trim()) {
      setErrorMessage('Please enter a search query');
      return;
    }

    if (!selectedVectorStore) {
      setErrorMessage('Please select a vector store');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/search/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          vector_store_id: selectedVectorStore,
          top_k: topK,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Search failed');
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
      setSearchMetadata({
        timeTaken: data.time_taken_seconds,
        totalResults: data.total_results,
      });

      // Add to search history
      setSearchHistory((prev) => [
        {
          query: query.trim(),
          timestamp: new Date(),
          resultCount: data.total_results,
        },
        ...prev.slice(0, 9), // Keep last 10 searches
      ]);
    } catch (error) {
      console.error('Search error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Search failed');
      setResults([]);
      setSearchMetadata(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    // Auto-search when clicking history item
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreBadgeColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 0.5) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Semantic Search</h1>
        <p className="section-subtitle">
          Search through documents using AI-powered semantic similarity
        </p>
      </div>

      {/* Configuration Bar */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Vector Store Selector */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Vector Store
            </label>
            <select
              value={selectedVectorStore}
              onChange={(e) => setSelectedVectorStore(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg
                       text-neutral-900 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500
                       hover:border-neutral-400"
            >
              {vectorStores.length === 0 ? (
                <option value="">No vector stores available</option>
              ) : (
                vectorStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.display_name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Top-K Selector */}
          <div className="w-full lg:w-48">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Results: {topK}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer
                       accent-accent-600"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>1</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="card p-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg
                className="h-6 w-6 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="How does attention mechanism work in transformers?"
              className="w-full pl-14 pr-32 py-4 text-lg bg-white border border-neutral-300 rounded-xl
                       text-neutral-900 placeholder:text-neutral-400
                       transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500
                       hover:border-neutral-400"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <button
                onClick={handleSearch}
                disabled={!query.trim() || isSearching || !selectedVectorStore}
                className="btn btn-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Searching
                  </span>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>

          {/* Search Tips */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Powered by semantic similarity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Natural language queries supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(item.query)}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-accent-50 border border-neutral-200
                         hover:border-accent-300 rounded-lg text-sm text-neutral-700 hover:text-accent-700
                         transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="max-w-[200px] truncate">{item.query}</span>
                <span className="text-xs text-neutral-500">({item.resultCount})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            {results.length > 0 ? `${results.length} Results Found` : 'Search Results'}
          </h2>
          {searchMetadata && (
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {searchMetadata.timeTaken.toFixed(3)}s
              </span>
              <span className="text-neutral-300">|</span>
              <span>Sorted by relevance</span>
            </div>
          )}
        </div>

        {!hasSearched ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-accent-50 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-accent-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-neutral-600 font-medium text-lg mb-2">Ready to search</p>
            <p className="text-sm text-neutral-400">
              Enter a query above to find relevant document chunks
            </p>
          </div>
        ) : isSearching ? (
          <div className="space-y-4">
            {[...Array(topK)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-neutral-100 rounded-xl p-6 h-40"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-neutral-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-neutral-600 font-medium text-lg mb-2">No results found</p>
            <p className="text-sm text-neutral-400">
              Try adjusting your query or selecting a different vector store
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="group card-hover p-6 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header with Rank and Score */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                    {result.rank}
                  </div>

                  {/* Content Header */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Source File Badge */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {result.source_file}
                      </span>
                    </div>

                    {/* Similarity Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-neutral-600">
                          Similarity Score
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            result.similarity_score >= 0.8
                              ? 'text-green-700'
                              : result.similarity_score >= 0.5
                              ? 'text-yellow-700'
                              : 'text-red-700'
                          }`}
                        >
                          {(result.similarity_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getScoreColor(
                            result.similarity_score
                          )}`}
                          style={{
                            width: `${result.similarity_score * 100}%`,
                            animationDelay: `${index * 100}ms`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Content */}
                <div className="pl-14">
                  <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {result.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
