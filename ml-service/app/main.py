import os
import psutil
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import numpy as np

from app.schemas import (
    TextEmbedRequest,
    TextEmbedResponse,
    ImageEmbedResponse,
    MultimodalEmbedResponse,
    SimilarityRequest,
    SimilarityResponse,
    HealthResponse
)
from app.models import model_manager
from app.preprocessor import preprocess_image

app = FastAPI(
    title="FoundIT ML Service",
    description="Multimodal Embedding Microservice using MPNet and CLIP for Lost & Found Matching",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Preload models into memory on server boot
    try:
        model_manager.load_models()
    except Exception as e:
        print(f"Warning during model load at startup: {e}")

@app.get("/health", response_model=HealthResponse)
def health_check():
    process = psutil.Process(os.getpid())
    mem_mb = process.memory_info().rss / (1024 * 1024)
    return HealthResponse(
        status="healthy" if model_manager.is_loaded else "initializing",
        device=str(model_manager.device),
        text_model=model_manager.text_model_name,
        image_model=model_manager.image_model_name,
        memory_mb=round(mem_mb, 2)
    )

@app.post("/embed/text", response_model=TextEmbedResponse)
def embed_text(payload: TextEmbedRequest):
    if not payload.text and not payload.texts:
        raise HTTPException(status_code=400, detail="Either 'text' or 'texts' must be provided.")

    if payload.text is not None:
        emb = model_manager.embed_texts(payload.text)[0]
        return TextEmbedResponse(
            embedding=emb,
            dim=len(emb),
            model=model_manager.text_model_name
        )
    else:
        embs = model_manager.embed_texts(payload.texts)
        return TextEmbedResponse(
            embeddings=embs,
            dim=len(embs[0]) if embs else 768,
            model=model_manager.text_model_name
        )

@app.post("/embed/image", response_model=ImageEmbedResponse)
async def embed_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image.")

    try:
        content = await file.read()
        pil_img = preprocess_image(content)
        emb = model_manager.embed_image(pil_img)
        return ImageEmbedResponse(
            embedding=emb,
            dim=len(emb),
            model=model_manager.image_model_name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

@app.post("/embed/both", response_model=MultimodalEmbedResponse)
async def embed_both(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    if not text and not file:
        raise HTTPException(status_code=400, detail="Must provide at least text or image.")

    text_emb = None
    image_emb = None

    if text:
        text_emb = model_manager.embed_texts(text)[0]

    if file:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Uploaded file must be a valid image.")
        content = await file.read()
        pil_img = preprocess_image(content)
        image_emb = model_manager.embed_image(pil_img)

    return MultimodalEmbedResponse(
        text_embedding=text_emb,
        image_embedding=image_emb,
        text_dim=len(text_emb) if text_emb else 768,
        image_dim=len(image_emb) if image_emb else 512
    )

@app.post("/embed/cross-modal-text")
def embed_cross_modal_text(payload: TextEmbedRequest):
    """Encodes text using CLIP text transformer into 512-dim visual space."""
    if not payload.text:
        raise HTTPException(status_code=400, detail="'text' must be provided.")
    emb = model_manager.embed_clip_text(payload.text)
    return {
        "embedding": emb,
        "dim": len(emb),
        "model": "clip-text-encoder"
    }

@app.post("/similarity", response_model=SimilarityResponse)
def compute_similarity(payload: SimilarityRequest):
    v1 = np.array(payload.vec1, dtype=np.float32)
    v2 = np.array(payload.vec2, dtype=np.float32)

    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)

    if norm1 == 0 or norm2 == 0:
        return SimilarityResponse(cosine_similarity=0.0)

    sim = float(np.dot(v1, v2) / (norm1 * norm2))
    return SimilarityResponse(cosine_similarity=round(sim, 5))
