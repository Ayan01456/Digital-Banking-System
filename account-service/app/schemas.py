from pydantic import BaseModel
from datetime import datetime

class AccountCreate(BaseModel):
    user_id: int
    initial_deposit: float

class AccountResponse(BaseModel):
    id: int
    user_id: int
    account_number: str
    balance: float
    created_at: datetime

    class Config:
        from_attributes = True

class TransferRequest(BaseModel):
    from_account_id: int
    to_account_id: int
    amount: float