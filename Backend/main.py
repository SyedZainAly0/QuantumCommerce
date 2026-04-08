from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Authenticationapp.database import engine
from Authenticationapp import models
from Authenticationapp.routes import auth
from Products.routes import router as product_router

app = FastAPI()

origins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      
    allow_credentials=True,
    allow_methods=["*"],       
    allow_headers=["*"],       
)

app.include_router(auth.router)
app.include_router(product_router)


