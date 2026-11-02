-- ==============================================================================
-- CLOUDWATCH SENTINEL - SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Enterprise AWS Cloud Observability, Cost Intelligence & CI/CD Pipeline Monitoring
-- Institution: Kumaraguru College of Technology
-- ==============================================================================

-- 1. CLOUD ACCOUNTS
CREATE TABLE IF NOT EXISTS cloud_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id VARCHAR(12) NOT NULL UNIQUE,
    account_alias VARCHAR(100) NOT NULL,
    role_arn TEXT,
    region VARCHAR(30) DEFAULT 'us-east-1',
    auth_method VARCHAR(30) DEFAULT 'IAM_ROLE',
    status VARCHAR(30) DEFAULT 'NOT_CONFIGURED',
    verified_permissions JSONB DEFAULT '[]'::jsonb,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLOUD RESOURCES (EC2, RDS, EBS, Lambda, S3, ALB)
CREATE TABLE IF NOT EXISTS cloud_resources (
    id VARCHAR(100) PRIMARY KEY,
    account_id VARCHAR(12) REFERENCES cloud_accounts(account_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    region VARCHAR(30) NOT NULL,
    state VARCHAR(50) NOT NULL,
    instance_type VARCHAR(50),
    availability_zone VARCHAR(50),
    launch_time TIMESTAMPTZ,
    tags JSONB DEFAULT '{}'::jsonb,
    health_status VARCHAR(30) DEFAULT 'HEALTHY',
    health_reason TEXT,
    last_collected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cloud_resources_account_type ON cloud_resources(account_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_cloud_resources_health ON cloud_resources(health_status);

-- 3. METRIC SAMPLES (CloudWatch GetMetricData observations)
CREATE TABLE IF NOT EXISTS metric_samples (
    id BIGSERIAL PRIMARY KEY,
    resource_id VARCHAR(100) REFERENCES cloud_resources(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    observation_time TIMESTAMPTZ NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(30) NOT NULL,
    statistic VARCHAR(30) DEFAULT 'Average',
    period_seconds INT DEFAULT 300,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_metric_samples_query ON metric_samples(resource_id, metric_name, observation_time DESC);

-- 4. COST RECORDS (AWS Cost Explorer unblended daily spending)
CREATE TABLE IF NOT EXISTS cost_records (
    id BIGSERIAL PRIMARY KEY,
    account_id VARCHAR(12) REFERENCES cloud_accounts(account_id) ON DELETE CASCADE,
    billing_date DATE NOT NULL,
    service_name VARCHAR(150) NOT NULL,
    unblended_cost NUMERIC(12, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    region VARCHAR(30) DEFAULT 'us-east-1',
    usage_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cost_records_date_service ON cost_records(billing_date, service_name);

-- 5. COST SUMMARIES
CREATE TABLE IF NOT EXISTS cost_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id VARCHAR(12) REFERENCES cloud_accounts(account_id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- e.g. '2026-11'
    mtd_cost NUMERIC(12, 2) NOT NULL,
    forecasted_cost NUMERIC(12, 2) NOT NULL,
    budget_limit NUMERIC(12, 2) NOT NULL DEFAULT 6000.00,
    budget_utilized_percent NUMERIC(5, 2) NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CI/CD CODEPIPELINES
CREATE TABLE IF NOT EXISTS pipelines (
    id VARCHAR(100) PRIMARY KEY,
    account_id VARCHAR(12) REFERENCES cloud_accounts(account_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(30) NOT NULL,
    status VARCHAR(50) NOT NULL,
    last_execution_id VARCHAR(100),
    last_execution_time TIMESTAMPTZ,
    duration_seconds INT,
    tags JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PIPELINE EXECUTIONS
CREATE TABLE IF NOT EXISTS pipeline_executions (
    execution_id VARCHAR(100) PRIMARY KEY,
    pipeline_id VARCHAR(100) REFERENCES pipelines(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_seconds INT,
    trigger_type VARCHAR(50) DEFAULT 'Event',
    trigger_commit_sha VARCHAR(60),
    trigger_author VARCHAR(100),
    trigger_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PIPELINE STAGES
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id BIGSERIAL PRIMARY KEY,
    execution_id VARCHAR(100) REFERENCES pipeline_executions(execution_id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_seconds INT,
    failed_action VARCHAR(150),
    error_message TEXT
);

-- 9. CODEBUILD EXECUTIONS
CREATE TABLE IF NOT EXISTS build_executions (
    id VARCHAR(150) PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    build_number INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_seconds INT,
    compute_type VARCHAR(50),
    image VARCHAR(255),
    failure_reason TEXT,
    phases JSONB DEFAULT '[]'::jsonb,
    logs_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CODEDEPLOY EXECUTIONS
CREATE TABLE IF NOT EXISTS deployment_executions (
    id VARCHAR(100) PRIMARY KEY,
    application_name VARCHAR(150) NOT NULL,
    deployment_group_name VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_seconds INT,
    succeeded_tasks INT DEFAULT 0,
    failed_tasks INT DEFAULT 0,
    rollback_status VARCHAR(50),
    failure_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ANOMALIES (Z-Score Gaussian Math)
CREATE TABLE IF NOT EXISTS anomalies (
    id VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'INFRASTRUCTURE' | 'COST' | 'PIPELINE'
    title VARCHAR(255) NOT NULL,
    target_resource VARCHAR(255) NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    observed_value DOUBLE PRECISION NOT NULL,
    baseline_mean DOUBLE PRECISION NOT NULL,
    baseline_std_dev DOUBLE PRECISION NOT NULL,
    z_score DOUBLE PRECISION NOT NULL,
    unit VARCHAR(30) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    explanation TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    historical_window_points INT DEFAULT 30
);
CREATE INDEX IF NOT EXISTS idx_anomalies_status_severity ON anomalies(status, severity);

-- 12. UNIFIED ALERTS & INCIDENTS
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    source VARCHAR(100) NOT NULL,
    resource_or_pipeline_id VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    supporting_evidence JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(30) DEFAULT 'OPEN',
    suggested_next_action TEXT NOT NULL,
    acknowledged_by VARCHAR(100),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_alerts_status_sev ON alerts(status, severity);

-- 13. MONITORING RULES
CREATE TABLE IF NOT EXISTS monitoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    threshold_value DOUBLE PRECISION NOT NULL,
    comparison_operator VARCHAR(10) NOT NULL, -- '>', '<', '>='
    evaluation_periods INT DEFAULT 1,
    severity VARCHAR(30) DEFAULT 'HIGH',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. COLLECTION RUNS (Worker audit telemetry)
CREATE TABLE IF NOT EXISTS collection_runs (
    id BIGSERIAL PRIMARY KEY,
    collector_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_ms INT,
    status VARCHAR(30) NOT NULL,
    records_collected INT DEFAULT 0,
    error_message TEXT
);

-- 15. EVENT HISTORY (Amazon EventBridge idempotency & webhook store)
CREATE TABLE IF NOT EXISTS event_history (
    event_id VARCHAR(100) PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    detail_type VARCHAR(100) NOT NULL,
    account_id VARCHAR(12) NOT NULL,
    region VARCHAR(30) NOT NULL,
    event_time TIMESTAMPTZ NOT NULL,
    payload JSONB NOT NULL,
    processed_status VARCHAR(30) DEFAULT 'PROCESSED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. USER PROFILES & TEAM ROLES
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'Cloud Engineer',
    department VARCHAR(150) DEFAULT 'Cloud Application and Development',
    institution VARCHAR(255) DEFAULT 'Kumaraguru College of Technology',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY & REALTIME
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_samples ENABLE ROW LEVEL SECURITY;

-- REALTIME PUBLICATION
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE anomalies;
ALTER PUBLICATION supabase_realtime ADD TABLE pipelines;
ALTER PUBLICATION supabase_realtime ADD TABLE cloud_resources;
