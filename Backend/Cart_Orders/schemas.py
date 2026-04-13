from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from Products.schemas import ProductOut


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True


class OrderItemOut(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: str
    product_price: float
    quantity: int

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    total_price: float
    status: str
    created_at: datetime
    items: list[OrderItemOut] = []

    class Config:
        from_attributes = True