from datetime import date
from pydantic import BaseModel, ConfigDict, field_validator, HttpUrl
from fastapi_users import schemas
import uuid
from typing import Optional, Any
import json
class PostCreate(BaseModel):
    title: str
    content: str

# 1. What the API returns (e.g., when you call GET /users/me)
class UserRead(schemas.BaseUser[uuid.UUID]):
    name: str | None = None
    birthday: date | None = None
    zodiac_sign: str | None = None

# 2. What the user can submit during POST /auth/register
class UserCreate(schemas.BaseUserCreate):
    name: str | None = None
    birthday: date | None = None
    zodiac_sign: str | None = None

# 3. What the user can change during PATCH /users/me
# We use the secure model we discussed earlier to protect the password field
class UserUpdate(schemas.CreateUpdateDictModel):
    name: str | None = None
    birthday: date | None = None
    zodiac_sign: str | None = None
    
    model_config = ConfigDict(extra="ignore")


class CardCSVRow(BaseModel):
    name_and_number: str
    suit: str
    image_url: Optional[str] =None
    metadata: dict[str,Any]

    @field_validator("metadata", mode="before")
    @classmethod
    def parse_json_metadata(cls,v:Any)->Any:
        if isinstance(v,str) and v.strip():
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON format in metadata colum")
        return v or {}
    

class DeckCreate(BaseModel):
    deck_name: str
    deck_type: str
    deck_content: str

class DeckUpdate(BaseModel):
    deck_name: str
    deck_content: str
    
class CardUpdate(BaseModel):
    card_name:str
    card_suit: str
    card_metadata: dict[str,Any]
    image_url: Optional[str] =None
    @field_validator("card_metadata", mode="before")
    @classmethod
    def parse_json_metadata(cls,v:Any)->Any:
        if isinstance(v,str) and v.strip():
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON format in metadata colum")
        return v or {}

class CardImageUpdate(BaseModel):
    image_url: str