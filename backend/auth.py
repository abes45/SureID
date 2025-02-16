import os
from datetime import datetime, timedelta
import jwt
from fastapi import Header, HTTPException, status
from typing import Optional
from pydantic import BaseModel
from passlib.context import CryptContext

# Configuration: Use environment variable for SECRET_KEY in production
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Set up password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic model for the authenticated user context
class User(BaseModel):
    username: str
    role: str  # Expected values: "provider", "security", or "admin"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify that the plain password matches the hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Return the hashed version of the given password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT token with an expiration time."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")) -> User:
    """Dependency to get the current user from the JWT token."""
    if not x_auth_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token."
        )
    try:
        payload = jwt.decode(x_auth_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
        return User(username=username, role=role)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate token.")

# For JWT-based authentication, we generally don't maintain a token store,
# but we define this alias if needed by other parts of the code.
tokens = {}
