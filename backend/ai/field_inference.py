import json
import os

from dotenv import load_dotenv

load_dotenv()

from google import genai
from pydantic import BaseModel


class FieldMapping(BaseModel):
    source_field: str
    target_field: str
    confidence: float
    reason: str


class MappingSuggestion(BaseModel):
    mappings: list[FieldMapping]


def infer_field_mapping(log_sample: str) -> dict:
    """
    Use Gemini to infer how fields from an unknown log
    map to the LogNexus normalized event schema.
    """

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    client = genai.Client(api_key=api_key)

    target_schema = [
        "event_id",
        "timestamp",
        "source",
        "device",
        "event_type",
        "severity",
        "source_ip",
        "source_port",
        "destination_ip",
        "destination_port",
        "user_id",
        "user_name",
        "action",
        "outcome",
        "message",
        "extra_data",
    ]

    prompt = f"""
You are a log normalization assistant for LogNexus.

Analyze the following unknown log sample.

UNKNOWN LOG:
{log_sample}

Map fields from the unknown log to the most appropriate
LogNexus normalized event field.

AVAILABLE LOGNEXUS FIELDS:
{json.dumps(target_schema, indent=2)}

Rules:
1. Infer meaning from field names and values.
2. Do not invent fields that are not present.
3. Do not guess sensitive values.
4. Use confidence between 0 and 1.
5. Only suggest mappings that are reasonably supported by the sample.
6. Preserve source-specific information through extra_data when appropriate.
7. Return only the structured mapping.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
        },
    )

    result = json.loads(response.text)

    return result

    


if __name__ == "__main__":
    sample_log = """
    2026-09-15T19:45:16Z
    firewall01
    ALLOW
    10.99.160.25
    10.99.160.81
    UDP
    60807
    53
    """

    result = infer_field_mapping(sample_log)

    print(json.dumps(result, indent=2))