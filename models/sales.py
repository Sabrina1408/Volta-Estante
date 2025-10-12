from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from pydantic.alias_generators import to_camel
from uuid import uuid4
from datetime import timezone, datetime

class Sales(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    sale_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    ISBN: str
    book_title: str
    book_category: List[str] = Field(default_factory=list)
    book_rating: Optional[int] = None
    book_price: float
    sale_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())