"""
API Routes module for Semantic Search Engine.
Contains all API endpoints organized by tasks.
"""
import os
from pathlib import Path
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.config import DATA_DIR, SUPPORTED_EMBEDDING_MODELS, SUPPORTED_VECTOR_DBS
from app import embedding_utils
import time

# Create API router
router = APIRouter()


# ============================================================================
# Helper Functions
# ============================================================================

def format_file_size(size_bytes: int) -> str:
    """Convert bytes to human-readable format."""
    if size_bytes == 0:
        return "0 Bytes"

    units = ["Bytes", "KB", "MB", "GB"]
    unit_index = 0
    size = float(size_bytes)

    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1

    return f"{size:.2f} {units[unit_index]}"


def get_file_preview(file_path: Path, max_chars: int = 200) -> str:
    """Get a preview of file content (first max_chars characters)."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read(max_chars)
            if len(content) == max_chars:
                content += "..."
            return content
    except Exception as e:
        return f"Error reading file: {str(e)}"


# ============================================================================
# Response Models
# ============================================================================

class DocumentInfo(BaseModel):
    filename: str
    file_size_bytes: int
    file_size_readable: str
    preview: str


class DatasetStats(BaseModel):
    total_documents: int
    total_size_bytes: int
    total_size_readable: str
    average_document_size_readable: str


class UploadResponse(BaseModel):
    success: bool
    uploaded_files: List[str]
    message: str


class DeleteResponse(BaseModel):
    success: bool
    message: str


# ============================================================================
# Task 2: Response Models for Embedding & Vector Store
# ============================================================================

class EmbeddingGenerateRequest(BaseModel):
    embedding_model: str
    vector_db: str


class EmbeddingGenerateResponse(BaseModel):
    number_of_documents: int
    number_of_chunks: int
    embedding_model: str
    vector_db: str
    embedding_dimension: int
    time_taken_seconds: float


class VectorStoreInfo(BaseModel):
    store_name: str
    vector_db: str
    embedding_model: str
    num_chunks: int | str
    created_at: str


# ============================================================================
# Task 1: Dataset endpoints
# ============================================================================

@router.post("/dataset/upload", response_model=UploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    """
    Upload multiple text documents to the data directory.
    Accepts .txt, .md, and optionally .pdf files.

    Returns:
        UploadResponse with list of successfully uploaded filenames
    """
    uploaded_files = []
    allowed_extensions = {'.txt', '.md', '.pdf'}

    try:
        for file in files:
            # Validate file extension
            file_ext = Path(file.filename).suffix.lower()
            if file_ext not in allowed_extensions:
                continue

            # Save file to data directory
            file_path = DATA_DIR / file.filename

            # Read and write file content
            content = await file.read()
            with open(file_path, 'wb') as f:
                f.write(content)

            uploaded_files.append(file.filename)

        if not uploaded_files:
            return UploadResponse(
                success=False,
                uploaded_files=[],
                message="No valid files uploaded. Only .txt, .md, and .pdf files are accepted."
            )

        return UploadResponse(
            success=True,
            uploaded_files=uploaded_files,
            message=f"Successfully uploaded {len(uploaded_files)} file(s)"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading files: {str(e)}")


@router.get("/dataset/list", response_model=List[DocumentInfo])
async def list_documents():
    """
    List all documents in the data directory.

    Returns:
        List of DocumentInfo with filename, size, and preview
    """
    try:
        documents = []

        # Iterate through all files in data directory
        for file_path in DATA_DIR.iterdir():
            if file_path.is_file():
                file_size = file_path.stat().st_size

                documents.append(DocumentInfo(
                    filename=file_path.name,
                    file_size_bytes=file_size,
                    file_size_readable=format_file_size(file_size),
                    preview=get_file_preview(file_path)
                ))

        # Sort by filename
        documents.sort(key=lambda x: x.filename)

        return documents

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")


@router.get("/dataset/stats", response_model=DatasetStats)
async def get_dataset_stats():
    """
    Get statistics about the dataset.

    Returns:
        DatasetStats with total documents, total size, and average size
    """
    try:
        total_documents = 0
        total_size_bytes = 0

        # Calculate totals
        for file_path in DATA_DIR.iterdir():
            if file_path.is_file():
                total_documents += 1
                total_size_bytes += file_path.stat().st_size

        # Calculate average
        average_size_bytes = total_size_bytes // total_documents if total_documents > 0 else 0

        return DatasetStats(
            total_documents=total_documents,
            total_size_bytes=total_size_bytes,
            total_size_readable=format_file_size(total_size_bytes),
            average_document_size_readable=format_file_size(average_size_bytes)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting dataset stats: {str(e)}")


@router.get("/dataset/{filename}")
async def get_document_content(filename: str):
    """
    Get the full content of a specific document.

    Args:
        filename: Name of the file to read

    Returns:
        JSON with filename and full content
    """
    try:
        file_path = DATA_DIR / filename

        # Check if file exists
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"File '{filename}' not found")

        # Check if it's actually a file (not a directory)
        if not file_path.is_file():
            raise HTTPException(status_code=400, detail=f"'{filename}' is not a file")

        # Read full content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        return {
            "filename": filename,
            "content": content,
            "size_bytes": file_path.stat().st_size,
            "size_readable": format_file_size(file_path.stat().st_size)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")


@router.delete("/dataset/{filename}", response_model=DeleteResponse)
async def delete_document(filename: str):
    """
    Delete a specific document from the data directory.

    Args:
        filename: Name of the file to delete

    Returns:
        DeleteResponse with success status and message
    """
    try:
        file_path = DATA_DIR / filename

        # Check if file exists
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"File '{filename}' not found")

        # Check if it's actually a file (not a directory)
        if not file_path.is_file():
            raise HTTPException(status_code=400, detail=f"'{filename}' is not a file")

        # Delete the file
        file_path.unlink()

        return DeleteResponse(
            success=True,
            message=f"Successfully deleted '{filename}'"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")


# ============================================================================
# Task 2: Embedding & vector store endpoints
# ============================================================================

@router.get("/embedding/models")
async def get_embedding_models():
    """
    Get list of available HuggingFace embedding models.

    Returns:
        List of embedding model names from config
    """
    try:
        return {"models": SUPPORTED_EMBEDDING_MODELS}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching models: {str(e)}")


@router.get("/embedding/vectordbs")
async def get_vector_dbs():
    """
    Get list of available vector database options.

    Returns:
        List of vector database options from config
    """
    try:
        return {"vector_dbs": SUPPORTED_VECTOR_DBS}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching vector DBs: {str(e)}")


@router.post("/embedding/generate", response_model=EmbeddingGenerateResponse)
async def generate_embeddings(request: EmbeddingGenerateRequest):
    """
    Generate embeddings and build vector store from documents in data directory.

    Args:
        request: EmbeddingGenerateRequest with embedding_model and vector_db

    Returns:
        EmbeddingGenerateResponse with statistics about the generated embeddings
    """
    try:
        start_time = time.time()

        # Validate inputs
        if request.embedding_model not in SUPPORTED_EMBEDDING_MODELS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid embedding model. Supported models: {SUPPORTED_EMBEDDING_MODELS}"
            )

        if request.vector_db not in SUPPORTED_VECTOR_DBS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid vector database. Supported databases: {SUPPORTED_VECTOR_DBS}"
            )

        # Step 1: Load documents from data directory
        documents, num_documents = embedding_utils.load_documents_from_data_dir()

        if num_documents == 0:
            raise HTTPException(
                status_code=400,
                detail="No documents found in data directory. Please upload documents first."
            )

        # Step 2: Chunk documents
        chunks = embedding_utils.chunk_documents(documents, chunk_size=500, chunk_overlap=50)
        num_chunks = len(chunks)

        if num_chunks == 0:
            raise HTTPException(
                status_code=400,
                detail="No chunks created from documents. Documents may be empty."
            )

        # Step 3: Create embeddings
        embeddings = embedding_utils.create_embeddings(request.embedding_model)

        # Get embedding dimension
        embedding_dim = embedding_utils.get_embedding_dimension(embeddings)

        # Step 4: Build and persist vector store
        vectorstore, store_path = embedding_utils.build_and_persist_vector_store(
            chunks=chunks,
            embeddings=embeddings,
            vector_db=request.vector_db,
            model_name=request.embedding_model
        )

        # Calculate time taken
        time_taken = time.time() - start_time

        return EmbeddingGenerateResponse(
            number_of_documents=num_documents,
            number_of_chunks=num_chunks,
            embedding_model=request.embedding_model,
            vector_db=request.vector_db,
            embedding_dimension=embedding_dim,
            time_taken_seconds=round(time_taken, 2)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embeddings: {str(e)}")


@router.get("/embedding/status", response_model=List[VectorStoreInfo])
async def get_embedding_status():
    """
    Get information about all existing vector stores.

    Returns:
        List of VectorStoreInfo with details about each vector store
    """
    try:
        vector_stores = embedding_utils.get_all_vector_stores()
        return vector_stores
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching vector store status: {str(e)}")

# ============================================================================
# Task 3: Semantic search endpoints
# ============================================================================
# Endpoints for performing semantic search queries
# - POST /search/query - Perform semantic search
# - POST /search/similar - Find similar documents
# - GET /search/history - Get search history
