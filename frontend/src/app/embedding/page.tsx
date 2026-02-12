'use client';

import { useState, useEffect } from 'react';

interface EmbeddingResult {
  number_of_documents: number;
  number_of_chunks: number;
  embedding_model: string;
  vector_db: string;
  embedding_dimension: number;
  time_taken_seconds: number;
}

interface VectorStoreInfo {
  store_name: string;
  vector_db: string;
  embedding_model: string;
  num_chunks: number | string;
  created_at: string;
}

export default function EmbeddingPage() {
  const [embeddingModels, setEmbeddingModels] = useState<string[]>([]);
  const [vectorDbs, setVectorDbs] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVectorDB, setSelectedVectorDB] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<EmbeddingResult | null>(null);
  const [existingStores, setExistingStores] = useState<VectorStoreInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch available models and vector DBs on component mount
  useEffect(() => {
    fetchEmbeddingModels();
    fetchVectorDbs();
    fetchExistingStores();
  }, []);

  const fetchEmbeddingModels = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/embedding/models');
      if (!response.ok) throw new Error('Failed to fetch embedding models');
      const data = await response.json();
      setEmbeddingModels(data.models);
      if (data.models.length > 0) {
        setSelectedModel(data.models[0]);
      }
    } catch (err) {
      console.error('Error fetching embedding models:', err);
      setError('Failed to load embedding models');
    }
  };

  const fetchVectorDbs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/embedding/vectordbs');
      if (!response.ok) throw new Error('Failed to fetch vector databases');
      const data = await response.json();
      setVectorDbs(data.vector_dbs);
      if (data.vector_dbs.length > 0) {
        setSelectedVectorDB(data.vector_dbs[0]);
      }
    } catch (err) {
      console.error('Error fetching vector databases:', err);
      setError('Failed to load vector databases');
    }
  };

  const fetchExistingStores = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/embedding/status');
      if (!response.ok) throw new Error('Failed to fetch existing stores');
      const data = await response.json();
      setExistingStores(data);
    } catch (err) {
      console.error('Error fetching existing stores:', err);
    }
  };

  const handleGenerateEmbeddings = async () => {
    if (!selectedModel || !selectedVectorDB) {
      setError('Please select both an embedding model and vector database');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/embedding/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embedding_model: selectedModel,
          vector_db: selectedVectorDB,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate embeddings');
      }

      const data = await response.json();
      setResult(data);

      // Refresh existing stores list
      fetchExistingStores();
    } catch (err) {
      console.error('Error generating embeddings:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate embeddings');
    } finally {
      setIsProcessing(false);
    }
  };

  const getModelShortName = (fullName: string) => {
    return fullName.split('/').pop() || fullName;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Embeddings & Vector Store</h1>
        <p className="section-subtitle">Create embeddings and build vector store for semantic search</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card p-4 border-2 border-red-300 bg-red-50">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="card p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Configuration</h2>
          <p className="text-sm text-neutral-500 mt-1">Select your embedding model and vector database</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Embedding Model Selector */}
          <div>
            <label htmlFor="embedding-model" className="block text-sm font-medium text-neutral-700 mb-2">
              Embedding Model
            </label>
            <select
              id="embedding-model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              {embeddingModels.map((model) => (
                <option key={model} value={model}>
                  {getModelShortName(model)}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-2">
              {selectedModel && `Full name: ${selectedModel}`}
            </p>
          </div>

          {/* Vector Database Selector */}
          <div>
            <label htmlFor="vector-db" className="block text-sm font-medium text-neutral-700 mb-2">
              Vector Database
            </label>
            <select
              id="vector-db"
              value={selectedVectorDB}
              onChange={(e) => setSelectedVectorDB(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              {vectorDbs.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-2">
              {selectedVectorDB === 'FAISS' && 'Fast similarity search with in-memory storage'}
              {selectedVectorDB === 'Chroma' && 'Modern vector DB with persistent storage'}
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="card p-6">
        <button
          onClick={handleGenerateEmbeddings}
          disabled={!selectedModel || !selectedVectorDB || isProcessing}
          className="btn btn-primary w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Embeddings... (This may take 30-60 seconds)
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Embeddings & Build Vector Store
            </span>
          )}
        </button>
      </div>

      {/* Results Card */}
      {result && (
        <div className="card p-8 border-2 border-green-300 bg-green-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Embeddings Generated Successfully!</h3>
              <p className="text-sm text-green-700">Vector store has been created and persisted</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Documents Processed</p>
              <p className="text-2xl font-bold text-neutral-900">{result.number_of_documents}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Chunks Created</p>
              <p className="text-2xl font-bold text-neutral-900">{result.number_of_chunks}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Embedding Dimension</p>
              <p className="text-2xl font-bold text-neutral-900">{result.embedding_dimension}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Time Taken</p>
              <p className="text-2xl font-bold text-neutral-900">{formatTime(result.time_taken_seconds)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Model Used</p>
              <p className="text-sm font-semibold text-neutral-900">{getModelShortName(result.embedding_model)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Vector DB</p>
              <p className="text-sm font-semibold text-neutral-900">{result.vector_db}</p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Vector Stores */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Existing Vector Stores</h2>
            <p className="text-sm text-neutral-500 mt-1">Previously created vector stores</p>
          </div>
          <button
            onClick={fetchExistingStores}
            className="btn btn-secondary text-sm py-2 px-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {existingStores.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-neutral-500">No vector stores found</p>
            <p className="text-sm text-neutral-400 mt-1">Create your first vector store using the form above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingStores.map((store, index) => (
              <div key={index} className="border border-neutral-200 rounded-lg p-5 hover:border-accent-400 hover:bg-accent-50/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="badge bg-neutral-100 text-neutral-700 text-xs">{store.vector_db}</span>
                </div>

                <h3 className="font-semibold text-neutral-900 mb-2 truncate" title={store.store_name}>
                  {store.store_name}
                </h3>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Model:</span>
                    <span className="text-neutral-700 font-medium text-xs truncate ml-2" title={store.embedding_model}>
                      {getModelShortName(store.embedding_model)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Chunks:</span>
                    <span className="text-neutral-700 font-medium">{store.num_chunks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Created:</span>
                    <span className="text-neutral-700 font-medium text-xs">{store.created_at}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
