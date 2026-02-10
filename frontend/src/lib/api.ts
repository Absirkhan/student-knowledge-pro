/**
 * API utility functions for communicating with FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * POST request helper with JSON body
 */
export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * POST request helper with FormData (for file uploads)
 */
export async function apiPostFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Health check to verify API is running
 */
export async function checkAPIHealth(): Promise<{ status: string; message: string }> {
  return apiGet('/api/health');
}


// ============================================================================
// Dataset API Functions
// ============================================================================

export interface DocumentInfo {
  filename: string;
  file_size_bytes: number;
  file_size_readable: string;
  preview: string;
}

export interface DatasetStats {
  total_documents: number;
  total_size_bytes: number;
  total_size_readable: string;
  average_document_size_readable: string;
}

export interface UploadResponse {
  success: boolean;
  uploaded_files: string[];
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface DocumentContent {
  filename: string;
  content: string;
  size_bytes: number;
  size_readable: string;
}

/**
 * Upload multiple documents to the dataset
 */
export async function uploadDocuments(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  return apiPostFormData<UploadResponse>('/api/dataset/upload', formData);
}

/**
 * Get list of all documents in the dataset
 */
export async function listDocuments(): Promise<DocumentInfo[]> {
  return apiGet<DocumentInfo[]>('/api/dataset/list');
}

/**
 * Get dataset statistics
 */
export async function getDatasetStats(): Promise<DatasetStats> {
  return apiGet<DatasetStats>('/api/dataset/stats');
}

/**
 * Get full content of a specific document
 */
export async function getDocumentContent(filename: string): Promise<DocumentContent> {
  return apiGet<DocumentContent>(`/api/dataset/${encodeURIComponent(filename)}`);
}

/**
 * Delete a specific document from the dataset
 */
export async function deleteDocument(filename: string): Promise<DeleteResponse> {
  return apiDelete<DeleteResponse>(`/api/dataset/${encodeURIComponent(filename)}`);
}
