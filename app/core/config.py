from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from .env
    """

    app_name: str = Field(alias="APP_NAME")
    environment: str = Field(alias="ENVIRONMENT")

    database_url: str = Field(alias="DATABASE_URL")

    gemini_api_key: str = Field(alias="GEMINI_API_KEY")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        populate_by_name=True,
    )


settings = Settings()