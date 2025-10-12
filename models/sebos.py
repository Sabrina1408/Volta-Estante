from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from pydantic.alias_generators import to_camel

class Sebo(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    sebo_id: str
    user_id: str
    name_sebo: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())