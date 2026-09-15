import psycopg2
from backend.database.db import DB_CONFIG

schema_sql = """
CREATE TABLE IF NOT EXISTS sources (
    source_id SERIAL PRIMARY KEY,
    source_name VARCHAR(255),
    source_type VARCHAR(255),
    vendor VARCHAR(255),
    hostname VARCHAR(255),
    ip_address VARCHAR(255),
    ingestion_method VARCHAR(255),
    status VARCHAR(50),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_events (
    raw_event_id SERIAL PRIMARY KEY,
    source_id INT REFERENCES sources(source_id),
    trace_id VARCHAR(255),
    detected_format VARCHAR(255),
    raw_event JSONB,
    raw_metadata JSONB,
    processing_status VARCHAR(50),
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS normalized_events (
    normalized_event_id SERIAL PRIMARY KEY,
    raw_event_id INT REFERENCES raw_events(raw_event_id),
    trace_id VARCHAR(255),
    source_id INT REFERENCES sources(source_id),
    event_id VARCHAR(255),
    timestamp TIMESTAMP,
    source_type VARCHAR(255),
    vendor VARCHAR(255),
    system VARCHAR(255),
    device VARCHAR(255),
    event_type VARCHAR(255),
    severity VARCHAR(50),
    source_ip VARCHAR(255),
    source_port INT,
    destination_ip VARCHAR(255),
    destination_port INT,
    user_id VARCHAR(255),
    user_name VARCHAR(255),
    action VARCHAR(255),
    outcome VARCHAR(255),
    message JSONB,
    extra_data JSONB,
    parser_version VARCHAR(50),
    validation_status VARCHAR(50),
    validation_errors JSONB,
    normalized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS processing_errors (
    error_id SERIAL PRIMARY KEY,
    raw_event_id INT REFERENCES raw_events(raw_event_id),
    source_id INT REFERENCES sources(source_id),
    trace_id VARCHAR(255),
    stage VARCHAR(255),
    error_type VARCHAR(255),
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS source_profiles (
    source_profile_id SERIAL PRIMARY KEY,
    profile_name VARCHAR(255),
    source_type VARCHAR(255),
    vendor VARCHAR(255),
    format VARCHAR(255),
    field_mapping JSONB,
    parser_config JSONB,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(user_id),
    action VARCHAR(255),
    resource_type VARCHAR(255),
    status VARCHAR(50)
);

-- Insert dummy data so frontend isn't totally empty
INSERT INTO sources (source_name, source_type, status) VALUES ('Initial Source', 'Syslog', 'Active') ON CONFLICT DO NOTHING;
"""

def setup_db():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute(schema_sql)
    conn.commit()
    cursor.close()
    conn.close()
    print("Schema created successfully!")

if __name__ == "__main__":
    setup_db()
