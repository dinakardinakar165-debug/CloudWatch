# CloudWatch Sentinel — Data Privacy, Minimisation & Governance Architecture

**Institution**: Kumaraguru College of Technology  
**Department**: Computer Science and Engineering  
**Course**: Cloud Application and Development  
**Student Team**: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)

---

## 1. The Zero-Trust Privacy Principle

Traditional APM (Application Performance Monitoring) tools operate on a "collect everything, index everything" philosophy. CloudWatch Sentinel reverses this approach:

```
           TRADITIONAL APM vs. CLOUDWATCH SENTINEL
+------------------------------------+---------------------------------------+
| Traditional APM (Datadog/NewRelic) | CloudWatch Sentinel                   |
+------------------------------------+---------------------------------------+
| * Collects raw stack traces        | * Strictly rejects application logs   |
| * Indexes environment variables    | * Drops environment variables         |
| * Stores full SQL queries          | * Rejects database contents & queries |
| * Transmits internal IP topologies | * Pseudonymizes resource identifiers  |
| * Permanent vendor-side storage    | * Customer Right-to-Erasure with 1-click|
+------------------------------------+---------------------------------------+
```

---

## 2. Strictly Prohibited Metadata Allowlist

The CloudWatch Sentinel Data Sanitisation Engine rejects any telemetry payload that contains the following patterns, both in key names and payload values:

| Category | Regex / Key Match | Action | Risk Prevented |
|---|---|---|---|
| **Passwords & Keys** | `/password/i`, `/secret_key/i`, `/private_key/i` | Dropped immediately | Plaintext credential exposure |
| **AWS Credentials** | `AKIA[0-9A-Z]{16}`, AWS STS session tokens | Redacted to `[REDACTED_SECRET]` | Account takeover |
| **API Tokens** | `ghp_[a-zA-Z0-9]{36}`, Bearer headers | Redacted to `[REDACTED_SECRET]` | Lateral privilege escalation |
| **Environment Variables**| `/env_var/i`, `/environment_variables/i` | Dropped immediately | Leaking API keys, connection strings |
| **Source Code** | `/source_code/i`, code diffs | Dropped immediately | Intellectual property theft |
| **Customer Data** | `/sql/i`, `/payload/i`, `/request_body/i` | Dropped immediately | Data breach of customer PII |
| **Raw Unfiltered Logs** | `/raw_logs/i`, unstructured stdout | Dropped immediately | Accidental log injection of secrets |

---

## 3. Deterministic Identifier Pseudonymisation

To safeguard internal naming topologies and AWS account numbers:
- **AWS Account ID**: An AWS 12-digit number like `123456789012` is mapped to an anonymous alias like `org-acc-8a4b`.
- **EC2 Instance ID**: Physical instance strings like `i-0a8b9f1234cde5678` are mapped to `res-ec2-a8b9`.
- **Algorithm**: Computed using a deterministic murmur-style hash so that metric trends for a given server remain consistently tracked across intervals without revealing physical identifiers.

---

## 4. Right to Erasure (GDPR Art. 17 / CCPA)

Customers retain absolute control over historical data stored in Sentinel:
1. Navigate to **Data Governance** -> **Right to Erasure**.
2. Select the tenant or account connection.
3. Choose the scope: **Delete All Historical Telemetry** or **Complete Account Purge**.
4. Confirm with an audit reason.
5. The system immediately executes cascading deletions across all 16 Postgres tables, removes cached statistics, and generates an immutable `DATA_DELETION` audit log.

---

## 5. Retention & Lifecycle Policies

Tenants can configure custom data retention windows:
- 30 Days (Recommended for strict compliance)
- 60 Days
- 90 Days (Enterprise default)
- 180 Days
- 365 Days (Statutory audit requirement)

An automated worker continuously purges telemetry data exceeding the tenant's retention ceiling.
