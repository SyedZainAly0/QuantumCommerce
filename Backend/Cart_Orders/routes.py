from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from Authenticationapp.database import get_db
from Authenticationapp import models as auth_models
from Authenticationapp.oauth2 import get_current_user
from Cart_Orders import models, schemas
from Products.models import Product
from fastapi import BackgroundTasks
from utils.email_service import send_order_email


router = APIRouter(prefix="/cart", tags=["Cart & Orders"])


@router.get("/", response_model=list[schemas.CartItemOut])
def get_cart(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    return (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )

@router.post("/", response_model=schemas.CartItemOut, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item: schemas.CartItemAdd,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < item.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    existing = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.user_id == current_user.id,
            models.CartItem.product_id == item.product_id
        )
        .first()
    )

    if existing:
        existing.quantity += item.quantity
        db.commit()
        db.refresh(existing)
        return existing

    cart_item = models.CartItem(
        user_id=current_user.id,
        product_id=item.product_id,
        quantity=item.quantity
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.put("/{item_id}", response_model=schemas.CartItemOut)
def update_cart_item(
    item_id: int,
    payload: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    cart_item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.id == item_id,
            models.CartItem.user_id == current_user.id
        )
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if payload.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    cart_item.quantity = payload.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):

    cart_item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.id == item_id,
            models.CartItem.user_id == current_user.id
        )
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(cart_item)
    db.commit()


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id
    ).delete()
    db.commit()


orders_router = APIRouter(prefix="/orders", tags=["Orders"])

@orders_router.post("/checkout", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def checkout(
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    cart_items = (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0.0
    order_items = []

    for ci in cart_items:
        product = db.query(Product).filter(Product.id == ci.product_id).first()
        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Product ID {ci.product_id} no longer exists"
            )
        if product.stock < ci.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for '{product.name}'"
            )

        product.stock -= ci.quantity
        line_total = product.price * ci.quantity
        total += line_total

        order_items.append(
            models.OrderItem(
                product_id=product.id,
                product_name=product.name,
                product_price=product.price,
                quantity=ci.quantity
            )
        )

    order = models.Order(
        user_id=current_user.id,
        total_price=round(total, 2),
        status="confirmed",
        Message="Order confirmation mail, has sent"
    )
    db.add(order)
    db.flush()

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id
    ).delete()

    db.commit()
    db.refresh(order)

    background_tasks.add_task(
        send_order_email,
        current_user.email,
        order.id,
        order.total_price
    )

    return order


@orders_router.get("/", response_model=list[schemas.OrderOut])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    return (
        db.query(models.Order)
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )


@orders_router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == order_id,
            models.Order.user_id == current_user.id
        )
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order