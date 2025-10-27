from enum import Enum
from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
from datetime import datetime, timezone

class ConservationState(str, Enum):
    NEW = "Novo"
    GOOD = "Bom"
    FAIR = "Mediano"
    POOR = "Péssimo"

class Copy(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    copy_id: str = Field(default="") 
    price: float
    conservation_state: ConservationState = ConservationState.NEW
    registered_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
