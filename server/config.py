from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_anon_key: str = ""
    anthropic_api_key: str = ""
    anthropic_base_url: str = "https://open.bigmodel.cn/api/anthropic"
    ai_model: str = "glm-4-flash"
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
