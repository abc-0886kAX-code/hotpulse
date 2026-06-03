import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.routers.trending import router as trending_router
from server.routers.quotes import router as quotes_router
from server.routers.stocks import router as stocks_router
from server.services.supabase_client import supabase, seed_quotes
from server.services.seed_data import seed_initial_data
from server.services.scrapers import fetch_all_trending
from server.services.ai_processor import process_trending_item, generate_market_analysis
from server.services.stock_fetcher import fetch_stock_indices
from server.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("初始化 Supabase...")
    count = seed_quotes()
    logger.info(f"名言种子数据: {count} 条")
    await seed_initial_data()
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


@app.get("/api/diag")
async def diagnose():
    """诊断端点：测试各数据源连通性"""
    import httpx
    results = {}

    sources = [
        ("60s", "https://60s.viki.moe/v2/60s"),
        ("baidu", "https://top.baidu.com/board?tab=realtime"),
        ("hackernews", "https://hacker-news.firebaseio.com/v0/topstories.json"),
        ("yahoo_sh", f"{settings.yahoo_finance_api_url}/000001.SS"),
    ]

    async with httpx.AsyncClient(timeout=10) as client:
        for name, url in sources:
            try:
                ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" if name == "baidu" else "HotPulse/1.0"
                resp = await client.get(url, headers={"User-Agent": ua})
                results[name] = {"status": resp.status_code, "body_len": len(resp.text)}
            except Exception as e:
                results[name] = {"status": "error", "error": str(e)[:100]}

    has_key = bool(settings.anthropic_api_key)
    results["ai_configured"] = has_key
    results["supabase_url"] = settings.supabase_url[:30] + "..."

    return results


async def _do_fetch_trending():
    items = await fetch_all_trending()
    logger.info(f"爬虫获取到 {len(items)} 条原始话题")

    if not items:
        logger.warning("所有爬虫返回空结果，跳过保存以保护现有数据")
        return len(items)

    now = datetime.now(timezone.utc).isoformat()

    def _save():
        rows = [{
            "platform": item.get("platform", ""),
            "source_url": item.get("source_url", ""),
            "title": item.get("title", ""),
            "original_text": item.get("original_text", ""),
            "content_snippet": item.get("content_snippet", item.get("original_text", "")),
            "ai_summary_zh": "",
            "ai_summary_en": "",
            "category": item.get("category", "other"),
            "sentiment": "neutral",
            "heat_score": item.get("heat_score", 0),
            "published_at": item.get("published_at", now),
            "fetched_at": now,
        } for item in items]

        if not rows:
            return

        supabase.table("trending_items").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        try:
            supabase.table("trending_items").insert(rows).execute()
        except Exception as e:
            logger.error(f"保存失败: {e}")
            # 尝试逐条保存
            for row in rows:
                try:
                    supabase.table("trending_items").insert(row).execute()
                except Exception as e2:
                    logger.error(f"逐条保存失败: {e2}")
        logger.info(f"保存 {len(rows)} 条热门话题到数据库")

    await asyncio.to_thread(_save)
    logger.info(f"热点抓取完成: {len(items)} 条")
    return len(items)


async def _do_ai_enrich():
    """后台异步：对未处理的话题进行 AI 分析"""
    def _fetch_unprocessed():
        resp = supabase.table("trending_items").select("id").eq("ai_summary_zh", "").execute()
        return resp.data

    rows = await asyncio.to_thread(_fetch_unprocessed)
    if not rows:
        return

    logger.info(f"AI 补充处理: {len(rows)} 条未处理话题")
    sem = asyncio.Semaphore(5)

    async def _process_one(row_id: str):
        async with sem:
            try:
                def _get():
                    return supabase.table("trending_items").select("*").eq("id", row_id).execute().data
                items = await asyncio.to_thread(_get)
                if not items:
                    return
                item = items[0]
                if item.get("ai_summary_zh"):
                    return

                result = await process_trending_item(item)

                def _update():
                    supabase.table("trending_items").update({
                        "ai_summary_zh": result.get("ai_summary_zh", ""),
                        "ai_summary_en": result.get("ai_summary_en", ""),
                        "category": result.get("category", "other"),
                        "sentiment": result.get("sentiment", "neutral"),
                    }).eq("id", row_id).execute()
                await asyncio.to_thread(_update)
            except Exception as e:
                logger.error(f"AI 处理失败 [{row_id}]: {e}")

    await asyncio.gather(*[_process_one(r["id"]) for r in rows])
    logger.info("AI 补充处理完成")


@app.post("/api/cron/fetch-trending")
async def cron_fetch_trending():
    try:
        count = await _do_fetch_trending()
        if count and count > 0:
            asyncio.create_task(_do_ai_enrich())
        return {"status": "completed", "count": count}
    except Exception as e:
        logger.error(f"热点抓取异常: {e}", exc_info=True)
        return {"status": "error", "message": str(e)[:500]}


async def _do_fetch_stocks():
    from server.services.stock_fetcher import fetch_stock_history
    indices = await fetch_stock_indices()
    logger.info(f"获取到 {len(indices)} 个股票指数最新快照")

    if not indices:
        logger.warning("未获取到任何股票指数数据，跳过保存")
        return 0

    history_tasks = []
    for item in indices:
        sym = item.get("symbol", "")
        history_tasks.append(fetch_stock_history(sym, 30))
    history_results = await asyncio.gather(*history_tasks)
    history_all = []
    for h in history_results:
        history_all.extend(h)
    logger.info(f"获取到 {len(history_all)} 条历史数据")

    def _save():
        supabase.table("stock_indices").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        snapshot_rows = [{
            "symbol": item.get("symbol", ""),
            "name": item.get("name", ""),
            "price": item.get("price", 0.0),
            "change_pct": item.get("change_pct", 0.0),
            "snapshot_time": item.get("snapshot_time", datetime.now(timezone.utc).isoformat()),
        } for item in indices]
        if snapshot_rows:
            supabase.table("stock_indices").insert(snapshot_rows).execute()
            logger.info(f"保存 {len(snapshot_rows)} 个股票快照")

        if history_all:
            for h in history_all:
                supabase.table("stock_history").upsert(
                    h,
                    on_conflict="symbol,snapshot_time",
                ).execute()
            logger.info(f"保存 {len(history_all)} 条历史数据")

    await asyncio.to_thread(_save)
    logger.info(f"股市数据抓取完成: {len(indices)} 快照 + {len(history_all)} 历史")

    return indices, history_all


async def _do_stock_ai_analysis(indices: list[dict], history: list[dict]):
    try:
        analysis = await generate_market_analysis(indices, history) or {}
        if analysis and analysis.get("content_zh"):
            def _save():
                supabase.table("market_analysis").insert({
                    "content_zh": analysis["content_zh"],
                    "content_en": analysis.get("content_en", ""),
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                }).execute()
            await asyncio.to_thread(_save)
            logger.info("保存市场分析报告")
    except Exception as e:
        logger.error(f"AI 市场分析生成失败: {e}")


@app.post("/api/cron/fetch-stocks")
async def cron_fetch_stocks():
    try:
        result = await _do_fetch_stocks()
        if result and not isinstance(result, int) and result[0]:
            indices, history = result
            asyncio.create_task(_do_stock_ai_analysis(indices, history))
        return {"status": "completed"}
    except Exception as e:
        logger.error(f"股市抓取异常: {e}", exc_info=True)
        return {"status": "error", "message": str(e)[:500]}
