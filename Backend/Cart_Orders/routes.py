from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
from Authenticationapp.database import get_db
from Authenticationapp import models as auth_models
from Authenticationapp.oauth2 import get_current_user
from Cart_Orders import models, schemas
from Products.models import Product
from utils.email_service import send_order_email
from exception.custom_exceptions import AppException

router = APIRouter(prefix="/cart", tags=["Cart & Orders"])
orders_router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/", response_model=list[schemas.CartItemOut])
def get_cart(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    return db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()


@router.post("/", response_model=schemas.CartItemOut, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item: schemas.CartItemAdd,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise AppException(
            status_code=404,
            title="Product Not Found",
            detail=f"Product with id {item.product_id} does not exist."
        )
    if product.stock < item.quantity:
        raise AppException(
            status_code=400,
            title="Insufficient Stock",
            detail="Product does not have enough stock for the requested quantity."
        )

    existing = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id,
        models.CartItem.product_id == item.product_id
    ).first()

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
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user.id
    ).first()

    if not cart_item:
        raise AppException(
            status_code=404,
            title="Cart Item Not Found",
            detail=f"Cart item with id {item_id} does not exist."
        )
    if payload.quantity <= 0:
        raise AppException(
            status_code=400,
            title="Invalid Quantity",
            detail="Quantity must be greater than 0."
        )

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
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user.id
    ).first()

    if not cart_item:
        raise AppException(
            status_code=404,
            title="Cart Item Not Found",
            detail=f"Cart item with id {item_id} does not exist."
        )
    db.delete(cart_item)
    db.commit()


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).delete()
    db.commit()


@orders_router.post("/checkout", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def checkout(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()

    if not cart_items:
        raise AppException(
            status_code=400,
            title="Empty Cart",
            detail="Your cart is empty. Add items before checking out."
        )

    total = 0.0
    order_items = []

    for ci in cart_items:
        product = db.query(Product).filter(Product.id == ci.product_id).first()
        if not product:
            raise AppException(
                status_code=404,
                title="Product No Longer Exists",
                detail=f"Product with id {ci.product_id} no longer exists."
            )
        if product.stock < ci.quantity:
            raise AppException(
                status_code=400,
                title="Insufficient Stock",
                detail=f"Product '{product.name}' does not have enough stock."
            )

        product.stock -= ci.quantity
        total += product.price * ci.quantity
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

    db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).delete()
    db.commit()
    db.refresh(order)

    background_tasks.add_task(send_order_email, current_user.email, order.id, order.total_price)
    return order


@orders_router.get("/", response_model=list[schemas.OrderOut])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    return db.query(models.Order).filter(
        models.Order.user_id == current_user.id
    ).order_by(models.Order.created_at.desc()).all()


@orders_router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(get_current_user)
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id
    ).first()

    if not order:
        raise AppException(
            status_code=404,
            title="Order Not Found",
            detail=f"Order with id {order_id} does not exist."
        )
    return order