import re
import io
from PIL import Image

def clean_text(text: str) -> str:
    """
    Cleans and standardizes text input:
    - Converts to lowercase
    - Replaces tabs/newlines with single spaces
    - Strips unwanted non-alphanumeric punctuation while retaining meaningful descriptive terms
    - Collapses consecutive whitespace
    """
    if not text:
        return ""
    text = text.lower()
    # Replace non-standard characters with spaces, keeping standard punctuation and alphanumerics
    text = re.sub(r"[^\w\s\-\.,]", " ", text)
    # Collapse multiple consecutive periods and commas
    text = re.sub(r"\.+", ".", text)
    text = re.sub(r",+", ",", text)
    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def preprocess_image(image_bytes: bytes) -> Image.Image:
    """
    Converts raw image bytes to an RGB PIL Image ready for CLIP preprocessing.
    """
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")
    return image
