import os
import torch
import torch.nn.functional as F
from typing import List, Union
from PIL import Image
from transformers import AutoTokenizer, AutoModel, CLIPProcessor, CLIPModel
from app.preprocessor import clean_text

TEXT_MODEL_NAME = os.getenv("TEXT_MODEL_NAME", "sentence-transformers/all-mpnet-base-v2")
IMAGE_MODEL_NAME = os.getenv("IMAGE_MODEL_NAME", "openai/clip-vit-base-patch32")

class ModelManager:
    def __init__(self):
        self.device = torch.device("cpu")
        self.text_model_name = TEXT_MODEL_NAME
        self.image_model_name = IMAGE_MODEL_NAME
        
        self.tokenizer = None
        self.text_model = None
        self.clip_processor = None
        self.clip_model = None
        self.is_loaded = False

    def load_models(self):
        """Loads MPNet and CLIP models onto CPU once at startup."""
        if self.is_loaded:
            return

        print(f"Loading Text Model (MPNet): {self.text_model_name} on {self.device}...")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.text_model_name, local_files_only=True)
            self.text_model = AutoModel.from_pretrained(self.text_model_name, local_files_only=True)
        except Exception:
            self.tokenizer = AutoTokenizer.from_pretrained(self.text_model_name)
            self.text_model = AutoModel.from_pretrained(self.text_model_name)

        self.text_model.to(self.device)
        self.text_model.eval()

        print(f"Loading Vision Model (CLIP): {self.image_model_name} on {self.device}...")
        try:
            self.clip_processor = CLIPProcessor.from_pretrained(self.image_model_name, local_files_only=True)
            self.clip_model = CLIPModel.from_pretrained(self.image_model_name, local_files_only=True)
        except Exception:
            self.clip_processor = CLIPProcessor.from_pretrained(self.image_model_name)
            self.clip_model = CLIPModel.from_pretrained(self.image_model_name)

        self.clip_model.to(self.device)
        self.clip_model.eval()

        self.is_loaded = True
        print("All multimodal models loaded successfully on CPU.")

    def _mean_pooling(self, model_output, attention_mask):
        """Perform mean pooling with attention mask applied."""
        token_embeddings = model_output[0]  # First element of model_output contains all token embeddings
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
        sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
        return sum_embeddings / sum_mask

    def embed_texts(self, texts: Union[str, List[str]]) -> List[List[float]]:
        """
        Generates 768-dim normalized text embeddings using MPNet.
        Mean-pooled and L2 normalized.
        """
        if not self.is_loaded:
            self.load_models()

        if isinstance(texts, str):
            texts = [texts]

        cleaned = [clean_text(t) for t in texts]

        # Tokenize sentences
        encoded_input = self.tokenizer(
            cleaned,
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors="pt"
        ).to(self.device)

        with torch.no_grad():
            model_output = self.text_model(**encoded_input)
            sentence_embeddings = self._mean_pooling(model_output, encoded_input["attention_mask"])
            # Normalize embeddings (L2 normalization)
            normalized_embeddings = F.normalize(sentence_embeddings, p=2, dim=1)

        return normalized_embeddings.cpu().tolist()

    def embed_image(self, image: Image.Image) -> List[float]:
        """
        Generates 512-dim visual embedding using CLIP ViT-B/32.
        L2 normalized.
        """
        if not self.is_loaded:
            self.load_models()

        inputs = self.clip_processor(images=image, return_tensors="pt").to(self.device)

        with torch.no_grad():
            image_features = self.clip_model.get_image_features(**inputs)
            # L2 normalization
            normalized_features = F.normalize(image_features, p=2, dim=-1)

        return normalized_features.cpu().squeeze(0).tolist()

    def embed_clip_text(self, text: str) -> List[float]:
        """
        Generates 512-dim CLIP text projection for cross-modal similarity.
        L2 normalized.
        """
        if not self.is_loaded:
            self.load_models()

        cleaned = clean_text(text)
        inputs = self.clip_processor(text=[cleaned], return_tensors="pt", padding=True).to(self.device)

        with torch.no_grad():
            text_features = self.clip_model.get_text_features(**inputs)
            normalized_features = F.normalize(text_features, p=2, dim=-1)

        return normalized_features.cpu().squeeze(0).tolist()

model_manager = ModelManager()
