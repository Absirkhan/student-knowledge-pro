"""
Embedding and Vector Store Utilities for Semantic Search Engine.
Contains helper functions for document processing, embedding generation, and vector store management.
"""
import os
import json
import time
from pathlib import Path
from typing import List, Dict, Tuple, Optional

# Use simple imports that work across versions
try:
    from langchain_community.embeddings import HuggingFaceEmbeddings
except ImportError:
    from langchain.embeddings import HuggingFaceEmbeddings

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter

try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document

# Import vector stores
try:
    from langchain_community.vectorstores import FAISS, Chroma
except ImportError:
    from langchain.vectorstores import FAISS, Chroma

from app.config import DATA_DIR, VECTOR_STORE_DIR


def load_documents_from_data_dir() -> Tuple[List[Document], int]:
    """
    Load all .txt and .md files from the data directory.

    Returns:
        Tuple of (list of Document objects, number of files loaded)
    """
    documents = []
    file_count = 0

    # Supported file extensions
    supported_extensions = ['.txt', '.md']

    # Iterate through all files in data directory
    for file_path in DATA_DIR.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in supported_extensions:
            try:
                # Read file content
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Create Document object with metadata
                doc = Document(
                    page_content=content,
                    metadata={
                        "source": file_path.name,
                        "file_path": str(file_path)
                    }
                )
                documents.append(doc)
                file_count += 1
            except Exception as e:
                print(f"Error loading {file_path.name}: {str(e)}")
                continue

    return documents, file_count


def chunk_documents(documents: List[Document], chunk_size: int = 500, chunk_overlap: int = 50) -> List[Document]:
    """
    Split documents into chunks using RecursiveCharacterTextSplitter.

    Args:
        documents: List of Document objects to chunk
        chunk_size: Maximum size of each chunk (default: 500)
        chunk_overlap: Number of overlapping characters between chunks (default: 50)

    Returns:
        List of chunked Document objects with preserved metadata
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )

    # Split documents while preserving metadata
    chunks = text_splitter.split_documents(documents)

    return chunks


def create_embeddings(model_name: str) -> HuggingFaceEmbeddings:
    """
    Create HuggingFace embeddings model.

    Args:
        model_name: Name of the HuggingFace model (e.g., "sentence-transformers/all-MiniLM-L6-v2")

    Returns:
        HuggingFaceEmbeddings object
    """
    embeddings = HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )

    return embeddings


def get_model_short_name(model_name: str) -> str:
    """
    Extract short name from full model path.

    Args:
        model_name: Full model name (e.g., "sentence-transformers/all-MiniLM-L6-v2")

    Returns:
        Short name (e.g., "all-MiniLM-L6-v2")
    """
    return model_name.split('/')[-1]


def get_vector_store_path(vector_db: str, model_name: str) -> Path:
    """
    Generate the path for storing vector database.

    Args:
        vector_db: Vector database type ("FAISS" or "Chroma")
        model_name: Full embedding model name

    Returns:
        Path object for vector store directory
    """
    model_short = get_model_short_name(model_name)
    store_name = f"{vector_db}_{model_short}"
    return VECTOR_STORE_DIR / store_name


def build_and_persist_vector_store(
    chunks: List[Document],
    embeddings: HuggingFaceEmbeddings,
    vector_db: str,
    model_name: str
) -> Tuple[object, Path]:
    """
    Build vector store from chunks and persist to disk.

    Args:
        chunks: List of document chunks
        embeddings: HuggingFace embeddings object
        vector_db: Vector database type ("FAISS" or "Chroma")
        model_name: Full embedding model name

    Returns:
        Tuple of (vector store object, path where it was saved)
    """
    store_path = get_vector_store_path(vector_db, model_name)

    # Create vector store based on type
    if vector_db.upper() == "FAISS":
        vectorstore = FAISS.from_documents(chunks, embeddings)

        # Persist FAISS index
        store_path.mkdir(parents=True, exist_ok=True)
        vectorstore.save_local(str(store_path))

    elif vector_db.upper() == "CHROMA":
        # For Chroma, the persist_directory is set during creation
        store_path.mkdir(parents=True, exist_ok=True)
        vectorstore = Chroma.from_documents(
            chunks,
            embeddings,
            persist_directory=str(store_path)
        )
        # Chroma auto-persists

    else:
        raise ValueError(f"Unsupported vector database: {vector_db}")

    # Save metadata
    metadata = {
        "vector_db": vector_db,
        "embedding_model": model_name,
        "num_chunks": len(chunks),
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    metadata_path = store_path / "metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    return vectorstore, store_path


def load_vector_store(vector_db: str, model_name: str) -> Optional[object]:
    """
    Load a persisted vector store from disk.

    Args:
        vector_db: Vector database type ("FAISS" or "Chroma")
        model_name: Full embedding model name

    Returns:
        Vector store object or None if not found
    """
    store_path = get_vector_store_path(vector_db, model_name)

    if not store_path.exists():
        return None

    # Create embeddings (needed for loading)
    embeddings = create_embeddings(model_name)

    try:
        if vector_db.upper() == "FAISS":
            vectorstore = FAISS.load_local(
                str(store_path),
                embeddings,
                allow_dangerous_deserialization=True
            )
        elif vector_db.upper() == "CHROMA":
            vectorstore = Chroma(
                persist_directory=str(store_path),
                embedding_function=embeddings
            )
        else:
            return None

        return vectorstore
    except Exception as e:
        print(f"Error loading vector store: {str(e)}")
        return None


def get_all_vector_stores() -> List[Dict]:
    """
    Get information about all existing vector stores.

    Returns:
        List of dictionaries containing vector store information
    """
    vector_stores = []

    if not VECTOR_STORE_DIR.exists():
        return vector_stores

    # Iterate through all directories in Vector_Store
    for store_dir in VECTOR_STORE_DIR.iterdir():
        if store_dir.is_dir():
            metadata_path = store_dir / "metadata.json"

            if metadata_path.exists():
                try:
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)

                    # Add directory name
                    metadata['store_name'] = store_dir.name
                    vector_stores.append(metadata)
                except Exception as e:
                    print(f"Error reading metadata for {store_dir.name}: {str(e)}")
                    continue
            else:
                # If no metadata, try to infer from directory name
                parts = store_dir.name.split('_', 1)
                if len(parts) == 2:
                    vector_stores.append({
                        "store_name": store_dir.name,
                        "vector_db": parts[0],
                        "embedding_model": f"sentence-transformers/{parts[1]}",
                        "num_chunks": "Unknown",
                        "created_at": "Unknown"
                    })

    return vector_stores


def get_embedding_dimension(embeddings: HuggingFaceEmbeddings) -> int:
    """
    Get the dimension of embeddings by testing with a sample text.

    Args:
        embeddings: HuggingFace embeddings object

    Returns:
        Dimension of the embedding vector
    """
    try:
        # Embed a test string to get dimension
        test_vector = embeddings.embed_query("test")
        return len(test_vector)
    except Exception:
        return 0
