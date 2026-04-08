from sqlalchemy.orm import Session
from . import models, schemas, utils  

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pass = utils.hash_password(user.password)
    
    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_pass, 
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user