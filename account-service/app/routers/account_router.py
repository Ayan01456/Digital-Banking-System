from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import random
from app.database import get_db
from app.models import Account, TransactionLedger
from app.schemas import AccountCreate, AccountResponse, TransferRequest

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])

@router.post("/create", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(account_data: AccountCreate, db: AsyncSession = Depends(get_db)):
    acct_num = "".join([str(random.randint(0, 9)) for _ in range(10)])
    
    new_account = Account(
        user_id=account_data.user_id,
        account_number=acct_num,
        balance=account_data.initial_deposit
    )
    db.add(new_account)
    await db.commit()
    await db.refresh(new_account)
    return new_account

@router.post("/transfer")
async def transfer_funds(payload: TransferRequest, db: AsyncSession = Depends(get_db)):
    async with db.begin():
        sender_res = await db.execute(select(Account).where(Account.id == payload.from_account_id))
        sender = sender_res.scalar_one_or_none()
        
        receiver_res = await db.execute(select(Account).where(Account.id == payload.to_account_id))
        receiver = receiver_res.scalar_one_or_none()
        
        if not sender or not receiver:
            raise HTTPException(status_code=404, detail="Account profile not found")
        if sender.balance < payload.amount:
            raise HTTPException(status_code=400, detail="Insufficient balances")
            
        sender.balance -= payload.amount
        receiver.balance += payload.amount
        
        ledger_entry = TransactionLedger(
            source_account_id=sender.id,
            destination_account_id=receiver.id,
            amount=payload.amount,
            transaction_type="TRANSFER"
        )
        db.add(ledger_entry)
        
    return {"status": "success", "message": "Transaction verified and executed"}