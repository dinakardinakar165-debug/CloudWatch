# CloudWatch Sentinel
## Privacy-First AWS Infrastructure, Cost Monitoring and CI/CD Pipeline Intelligence Platform

**Institution**: Kumaraguru College of Technology  
**Department**: Computer Science and Engineering  
**Course**: Cloud Application and Development  

### Student Engineering Team
1. **Dinakar S** — 24BCS405 (Full Stack & Cloud Architecture Lead)
2. **Kabileshwara Y** — 24BCS411 (CI/CD Pipeline & CodeBuild Integration Engineer)
3. **Pranesh Sachin M** — 24BCS415 (CloudWatch Telemetry & Anomaly Analytics Engineer)
4. **Santhosh TMA** — 24BCS247 (Cost Explorer & FinOps Optimization Engineer)
5. **Nikhil R** — 24BCS190 (DevOps, Supabase Realtime & Security Engineer)

---

## 1. Overview & Core Philosophy

Enterprise cloud operations often require multi-account monitoring, cost governance, and CI/CD pipeline observability. However, standard SaaS APM tools demand permanent AWS credentials (`AKIA...`), broad IAM permissions, and external transmission of proprietary code or logs.

**CloudWatch Sentinel** eliminates these risks by enforcing that:
> **"The AWS account owner must retain continuous control over their data, permissions, collection process, and instant revocation of access."**

### Three Operating Modes:
1. **Mode A — Customer-Authorised AWS Cross-Account Integration**: Short-lived AWS STS `AssumeRole` tokens with unique `sts:ExternalId` preventing Confused Deputy vulnerabilities.
2. **Mode B — Customer-Controlled In-VPC Local Collector**: Lightweight Python 3 daemon (`collector/sentinel_collector.py`) executing inside the customer's VPC. Performs in-memory secret scrubbing and field allowlisting before transmitting telemetry via scoped revocable bearer tokens.
3. **Mode C — Offline Deterministic Demonstration Mode (Default)**: Zero-access offline mode with realistic AWS telemetry, strictly labeled with `[DEMO]` badges across all UI components.

---

## 2. Platform Capabilities

- **Strict In-VPC Data Minimisation**: Automatically drops prohibited fields (`password`, `secret_key`, `env_vars`, `source_code`, `raw_logs`) and redacts secret patterns (`AKIA...`, `ghp_...`, Bearer tokens).
- **Statistical Gaussian Anomaly Engine**: Detects deviations using sample standard deviation with Bessel's correction ($N - 1$) and zero-variance flatline guards ($\epsilon = 0.0001$).
- **Customer Consent & Right to Erasure**: GDPR Art. 17 / CCPA compliant 1-click historical telemetry purge.
- **Supabase PostgreSQL & Realtime**: 16-table normalized schema with Row Level Security and live WebSocket telemetry broadcasting.
- **Multi-Role RBAC**: Pre-configured roles for Administrator, Org Owner, Security Reviewer, and Viewer.
- **Executive Audit Reporting**: Instant CSV export and statutory audit PDF generation with clear data source provenance badges.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, jsPDF
- **Backend Microservice**: Python 3.11, FastAPI, Boto3, Uvicorn, Pydantic
- **Customer Collector**: Standalone Python 3 daemon (`collector/sentinel_collector.py`)
- **Database & Realtime**: Supabase Managed PostgreSQL 16 (16 tables with RLS)
- **Deployment**: Render Blueprint (`render.yaml`) for static frontend + FastAPI web service

---

## 4. Verification & Running Commands

```bash
# 1. Install dependencies
npm install

# 2. Run automated security & privacy test suite (33 assertions)
npm test

# 3. TypeScript validation
npm run lint

# 4. Production build check
npm run build

# 5. Start development server on port 3000
npm run dev
```

---

## 5. Comprehensive Documentation Suite

For complete engineering and operational details, refer to the documentation suite:

1. [System Architecture & Trust Boundaries (ARCHITECTURE.md)](./ARCHITECTURE.md)
2. [AWS Cross-Account Integration Guide (AWS_SETUP.md)](./AWS_SETUP.md)
3. [Customer-Controlled In-VPC Collector Setup (CUSTOMER_COLLECTOR_SETUP.md)](./CUSTOMER_COLLECTOR_SETUP.md)
4. [Data Privacy & Minimisation Architecture (DATA_PRIVACY.md)](./DATA_PRIVACY.md)
5. [Data Sharing Policy & Approval Framework (DATA_SHARING_POLICY.md)](./DATA_SHARING_POLICY.md)
6. [Supabase Database & Realtime Setup (SUPABASE_SETUP.md)](./SUPABASE_SETUP.md)
7. [Cloud & Production Deployment Guide (DEPLOYMENT.md)](./DEPLOYMENT.md)
8. [Security Threat Model & Safeguards (SECURITY.md)](./SECURITY.md)
9. [Verification, Security & Unit Testing Suite (TESTING.md)](./TESTING.md)
10. [Ingestion & Management API Reference (API_REFERENCE.md)](./API_REFERENCE.md)

---

## 6. Academic Submission
Submitted to the Department of Computer Science and Engineering, **Kumaraguru College of Technology**, for the course **Cloud Application and Development**.
