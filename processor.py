from .models import NewsItem

def validate_news(item: NewsItem) -> NewsItem:
    if not item.source.strip():
        raise ValueError("Notícia sem fonte.")
    if not item.source_url:
        raise ValueError("Notícia sem URL da fonte.")
    return item

def build_update_payload(item: NewsItem) -> dict:
    return {
        "title": item.title,
        "description": item.description,
        "content": item.content,
        "source": item.source,
        "sourceUrl": str(item.source_url),
        "articleUrl": str(item.article_url) if item.article_url else None,
        "publishedAt": item.published_at.isoformat(),
        "updatedAt": item.updated_at.isoformat() if item.updated_at else None,
        "country": item.country,
        "category": item.category,
        "eventId": item.event_id,
    }
