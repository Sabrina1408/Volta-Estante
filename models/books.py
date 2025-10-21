from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from pydantic.alias_generators import to_camel

class Book(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    ISBN: str
    title: str
    authors: List[str] = Field(default_factory=list)
    publisher: Optional[str] = None
    categories: List[str] = Field(default_factory=list)
    published_date: Optional[str] = None
    description: Optional[str] = None
    page_count: Optional[int] = None
    ratings_count: Optional[int] = None
    average_rating: Optional[float] = None
    language: str
    maturity_rating: Optional[str] = None
    thumbnail: Optional[str] = None
    small_thumbnail: Optional[str] = None
    text_snippet: Optional[str] = None
    total_quantity: int
    