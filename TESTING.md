# CloudWatch Sentinel — Verification, Security & Unit Testing Suite

**Institution**: Kumaraguru College of Technology  
**Department**: Computer Science and Engineering  
**Course**: Cloud Application and Development  
**Student Team**: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)

---

## 1. Automated Test Execution

The codebase contains a comprehensive automated test suite verifying privacy filters, regex redaction, pseudonymisation, Gaussian Z-Score anomaly computation, and AWS trust policy integrity.

### Running the Suite:
```bash
npm test
```
Or directly with `tsx`:
```bash
npx tsx tests/privacy_security.test.ts
```

---

## 2. Test Coverage & Verification Matrix

The test runner executes **33 discrete assertions** across 6 core security and mathematical domains:

### Suite 1: In-VPC Secret Pattern Redaction
- Redaction of AWS Access Key IDs (`AKIA[0-9A-Z]{16}`)
- Redaction of GitHub personal access tokens (`ghp_...`)
- Redaction of Bearer tokens (`Bearer eyJ...`)
- Redaction of RSA Private Keys (`-----BEGIN RSA PRIVATE KEY-----`)
- Accurate counting of multiple concurrent secrets

### Suite 2: Prohibited Metadata Field Rejection
- Verification that approved metrics (`cpu_utilization_avg`, etc.) pass through intact
- Strict dropping of prohibited fields: `db_password`, `api_access_key`, `app_env_vars`, `source_code_snippet`, `raw_logs`
- Accurate audit logging of prohibited keys attempt

### Suite 3: Dynamic Category Policy Allowlisting
- Verification that when `allowCpuMetrics: false`, CPU telemetry is dropped
- Verification that when `allowCostAggregates: false`, cost telemetry is dropped
- Verification that allowed categories (`allowNetworkTotals: true`) remain intact

### Suite 4: Deterministic Identifier Pseudonymisation
- Transformation of physical EC2 IDs (`i-0a8b9f1234cde5678`) to synthetic tokens (`res-ec2-xxxx`)
- Deterministic consistency across multiple invocations
- Masking of 12-digit AWS Account Numbers to synthetic organization aliases (`org-acc-xxxx`)

### Suite 5: Gaussian Z-Score Anomaly Engine
- Calculation of mean and standard deviation with Bessel's correction ($N - 1$)
- Verification that normal variations ($|Z| < 1.8$) do not produce false alarms
- Detection and correct classification of critical anomalies ($|Z| \ge 3.5$)
- Zero-variance flatline guard ($\epsilon = 0.0001$) preventing divide-by-zero or `NaN`

### Suite 6: AWS Cross-Account Trust Policy & Confused Deputy
- Trust policy enforcement of `sts:AssumeRole` action
- Mandatory `sts:ExternalId` condition block
- Verification that least-privilege policy grants strictly read-only actions and excludes write/destructive actions (`s3:GetObject`, `ec2:RunInstances`, `iam:CreateUser`)

---

## 3. Additional Verification Commands

```bash
# Type check without compilation errors
npm run lint

# Production build bundle check
npm run build

# Python collector dry run (simulates in-VPC collection)
python3 collector/sentinel_collector.py --dry-run
```
