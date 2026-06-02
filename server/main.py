import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.database import init_db
from server.routers.trending import router as trending_router
from server.routers.quotes import router as quotes_router
from server.routers.stocks import router as stocks_router
from server.services.quote_service import seed_quotes
from server.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("初始化数据库...")
    await init_db()

    from server.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        count = await seed_quotes(db)
        logger.info(f"名言种子数据: {count} 条")

    yield

    logger.info("应用关闭")


app = FastAPI(
    title="HotPulse API",
    description="AI驱动的全球热门新闻聚合平台",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trending_router)
app.include_router(quotes_router)
app.include_router(stocks_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
