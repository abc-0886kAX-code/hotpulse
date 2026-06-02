from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://hotpulse:hotpulse@localhost:5432/hotpulse"
    redis_url: str = "redis://localhost:6379/0"
    anthropic_api_key: str = ""
    youtube_api_key: str = ""
    yahoo_finance_api_url: str = "https://query1.finance.yahoo.com/v8/finance/chart"
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
