from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
from datetime import datetime, timezone
from uuid import uuid4
from typing import Dict, Any

class AlterationLog(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    log_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    user_name: str
    action: str # endpoint used( add_book, update_book etc)
    details: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    