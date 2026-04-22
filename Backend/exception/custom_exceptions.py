
class UserAlreadyExistsException(Exception):
    def __init__(self, email: str):
        self.email = email

class InvalidCredentialsException(Exception):
    pass


class CategoryNotFoundException(Exception):
    def __init__(self, category_id: int):
        self.category_id = category_id

class ProductNotFoundException(Exception):
    def __init__(self, product_id: int):
        self.product_id = product_id

# --- Cart Exceptions ---
class CartItemNotFoundException(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id

class InsufficientStockException(Exception):
    def __init__(self, product_name: str = None):
        self.product_name = product_name

class InvalidQuantityException(Exception):
    pass

# --- Order Exceptions ---
class EmptyCartException(Exception):
    pass

class ProductNoLongerExistsException(Exception):
    def __init__(self, product_id: int):
        self.product_id = product_id

class OrderNotFoundException(Exception):
    def __init__(self, order_id: int):
        self.order_id = order_id