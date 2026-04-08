from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr 
    full_name: str = Field(..., min_length=3, max_length=50)
    role : str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)  


class UserOut(UserBase):
    id: int
    role: str
    created_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    
    class Config:
        from_attributes = True 