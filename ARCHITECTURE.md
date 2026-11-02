# CloudWatch Sentinel — System Architecture & Trust Boundaries

**Institution**: Kumaraguru College of Technology  
**Department**: Computer Science and Engineering  
**Course**: Cloud Application and Development  
**Student Team**: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)

---

## 1. Executive Summary & Core Philosophy

Enterprise cloud operations often require multi-account monitoring, cost governance, and CI/CD pipeline observability. However, standard third-party SaaS monitoring tools demand root or persistent AWS credentials (`AKIA...`), unrestricted read permissions across S3, IAM, or DynamoDB, and external storage of proprietary logs or source code.

**CloudWatch Sentinel** eliminates these privacy and security risks by adhering to the fundamental principle:
> **"The AWS account owner must retain continuous sovereignty over their data, permissions, ingestion mechanisms, and instant revocation of access."**

---

## 2. The Three Operating Modes

```
+---------------------------------------------------------------------------------------------------+
|                                  OPERATING MODE SELECTION MATRIX                                  |
+------------------------------------+----------------------------------+---------------------------+
| Mode A: Cross-Account STS AssumeRole | Mode B: Customer Local Collector | Mode C: Deterministic Demo|
+------------------------------------+----------------------------------+---------------------------+
| * Customer grants explicit IAM role | * Runs inside customer VPC/EC2   | * Default, zero-access     |
| * External ID protects vs Confused | * Redacts secrets inside VPC     | * Realistic telemetry     |
|   Deputy attacks                    | * Only telemetry leaves perimeter| * Explicit [DEMO] labeling|
| * Ephemeral 1-hour STS tokens      | * Scoped revocable bearer tokens | * Instant verification    |
+------------------------------------+----------------------------------+---------------------------+
```

### Mode A: Customer-Authorised AWS Cross-Account Integration
- **Mechanism**: The customer deploys an IAM Role in their target account with a trust policy allowing `sts:AssumeRole` from CloudWatch Sentinel's AWS Account.
- **Confused Deputy Protection**: Sentinel generates a cryptographically random `sts:ExternalId`. The IAM trust policy mandates that this `sts:ExternalId` must be passed on every STS call.
- **Least-Privilege Policy**: Strictly read-only calls (`cloudwatch:GetMetricData`, `ec2:DescribeInstances`, `ce:GetCostAndUsage`, `codepipeline:GetPipelineState`).
- **Data Boundary**: Credentials never touch client storage; only sanitised metric summaries are returned to the UI.

### Mode B: Customer-Controlled In-VPC Local Collector
- **Mechanism**: A Python 3 daemon (`collector/sentinel_collector.py`) deployed on an EC2 instance, ECS container, or customer bastion.
- **IAM Identity**: Uses the instance profile attached to the customer's machine. Credentials **never** exit the customer's environment.
- **In-VPC Redaction**: All metrics pass through an in-memory sanitizer before transmission. Secrets (AWS keys, GitHub tokens, Bearer strings) and prohibited payload fields (`password`, `sql`, `env_var`, `raw_logs`, `source_code`) are removed inside the customer perimeter.
- **Ingestion Authentication**: Transmits compressed HTTPS payloads to `/api/ingestion/metrics` using scoped, revocable tokens that can be rotated or invalidated instantly in the UI.

### Mode C: Deterministic Offline Demonstration Mode (Default)
- **Zero-Access Guarantee**: No network requests or AWS API calls are executed.
- **Labelling Discipline**: Every card, metric, line chart, and log line displays an explicit `[DEMO]` attribution badge to avoid confusing synthetic data with live production infrastructure.

---

## 3. High-Level Architecture & Trust Boundaries

```
[CUSTOMER AWS VPC / ON-PREMISES PERIMETER]
+---------------------------------------------------------------------------+
|                                                                           |
|   +-----------------------+           +-------------------------------+   |
|   | AWS Services (Local)  |           | Customer Local Collector      |   |
|   | CloudWatch, EC2, CE   |           | (collector/sentinel_collector)|   |
|   +-----------+-----------+           +---------------+---------------+   |
|               |                                       |                   |
|               | (Instance Profile / Read-Only)        |                   |
|               v                                       |                   |
|   +-----------+-----------+                           |                   |
|   | Raw Telemetry & Logs  |                           |                   |
|   +-----------+-----------+                           |                   |
|               |                                       |                   |
|               v                                       v                   |
|       [ IN-VPC SANITISATION & REDACTION ENGINE ]                          |
|       - Regex Redaction of AKIA..., ghp_..., Private Keys                 |
|       - Mandatory Drop of Prohibited Metadata Keys                        |
|       - Pseudonymisation of Instance IDs & Account Numbers                |
|                               |                                           |
+-------------------------------|-------------------------------------------+
                                |
                                | Scoped TLS 1.3 HTTPS + Revocable Bearer Token
                                v
+---------------------------------------------------------------------------+
| CLOUDWATCH SENTINEL PLATFORM (FASTAPI BACKEND & REACT 19 SPA)             |
|                                                                           |
|   +-------------------------------+   +-------------------------------+   |
|   | FastAPI Ingestion Microservice|   | Policy & Consent Registry     |   |
|   | (/api/ingestion/metrics)      |---| (Customer Allowlist Engine)   |   |
|   +---------------+---------------+   +---------------+---------------+   |
|                   |                                   |                   |
|                   v                                   v                   |
|   +-------------------------------+   +-------------------------------+   |
|   | Gaussian Z-Score Engine       |   | Audit Trail & Erasure Bus     |   |
|   | Z = (x - μ) / σ               |   | (Immutable Event Logger)      |   |
|   +---------------+---------------+   +---------------+---------------+   |
|                   |                                   |                   |
|                   +-----------------+-----------------+                   |
|                                     |                                     |
|                                     v                                     |
|                      +-----------------------------+                      |
|                      | Supabase PostgreSQL 16      |                      |
|                      | Row-Level Security Enabled  |                      |
|                      +--------------+--------------+                      |
|                                     |                                     |
|                                     v                                     |
|                      +-----------------------------+                      |
|                      | React 19 Sentinel Console   |                      |
|                      | Strict [DEMO] vs [LIVE] Tag |                      |
|                      +-----------------------------+                      |
+---------------------------------------------------------------------------+
```

---

## 4. Anomaly Detection Engine

The anomaly engine calculates statistical deviation on every numerical telemetry series:

$$\mu = \frac{1}{N} \sum_{i=1}^N x_i$$

$$s^2 = \frac{1}{N-1} \sum_{i=1}^N (x_i - \mu)^2 \quad \text{(Bessel's Correction)}$$

$$Z = \frac{x - \mu}{\sqrt{\max(s^2, \, \epsilon^2)}} \quad \text{where } \epsilon = 0.0001$$

- **Severity Classification**:
  - $|Z| \ge 3.5$: **CRITICAL** (e.g. CPU spike from 20% to 95%)
  - $2.5 \le |Z| < 3.5$: **HIGH**
  - $1.8 \le |Z| < 2.5$: **MEDIUM**
  - $|Z| < 1.8$: **NORMAL** (Suppressed to prevent alert fatigue)

---

## 5. Security & Compliance Safeguards

1. **Zero Secret Storage**: No permanent AWS credentials, passwords, or private keys are ever stored in Postgres, local storage, or application memory.
2. **Right to Erasure (GDPR Art. 17 / CCPA)**: The customer can purge all historical data with a single click, instantly dropping telemetry records and writing an audit event.
3. **Statutory Export**: Full tenant data can be exported at any time in machine-readable CSV format or executive audit PDF signed with data provenance metadata.
