from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from pydantic.alias_generators import to_camel
from uuid import uuid4
from datetime import timezone, datetime
from models.copy import ConservationState

class Sales(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    sale_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    user_name: str
    ISBN: str
    book_title: str
    authors: List[str] = Field(default_factory=list)
    book_category: List[str] = Field(default_factory=list)
    average_rating: Optional[float] = None
    book_price: float
    conservation_state: ConservationState
    sale_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())