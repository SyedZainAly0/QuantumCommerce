from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from Authenticationapp.database import engine
from Authenticationapp import models
from Authenticationapp.routes import auth
from Products.routes import router as product_router
from Cart_Orders.routes import router as cart_router, orders_router

app = FastAPI()

# ── CORS must be registered before any mounts or routers ──────────────────────
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files & routers ────────────────────────────────────────────────────
app.mount("/media", StaticFiles(directory="media"), name="media")

app.include_router(auth.router)
app.include_router(product_router)
app.include_router(cart_router)
app.include_router(orders_router)