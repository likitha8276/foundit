from typing import List, Optional
from pydantic import BaseModel, Field

class TextEmbedRequest(BaseModel):
    text: Optional[str] = Field(None, description="Single text string to encode")
    texts: Optional[List[str]] = Field(None, description="Batch of text strings to encode")

class TextEmbedResponse(BaseModel):
    embedding: Optional[List[float]] = None
    embeddings: Optional[List[List[float]]] = None
    dim: int
    model: str

class ImageEmbedResponse(BaseModel):
    embedding: List[float]
    dim: int
    model: str

class MultimodalEmbedResponse(BaseModel):
    text_embedding: Optional[List[float]] = None
    image_embedding: Optional[List[float]] = None
    text_dim: int
    image_dim: int

class SimilarityRequest(BaseModel):
    vec1: List[float]
    vec2: List[float]

class SimilarityResponse(BaseModel):
    cosine_similarity: float

class HealthResponse(BaseModel):
    status: str
    device: str
    text_model: str
    image_model: str
    memory_mb: float
