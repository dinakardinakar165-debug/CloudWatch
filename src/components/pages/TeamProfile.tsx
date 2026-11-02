import React from 'react';
import { TEAM_MEMBERS } from '../../data/mockEnterpriseData';
import {
  GraduationCap,
  Users,
  Award,
  Layers,
  BookOpen,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const TeamProfile: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Institution Banner */}
      <div className="bg-[#14243A] text-white rounded-lg p-6 shadow-sm border border-[#0D1929] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#3157C8] flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
              Academic Project Submission
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans mt-0.5">
              Kumaraguru College of Technology
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Department of Computer Science and Engineering · Subject: Cloud Application and Development
            </p>
          </div>
        </div>

        <div className="bg-white/10 px-4 py-2.5 rounded-lg border border-white/10 text-xs font-mono flex flex-col gap-0.5">
          <span className="text-slate-400 text-[10px]">PROJECT IDENTITY:</span>
          <span className="font-bold text-white text-sm">CloudWatch Sentinel</span>
          <span className="text-cyan-300 text-[10px]">Unified AWS Observability Platform</span>
        </div>
      </div>

      {/* Project Abstract */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#263445] pb-2 border-b border-[#E0E5EC] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#3157C8]" />
          Project Abstract & Architectural Scope
        </h3>
        <p className="text-xs text-[#263445] leading-relaxed">
          <strong>CloudWatch Sentinel</strong> is an enterprise-grade cloud observability platform architected for distributed AWS environments. It provides real-time cross-system visibility by continuously aggregating telemetry across <strong>AWS CloudWatch metrics</strong> (hypervisor compute, status check failures, network I/O), <strong>AWS Cost Explorer</strong> (unblended daily expenditure, budget burn rates, forecasting), and <strong>AWS CI/CD release pipelines</strong> (CodePipeline multi-stage progression, CodeBuild container phases, and CodeDeploy traffic shifting). The platform incorporates a <strong>Gaussian Z-score statistical anomaly detection engine</strong> [Z = (x - μ) / σ] to uncover unusual cost surges and pipeline execution latency regressions, paired with <strong>Supabase PostgreSQL</strong> for durable persistence and <strong>Supabase Realtime WebSockets</strong> for instant operational alerting.
        </p>
      </div>

      {/* Student Engineering Team */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#263445] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#3157C8]" />
            Student Engineering Team (CSE - Batch 2024-2028)
          </h3>
          <span className="text-xs font-mono text-[#667085]">5 Members</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-[#E0E5EC] p-4 shadow-2xs flex items-start gap-3 hover:border-[#3157C8] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#14243A] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {member.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-[#263445]">{member.name}</span>
                <span className="font-mono text-xs font-semibold text-[#3157C8]">
                  {member.rollNumber}
                </span>
                <span className="text-[11px] text-[#667085] mt-1 leading-snug">
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Specs */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#263445] pb-2 border-b border-[#E0E5EC] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#168C83]" />
          Production Technology Stack & Deployment Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded bg-[#F4F6F9] border border-[#E0E5EC]">
            <span className="text-[#667085] block font-mono text-[10px] uppercase font-bold">
              Frontend Client
            </span>
            <span className="font-bold text-[#263445] block mt-1">
              React 19 + TypeScript + Vite
            </span>
            <span className="text-[#667085] text-[11px] block mt-0.5">
              Tailwind CSS, SVG charting, Lucide icons, jsPDF
            </span>
          </div>

          <div className="p-3 rounded bg-[#F4F6F9] border border-[#E0E5EC]">
            <span className="text-[#667085] block font-mono text-[10px] uppercase font-bold">
              Backend Microservice
            </span>
            <span className="font-bold text-[#263445] block mt-1">
              Python FastAPI / Node TS
            </span>
            <span className="text-[#667085] text-[11px] block mt-0.5">
              boto3, Uvicorn, Pydantic, SQLAlchemy, Render Web Service
            </span>
          </div>

          <div className="p-3 rounded bg-[#F4F6F9] border border-[#E0E5EC]">
            <span className="text-[#667085] block font-mono text-[10px] uppercase font-bold">
              Persistence & Eventing
            </span>
            <span className="font-bold text-[#263445] block mt-1">
              Supabase PostgreSQL
            </span>
            <span className="text-[#667085] text-[11px] block mt-0.5">
              Realtime WebSockets, RLS, 16 tables, EventBridge Bus
            </span>
          </div>

          <div className="p-3 rounded bg-[#F4F6F9] border border-[#E0E5EC]">
            <span className="text-[#667085] block font-mono text-[10px] uppercase font-bold">
              AWS Integrations
            </span>
            <span className="font-bold text-[#263445] block mt-1">
              Boto3 / STS / CloudWatch
            </span>
            <span className="text-[#667085] text-[11px] block mt-0.5">
              Cost Explorer, CodePipeline, CodeBuild, CodeDeploy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
