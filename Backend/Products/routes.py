from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Request
from sqlalchemy.orm import Session
from Authenticationapp.database import get_db
from Products import models, schemas
from Authenticationapp import models as auth_models
from Authenticationapp.oauth2 import RoleChecker
import shutil
import os
import uuid
from typing import Optional
from utils.Validations import validate_image
from sqlalchemy.orm import joinedload
from exception.custom_exceptions import ProductNotFoundException,CategoryNotFoundException



router = APIRouter(prefix="/products", tags=["Products"])

allow_admin = RoleChecker(["admin"])

UPLOAD_DIR = "media/products"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/categories", response_model=list[schemas.CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


@router.post("/categories", response_model=schemas.CategoryOut)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    new_category = models.Category(**category.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin: auth_models.User = Depends(allow_admin)
):
    category_query = db.query(models.Category).filter(models.Category.id == category_id)
    category = category_query.first()

    if not category:
        raise CategoryNotFoundException(category_id)

    category_query.delete(synchronize_session=False)
    db.commit()
    return {"detail": "Category deleted successfully"}


@router.get("/public", response_model=list[schemas.ProductOut])
def get_public_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()


@router.get("/admin", response_model=list[schemas.ProductOut])
def get_admin_products(
    db: Session = Depends(get_db),
    current_admin: auth_models.User = Depends(allow_admin)
):
    return db.query(models.Product).filter(
        models.Product.owner_id == current_admin.id
    ).all()


@router.get("/", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
  return db.query(models.Product)\
    .options(joinedload(models.Product.category))\
    .all()

@router.post("/", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    request: Request,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    category_id: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: auth_models.User = Depends(allow_admin)
):
    image_path = None

    if image:
        validate_image(image, request)
        filename = f"{uuid.uuid4()}_{image.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_path = f"/media/products/{filename}"

    new_product = models.Product(
        name=name,
        description=description,
        price=price,
        stock=stock,
        category_id=category_id,
        image=image_path,
        owner_id=current_admin.id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    request: Request,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    category_id: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: auth_models.User = Depends(allow_admin)
):
    db_product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.owner_id == current_admin.id
    ).first()

    if not db_product:
        raise ProductNotFoundException(product_id=product_id)

    db_product.name = name
    db_product.description = description
    db_product.price = price
    db_product.stock = stock
    db_product.category_id = category_id

    if image:
        validate_image(image, request)  # sync call, no await
        if db_product.image:
            old_path = db_product.image.lstrip("/")
            if os.path.exists(old_path):
                os.remove(old_path)

        filename = f"{uuid.uuid4()}_{image.filename}"
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        db_product.image = f"/media/products/{filename}"

    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: auth_models.User = Depends(allow_admin)
):
    db_product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.owner_id == current_admin.id
    ).first()

    if not db_product:
        raise ProductNotFoundException(product_id=product_id)

    if db_product.image:
        old_path = db_product.image.lstrip("/")
        if os.path.exists(old_path):
            os.remove(old_path)

    db.delete(db_product)
    db.commit()
    return {"detail": "Product deleted successfully"}


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_single_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: auth_models.User = Depends(allow_admin)
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.owner_id == current_admin.id
    ).first()

    if not product:
        raise ProductNotFoundException(product_id=product_id)
    
    return product