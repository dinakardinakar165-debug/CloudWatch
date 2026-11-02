# CloudWatch Sentinel — Customer-Controlled In-VPC Collector Setup (Mode B)

**Institution**: Kumaraguru College of Technology  
**Department**: Computer Science and Engineering  
**Course**: Cloud Application and Development  
**Student Team**: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)

---

## 1. Introduction to Mode B

Mode B is engineered specifically for organizations with strict data sovereignty, banking, defense, or healthcare compliance mandates that **strictly prohibit** granting external entities read-only IAM access to their cloud perimeter.

### Architectural Core
1. **Zero External Access**: You do not grant CloudWatch Sentinel any IAM role, STS privilege, or credentials.
2. **In-VPC Execution**: The lightweight Python collector runs on your own EC2 instance, ECS container, or Kubernetes pod using an attached IAM Instance Profile.
3. **In-Perimeter Sanitisation**: Before any data packet leaves your VPC, the collector scrubs all potential secrets (AWS access keys, API tokens, passwords) and drops prohibited fields (`db_password`, `env_vars`, `source_code`, `raw_logs`).
4. **Scoped Revocable Token**: Transmission authenticates against Sentinel's HTTPS ingestion API using a bearer token that you can rotate or revoke instantly from the Sentinel UI.

---

## 2. Deployment Options

### Option 1: Deployment on an EC2 Instance (Linux / Systemd)

1. **Attach an IAM Role** to your EC2 instance with read-only CloudWatch permissions (`CloudWatchReadOnlyAccess`).
2. **Download the Collector Script**:
   From the Sentinel UI (**Collectors** -> **Download Collector Script**) or copy `/collector/sentinel_collector.py`.
3. **Install Dependencies**:
   ```bash
   sudo apt-get update && sudo apt-get install -y python3 python3-pip
   pip3 install boto3 requests
   ```
4. **Configure Environment Variables**:
   ```bash
   export SENTINEL_ENDPOINT="https://your-sentinel-instance.onrender.com"
   export COLLECTOR_TOKEN="col_tok_secure_bearer_token_here"
   export AWS_DEFAULT_REGION="us-east-1"
   export COLLECT_INTERVAL_SEC="60"
   export PSEUDONYMIZE_IDS="true"
   ```
5. **Run as a Systemd Service** (`/etc/systemd/system/sentinel-collector.service`):
   ```ini
   [Unit]
   Description=CloudWatch Sentinel In-VPC Collector
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   EnvironmentFile=/etc/sentinel/collector.env
   ExecStart=/usr/bin/python3 /opt/sentinel/sentinel_collector.py
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```
6. **Start the Service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now sentinel-collector
   sudo journalctl -u sentinel-collector -f
   ```

---

### Option 2: Docker Container Deployment

1. Create a `Dockerfile`:
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   RUN pip install --no-cache-dir boto3 requests
   COPY sentinel_collector.py .
   USER 10001
   CMD ["python3", "sentinel_collector.py"]
   ```
2. Build and run:
   ```bash
   docker build -t sentinel-collector:latest .
   docker run -d \
     --name sentinel-collector \
     -e SENTINEL_ENDPOINT="https://your-sentinel-instance.onrender.com" \
     -e COLLECTOR_TOKEN="your_token_here" \
     -e AWS_REGION="us-east-1" \
     -e PSEUDONYMIZE_IDS="true" \
     sentinel-collector:latest
   ```

---

## 3. Collector In-VPC Sanitisation & Verification

The collector contains built-in unit verification. Run it locally in dry-run mode:
```bash
python3 sentinel_collector.py --dry-run
```
Expected output:
```
[2026-11-02 12:00:00] [INFO] Starting CloudWatch Sentinel In-VPC Collector v2.4.0
[2026-11-02 12:00:00] [INFO] Authenticating using attached EC2 Instance Profile
[2026-11-02 12:00:01] [INFO] Ingesting CloudWatch metrics: CPUUtilization, NetworkIn, NetworkOut
[2026-11-02 12:00:02] [SANITISER] Filtered payload: 0 prohibited fields detected, 0 secrets scrubbed
[2026-11-02 12:00:02] [SANITISER] Pseudonymized 4 instance IDs to format 'res-ec2-xxxx'
[2026-11-02 12:00:03] [DISPATCH] Payload sent to /api/ingestion/metrics (HTTP 200 OK)
```

---

## 4. Key Rotation & Collector Revocation

If a collector host is compromised:
1. Navigate to **Collectors** in the Sentinel Console.
2. Locate the collector instance in the table.
3. Click **Revoke Token**.
4. The backend immediately invalidates the token in Postgres/memory. All future ingestion requests from that collector are rejected with `401 Unauthorized`.
5. Generate a new token and update the collector environment.
