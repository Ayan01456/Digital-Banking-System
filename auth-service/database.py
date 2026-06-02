from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# Create the asynchronous engine (with SQL logging enabled like show-sql=true)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)

# Factory to spin up isolated DB transactions (Spring's EntityManager)
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

# FastAPI dependency injection function to yield database sessions to routers
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()