from dotenv import load_dotenv
import os

# Load variables from the .env file
load_dotenv()

# Read each value from the environment
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)


class Settings:
    DATABASE_URL: str | None = DATABASE_URL
    SECRET_KEY: str = SECRET_KEY or "change-this-secret"
    ALGORITHM: str = ALGORITHM or "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = ACCESS_TOKEN_EXPIRE_MINUTES


settings = Settings()
