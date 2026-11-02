import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import {
  Lightbulb,
  DollarSign,
  HardDrive,
  Cpu,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const OptimizationInsights: React.FC = () => {
  const { resources } = useApp();

  const recommendations = [
    {
      id: 'rec-ebs-unattached',
      title: 'Delete Unattached gp3 EBS Volume',
      resource: 'vol-039401a8f902492bb (500 GiB)',
      estimatedMonthlySavings: 40.0,
      risk: 'Low',
      category: 'Storage',
      impact: 'Volume has been idle and unattached for > 80 days since runner teardown.',
      action: 'Create AWS Backup snapshot and execute ec2:DeleteVolume.',
    },
    {
      id: 'rec-ec2-rightsize-worker',
      title: 'Downsize Over-provisioned API Cluster Instance',
      resource: 'i-0a8b9f1234cde5678 (m6i.xlarge)',
      estimatedMonthlySavings: 72.5,
      risk: 'Low',
      category: 'Compute',
      impact: 'Average 30-day CPU utilization is only 14.6% with peak RAM utilization < 45%.',
      action: 'Modify instance type to m6i.large during next planned maintenance window.',
    },
    {
      id: 'rec-cloudwatch-log-retention',
      title: 'Expire CloudWatch Log Groups Never Expiring',
      resource: '/aws/containerinsights/kct-ecs/performance',
      estimatedMonthlySavings: 35.0,
      risk: 'None',
      category: 'CloudWatch',
      impact: '240 GB of raw debug logs stored indefinitely without retention rules.',
      action: 'Apply 30-day log retention policy via PutRetentionPolicy.',
    },
    {
      id: 'rec-gp2-to-gp3',
      title: 'Migrate Legacy EBS gp2 Volumes to gp3',
      resource: '2 legacy volumes across staging cluster',
      estimatedMonthlySavings: 28.0,
      risk: 'Low',
      category: 'Storage',
      impact: 'gp3 offers 20% baseline cost reduction + predictable 3,000 baseline IOPS.',
      action: 'Perform live EBS elastic volume type modification without downtime.',
    },
  ];

  const totalSavings = recommendations.reduce((sum, r) => sum + r.estimatedMonthlySavings, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            AWS FinOps Cost Optimization & Rightsizing
          </h2>
          <p className="text-xs text-[#667085]">
            Automated architectural recommendations to eliminate idle waste and optimize compute reservations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Identified Monthly Savings"
          value={`$${totalSavings.toFixed(2)} / mo`}
          subtitle={`Annual projected reduction: $${(totalSavings * 12).toFixed(2)}`}
          icon={DollarSign}
          accentColor="teal"
        />
        <StatCard
          title="Optimization Candidates"
          value={recommendations.length}
          subtitle="4 actionable recommendations"
          icon={Lightbulb}
          accentColor="blue"
        />
        <StatCard
          title="Implementation Risk"
          value="Zero Downtime"
          subtitle="All modifications non-disruptive"
          icon={CheckCircle2}
          accentColor="teal"
        />
      </div>

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-lg border border-[#E0E5EC] p-5 flex flex-col justify-between shadow-2xs"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-bold text-[#263445] leading-snug">
                  {rec.title}
                </h4>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  Save ${rec.estimatedMonthlySavings.toFixed(2)}/mo
                </span>
              </div>

              <div className="text-xs font-mono text-[#667085] mb-3">
                Target: {rec.resource}
              </div>

              <p className="text-xs text-[#263445] mb-3 leading-relaxed">
                {rec.impact}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E0E5EC] flex items-center justify-between text-xs">
              <span className="text-[#667085]">
                Category: <strong>{rec.category}</strong> · Risk: <strong>{rec.risk}</strong>
              </span>
              <button
                onClick={() => alert(`Remediation guide:\n\n${rec.action}`)}
                className="font-semibold text-[#3157C8] hover:underline flex items-center gap-1"
              >
                Remediate <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
