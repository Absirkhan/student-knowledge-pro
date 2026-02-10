"""
Configuration module for Semantic Search Engine.
Defines paths, supported models, and database options.
"""
from pathlib import Path

# Project root directory
PROJECT_ROOT = Path(__file__).parent.parent

# Directory paths
DATA_DIR = PROJECT_ROOT / "data"
EMBEDDINGS_DIR = PROJECT_ROOT / "embeddings"
VECTOR_STORE_DIR = PROJECT_ROOT / "Vector_Store"

# Create directories if they don't exist
DATA_DIR.mkdir(exist_ok=True)
EMBEDDINGS_DIR.mkdir(exist_ok=True)
VECTOR_STORE_DIR.mkdir(exist_ok=True)

# Supported HuggingFace embedding models
SUPPORTED_EMBEDDING_MODELS = [
    "sentence-transformers/all-MiniLM-L6-v2",
    "sentence-transformers/all-mpnet-base-v2",
    "sentence-transformers/paraphrase-MiniLM-L3-v2",
]

# Default embedding model
DEFAULT_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Supported vector database options
SUPPORTED_VECTOR_DBS = ["FAISS", "Chroma"]

# Default vector database
DEFAULT_VECTOR_DB = "FAISS"
