import json
import os
import time

import requests
import win32evtlog


SERVER_URL = "http://127.0.0.1:8000/api/v1/events"

SERVER = "localhost"
LOG_TYPE = "Security"

STATE_FILE = os.path.join(
    os.path.dirname(__file__),
    "agent_state.json"
)

POLL_INTERVAL = 5


def load_last_record_number():
    if not os.path.exists(STATE_FILE):
        return None

    try:
        with open(STATE_FILE, "r") as file:
            state = json.load(file)

        return state.get("last_record_number")

    except (json.JSONDecodeError, OSError):
        return None


def save_last_record_number(record_number):
    with open(STATE_FILE, "w") as file:
        json.dump(
            {"last_record_number": record_number},
            file
        )


def read_events():
    handle = win32evtlog.OpenEventLog(
        SERVER,
        LOG_TYPE
    )

    flags = (
        win32evtlog.EVENTLOG_BACKWARDS_READ
        | win32evtlog.EVENTLOG_SEQUENTIAL_READ
    )

    try:
        events = win32evtlog.ReadEventLog(
            handle,
            flags,
            0
        )

        return events

    finally:
        win32evtlog.CloseEventLog(handle)


def convert_event(event):
    return {
        "event_id": event.EventID & 0xFFFF,
        "source": event.SourceName,
        "timestamp": event.TimeGenerated.isoformat(),
        "computer": event.ComputerName,
        "message_data": list(event.StringInserts or []),
    }


def send_event(event):
    max_retries = 3

    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(
                SERVER_URL,
                json=event,
                timeout=5
            )

            if response.ok:
                result = response.json()

                if result.get("status") == "success":
                    print(
                        f"[SENT] Event ID: {event['event_id']}"
                    )
                    return True

                print(
                    f"[ERROR] LogNexus rejected event: "
                    f"{result.get('message', 'Unknown error')}"
                )
                return False

            print(
                f"[ERROR] Server returned "
                f"{response.status_code}"
            )

        except requests.RequestException as error:
            print(
                f"[RETRY {attempt}/{max_retries}] "
                f"Server unavailable: {error}"
            )

            if attempt < max_retries:
                time.sleep(2)

    print(
        f"[FAILED] Event ID {event['event_id']} "
        f"could not be sent"
    )

    return False


def main():
    print("LogNexus Agent started...")
    print("Watching Windows Security Event Log")

    last_record_number = load_last_record_number()

    while True:
        try:
            events = read_events()

            if not events:
                time.sleep(POLL_INTERVAL)
                continue

            # Events are returned newest first.
            events = sorted(
                events,
                key=lambda event: event.RecordNumber
            )

            # First startup:
            # remember the current latest event instead of
            # uploading the entire existing Security log.
            if last_record_number is None:
                last_record_number = events[-1].RecordNumber
                save_last_record_number(last_record_number)

                print(
                    f"[READY] Starting from "
                    f"RecordNumber {last_record_number}"
                )

                time.sleep(POLL_INTERVAL)
                continue

            for event in events:

                if event.RecordNumber <= last_record_number:
                    continue

                converted_event = convert_event(event)

                success = send_event(converted_event)

                if success:
                    last_record_number = event.RecordNumber
                    save_last_record_number(last_record_number)

        except Exception as error:
            print(f"[ERROR] Agent: {error}")

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()