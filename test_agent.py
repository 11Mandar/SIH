import subprocess
import requests
import time
import socket
import xml.etree.ElementTree as ET


SERVER_URL = "http://127.0.0.1:8000"
API_URL = f"{SERVER_URL}/api/v1/events"

LOG_NAME = "Security"
POLL_INTERVAL = 2


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None


def get_security_events():
    command = [
        "powershell",
        "-NoProfile",
        "-Command",
        (
            "Get-WinEvent -LogName Security -MaxEvents 100 | "
            "ForEach-Object { $_.ToXml() }"
        )
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=10
        )

        if result.returncode != 0:
            print("[ERROR] Could not read Security log:")
            print(result.stderr.strip())
            return []

        output = result.stdout.strip()

        if not output:
            return []

        events = []

        parts = output.split("<Event ")

        for part in parts[1:]:
            xml_text = "<Event " + part

            try:
                root = ET.fromstring(xml_text)
                events.append(root)
            except ET.ParseError:
                continue

        return events

    except Exception as e:
        print(f"[ERROR] Reading Security events: {e}")
        return []


def get_value(root, name):
    for element in root.iter():
        if element.tag.endswith("Data"):
            if element.attrib.get("Name") == name:
                return element.text

    return None


def get_event_id(root):
    for element in root.iter():
        if element.tag.endswith("EventID"):
            try:
                return int(element.text)
            except:
                return None

    return None


def get_record_id(root):
    for element in root.iter():
        if element.tag.endswith("EventRecordID"):
            try:
                return int(element.text)
            except:
                return None

    return None


def get_provider(root):
    for element in root.iter():
        if element.tag.endswith("Provider"):
            return element.attrib.get("Name")

    return None


def get_computer(root):
    for element in root.iter():
        if element.tag.endswith("Computer"):
            return element.text

    return None


def get_timestamp(root):
    for element in root.iter():
        if element.tag.endswith("TimeCreated"):
            return element.attrib.get("SystemTime")

    return None


def extract_event_fields(root):

    event_id = get_event_id(root)
    record_id = get_record_id(root)
    provider = get_provider(root)
    computer = get_computer(root)
    timestamp = get_timestamp(root)

    source_ip = None
    source_port = None
    destination_ip = None
    destination_port = None

    # -----------------------------------------
    # Windows Security 4624 / 4625
    # -----------------------------------------
    if event_id in (4624, 4625):

        source_ip = get_value(root, "IpAddress")
        source_port = get_value(root, "IpPort")

        # Keep real values.
        # Only remove empty / placeholder values.
        if source_ip in (None, "", "-"):
            source_ip = None

        if source_port in (None, "", "-", "0"):
            source_port = None

    # -----------------------------------------
    # Windows Filtering Platform 5156
    # -----------------------------------------
    elif event_id == 5156:

        source_ip = get_value(root, "SourceAddress")
        source_port = get_value(root, "SourcePort")

        destination_ip = get_value(root, "DestAddress")
        destination_port = get_value(root, "DestPort")

        if source_ip in (None, "", "-"):
            source_ip = None

        if destination_ip in (None, "", "-"):
            destination_ip = None

        if source_port in (None, "", "-", "0"):
            source_port = None

        if destination_port in (None, "", "-", "0"):
            destination_port = None

    # -----------------------------------------
    # Collect event data as LIST
    # -----------------------------------------
    message_data = []

    for element in root.iter():

        if element.tag.endswith("Data"):

            name = element.attrib.get("Name")
            value = element.text

            if name:
                message_data.append({
                    "name": name,
                    "value": value
                })

    return {
        "event_id": event_id,
        "record_id": record_id,
        "source": provider,
        "timestamp": timestamp,
        "computer": computer,
        "message_data": message_data,

        "source_ip": source_ip,
        "source_port": source_port,
        "destination_ip": destination_ip,
        "destination_port": destination_port
    }


def send_event(event_data):

    try:

        response = requests.post(
            API_URL,
            json=event_data,
            timeout=5
        )

        if response.ok:

            print(
                f"[SENT] Event {event_data['event_id']} "
                f"| Record ID: {event_data['record_id']} "
                f"| Source IP: {event_data['source_ip']} "
                f"| Destination IP: {event_data['destination_ip']}"
            )

        else:

            print(
                f"[ERROR] Server returned "
                f"{response.status_code}: {response.text}"
            )

    except requests.RequestException as e:

        print(
            f"[ERROR] Could not reach LogNexus Server: {e}"
        )


def main():

    print("===================================")
    print("       LogNexus Windows Agent")
    print("===================================")

    print(f"Monitoring: {LOG_NAME}")
    print(f"Server: {SERVER_URL}")
    print(f"Local IP: {get_local_ip()}")
    print()

    # Read current events once
    roots = get_security_events()

    record_ids = []

    for root in roots:

        record_id = get_record_id(root)

        if record_id is not None:
            record_ids.append(record_id)

    if record_ids:
        latest_record_id = max(record_ids)
    else:
        latest_record_id = 0

    print(
        f"Agent started. Latest Record ID: "
        f"{latest_record_id}"
    )

    print("Waiting for new Security events...\n")

    try:

        while True:

            roots = get_security_events()

            new_events = []

            for root in roots:

                record_id = get_record_id(root)

                if (
                    record_id is not None
                    and record_id > latest_record_id
                ):
                    new_events.append(root)

            # Oldest → newest
            new_events.sort(
                key=lambda root: get_record_id(root) or 0
            )

            for root in new_events:

                event_data = extract_event_fields(root)

                send_event(event_data)

                record_id = event_data["record_id"]

                if record_id > latest_record_id:
                    latest_record_id = record_id

            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:

        print("\nAgent stopped.")


if __name__ == "__main__":
    main()