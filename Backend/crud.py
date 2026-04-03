from sqlalchemy.orm import Session
import models, schemas

# 1. User ko email se dhoondne ka function
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# 2. Naya User banane ka function
def create_user(db: Session, user: schemas.UserCreate):
    # Password abhi hum plain text rakh rahe hain (baad mein hash karenge)
    db_user = models.User(
        full_name=user.full_name, 
        email=user.email
    )
    db.add(db_user) # Database mein add karo
    db.commit() # Save karo
    db.refresh(db_user) # Nayi ID ke sath user ko wapas lao
    return db_user

# Database se saare users uthane ka logic
def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()