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
        # 去除可能的 markdown 代码块标记
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
