from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
import uuid
from datetime import datetime, timezone

class Copy(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    copy_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    price: float
    conservation_state: str
    registered_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())