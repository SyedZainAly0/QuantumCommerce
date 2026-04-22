from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException, RequestValidationError
from .custom_exceptions import (
    UserAlreadyExistsException,
    InvalidCredentialsException,
    CategoryNotFoundException,
    ProductNotFoundException,
    CartItemNotFoundException,
    InsufficientStockException,
    InvalidQuantityException,
    EmptyCartException,
    ProductNoLongerExistsException,
    OrderNotFoundException
)
import logging

logger = logging.getLogger(__name__)

async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation failed",
            "details": [
                {"field": e["loc"][-1], "issue": e["msg"]}
                for e in exc.errors()
            ]
        }
    )

# --- Auth ---
async def user_already_exists_handler(request: Request, exc: UserAlreadyExistsException):
    return JSONResponse(
        status_code=400,
        content={"error": f"User with email '{exc.email}' already exists."}
    )

async def invalid_credentials_handler(request: Request, exc: InvalidCredentialsException):
    return JSONResponse(
        status_code=403,
        content={"error": "Invalid credentials."}
    )

# --- Product ---
async def category_not_found_handler(request: Request, exc: CategoryNotFoundException):
    return JSONResponse(
        status_code=404,
        content={"error": f"Category with ID {exc.category_id} not found."}
    )

async def product_not_found_handler(request: Request, exc: ProductNotFoundException):
    return JSONResponse(
        status_code=404,
        content={"error": f"Product with ID {exc.product_id} not found."}
    )

# --- Cart ---
async def cart_item_not_found_handler(request: Request, exc: CartItemNotFoundException):
    return JSONResponse(
        status_code=404,
        content={"error": f"Cart item with ID {exc.item_id} not found."}
    )

async def insufficient_stock_handler(request: Request, exc: InsufficientStockException):
    message = (
        f"Not enough stock for '{exc.product_name}'."
        if exc.product_name
        else "Not enough stock."
    )
    return JSONResponse(status_code=400, content={"error": message})

async def invalid_quantity_handler(request: Request, exc: InvalidQuantityException):
    return JSONResponse(
        status_code=400,
        content={"error": "Quantity must be at least 1."}
    )

# --- Order ---
async def empty_cart_handler(request: Request, exc: EmptyCartException):
    return JSONResponse(
        status_code=400,
        content={"error": "Your cart is empty. Add items before checking out."}
    )

async def product_no_longer_exists_handler(request: Request, exc: ProductNoLongerExistsException):
    return JSONResponse(
        status_code=400,
        content={"error": f"Product ID {exc.product_id} no longer exists."}
    )

async def order_not_found_handler(request: Request, exc: OrderNotFoundException):
    return JSONResponse(
        status_code=404,
        content={"error": f"Order with ID {exc.order_id} not found."}
    )

# --- Global Catch-All ---
async def global_exception_handler(request: Request, exc: Exception):
    logger.critical(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error."}
    )

def register_exception_handlers(app: FastAPI):
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(UserAlreadyExistsException, user_already_exists_handler)
    app.add_exception_handler(InvalidCredentialsException, invalid_credentials_handler)
    app.add_exception_handler(CategoryNotFoundException, category_not_found_handler)
    app.add_exception_handler(ProductNotFoundException, product_not_found_handler)
    app.add_exception_handler(CartItemNotFoundException, cart_item_not_found_handler)
    app.add_exception_handler(InsufficientStockException, insufficient_stock_handler)
    app.add_exception_handler(InvalidQuantityException, invalid_quantity_handler)
    app.add_exception_handler(EmptyCartException, empty_cart_handler)
    app.add_exception_handler(ProductNoLongerExistsException, product_no_longer_exists_handler)
    app.add_exception_handler(OrderNotFoundException, order_not_found_handler)
    app.add_exception_handler(Exception, global_exception_handler) 