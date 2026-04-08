from pydantic import BaseModel
from typing import Optional


class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category_id: int

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    category: CategoryOut
    class Config:
        from_attributes = True