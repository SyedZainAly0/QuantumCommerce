from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from .. import crud, models, schemas, utils, oauth2
from ..database import get_db
from exception.custom_exceptions import AppException

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise AppException(
            status_code=400,
            title="User Already Exists",
            detail="A user with this email already exists."
        )
    return crud.create_user(db=db, user=user)


@router.post("/login")
def login(response: Response, user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not utils.verify_password(user_credentials.password, user.password):
        raise AppException(
            status_code=403,
            title="Invalid Credentials",
            detail="Email or password is incorrect."
        )

    access_token = utils.create_access_token(data={"user_id": user.id, "role": user.role})

    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=900,
        samesite="lax",
        secure=False
    )
    return {"role": user.role}


@router.get("/me")
def get_me(current_user: models.User = Depends(oauth2.get_current_user)):
    return {
        "user_id": current_user.id,
        "role": current_user.role,
        "status": "Active",
        "full_name": current_user.full_name
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}