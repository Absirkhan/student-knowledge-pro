'use client';

import { useState } from 'react';

interface EmbeddingModel {
  id: string;
  name: string;
  description: string;
  dimensions: number;
  speed: 'Fast' | 'Medium' | 'Slow';
}

interface VectorDatabase {
  id: string;
  name: string;
  description: string;
  features: string[];
}

export default function EmbeddingPage() {
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVectorDB, setSelectedVectorDB] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const embeddingModels: EmbeddingModel[] = [
    {
      id: 'all-MiniLM-L6-v2',
      name: 'all-MiniLM-L6-v2',
      description: 'Lightweight and fast, suitable for most use cases',
      dimensions: 384,
      speed: 'Fast',
    },
    {
      id: 'all-mpnet-base-v2',
      name: 'all-mpnet-base-v2',
      description: 'High quality embeddings with balanced performance',
      dimensions: 768,
      speed: 'Medium',
    },
    {
      id: 'paraphrase-MiniLM-L3-v2',
      name: 'paraphrase-MiniLM-L3-v2',
      description: 'Ultra-fast with decent quality for rapid prototyping',
      dimensions: 384,
      speed: 'Fast',
    },
  ];

  const vectorDatabases: VectorDatabase[] = [
    {
      id: 'FAISS',
      name: 'FAISS',
      description: 'Facebook AI Similarity Search - Optimized for speed',
      features: ['In-memory storage', 'Fast similarity search', 'Efficient indexing'],
    },
    {
      id: 'Chroma',
      name: 'ChromaDB',
      description: 'Modern vector database with persistent storage',
      features: ['Persistent storage', 'Rich metadata', 'Easy to use'],
    },
  ];

  const handleCreateEmbeddings = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'Fast':
        return 'bg-success-light text-success-dark border-success';
      case 'Medium':
        return 'bg-warning-light text-warning-dark border-warning';
      case 'Slow':
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Embeddings & Vector Store</h1>
        <p className="section-subtitle">Create embeddings and build vector store for semantic search</p>
      </div>

      {/* Embedding Model Selection */}
      <div className="card p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Select Embedding Model</h2>
          <p className="text-sm text-neutral-500 mt-1">Choose the model that best fits your needs</p>
        </div>

        <div className="space-y-3">
          {embeddingModels.map((model) => (
            <label
              key={model.id}
              className={`
                group relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${selectedModel === model.id
                  ? 'border-primary-500 bg-primary-50/50 shadow-soft'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                }
              `}
            >
              {/* Radio Button */}
              <div className="flex items-center h-6 mt-0.5">
                <input
                  type="radio"
                  name="embedding-model"
                  value={model.id}
                  checked={selectedModel === model.id}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-5 h-5 text-primary-600 border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-neutral-900">{model.name}</span>
                  <span className={`badge text-xs ${getSpeedColor(model.speed)}`}>
                    {model.speed}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-2">{model.description}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    {model.dimensions} dimensions
                  </span>
                </div>
              </div>

              {/* Selected Indicator */}
              {selectedModel === model.id && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Vector Database Selection */}
      <div className="card p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Select Vector Database</h2>
          <p className="text-sm text-neutral-500 mt-1">Choose your preferred vector storage solution</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vectorDatabases.map((db) => (
            <label
              key={db.id}
              className={`
                group relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${selectedVectorDB === db.id
                  ? 'border-primary-500 bg-primary-50/50 shadow-soft'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                }
              `}
            >
              {/* Header with Radio */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="vector-db"
                    value={db.id}
                    checked={selectedVectorDB === db.id}
                    onChange={(e) => setSelectedVectorDB(e.target.value)}
                    className="w-5 h-5 text-primary-600 border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer mt-0.5"
                  />
                  <div>
                    <h3 className="font-semibold text-neutral-900">{db.name}</h3>
                  </div>
                </div>
                {selectedVectorDB === db.id && (
                  <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-600 mb-4 ml-8">{db.description}</p>

              {/* Features */}
              <div className="ml-8 space-y-2">
                {db.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-neutral-500">
                    <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-neutral-900">Ready to Build</h3>
            <p className="text-sm text-neutral-500 mt-1">
              {selectedModel && selectedVectorDB
                ? `Using ${selectedModel} with ${selectedVectorDB}`
                : 'Select both model and database to continue'}
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateEmbeddings}
          disabled={!selectedModel || !selectedVectorDB || isProcessing}
          className="btn btn-primary w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Embeddings...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Create Embeddings & Build Vector Store
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
