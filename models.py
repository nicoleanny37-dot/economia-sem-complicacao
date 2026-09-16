from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, HttpUrl

Category = Literal["brasil", "internacional", "mercados", "indicadores"]

class NewsItem(BaseModel):
    title: str
    description: str = ""
    content: str = ""
    source: str
    source_url: HttpUrl
    article_url: Optional[HttpUrl] = None
    published_at: datetime
    updated_at: Optional[datetime] = None
    country: Optional[str] = None
    category: Category
    event_id: Optional[str] = None
