import re
import unicodedata
from difflib import SequenceMatcher
from .models import NewsItem

def normalize_title(title: str) -> str:
    text = unicodedata.normalize("NFKD", title)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
    return re.sub(r"\s+", " ", text).strip()

def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_title(a), normalize_title(b)).ratio()

def is_duplicate(candidate: NewsItem, existing: list[NewsItem], threshold: float = 0.88) -> bool:
    for item in existing:
        if candidate.article_url and item.article_url:
            if str(candidate.article_url).rstrip("/") == str(item.article_url).rstrip("/"):
                return True
        if candidate.event_id and item.event_id and candidate.event_id == item.event_id:
            return True
        if similarity(candidate.title, item.title) >= threshold:
            return True
    return False
