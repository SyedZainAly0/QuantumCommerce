from sqlalchemy.orm import Session
import models, schemas


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    
    db_user = models.User(
        full_name=user.full_name, 
        email=user.email
    )
    db.add(db_user) 
    db.commit() 
    db.refresh(db_user)
    return db_user


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()