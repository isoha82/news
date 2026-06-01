import os
import json
import urllib.request
import urllib.error

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

SYSTEM_PROMPT = (
    "You are a concise news summarizer. "
    "Given a news article title and body, return exactly 3 bullet points summarizing the key facts. "
    "Respond with a JSON object: {\"bullet1\": \"...\", \"bullet2\": \"...\", \"bullet3\": \"...\"}"
)


def summarize_article(title: str, body: str) -> dict | None:
    """Call OpenAI gpt-4o-mini and return {bullet1, bullet2, bullet3} or None on failure."""
    if not OPENAI_API_KEY:
        return None

    content = f"Title: {title}\n\n{body[:3000]}"
    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": content},
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"},
    }).encode()

    req = urllib.request.Request(
        OPENAI_API_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            text = data["choices"][0]["message"]["content"]
            parsed = json.loads(text)
            if all(k in parsed for k in ("bullet1", "bullet2", "bullet3")):
                return parsed
            return None
    except (urllib.error.URLError, json.JSONDecodeError, KeyError):
        return None
