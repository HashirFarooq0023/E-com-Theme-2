import uvicorn
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
from fastapi import Security, status
from fastapi.security import APIKeyHeader

# Import your modules
from src.assistant.store_assistant import StoreAssistant
from dotenv import load_dotenv

# Load Environment Variables (API Keys)
load_dotenv()

# --- Configuration ---
app = FastAPI(title="Trends Store AI API")

# Allow the Next.js frontend (localhost:3000) to talk to this Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Assistant (The Brain)
# We don't need to pass config anymore; it uses defaults + .env
try:
    assistant = StoreAssistant(store_name="Trends Store")
    print(" Store Assistant Initialized Successfully!")
except Exception as e:
    print(f" Error Initializing Assistant: {str(e)}")
    assistant = None

# --- Data Models (Validation) ---
class ChatRequest(BaseModel):
    message: str
    session_id: str = "guest_session"

class SyncRequest(BaseModel):
    admin_key: Optional[str] = None

# --- Security ---
api_key_header = APIKeyHeader(name="X-API-KEY", auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    expected_key = os.getenv("API_KEY")
    if not expected_key:
        # If no key set in env, warn but allow (or fail secure - let's fail secure)
        print("WARNING: API_KEY not set in .env! rejecting requests.")
        raise HTTPException(status_code=500, detail="Server misconfiguration")
        
    if api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key"
        )
    return api_key

# --- API Endpoints ---

@app.get("/")
def health_check():
    """Simple check to see if the server is running."""
    return {
        "status": "online",
        "system": "Trends Store AI",
        "model": "Groq Llama 3.3 70B",
        "database": "ChromaDB + HuggingFace"
    }

@app.post("/chat")
async def chat_endpoint(request: ChatRequest, api_key: str = Security(verify_api_key)):
    """
    The main endpoint. Next.js sends text here, we return the AI response.
    """
    if not assistant:
        raise HTTPException(status_code=500, detail="AI Assistant is not initialized.")
    
    try:
        response = assistant.process_user_message(
            user_message=request.message,
            session_id=request.session_id
        )
        return response
    except Exception as e:
        print(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sync-products")
async def sync_products(request: SyncRequest, api_key: str = Security(verify_api_key)):
    """
    (Optional) Call this to re-run the ingestion script 
    if you add new products to MySQL.
    """
    try:
        # Run the ingestion script programmatically
        os.system("python scripts/ingest_products.py")
        return {"status": "success", "message": "Product database updated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Entry Point ---
if __name__ == "__main__":
    # This runs when you type 'python ai-service/main.py'
    print(" Starting  AI Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)