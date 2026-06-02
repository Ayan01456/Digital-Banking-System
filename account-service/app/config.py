from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://account_user:account_password_123@account-db:5432/account_ledger_db"
    JWT_SECRET_KEY: str = "super_secret_signing_key_keep_it_safe"
    JWT_ALGORITHM: str = "HS256"
    AUTH_SERVICE_URL: str = "http://auth-service:8000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()