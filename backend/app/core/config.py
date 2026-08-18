import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tempo - Personalized Cinematic Invitation Videos"
    API_V1_STR: str = "/api"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    if not os.path.exists(os.path.join(BASE_DIR, "assets")):
        BASE_DIR = "/Users/dattakambagi/Desktop/Tempo"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))}/tempo.db")
    
    # Centralized Pricing Config (Defaults to ₹499 INR)
    DEFAULT_PRICE_INR: int = int(os.getenv("DEFAULT_PRICE_INR", "499"))
    DEFAULT_CURRENCY: str = os.getenv("DEFAULT_CURRENCY", "INR")
    
    # Payment Gateway Provider Config (Abstraction Layer)
    PAYMENT_GATEWAY: str = os.getenv("PAYMENT_GATEWAY", "MOCK") # MOCK, RAZORPAY, STRIPE
    PAYMENT_KEY_ID: str = os.getenv("PAYMENT_KEY_ID", "mock_key_id_12345")
    PAYMENT_KEY_SECRET: str = os.getenv("PAYMENT_KEY_SECRET", "mock_key_secret_67890")
    
    # Storage & App Secrets
    STORAGE_DIR: str = os.path.join(BASE_DIR, "storage")
    APP_SECRET_KEY: str = os.getenv("APP_SECRET_KEY", "tempo-secret-key-cinema-2026")
    
    # Allowed CORS Origins
    CORS_ORIGINS: list = ["*"]

    class Config:
        case_sensitive = True

settings = Settings()
