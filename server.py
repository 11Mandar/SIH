from fastapi import FastAPI
from backend.ai.field_inference import infer_field_mapping
from fastapi.middleware.cors import CORSMiddleware
from backend.processing.pipeline import process_event
from backend.processing.persistence import (
    persist_processed_event,
    persist_processing_error,
)
from backend.database.db import init_db, get_db_connection
import uuid
import json
from psycopg2.extras import Json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


@app.post("/api/v1/events")
def receive_event(event: dict):

    # ---------------------------------------------------------------
    # 1. Process event through the common pipeline
    # ---------------------------------------------------------------

    result = process_event(event)

    # ---------------------------------------------------------------
    # 2. Handle processing failure
    # ---------------------------------------------------------------

    if not result.success:

        persistence_result = persist_processing_error(
            event=event,
            processing_result=result,
            source_id=1,
        )

        return {
            "status": "error",
            "trace_id": persistence_result["trace_id"],
            "raw_event_id": persistence_result["raw_event_id"],
            "detected_format": result.detected_format,
            "stage": result.error_stage,
            "error_type": result.error_type,
            "message": result.error_message,
        }

    # ---------------------------------------------------------------
    # 3. Store successful event
    # ---------------------------------------------------------------

    persistence_result = persist_processed_event(
        event=event,
        processing_result=result,
        source_id=1,
    )

    # ---------------------------------------------------------------
    # 4. Return result
    # ---------------------------------------------------------------

    return {
        "status": "success",
        "trace_id": persistence_result["trace_id"],
        "raw_event_id": persistence_result["raw_event_id"],
        "detected_format": result.detected_format,
        "normalized_event": result.validated_event.model_dump(),
    }


@app.get("/api/v1/normalized-events")
def get_normalized_events():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            normalized_event_id,
            raw_event_id,
            trace_id,
            source_id,
            event_id,
            timestamp,
            source_type,
            vendor,
            system,
            device,
            event_type,
            severity,
            source_ip,
            source_port,
            destination_ip,
            destination_port,
            user_id,
            user_name,
            action,
            outcome,
            message,
            extra_data,
            parser_version,
            validation_status,
            validation_errors,
            normalized_at
        FROM normalized_events
        ORDER BY normalized_event_id DESC
        LIMIT 100
    """)

    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [dict(zip(columns, row)) for row in rows]


@app.get("/api/v1/raw-events")
def get_raw_events():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            r.raw_event_id,
            r.trace_id,
            r.received_at,
            r.detected_format,
            r.raw_event,
            r.raw_metadata,
            r.processing_status,
            s.source_name
        FROM raw_events r
        LEFT JOIN sources s
            ON r.source_id = s.source_id
        ORDER BY r.raw_event_id DESC
        LIMIT 100
    """)

    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [dict(zip(columns, row)) for row in rows]


@app.get("/api/v1/sources")
def get_sources():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s.source_id,
            s.source_name,
            s.source_type,
            s.vendor,
            s.hostname,
            s.ip_address,
            s.ingestion_method,
            s.status,
            s.registered_at,
            s.last_seen_at,
            COUNT(r.raw_event_id) AS events
        FROM sources s
        LEFT JOIN raw_events r
            ON s.source_id = r.source_id
        GROUP BY
            s.source_id,
            s.source_name,
            s.source_type,
            s.vendor,
            s.hostname,
            s.ip_address,
            s.ingestion_method,
            s.status,
            s.registered_at,
            s.last_seen_at
        ORDER BY s.source_id
    """)

    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [dict(zip(columns, row)) for row in rows]



@app.get("/api/v1/dashboard/stats")
def get_dashboard_stats():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM sources")
    total_sources = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM raw_events")
    total_events = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM normalized_events
        WHERE validation_status = 'valid'
    """)
    normalized_events = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM processing_errors")
    processing_errors = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    return {
        "totalSources": total_sources,
        "totalEvents": total_events,
        "normalizedEvents": normalized_events,
        "processingErrors": processing_errors
    }


@app.get("/api/v1/dashboard/activity")
def get_event_activity():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            TO_CHAR(hour, 'HH24:MI') AS time,
            COUNT(n.normalized_event_id) AS events
        FROM generate_series(
            date_trunc('hour', NOW()) - INTERVAL '23 hours',
            date_trunc('hour', NOW()),
            INTERVAL '1 hour'
        ) AS hour
        LEFT JOIN normalized_events n
            ON n.normalized_at >= hour
            AND n.normalized_at < hour + INTERVAL '1 hour'
        GROUP BY hour
        ORDER BY hour
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "time": row[0],
            "events": row[1]
        }
        for row in rows
    ]


@app.get("/api/v1/dashboard/source-distribution")
def get_source_distribution():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            source_type,
            COUNT(*) AS events
        FROM normalized_events
        GROUP BY source_type
        ORDER BY events DESC
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "sourceType": row[0],
            "events": row[1]
        }
        for row in rows
    ]


@app.get("/api/v1/dashboard/recent-events")
def get_recent_events():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            n.normalized_event_id,
            n.timestamp,
            COALESCE(s.source_name, 'Unknown') AS source,
            n.event_type,
            r.detected_format,
            n.validation_status,
            n.trace_id
        FROM normalized_events n
        LEFT JOIN raw_events r
            ON n.raw_event_id = r.raw_event_id
        LEFT JOIN sources s
            ON n.source_id = s.source_id
        ORDER BY n.normalized_event_id DESC
        LIMIT 6
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    events = []

    for row in rows:

        validation = row[5]

        if validation == "valid":
            status = "Normalized"
        elif validation == "invalid":
            status = "Validation Failed"
        else:
            status = "Processing"

        events.append({
            "id": str(row[0]),
            "timestamp": str(row[1]),
            "source": row[2],
            "eventType": row[3] or "Unknown",
            "format": row[4] or "Unknown",
            "status": status,
            "provenanceId": row[6]
        })

    return events


@app.post("/api/v1/ai/infer-mapping")
def infer_mapping(payload: dict):
    log_sample = payload.get("log_sample")

    if not log_sample or not isinstance(log_sample, str):
        raise HTTPException(
            status_code=400,
            detail="log_sample is required."
        )

    try:
        mapping = infer_field_mapping(log_sample)

        return {
            "status": "success",
            "mapping": mapping
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/v1/source-profiles")
def get_source_profiles():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            source_profile_id,
            profile_name,
            source_type,
            vendor,
            format,
            field_mapping,
            parser_config,
            status,
            created_at,
            approved_at
        FROM source_profiles
        ORDER BY source_profile_id
    """)

    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        dict(zip(columns, row))
        for row in rows
    ]



@app.patch("/api/v1/source-profiles/{profile_id}/review")
def review_source_profile(profile_id: int, decision: str):

    if decision not in ["Approved", "Rejected"]:
        return {
            "status": "error",
            "message": "Decision must be Approved or Rejected"
        }

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE source_profiles
        SET status = %s,
            approved_at = CASE
                WHEN %s = 'Approved' THEN NOW()
                ELSE NULL
            END
        WHERE source_profile_id = %s
        RETURNING source_profile_id, status
    """, (decision, decision, profile_id))

    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()

        return {
            "status": "error",
            "message": "Source profile not found"
        }

    conn.commit()

    cursor.close()
    conn.close()

    return {
        "status": "success",
        "source_profile_id": result[0],
        "status_value": result[1]
    }


@app.get("/api/v1/audit-logs")
def get_audit_logs():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            a.audit_id,
            a.timestamp,
            COALESCE(u.username, 'System') AS user,
            a.action,
            a.resource_type,
            a.status
        FROM audit_logs a
        LEFT JOIN users u
            ON a.user_id = u.user_id
        ORDER BY a.audit_id DESC
        LIMIT 100
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "audit_id": row[0],
            "timestamp": row[1],
            "user": row[2],
            "action": row[3],
            "resource_type": row[4],
            "status": row[5]
        }
        for row in rows
    ]