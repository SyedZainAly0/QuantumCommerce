from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# Database connection hasil karein
db = SessionLocal()

# Dummy Data ki list
dummy_users = [
    {"full_name": "Ali Ahmed", "email": "ali@example.com"},
    {"full_name": "Sara Khan", "email": "sara@example.com"},
    {"full_name": "Zain Malik", "email": "zain@example.com"},
    {"full_name": "Hamza Dev", "email": "hamza@example.com"},
    {"full_name": "Fatima Noor", "email": "fatima@example.com"}
]

def seed_data():
    print("Seeding database...")
    for user_data in dummy_users:
        exists = db.query(models.User).filter(models.User.email == user_data["email"]).first()
        if not exists:
            new_user = models.User(
                full_name=user_data["full_name"],
                email=user_data["email"]
            )
            db.add(new_user)
    
    db.commit()
    print("Seeding complete! 5 dummy users added.")

if __name__ == "__main__":
    seed_data()