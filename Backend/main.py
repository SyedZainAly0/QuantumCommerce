from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, crud
from database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",  # Vite ka default port
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # Create-React-App ka port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # In URLs ko ijazat do
    allow_credentials=True,
    allow_methods=["*"],         # GET, POST, sab allow karo
    allow_headers=["*"],         # Tamam headers allow karo
)



# 1. Pehle GET route (Users dekhne ke liye)
@app.get("/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

# 2. Phir POST route (Naya user banane ke liye)
@app.post("/users/", response_model=schemas.User)
def create_new_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)