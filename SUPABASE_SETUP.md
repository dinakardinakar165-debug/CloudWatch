# CloudWatch Sentinel — Supabase Database & Realtime Setup

**Institution**: Kumaraguru College of Technology  
**Department**: Computer Science and Engineering  
**Course**: Cloud Application and Development  
**Student Team**: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)

---

## 1. Schema Overview

CloudWatch Sentinel uses a normalized, relational PostgreSQL 16 schema structured across 16 core entities:

1. `tenants` — Organization definitions and primary settings.
2. `aws_account_connections` — Cross-account configurations, External IDs, and IAM role ARNs.
3. `cloud_resources` — EC2, RDS, ALB compute resources and health states.
4. `metric_datapoints` — Timeseries metrics (CPU, Memory, Network) with provenance tracking.
5. `cost_records` — Daily spending per service from Cost Explorer.
6. `cost_budgets` — Tenant budget limits, thresholds, and burn rates.
7. `pipelines` — AWS CodePipeline definitions and states.
8. `pipeline_stages` — Multi-stage execution details (Source, Build, Deploy).
9. `build_projects` — AWS CodeBuild project configurations.
10. `build_executions` — Individual build runs, phase durations, and sanitised logs.
11. `anomalies` — Statistical Gaussian Z-score anomalies.
12. `alerts` — CloudWatch alarms and incident status.
13. `collector_registrations` — Registered Mode B collectors and token status.
14. `data_sharing_policies` — Allowlist settings per tenant.
15. `audit_events` — Immutable audit log trail.
16. `deletion_requests` — GDPR/CCPA Right-to-Erasure compliance records.

The schema script is located in `/supabase/schema.sql`.

---

## 2. Setting Up Supabase

### Step 1: Create a Supabase Project
1. Navigate to [https://supabase.com](https://supabase.com) and create a free PostgreSQL project.
2. Under **Project Settings** -> **API**, copy your **Project URL** and **anon public API Key**.

### Step 2: Apply Schema
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Copy the entire contents of `supabase/schema.sql`.
3. Paste and click **Run**.
4. All 16 tables, constraints, indexes, and Row Level Security (RLS) policies will be provisioned.

### Step 3: Enable Realtime Broadcasts
The schema automatically adds high-frequency telemetry tables to `supabase_realtime`:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE metric_datapoints;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE anomalies;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_events;
```

### Step 4: Configure Frontend & Backend
In `.env` or Render environment settings:
```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
