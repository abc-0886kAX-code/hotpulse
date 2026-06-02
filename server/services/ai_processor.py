import anthropic

from server.config import settings

client = anthropic.AsyncClient(
    api_key=settings.anthropic_api_key,
    base_url=settings.anthropic_base_url,
)

SYSTEM_PROMPT = """你是一个新闻分析助手。对给定的新闻条目，用JSON格式返回以下字段：
- summary_zh: 中文摘要（不超过100字）
- summary_en: 英文摘要（不超过100字）
- category: 分类（tech/politics/finance/entertainment/sports/science/health/other）
- sentiment: 情感倾向（positive/negative/neutral）

只返回JSON，不要其他内容。"""

MARKET_ANALYSIS_PROMPT = """你是一个专业的金融市场分析师。根据以下全球主要股指的最新数据和历史走势，用中文和英文分别生成一份简洁的市场分析报告。

报告应包含：
1. 各指数当前表现总结
2. 市场整体趋势判断
3. 风险提示
4. 短期展望

用JSON格式返回：
- analysis_zh: 中文分析报告（300-500字）
- analysis_en: 英文分析报告（200-400 words）

只返回JSON，不要其他内容。"""


async def process_trending_item(item: dict) -> dict:
    if not settings.anthropic_api_key:
        return {
            **item,
            "ai_summary_zh": "",
            "ai_summary_en": "",
            "category": "other",
            "sentiment": "neutral",
        }
    try:
        text = f"标题: {item.get('title', '')}\n内容: {item.get('original_text', '')}"
        response = await client.messages.create(
            model=settings.ai_model,
            max_tokens=300,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": text}],
        )
        content = response.content[0].text.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        import json
        result = json.loads(content.strip())
        return {
            **item,
            "ai_summary_zh": result.get("summary_zh", ""),
            "ai_summary_en": result.get("summary_en", ""),
            "category": result.get("category", "other"),
            "sentiment": result.get("sentiment", "neutral"),
        }
    except Exception:
        return {
            **item,
            "ai_summary_zh": "",
            "ai_summary_en": "",
            "category": "other",
            "sentiment": "neutral",
        }


async def generate_market_analysis(indices: list[dict], history: list[dict]) -> dict:
    if not settings.anthropic_api_key or not indices:
        return {}

    try:
        lines = []
        for idx in indices:
            lines.append(
                f"{idx.get('name', '')}: 价格 {idx.get('price', 0)}, "
                f"涨跌幅 {idx.get('change_pct', 0)}%"
            )

        history_summary = []
        for h in history[-20:]:
            history_summary.append(
                f"{h.get('name', '')} {h.get('price', 0)} ({h.get('snapshot_time', '')})"
            )

        text = f"当前指数数据:\n" + "\n".join(lines)
        if history_summary:
            text += f"\n\n近期走势:\n" + "\n".join(history_summary[:10])

        response = await client.messages.create(
            model=settings.ai_model,
            max_tokens=1000,
            system=MARKET_ANALYSIS_PROMPT,
            messages=[{"role": "user", "content": text}],
        )
        content = response.content[0].text.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        import json
        result = json.loads(content.strip())
        return {
            "content_zh": result.get("analysis_zh", ""),
            "content_en": result.get("analysis_en", ""),
        }
    except Exception:
        return {}
