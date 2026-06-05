import logging
import re
import json
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

ZHIHU_HOT_URL = "https://www.zhihu.com/hot"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


async def fetch_zhihu() -> list[dict]:
    """从知乎热榜获取国内热点"""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                ZHIHU_HOT_URL,
                headers={
                    "User-Agent": UA,
                    "Accept": "text/html,application/xhtml+xml",
                    "Accept-Language": "zh-CN,zh;q=0.9",
                },
                follow_redirects=True,
            )
            resp.raise_for_status()
            html = resp.text

        # 从页面 JS 数据中提取热榜条目
        # 知乎热榜在 initialData 中嵌套 JSON
        items = []
        # 尝试匹配 InitialData 中的热榜数据
        pattern = r'"target":\s*\{[^}]*?"title":\s*"([^"]+)"[^}]*?"excerpt":\s*"([^"]*?)"[^}]*?\}'
        matches = re.findall(pattern, html)

        if not matches:
            # 备用方案：尝试从 <script> 标签中提取 JSON 数据
            script_pattern = r'<script id="js-initialData"[^>]*>(.*?)</script>'
            script_match = re.search(script_pattern, html, re.DOTALL)
            if script_match:
                try:
                    json_str = script_match.group(1)
                    # 找到热榜相关的数据
                    hot_items = re.findall(
                        r'"title":\s*"((?:[^"\\]|\\.)*)"[^}]*?"excerpt":\s*"((?:[^"\\]|\\.)*)"',
                        json_str
                    )
                    matches = hot_items
                except Exception as e:
                    logger.warning(f"解析知乎 JSON 数据失败: {e}")

        for idx, (title, excerpt) in enumerate(matches[:30]):
            title = title.replace("\\", "")
            excerpt = excerpt.replace("\\", "") if excerpt else title
            if not title:
                continue

            heat_score = max(10, 100 - idx * 3)

            items.append({
                "platform": "zhihu",
                "source_url": f"https://www.zhihu.com/search?q={title}",
                "title": title,
                "original_text": excerpt,
                "content_snippet": excerpt,
                "ai_summary_zh": "",
                "ai_summary_en": "",
                "category": "domestic",
                "sentiment": "neutral",
                "heat_score": heat_score,
                "published_at": datetime.now(timezone.utc).isoformat(),
            })

        logger.info(f"知乎热榜获取到 {len(items)} 条")
        return items
    except Exception as e:
        logger.error(f"知乎热榜获取失败: {e}")
        return []
