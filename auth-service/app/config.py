from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Points to your dedicated auth-db container
    DATABASE_URL: str = "postgresql+asyncpg://auth_user:auth_password_123@auth-db:5432/auth_db"
    
    # Core security settings (Spring Security configuration equivalents)
    JWT_SECRET_KEY: str = "super_secret_signing_key_keep_it_safe"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()