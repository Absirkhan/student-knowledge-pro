'use client';

import { useState } from 'react';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  source: string;
  metadata?: {
    date?: string;
    category?: string;
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate search - replace with actual API call
    setTimeout(() => {
      // Mock results for demonstration
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Neural Networks',
          content: 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process and transmit information...',
          score: 0.95,
          source: 'neural_networks.txt',
          metadata: {
            category: 'Deep Learning',
            date: '2024-01-15',
          },
        },
        {
          id: '2',
          title: 'Machine Learning Basics',
          content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed...',
          score: 0.87,
          source: 'machine_learning_basics.txt',
          metadata: {
            category: 'ML Fundamentals',
            date: '2024-01-10',
          },
        },
        {
          id: '3',
          title: 'Transfer Learning',
          content: 'Transfer learning is a machine learning technique where a model trained on one task is repurposed for a second related task...',
          score: 0.82,
          source: 'transfer_learning.txt',
          metadata: {
            category: 'Advanced Topics',
            date: '2024-01-20',
          },
        },
      ];

      setResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-success-dark bg-success-light border-success';
    if (score >= 0.8) return 'text-primary-700 bg-primary-50 border-primary-200';
    if (score >= 0.7) return 'text-warning-dark bg-warning-light border-warning';
    return 'text-neutral-600 bg-neutral-100 border-neutral-300';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Very Good';
    if (score >= 0.7) return 'Good';
    return 'Fair';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Semantic Search</h1>
        <p className="section-subtitle">Search through documents using semantic similarity</p>
      </div>

      {/* Search Bar */}
      <div className="card p-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your search query..."
              className="w-full pl-14 pr-32 py-4 text-lg bg-white border-2 border-neutral-200 rounded-2xl
                       text-neutral-900 placeholder:text-neutral-400
                       transition-all duration-200
                       focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500
                       hover:border-neutral-300"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <button
                onClick={handleSearch}
                disabled={!query.trim() || isSearching}
                className="btn btn-primary px-6 py-2.5 disabled:opacity-50"
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Powered by semantic similarity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Natural language queries supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            {results.length > 0 ? `${results.length} Results Found` : 'Search Results'}
          </h2>
          {results.length > 0 && (
            <span className="text-sm text-neutral-500">
              Sorted by relevance
            </span>
          )}
        </div>

        {!hasSearched ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-neutral-600 font-medium text-lg mb-2">Ready to search</p>
            <p className="text-sm text-neutral-400">Enter a query above to find relevant documents</p>
          </div>
        ) : isSearching ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-primary-50 flex items-center justify-center">
              <svg className="animate-spin h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-neutral-600 font-medium text-lg">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-neutral-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-neutral-600 font-medium text-lg mb-2">No results found</p>
            <p className="text-sm text-neutral-400">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {results.map((result, index) => (
              <div
                key={result.id}
                className="group card-hover p-6 cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors mb-1">
                      {result.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {result.source}
                      </span>
                      {result.metadata?.category && (
                        <>
                          <span className="text-neutral-300">•</span>
                          <span>{result.metadata.category}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Relevance Score */}
                  <div className="flex-shrink-0">
                    <div className={`badge ${getScoreColor(result.score)}`}>
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold">{(result.score * 100).toFixed(0)}%</span>
                        <span className="font-medium">{getScoreLabel(result.score)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <p className="text-neutral-600 leading-relaxed">
                  {result.content}
                </p>

                {/* View More Indicator */}
                <div className="mt-4 flex items-center gap-2 text-sm text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-medium">View details</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
