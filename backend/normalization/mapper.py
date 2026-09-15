import re


# ---------------------------------------------------------------------------
# Windows Event Normalization
# ---------------------------------------------------------------------------

def normalize_windows_event(event):

    event_id = event.get("event_id")
    message_data = event.get("message_data", {})

    if isinstance(message_data, dict):
        message = [message_data]
    else:
        message = message_data

    event_type = "Windows Event"
    action = "Event Recorded"
    outcome = "Unknown"

    # Windows logon
    if event_id == 4624:
        event_type = "Logon"
        action = "Login"
        outcome = "Success"

    # Failed logon
    elif event_id == 4625:
        event_type = "Failed Logon"
        action = "Login"
        outcome = "Failure"

    # Special privileges assigned
    elif event_id == 4672:
        event_type = "Privilege Assignment"
        action = "Special Privilege Assigned"

    # User/group membership queried
    elif event_id == 4798:
        event_type = "User Group Query"
        action = "Group Membership Queried"

    # Credential Manager credentials read
    elif event_id == 5379:
        event_type = "Credential Access"
        action = "Credential Manager Access"

    # Windows Filtering Platform connection
    elif event_id == 5156:
        event_type = "Network Connection"
        action = "Connection Allowed"

    return {
        "event_id": str(event_id) if event_id is not None else None,
        "timestamp": event.get("timestamp"),
        "source": event.get("source"),
        "device": event.get("computer"),
        "event_type": event_type,
        "severity": None,

        "message": message,

        "source_ip": event.get("source_ip"),
        "source_port": event.get("source_port"),
        "destination_ip": event.get("destination_ip"),
        "destination_port": event.get("destination_port"),

        "user_id": None,
        "user_name": None,

        "action": action,
        "outcome": outcome,

        "extra_data": {}
    }


# ---------------------------------------------------------------------------
# Helper functions for Syslog normalization
# ---------------------------------------------------------------------------

IP_PATTERN = re.compile(
    r"\b(?:"
    r"(?:25[0-5]|2[0-4]\d|1?\d?\d)"
    r"\.){3}"
    r"(?:25[0-5]|2[0-4]\d|1?\d?\d)"
    r"\b"
)


def extract_first_ip(message):
    """
    Extract the first IPv4 address from a message.

    This is deliberately conservative. We do not assume that every IP
    appearing in a Syslog message is a source IP.
    """

    if not isinstance(message, str):
        return None

    match = IP_PATTERN.search(message)

    return match.group(0) if match else None


def extract_named_ip(message, names):
    """
    Extract an IPv4 address following an explicit field name.

    Examples:

        src=10.0.0.5
        source=10.0.0.5
        dst=192.168.1.10
        destination=192.168.1.10
    """

    if not isinstance(message, str):
        return None

    for name in names:

        pattern = rf"\b{name}\s*=\s*({IP_PATTERN.pattern})"

        match = re.search(
            pattern,
            message,
            re.IGNORECASE,
        )

        if match:
            return match.group(1)

    return None


def extract_user(message):
    """
    Extract a username only when the message uses an obvious
    username/account field.
    """

    if not isinstance(message, str):
        return None

    patterns = [
        r"\buser(?:name)?\s*=\s*([A-Za-z0-9_.@\\-]+)",
        r"\baccount\s*=\s*([A-Za-z0-9_.@\\-]+)",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            message,
            re.IGNORECASE,
        )

        if match:
            return match.group(1)

    return None


def classify_syslog_event(message):
    """
    Perform conservative classification of common security activity.

    This is not intended to replace vendor-specific source profiles.
    """

    if not isinstance(message, str):
        return (
            "Syslog Event",
            "Event Recorded",
            "Unknown",
        )

    text = message.lower()

    # Authentication
    if (
        "failed login" in text
        or "login failed" in text
        or "authentication failure" in text
        or "authentication failed" in text
        or "invalid password" in text
    ):
        return (
            "Authentication",
            "Login",
            "Failure",
        )

    if (
        "successful login" in text
        or "login succeeded" in text
        or "authentication successful" in text
        or "accepted password" in text
    ):
        return (
            "Authentication",
            "Login",
            "Success",
        )

    # Firewall/network actions
    if re.search(r"\bdeny\b|\bdenied\b|\bblocked\b|\bdropped\b", text):
        return (
            "Network Connection",
            "Connection Blocked",
            "Failure",
        )

    if re.search(r"\ballow\b|\ballowed\b|\baccepted\b", text):
        return (
            "Network Connection",
            "Connection Allowed",
            "Success",
        )

    return (
        "Syslog Event",
        "Event Recorded",
        "Unknown",
    )


# ---------------------------------------------------------------------------
# Syslog Normalization
# ---------------------------------------------------------------------------

def normalize_syslog_event(event):
    """
    Convert a parsed Syslog event into the common LogNexus schema.

    The parser is responsible for understanding Syslog syntax.

    This function is responsible for mapping the parsed information into
    common security fields while preserving source-specific information
    inside extra_data.
    """

    raw_message = event.get("message") or ""

    # ---------------------------------------------------------------
    # Basic Syslog fields
    # ---------------------------------------------------------------

    timestamp = event.get("timestamp")

    hostname = event.get("hostname")

    app_name = event.get("app_name")

    procid = event.get("procid")

    msgid = event.get("msgid")

    severity_name = event.get("severity_name")

    facility = event.get("facility")

    facility_name = event.get("facility_name")

    structured_data = event.get("structured_data", [])

    # ---------------------------------------------------------------
    # Event classification
    # ---------------------------------------------------------------

    event_type, action, outcome = classify_syslog_event(
        raw_message
    )

    # ---------------------------------------------------------------
    # Network information
    # ---------------------------------------------------------------

    source_ip = extract_named_ip(
        raw_message,
        [
            "src",
            "src_ip",
            "source",
            "source_ip",
            "sourceAddress",
        ],
    )

    destination_ip = extract_named_ip(
        raw_message,
        [
            "dst",
            "dst_ip",
            "destination",
            "destination_ip",
            "destinationAddress",
        ],
    )

    # Only use an unlabelled IP when we have not already found
    # an explicitly named source IP.
    if source_ip is None and destination_ip is None:

        possible_ip = extract_first_ip(raw_message)

        if possible_ip is not None:

            # We deliberately do not automatically call this
            # source_ip. Preserve it in extra_data instead.

            pass

    # ---------------------------------------------------------------
    # User information
    # ---------------------------------------------------------------

    user_name = extract_user(raw_message)

    # ---------------------------------------------------------------
    # Preserve protocol/source-specific information
    # ---------------------------------------------------------------

    extra_data = {
        "protocol": event.get("protocol"),
        "syslog_version": event.get("version"),
        "pri": event.get("pri"),
        "facility": facility,
        "facility_name": facility_name,
        "app_name": app_name,
        "procid": procid,
        "msgid": msgid,
        "structured_data": structured_data,
    }

    # Preserve an unlabelled IP rather than incorrectly assigning
    # it to source_ip.
    if source_ip is None and destination_ip is None:

        possible_ip = extract_first_ip(raw_message)

        if possible_ip is not None:
            extra_data["unclassified_ip"] = possible_ip

    # ---------------------------------------------------------------
    # Return common normalized schema
    # ---------------------------------------------------------------

    return {
        "event_id": str(msgid) if msgid is not None else None,

        "timestamp": timestamp,

        "source": "Syslog",

        "device": hostname,

        "event_type": event_type,

        "severity": severity_name,

        "message": [
            {
                "name": "message",
                "value": raw_message,
            }
        ],

        "source_ip": source_ip,
        "source_port": None,

        "destination_ip": destination_ip,
        "destination_port": None,

        "user_id": None,
        "user_name": user_name,

        "action": action,
        "outcome": outcome,

        "extra_data": extra_data,
    }


# ---------------------------------------------------------------------------
# Local test
# ---------------------------------------------------------------------------

if __name__ == "__main__":

    test_event = {
        "protocol": "Syslog",
        "version": 1,
        "pri": 165,
        "facility": 20,
        "facility_name": "local4",
        "severity": 5,
        "severity_name": "Notice",
        "timestamp": "2026-09-12T12:00:00Z",
        "hostname": "firewall01",
        "app_name": "firewall",
        "procid": "1234",
        "msgid": "FW001",
        "structured_data": [
            {
                "id": "exampleSDID@32473",
                "params": {
                    "eventID": "1011"
                },
            }
        ],
        "message": "Connection blocked src=10.0.0.5 dst=10.0.0.10",
        "raw_message": (
            "<165>1 2026-09-12T12:00:00Z "
            "firewall01 firewall 1234 FW001 "
            "[exampleSDID@32473 eventID=\"1011\"] "
            "Connection blocked src=10.0.0.5 dst=10.0.0.10"
        ),
    }

    normalized = normalize_syslog_event(test_event)

    print("Normalized Syslog Event:")
    print(normalized)