'use client';

import { useState, useRef, useEffect } from 'react';
import {
  uploadDocuments,
  listDocuments,
  getDatasetStats,
  deleteDocument,
  getDocumentContent,
  DocumentInfo,
  DatasetStats,
  DocumentContent,
} from '@/lib/api';

export default function DatasetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<DocumentContent | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents and stats on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [docsData, statsData] = await Promise.all([
        listDocuments(),
        getDatasetStats(),
      ]);
      setDocuments(docsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset');
      console.error('Error loading dataset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Filter for allowed file types
    const allowedExtensions = ['.txt', '.md'];
    const validFiles = files.filter(file => {
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return allowedExtensions.includes(ext);
    });

    if (validFiles.length === 0) {
      setError('No valid files selected. Only .txt and .md files are allowed.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(`Uploading ${validFiles.length} file(s)...`);

    try {
      const response = await uploadDocuments(validFiles);

      if (response.success) {
        setUploadProgress(`Successfully uploaded ${response.uploaded_files.length} file(s)`);
        // Reload data to show new files
        await loadData();
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Clear success message after 3 seconds
        setTimeout(() => setUploadProgress(null), 3000);
      } else {
        setError(response.message);
        setUploadProgress(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload files');
      setUploadProgress(null);
      console.error('Error uploading files:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = async (filename: string) => {
    setIsLoadingDocument(true);
    setError(null);
    try {
      const content = await getDocumentContent(filename);
      setViewingDocument(content);
    } catch (err: any) {
      setError(err.message || `Failed to load ${filename}`);
      console.error('Error loading document:', err);
    } finally {
      setIsLoadingDocument(false);
    }
  };

  const closeModal = () => {
    setViewingDocument(null);
  };

  const handleDelete = async (filename: string) => {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    setError(null);
    try {
      const response = await deleteDocument(filename);
      if (response.success) {
        // Reload data to reflect deletion
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || `Failed to delete ${filename}`);
      console.error('Error deleting document:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Dataset Management</h1>
        <p className="section-subtitle">Upload and manage text documents for semantic search</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="card p-4 border-error bg-error-light animate-slide-in">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-error-dark font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-error hover:text-error-dark"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {uploadProgress && (
        <div className="card p-4 border-success bg-success-light animate-slide-in">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-success-dark font-medium">{uploadProgress}</p>
          </div>
        </div>
      )}

      {/* Dataset Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.total_documents}</p>
                <p className="text-sm text-neutral-500">Total Documents</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.total_size_readable}</p>
                <p className="text-sm text-neutral-500">Total Size</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success-light border border-success flex items-center justify-center">
                <svg className="w-6 h-6 text-success-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.average_document_size_readable}</p>
                <p className="text-sm text-neutral-500">Average Size</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Upload Documents</h2>
            <p className="text-sm text-neutral-500 mt-1">Support for .txt and .md files</p>
          </div>
        </div>

        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
            ${isDragActive
              ? 'border-primary-500 bg-primary-50/50 scale-[1.02]'
              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
            }
          `}
        >
          {/* Upload Icon */}
          <div className={`
            mx-auto w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragActive
              ? 'bg-primary-100 text-primary-600 scale-110'
              : isUploading
              ? 'bg-primary-100 text-primary-600'
              : 'bg-neutral-100 text-neutral-400'
            }
          `}>
            {isUploading ? (
              <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {/* Upload Text */}
          <div className="mb-6">
            <p className="text-base font-medium text-neutral-700 mb-2">
              {isUploading
                ? 'Uploading...'
                : isDragActive
                ? 'Drop files here'
                : 'Drag and drop files here'}
            </p>
            <p className="text-sm text-neutral-500">or click the button below to browse</p>
          </div>

          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label htmlFor="file-upload">
            <span className={`btn btn-primary cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Choose Files
            </span>
          </label>
        </div>
      </div>

      {/* Documents Table */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Documents</h2>
          {documents.length > 0 && (
            <button
              onClick={loadData}
              className="btn btn-ghost text-sm"
              disabled={isLoading}
            >
              <svg className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-neutral-500 font-medium">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-neutral-500 font-medium">No documents found</p>
            <p className="text-sm text-neutral-400 mt-1">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Size</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.filename}
                    className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="font-medium text-neutral-900">{doc.filename}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-neutral-600">{doc.file_size_readable}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(doc.filename)}
                          className="btn btn-ghost text-primary-600 hover:bg-primary-50 px-3 py-1.5 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          title="View document"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(doc.filename)}
                          className="btn btn-ghost text-error hover:bg-error-light px-3 py-1.5 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete document"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{viewingDocument.filename}</h3>
                  <p className="text-sm text-neutral-500">{viewingDocument.size_readable}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {viewingDocument.content}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
              <button
                onClick={closeModal}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay for Document */}
      {isLoadingDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4">
              <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-neutral-700 font-medium">Loading document...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
