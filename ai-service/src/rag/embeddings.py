"""
Embedding module for the RAG system.

Optimized to use lightweight Hugging Face sentence-transformers
embeddings on CPU (no local Ollama server required).
"""

from typing import List, Optional

import numpy as np


class EmbeddingModel:
    """Embedding model wrapper for RAG using sentence-transformers."""

    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2",
        provider: str = "sentence-transformers",
        base_url: Optional[str] = None,
    ):
        """
        Initialize embedding model.

        Args:
            model_name: Hugging Face sentence-transformers model name.
            provider:   Kept for backwards compatibility; ignored and
                        always uses sentence-transformers.
            base_url:   Unused; kept for backwards compatibility.
        """
        self.model_name = model_name or "all-MiniLM-L6-v2"
        self._st_model = None

    def _ensure_sentence_transformers_model(self):
        if self._st_model is None:
            try:
                from sentence_transformers import SentenceTransformer  # type: ignore
            except ImportError as exc:
                raise ImportError(
                    "sentence-transformers is required for embeddings. "
                    "Install with: pip install sentence-transformers"
                ) from exc

            self._st_model = SentenceTransformer(self.model_name)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def embed_text(self, text: str) -> np.ndarray:
        """Generate embedding for a single text."""
        self._ensure_sentence_transformers_model()
        embedding = self._st_model.encode(text, convert_to_numpy=True)
        return embedding

    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a batch of texts."""
        self._ensure_sentence_transformers_model()
        embeddings = self._st_model.encode(
            texts,
            convert_to_numpy=True,
            show_progress_bar=False,
        )
        return embeddings

    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings."""
        dummy_embedding = self.embed_text("dummy")
        return int(dummy_embedding.shape[0])

