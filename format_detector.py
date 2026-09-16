import json


def detect_format(log):
    log = log.strip()

    # JSON
    try:
        json.loads(log)
        return "JSON"
    except:
        pass

    # CEF
    if log.startswith("CEF:"):
        return "CEF"

    # LEEF
    if log.startswith("LEEF:"):
        return "LEEF"

    # Syslog
    if log.startswith("<") and ">" in log:
        return "Syslog"

    return "Unknown"


# Test examples
logs = [
    '{"user":"admin","ip":"192.168.1.10"}',
    'CEF:0|Vendor|Firewall|1.0|100|Connection blocked|7|src=10.0.0.5',
    '<134>Sep 06 17:00:01 Firewall DENY src=10.0.0.5',
    'User=admin IP=192.168.1.10 Action=Login'
]

if __name__ == "__main__":
    for log in logs:
        print(detect_format(log))
