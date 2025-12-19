from fastapi import Header, HTTPException
from jose import jwt, JWTError
from .config import Config

async def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Header invalide")
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=[Config.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")