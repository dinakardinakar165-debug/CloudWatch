# CloudWatch Sentinel — Data Sharing Policy & Approval Framework

**Institution**: Kumaraguru College of Technology  
**Department**: Computer Science and Engineering  
**Course**: Cloud Application and Development  
**Student Team**: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)

---

## 1. Overview of Data Sharing Policies

Every organization configured in CloudWatch Sentinel possesses a customer-governed **Data Sharing Policy**. This policy functions as a strict firewall: even if an AWS IAM role or in-VPC collector attempts to submit data, any category disabled in the policy is discarded before ingestion.

---

## 2. Configurable Policy Categories

```
+---------------------------------------------------------------------------------------------+
|                               POLICY CATEGORIES & TOGGLES                                   |
+--------------------------+-----------------------------------+------------------------------+
| Category                 | Field / Scope                     | Purpose & Impact             |
+--------------------------+-----------------------------------+------------------------------+
| CPU Metrics              | cpu_utilization_avg, min, max     | Infrastructure sizing        |
| Network Totals           | network_in_bytes, out_bytes       | Bandwidth trend analysis     |
| Instance Status          | status_check_failed               | Outage & health detection    |
| Cost Aggregates          | daily_cost_usd, service_breakdown | FinOps & budget forecasting  |
| Pipeline Status          | pipeline_state, stage_status      | CI/CD deployment monitoring  |
| Build Duration           | build_duration_sec, phase_timings | Build efficiency metrics     |
+--------------------------+-----------------------------------+------------------------------+
```

### Immutable Blocked Categories (Cannot be enabled by any role):
- **Raw Application Request / Response Payloads** (LOCKED: OFF)
- **Source Code & Git Commits** (LOCKED: OFF)
- **Environment Variables & Secrets** (LOCKED: OFF)
- **Customer Database Records** (LOCKED: OFF)

---

## 3. Policy Approval & Versioning Workflow

1. **Role-Based Modification**:
   - Only users with the `Administrator` or `Org Owner` role can propose or toggle data categories.
   - Users with the `Security Reviewer` role inspect policies and review audit logs.
2. **Audit Logging**:
   Every policy modification triggers an immutable audit log entry containing:
   - User identity and timestamp
   - Previous state vs. new state
   - Client IP and user agent
3. **Instant Enforcement**:
   - Updates to the policy apply immediately to subsequent HTTP collector heartbeats and cross-account queries.

---

## 4. In-VPC Sanitisation Simulator

Under **Consent & Policies** -> **In-VPC Sanitisation Simulator**, administrators can paste sample JSON payloads to preview exactly how the engine scrubs secrets, redacts AWS keys, and strips disabled categories in real time before approving policy modifications.
