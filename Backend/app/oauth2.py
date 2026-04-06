# app/oauth2.py
from fastapi import Request, HTTPException, status
from jose import jwt, JWTError
from . import utils

def get_current_user(request: Request):
 
    token = request.cookies.get("access_token")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated"
        )
    
    try:
        
        token = token.split(" ")[1]
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        return payload 
    except (JWTError, IndexError):
        raise HTTPException(status_code=401, detail="Invalid token")