from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from pydantic.alias_generators import to_camel
from uuid import uuid4
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "Admin"
    EDITOR = "Editor"
    READER = "Reader"

class User(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    user_id: str
    name: str
    email: str
    name_sebo: str
    sebo_id: str = Field(default_factory=lambda: str(uuid4()))
    user_role: UserRole = UserRole.ADMIN
    registered_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UpdateUser(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    name: Optional[str] = None
    email: Optional[str] = None
    name_sebo: Optional[str] = None
    user_role: Optional[UserRole] = None
    
 