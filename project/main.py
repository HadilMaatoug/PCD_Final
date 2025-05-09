from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from utils import interact_until_fields_complete
from langchain_core.messages import HumanMessage
import jwt
import os
from dotenv import load_dotenv
from typing import Optional

from fastapi.staticfiles import StaticFiles


load_dotenv()

app = FastAPI()

#################33
app.mount("/dataCV", StaticFiles(directory="dataCV"), name="dataCV")
# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Token Verification Dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# Models
class ChatInput(BaseModel):
    message: str

# Routes
@app.post("/chatbot/")
async def chat_route(
    chat_input: ChatInput, 
    request: Request,
    token_payload: dict = Depends(verify_token)
):
    try:
        human_message = HumanMessage(content=chat_input.message)
        response = interact_until_fields_complete(human_message)
        return {
            "status": "success",
            "response": response,
            "user": token_payload
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/verify-token")
async def verify_token_route(token_payload: dict = Depends(verify_token)):
    return {
        "status": "success",
        "user": token_payload
    }

# Health Check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}