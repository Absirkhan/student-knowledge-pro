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

from app.config import DATA_DIR

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
# Endpoints for creating embeddings and managing vector stores
# - POST /embeddings/create - Create embeddings for documents
# - GET /embeddings/models - List available embedding models
# - POST /vectorstore/create - Create and persist vector store
# - GET /vectorstore/list - List available vector stores
# - GET /vectorstore/info - Get information about a vector store

# ============================================================================
# Task 3: Semantic search endpoints
# ============================================================================
# Endpoints for performing semantic search queries
# - POST /search/query - Perform semantic search
# - POST /search/similar - Find similar documents
# - GET /search/history - Get search history
