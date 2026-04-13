from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from Authenticationapp.database import get_db
from Products import models, schemas
from Authenticationapp import models as auth_models
from Authenticationapp.oauth2 import get_current_user, RoleChecker

router = APIRouter(prefix="/products", tags=["Products"])

allow_admin = RoleChecker(["admin"])

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


@router.get("/public", response_model=list[schemas.ProductOut])
def get_public_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()


@router.get("/admin", response_model=list[schemas.ProductOut])
def get_admin_products(
    db: Session = Depends(get_db),
    current_admin: auth_models.User = Depends(allow_admin)
):
    return db.query(models.Product).filter(models.Product.owner_id == current_admin.id).all()


@router.get("/", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@router.post("/", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_admin: auth_models.User = Depends(allow_admin)
):
    new_product = models.Product(**product.model_dump(), owner_id=current_admin.id)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    print(new_product)
    return new_product

@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_admin: auth_models.User = Depends(allow_admin)
):
    db_product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.owner_id == current_admin.id
    ).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.model_dump().items():
        setattr(db_product, key, value)
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
        raise HTTPException(status_code=404, detail="Product not found")
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
        raise HTTPException(status_code=404, detail="Product not found")

    return product

@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int, 
    db: Session = Depends(get_db), 
    current_admin: auth_models.User = Depends(allow_admin)
):
    category_query = db.query(models.Category).filter(models.Category.id == category_id)
    category = category_query.first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category_query.delete(synchronize_session=False)
    db.commit()

    return {"detail": "Category deleted successfully"}