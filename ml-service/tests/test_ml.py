import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
import numpy as np
from PIL import Image
from app.models import model_manager
from app.preprocessor import clean_text

@pytest.fixture(scope="module")
def models():
    model_manager.load_models()
    return model_manager

def test_clean_text():
    raw = "  Black LEATHER Wallet!! Found near Library #101... "
    cleaned = clean_text(raw)
    assert cleaned == "black leather wallet found near library 101."

def test_mpnet_embedding_shape_and_norm(models):
    text = "lost black leather wallet with student ID card"
    emb = models.embed_texts(text)[0]
    
    assert len(emb) == 768, f"Expected 768 dimensions for MPNet, got {len(emb)}"
    
    norm = np.linalg.norm(emb)
    assert np.isclose(norm, 1.0, atol=1e-3), f"Expected L2 unit norm, got {norm}"

def test_semantic_sanity_check(models):
    """
    Paper sanity check:
    'red handbag' vs 'red color bag' must score strictly higher than
    'red handbag' vs 'blue water bottle'.
    """
    v_handbag = np.array(models.embed_texts("red handbag")[0])
    v_similar = np.array(models.embed_texts("red color bag")[0])
    v_bottle = np.array(models.embed_texts("blue water bottle")[0])

    sim_similar = float(np.dot(v_handbag, v_similar))
    sim_bottle = float(np.dot(v_handbag, v_bottle))

    assert sim_similar > sim_bottle, (
        f"Semantic mismatch: sim('red handbag', 'red color bag')={sim_similar:.4f} "
        f"should exceed sim('red handbag', 'blue water bottle')={sim_bottle:.4f}"
    )
    assert sim_similar > 0.80, f"Expected high similarity for synonymous bags, got {sim_similar:.4f}"

def test_clip_image_embedding_shape_and_norm(models):
    # Create a synthetic image for test
    img = Image.new("RGB", (224, 224), color=(255, 0, 0))
    emb = models.embed_image(img)

    assert len(emb) == 512, f"Expected 512 dimensions for CLIP ViT-B/32, got {len(emb)}"
    norm = np.linalg.norm(emb)
    assert np.isclose(norm, 1.0, atol=1e-3), f"Expected L2 unit norm for image embedding, got {norm}"

def test_clip_cross_modal_text_projection(models):
    text = "red backpack"
    emb = models.embed_clip_text(text)

    assert len(emb) == 512, f"Expected 512 dimensions for CLIP text projection, got {len(emb)}"
    norm = np.linalg.norm(emb)
    assert np.isclose(norm, 1.0, atol=1e-3), f"Expected L2 unit norm for cross-modal projection, got {norm}"
