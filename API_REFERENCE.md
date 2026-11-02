# CloudWatch Sentinel — Ingestion & Management API Reference

**Institution**: Kumaraguru College of Technology  
**Department**: Computer Science and Engineering  
**Course**: Cloud Application and Development  
**Student Team**: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)

---

## 1. Overview & Authentication

The CloudWatch Sentinel backend (`backend/main.py`) provides an asynchronous FastAPI service handling AWS STS validation, collector registration, metric ingestion, token revocation, and policy synchronization.

All ingestion endpoints require a Bearer token:
```http
Authorization: Bearer <COLLECTOR_INGESTION_TOKEN>
```

---

## 2. API Endpoints

### 1. Ingestion Health Check
```http
GET /health
```
**Response (200 OK)**:
```json
{
  "status": "healthy",
  "service": "CloudWatch Sentinel Ingestion API",
  "version": "2.4.0",
  "timestamp": "2026-11-02T16:00:00Z"
}
```

---

### 2. Verify Cross-Account AWS Role (Mode A)
```http
POST /api/aws/verify
Content-Type: application/json
```
**Request Body**:
```json
{
  "role_arn": "arn:aws:iam::123456789012:role/CloudWatchSentinelReadOnlyRole",
  "external_id": "sentinel-ext-live-729410",
  "region": "us-east-1"
}
```
**Response (200 OK)**:
```json
{
  "success": true,
  "account_id": "123456789012",
  "account_alias": "prod-workloads",
  "region": "us-east-1",
  "permissions": [
    { "service": "CloudWatch", "action": "cloudwatch:GetMetricData", "status": "GRANTED" },
    { "service": "EC2", "action": "ec2:DescribeInstances", "status": "GRANTED" },
    { "service": "CostExplorer", "action": "ce:GetCostAndUsage", "status": "GRANTED" },
    { "service": "CodePipeline", "action": "codepipeline:GetPipelineState", "status": "GRANTED" }
  ]
}
```

---

### 3. Register Customer Collector (Mode B)
```http
POST /api/ingestion/register
Content-Type: application/json
```
**Request Body**:
```json
{
  "collector_name": "vpc-east-primary-collector",
  "hostname": "ip-10-0-12-44.ec2.internal",
  "version": "2.4.0",
  "environment": "EC2_INSTANCE_PROFILE",
  "account_alias": "primary-vpc"
}
```
**Response (201 Created)**:
```json
{
  "collector_id": "col-ec2-7f2a1b",
  "token": "col_tok_9f81a7b6c5d4e3f210a9b8c7d6e5f4a3",
  "expires_in_days": 90,
  "message": "Store this token securely; it is never displayed again."
}
```

---

### 4. Collector Telemetry Ingestion (Mode B)
```http
POST /api/ingestion/metrics
Authorization: Bearer <COLLECTOR_TOKEN>
Content-Type: application/json
```
**Request Body**:
```json
{
  "collector_id": "col-ec2-7f2a1b",
  "timestamp": "2026-11-02T16:05:00Z",
  "data_source": "CUSTOMER_COLLECTOR",
  "metrics": [
    {
      "resource_id": "res-ec2-a8b9",
      "resource_type": "EC2",
      "metric_name": "CPUUtilization",
      "value": 42.8,
      "unit": "%"
    }
  ]
}
```
**Response (200 OK)**:
```json
{
  "status": "ACCEPTED",
  "datapoints_ingested": 1,
  "rejected_fields_count": 0,
  "redacted_secret_count": 0
}
```

---

### 5. Revoke Collector Token (Instant Access Revocation)
```http
POST /api/ingestion/revoke
Content-Type: application/json
```
**Request Body**:
```json
{
  "collector_id": "col-ec2-7f2a1b",
  "reason": "Host decommissioned or suspected breach"
}
```
**Response (200 OK)**:
```json
{
  "status": "REVOKED",
  "collector_id": "col-ec2-7f2a1b",
  "revoked_at": "2026-11-02T16:06:12Z"
}
```

---

### 6. Synchronize Data Sharing Policy
```http
GET /api/ingestion/policy
Authorization: Bearer <COLLECTOR_TOKEN>
```
**Response (200 OK)**:
```json
{
  "allow_cpu_metrics": true,
  "allow_network_totals": true,
  "allow_cost_aggregates": true,
  "allow_pipeline_status": true,
  "pseudonymize_identifiers": true
}
```
