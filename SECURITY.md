# CloudWatch Sentinel — Security Threat Model & Safeguards

**Institution**: Kumaraguru College of Technology  
**Department**: Computer Science and Engineering  
**Course**: Cloud Application and Development  
**Student Team**: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)

---

## 1. Threat Modeling & Vulnerability Mitigation

| Threat Vector | Potential Attack | Sentinel Architectural Mitigation |
|---|---|---|
| **Confused Deputy Attack** | Malicious third party passes target account ARN to assume victim role | **Mandatory `sts:ExternalId`**: Every tenant receives a cryptographically random External ID required by the IAM trust policy condition. |
| **Credential Exfiltration** | Attacker extracts AWS access keys from monitoring agent | **Zero Persistent Keys**: Uses instance profiles in Mode B, short-lived STS tokens in Mode A. No persistent keys stored anywhere. |
| **Data Leakage via Logs** | Application errors write DB passwords or API keys to telemetry | **In-VPC Regex Redaction**: Scrubs `AKIA...`, `ghp_...`, Bearer tokens, and RSA keys inside the customer VPC before transit. |
| **Eavesdropping / MITM** | In-flight interception of telemetry | **Enforced TLS 1.3**: All communication between collectors, backend, and Supabase uses HTTPS/WSS with HSTS. |
| **Collector Compromise** | An EC2 instance running a collector is breached | **Instant Token Revocation**: Administrators can revoke a collector token in the UI within 1 click, rejecting future payloads. |
| **Privilege Escalation** | Monitoring platform gains write or administrative access to AWS | **Strict Read-Only IAM Policies**: Specifically excludes `s3:GetObject`, `ec2:RunInstances`, `iam:*`, `kms:Decrypt`. |

---

## 2. In-Depth: The Confused Deputy Problem in AWS

In a cross-account assume-role scenario:
1. Customer A creates role `arn:aws:iam::111111111111:role/SentinelRole` trusting Sentinel backend (`38578049108`).
2. Attacker B signs into Sentinel and enters Customer A's ARN `arn:aws:iam::111111111111:role/SentinelRole`.
3. Without `sts:ExternalId`, the Sentinel backend would assume Customer A's role on behalf of Attacker B!

### Sentinel's Cryptographic Fix:
- Sentinel generates a unique External ID for Customer A: `sentinel-ext-c184-7a9f-44e2`.
- Customer A's Trust Policy requires:
  ```json
  "Condition": {
    "StringEquals": {
      "sts:ExternalId": "sentinel-ext-c184-7a9f-44e2"
    }
  }
  ```
- When Attacker B attempts to enter Customer A's ARN, Sentinel provides Attacker B's External ID to STS. The condition fails, and AWS STS rejects the request with `AccessDenied`.

---

## 3. Incident Response & Responsible Disclosure

If a security vulnerability is identified:
- Report to the engineering leads: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190).
- Department of Computer Science and Engineering, Kumaraguru College of Technology.
