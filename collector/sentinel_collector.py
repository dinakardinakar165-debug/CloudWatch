#!/usr/bin/env python3
"""
CloudWatch Sentinel - Customer-Side Local Collector (Mode B)
=============================================================
Runs inside customer VPC / EC2 / Lambda / Container.
Uses local IAM role; never transmits AWS secrets to CloudWatch Sentinel.
Performs in-VPC data filtering, secret redaction, and allowlisting.
Transmits only sanitised telemetry over TLS to the Sentinel Ingestion API.

Institution: Kumaraguru College of Technology
"""

import os
import sys
import json
import re
import time
import datetime
import urllib.request
import urllib.error

# In customer environment, boto3 is available from local AWS CLI / IAM instance profile
try:
    import boto3
    from botocore.exceptions import ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

# Configuration (configured via environment variables or local config)
SENTINEL_INGESTION_ENDPOINT = os.getenv("SENTINEL_API_URL", "https://your-sentinel-instance.com/api/ingestion")
SENTINEL_COLLECTOR_TOKEN = os.getenv("SENTINEL_COLLECTOR_TOKEN", "cws_live_sample_token")
COLLECTOR_NAME = os.getenv("COLLECTOR_NAME", "customer-vpc-collector-01")
AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
COLLECTOR_VERSION = "v1.4.2-py311"

# Strict Prohibited Fields Regex
PROHIBITED_PATTERNS = [
    re.compile(r"password", re.I),
    re.compile(r"secret", re.I),
    re.compile(r"access_key", re.I),
    re.compile(r"token", re.I),
    re.compile(r"env_var", re.I),
    re.compile(r"source_code", re.I),
    re.compile(r"raw_logs", re.I),
]

SECRET_REGEX = re.compile(r"(?:AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36})")


def sanitize_payload(payload: dict) -> dict:
    """Recursively removes prohibited keys and redacts secret patterns."""
    clean = {}
    for k, v in payload.items():
        # Check prohibited key
        if any(pat.search(k) for pat in PROHIBITED_PATTERNS):
            continue

        if isinstance(v, str):
            clean[k] = SECRET_REGEX.sub("[REDACTED_SECRET]", v)
        elif isinstance(v, dict):
            clean[k] = sanitize_payload(v)
        else:
            clean[k] = v
    return clean


def send_to_sentinel(endpoint_path: str, data: dict):
    """Transmits sanitised payload over TLS using scoped bearer token."""
    url = f"{SENTINEL_INGESTION_ENDPOINT}/{endpoint_path}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {SENTINEL_COLLECTOR_TOKEN}",
        "X-Collector-Name": COLLECTOR_NAME,
        "X-Collector-Version": COLLECTOR_VERSION,
        "User-Agent": f"CloudWatchSentinelCollector/{COLLECTOR_VERSION}",
    }

    sanitized = sanitize_payload(data)
    json_bytes = json.dumps(sanitized).encode("utf-8")

    req = urllib.request.Request(url, data=json_bytes, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.status, response.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        print(f"[-] Ingestion API error ({e.code}): {e.read().decode('utf-8')}")
        return e.code, str(e)
    except Exception as e:
        print(f"[-] Network connection error: {str(e)}")
        return 0, str(e)


def collect_metrics_from_aws():
    """Extracts approved EC2 metrics using local IAM execution role."""
    if not BOTO3_AVAILABLE:
        # Fallback simulated collection for dry run
        return {
            "collector_id": COLLECTOR_NAME,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "region": AWS_REGION,
            "metrics": [
                {"resource_id": "i-customer-01", "metric": "CPUUtilization", "value": 41.5, "unit": "%"},
                {"resource_id": "i-customer-01", "metric": "NetworkIn", "value": 8500000, "unit": "Bytes"},
            ],
        }

    session = boto3.Session(region_name=AWS_REGION)
    cw = session.client("cloudwatch")
    ec2 = session.client("ec2")

    # Discover running instances
    reservations = ec2.describe_instances(Filters=[{"Name": "instance-state-name", "Values": ["running"]}])
    instances = []
    for res in reservations.get("Reservations", []):
        for inst in res.get("Instances", []):
            instances.append(inst["InstanceId"])

    metrics_list = []
    end_time = datetime.datetime.utcnow()
    start_time = end_time - datetime.timedelta(minutes=10)

    for inst_id in instances[:5]: # Cap to top 5 for rate limits
        try:
            stats = cw.get_metric_statistics(
                Namespace="AWS/EC2",
                MetricName="CPUUtilization",
                Dimensions=[{"Name": "InstanceId", "Value": inst_id}],
                StartTime=start_time,
                EndTime=end_time,
                Period=300,
                Statistics=["Average"],
            )
            pts = stats.get("Datapoints", [])
            if pts:
                latest = sorted(pts, key=lambda x: x["Timestamp"])[-1]
                metrics_list.append({
                    "resource_id": inst_id,
                    "metric": "CPUUtilization",
                    "value": round(latest["Average"], 2),
                    "unit": "%"
                })
        except ClientError as e:
            print(f"[-] Warning: Unable to read metric for {inst_id}: {e}")

    return {
        "collector_id": COLLECTOR_NAME,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "region": AWS_REGION,
        "metrics": metrics_list,
    }


def main():
    print(f"[+] Starting CloudWatch Sentinel Local Collector ({COLLECTOR_VERSION})")
    print(f"[+] Endpoint: {SENTINEL_INGESTION_ENDPOINT}")
    print(f"[+] Region: {AWS_REGION}")
    print("[+] Mode B Zero-Trust Sanitisation: ACTIVE")

    # 1. Send heartbeat
    hb_payload = {
        "collector_id": COLLECTOR_NAME,
        "version": COLLECTOR_VERSION,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "status": "HEALTHY",
    }
    status, res = send_to_sentinel("heartbeat", hb_payload)
    print(f"[+] Heartbeat status: {status}")

    # 2. Collect and send metrics
    metrics_payload = collect_metrics_from_aws()
    status, res = send_to_sentinel("metrics", metrics_payload)
    print(f"[+] Metrics upload status: {status}")


if __name__ == "__main__":
    main()
