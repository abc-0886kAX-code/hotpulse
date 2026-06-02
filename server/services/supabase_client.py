import json
from pathlib import Path

from supabase import create_client, Client

from server.config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_anon_key)


def seed_quotes():
    table = supabase.table("quotes")
    result = table.select("id", count="exact").limit(1).execute()
    if result.count > 0:
        return result.count

    seed_path = Path(__file__).parent.parent / "seeds" / "quotes.json"
    if not seed_path.exists():
        return 0

    with open(seed_path, "r", encoding="utf-8") as f:
        quotes = json.load(f)

    rows = []
    for q in quotes:
        rows.append({
            "text_zh": q["text_zh"],
            "text_en": q["text_en"],
            "author": q["author"],
            "category": q.get("category", "motivation"),
            "used_count": 0,
        })

    if rows:
        table.insert(rows).execute()

    return len(rows)
