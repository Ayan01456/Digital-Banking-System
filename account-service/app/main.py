from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.account_router import router as account_router

app = FastAPI(title="Digital Banking - Account Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(account_router)

@app.get("/health")
async def health():
    return {"status": "UP", "service": "account-service"}