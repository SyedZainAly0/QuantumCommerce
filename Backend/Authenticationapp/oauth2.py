from fastapi import Request, HTTPException, status, Depends
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from . import utils, database, models 

def get_current_user(request: Request, db: Session = Depends(database.get_db)):
    token_cookie = request.cookies.get("access_token")
    
    if not token_cookie:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated"
        )
    
    try:
        if " " in token_cookie:
            token = token_cookie.split(" ")[1]
        else:
            token = token_cookie

        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token missing user ID"
            )

        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="User no longer exists"
            )
            
        return user 
        
    except (JWTError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Could not validate credentials"
        )
    
class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: models.User = Depends(get_current_user)):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' is not authorized to access this resource"
            )
        return current_user