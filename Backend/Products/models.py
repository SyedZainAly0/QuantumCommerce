from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from Authenticationapp.database import Base

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
   
    # Added passive_deletes=True to help SQLAlchemy handle the relationship
    products = relationship("Product", back_populates="category", passive_deletes=True)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    stock = Column(Integer, default=0)
    
    # ✅ UPDATED: Added ondelete="SET NULL"
    # This ensures that deleting a category doesn't crash the app
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    
    owner_id = Column(Integer, ForeignKey("users.id")) 

    category = relationship("Category", back_populates="products")
    owner = relationship("Authenticationapp.models.User")