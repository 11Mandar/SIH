"""
LogNexus Processing Pipeline

Responsibilities:
    1. Identify the input format
    2. Select the appropriate parser
    3. Normalize the parsed event
    4. Validate the normalized event
    5. Return a structured processing result

This module deliberately does NOT:
    - receive network traffic
    - create FastAPI routes
    - write directly to PostgreSQL
    - generate dashboard responses

Those responsibilities belong to other layers.
"""

from dataclasses import dataclass, field
from typing import Any

from format_detector import detect_format

from backend.parsers.windows_parser import parse_windows_event
from backend.parsers.syslog_parser import parse_syslog

from backend.normalization.mapper import (
    normalize_windows_event,
    normalize_syslog_event,
)
from backend.validation.models import NormalizedEvent


# ---------------------------------------------------------------------------
# Processing result
# ---------------------------------------------------------------------------

@dataclass
class ProcessingResult:
    """
    Result returned by the LogNexus processing pipeline.

    Keeping this as a single object makes it easier for ingestion layers
    and future queue/worker systems to consume the result consistently.
    """

    success: bool
    detected_format: str
    raw_event: Any

    parsed_event: dict[str, Any] | None = None
    normalized_event: dict[str, Any] | None = None
    validated_event: NormalizedEvent | None = None

    error_stage: str | None = None
    error_type: str | None = None
    error_message: str | None = None

    metadata: dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Parser registry
# ---------------------------------------------------------------------------

PARSERS = {
    "Syslog": parse_syslog,
    "Windows Event": parse_windows_event,
}


# ---------------------------------------------------------------------------
# Normalizer registry
# ---------------------------------------------------------------------------

NORMALIZERS = {
    "Windows Event": normalize_windows_event,
    "Syslog": normalize_syslog_event,
}


# ---------------------------------------------------------------------------
# Format detection
# ---------------------------------------------------------------------------

def detect_event_format(event):
    """
    Detect the format of an incoming event.

    Supports:
    - Windows Event dictionaries
    - Raw Syslog strings
    - API payloads containing a raw_log field
    """

    # Raw log sent directly as a string
    if isinstance(event, str):
        return detect_format(event)

    # Dictionary-based event
    if isinstance(event, dict):

        # Windows Event
        if (
            "event_id" in event
            and (
                "message_data" in event
                or "computer" in event
                or "source" in event
            )
        ):
            return "Windows Event"

        # Raw log wrapped by an API payload
        if "raw_log" in event:
            raw_log = event["raw_log"]

            if isinstance(raw_log, str):
                return detect_format(raw_log)

    return "Unknown"

# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def parse_event(event, detected_format):
    """
    Parse an event according to the detected format.
    """

    parser = PARSERS.get(detected_format)

    if parser is None:
        raise ValueError(
            f"No parser registered for format: {detected_format}"
        )

    # API payload containing raw log
    if isinstance(event, dict) and "raw_log" in event:
        event = event["raw_log"]

    return parser(event)


# ---------------------------------------------------------------------------
# Normalization
# ---------------------------------------------------------------------------

def normalize_event(
    parsed_event: dict[str, Any],
    detected_format: str,
) -> dict[str, Any]:
    """
    Normalize a parsed event into the LogNexus common event structure.

    Format-specific normalizers can be added to NORMALIZERS without changing
    the main processing pipeline.
    """

    normalizer = NORMALIZERS.get(detected_format)

    if normalizer is None:
        raise ValueError(
            f"No normalizer registered for format: {detected_format}"
        )

    normalized_event = normalizer(parsed_event)

    if not isinstance(normalized_event, dict):
        raise TypeError(
            f"Normalizer for {detected_format} must return a dictionary"
        )

    return normalized_event


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def validate_event(normalized_event: dict[str, Any]) -> NormalizedEvent:
    """
    Validate a normalized event using the central Pydantic model.

    Validation is intentionally performed after normalization so that every
    source eventually follows the same validation contract.
    """

    return NormalizedEvent(**normalized_event)


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def process_event(event: Any) -> ProcessingResult:
    """
    Run one event through the complete LogNexus processing pipeline.

    Flow:

        Input
          ↓
        Detection
          ↓
        Parsing
          ↓
        Normalization
          ↓
        Validation
          ↓
        ProcessingResult

    Database persistence is intentionally handled outside this function.
    """

    # ---------------------------------------------------------------
    # 1. Detect format
    # ---------------------------------------------------------------

    detected_format = detect_event_format(event)

    if detected_format == "Unknown":
        return ProcessingResult(
            success=False,
            detected_format="Unknown",
            raw_event=event,
            error_stage="detection",
            error_type="UnsupportedFormat",
            error_message="Unable to identify the event format.",
        )

    # ---------------------------------------------------------------
    # 2. Parse
    # ---------------------------------------------------------------

    try:
        parsed_event = parse_event(
            event,
            detected_format,
        )

    except Exception as exc:
        return ProcessingResult(
            success=False,
            detected_format=detected_format,
            raw_event=event,
            error_stage="parsing",
            error_type=type(exc).__name__,
            error_message=str(exc),
        )

    # ---------------------------------------------------------------
    # 3. Normalize
    # ---------------------------------------------------------------

    try:
        normalized_event = normalize_event(
            parsed_event,
            detected_format,
        )

    except Exception as exc:
        return ProcessingResult(
            success=False,
            detected_format=detected_format,
            raw_event=event,
            parsed_event=parsed_event,
            error_stage="normalization",
            error_type=type(exc).__name__,
            error_message=str(exc),
        )

    # ---------------------------------------------------------------
    # 4. Validate
    # ---------------------------------------------------------------

    try:
        validated_event = validate_event(
            normalized_event
        )

    except Exception as exc:
        return ProcessingResult(
            success=False,
            detected_format=detected_format,
            raw_event=event,
            parsed_event=parsed_event,
            normalized_event=normalized_event,
            error_stage="validation",
            error_type=type(exc).__name__,
            error_message=str(exc),
        )

    # ---------------------------------------------------------------
    # 5. Success
    # ---------------------------------------------------------------

    return ProcessingResult(
        success=True,
        detected_format=detected_format,
        raw_event=event,
        parsed_event=parsed_event,
        normalized_event=normalized_event,
        validated_event=validated_event,
        metadata={
            "pipeline_version": "1.0",
        },
    )


# ---------------------------------------------------------------------------
# Simple local test
# ---------------------------------------------------------------------------

if __name__ == "__main__":

    # ---------------------------------------------------------------
    # Test 1: Windows Event
    # ---------------------------------------------------------------

    windows_event = {
        "event_id": 4624,
        "timestamp": "2026-09-12T12:00:00+05:30",
        "source": "Microsoft-Windows-Security-Auditing",
        "computer": "TEST-PC",
        "message_data": [
            {
                "name": "TargetUserName",
                "value": "admin"
            }
        ],
        "source_ip": "192.168.1.20",
        "source_port": "51520",
        "destination_ip": None,
        "destination_port": None,
    }

    print("=" * 70)
    print("WINDOWS EVENT TEST")
    print("=" * 70)

    result = process_event(windows_event)

    print("Success:", result.success)
    print("Format:", result.detected_format)

    if result.success:
        print("Normalized:")
        print(result.validated_event.model_dump())
    else:
        print("Stage:", result.error_stage)
        print("Error:", result.error_message)


    # ---------------------------------------------------------------
    # Test 2: Syslog
    # ---------------------------------------------------------------

    syslog_event = (
        "<165>1 2026-09-12T12:00:00Z "
        "firewall01 firewall 1234 FW001 "
        '[exampleSDID@32473 eventID="1011"] '
        "Connection blocked src=10.0.0.5 dst=10.0.0.10"
    )

    print()
    print("=" * 70)
    print("SYSLOG EVENT TEST")
    print("=" * 70)

    result = process_event(syslog_event)

    print("Success:", result.success)
    print("Format:", result.detected_format)

    if result.success:
        print("Normalized:")
        print(result.validated_event.model_dump())
    else:
        print("Stage:", result.error_stage)
        print("Error:", result.error_message)