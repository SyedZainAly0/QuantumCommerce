from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .database import Base 
 
class User(Base):
    __tablename__ = "users"
 
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String, default="user") 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
 