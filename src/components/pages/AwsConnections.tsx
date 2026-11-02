import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  generateCrossAccountTrustPolicy,
  generateLeastPrivilegeIAMPolicy,
  verifyCrossAccountConnection,
  AWSVerificationResult,
} from '../../services/awsClientService';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  Info,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const AwsConnections: React.FC = () => {
  const { account, setAccount, selectedRegion, operatingMode, setOperatingMode, currentUser } = useApp();

  const [roleArn, setRoleArn] = useState(account.roleArn || '');
  const [externalId, setExternalId] = useState(
    account.externalId || `kct-cws-deputy-defense-${Math.random().toString(36).substring(2, 8)}`
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<AWSVerificationResult | null>(null);
  const [copiedTrustPolicy, setCopiedTrustPolicy] = useState(false);
  const [copiedPermissionsPolicy, setCopiedPermissionsPolicy] = useState(false);

  const trustPolicyJson = generateCrossAccountTrustPolicy(externalId);
  const permissionsPolicyJson = generateLeastPrivilegeIAMPolicy();

  const handleCopyTrustPolicy = () => {
    navigator.clipboard.writeText(trustPolicyJson);
    setCopiedTrustPolicy(true);
    setTimeout(() => setCopiedTrustPolicy(false), 3000);
  };

  const handleCopyPermissionsPolicy = () => {
    navigator.clipboard.writeText(permissionsPolicyJson);
    setCopiedPermissionsPolicy(true);
    setTimeout(() => setCopiedPermissionsPolicy(false), 3000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationResult(null);

    const result = await verifyCrossAccountConnection(roleArn, externalId, selectedRegion);
    setVerificationResult(result);
    setIsVerifying(false);

    if (result.success) {
      setAccount({
        accountId: result.accountId || '124890374182',
        accountAlias: result.accountAlias || 'customer-aws-prod',
        roleArn,
        externalId,
        region: selectedRegion,
        status: 'CONNECTED',
        authMethod: 'IAM_ROLE_EXTERNAL_ID',
        lastVerifiedAt: new Date().toISOString(),
        verifiedPermissions: result.permissions.map((p) => p.action),
        operatingMode: 'MODE_A_CROSS_ACCOUNT',
        dataSource: 'LIVE_AWS',
      });
      setOperatingMode('MODE_A_CROSS_ACCOUNT');
    }
  };

  const handleDisconnect = () => {
    setAccount({
      accountId: '',
      accountAlias: '',
      region: selectedRegion,
      status: 'NOT_CONFIGURED',
      authMethod: 'IAM_ROLE_EXTERNAL_ID',
      verifiedPermissions: [],
      operatingMode: 'MODE_A_CROSS_ACCOUNT',
      dataSource: 'LIVE_AWS',
    });
    setRoleArn('');
    setVerificationResult(null);
  };

  const isViewer = currentUser.role === 'Viewer';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#172033]">
            Mode A: Customer-Authorised Cross-Account IAM Role
          </h2>
          <p className="text-xs text-[#667085]">
            Strictly read-only AWS STS AssumeRole integration using customer-provided External ID to eliminate Confused Deputy risk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#667085]">CONNECTION STATE:</span>
          <StatusBadge status={account.status} />
        </div>
      </div>

      {/* Confused Deputy & Privacy Safeguards Notice */}
      <div className="bg-[#F5F7FA] border border-[#E0E5EC] rounded-lg p-4 text-xs flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#3157C8] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="font-bold text-[#172033]">
            Cross-Account Security & Zero-Permanent-Credential Guarantee:
          </span>
          <p className="text-[#667085] leading-relaxed">
            1. CloudWatch Sentinel <strong>never requests or stores permanent AWS Access Keys</strong>.<br />
            2. Customer creates an IAM Role in their own AWS account with an <strong>External ID</strong> constraint.<br />
            3. Sentinel backend assumes the role strictly via <code className="bg-white px-1 py-0.5 rounded border border-slate-200">sts:AssumeRole</code> for temporary 15-minute read-only credentials.<br />
            4. Access can be revoked instantly at any time by deleting or modifying the trust relationship in the AWS Console.
          </p>
        </div>
      </div>

      {/* Main Grid: Connection Form vs Trust Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 6 Cols */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#172033] pb-2 border-b border-[#E0E5EC] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#3157C8]" />
              Role Assumption Credentials
            </h3>

            <form onSubmit={handleVerify} className="mt-4 flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-[#667085] uppercase tracking-wider block mb-1">
                  Customer IAM Role ARN
                </label>
                <input
                  type="text"
                  required
                  placeholder="arn:aws:iam::123456789012:role/CloudWatchSentinelMonitoringRole"
                  value={roleArn}
                  onChange={(e) => setRoleArn(e.target.value)}
                  disabled={isViewer}
                  className="w-full font-mono border border-[#E0E5EC] rounded-md px-3 py-2 outline-none focus:border-[#3157C8]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#667085] uppercase tracking-wider block mb-1">
                  External ID (Confused Deputy Mitigation)
                </label>
                <input
                  type="text"
                  required
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                  disabled={isViewer}
                  className="w-full font-mono border border-[#E0E5EC] rounded-md px-3 py-2 outline-none focus:border-[#3157C8] bg-slate-50"
                />
                <span className="text-[10px] text-[#667085] mt-1 block">
                  Must match the StringEquals condition in your IAM role trust relationship.
                </span>
              </div>

              <div>
                <label className="font-semibold text-[#667085] uppercase tracking-wider block mb-1">
                  Configured AWS Region
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedRegion}
                  className="w-full font-mono border border-[#E0E5EC] rounded-md px-3 py-2 bg-slate-50 text-[#667085]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isVerifying || isViewer}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-[#3157C8] hover:bg-[#2544A8] text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying AWS STS AssumeRole...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Connect Role</span>
                    </>
                  )}
                </button>

                {account.status === 'CONNECTED' && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={isViewer}
                    className="py-2 px-3 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Verification Feedback */}
          {verificationResult && (
            <div
              className={`p-3.5 rounded-md border text-xs flex flex-col gap-2 ${
                verificationResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {verificationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  {verificationResult.success
                    ? 'Cross-Account IAM Role Verified'
                    : 'Role Assumption Verification Failed'}
                </span>
              </div>

              {verificationResult.errorMessage && (
                <p className="font-mono text-[11px] text-rose-900">
                  {verificationResult.errorMessage}
                </p>
              )}

              {verificationResult.success && (
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] pt-1 border-t border-emerald-200">
                  {verificationResult.permissions.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="text-emerald-700">✓</span>
                      <span>{p.action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Policies: 6 Cols */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Trust Policy */}
          <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E0E5EC]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                1. IAM Role Trust Policy (Copy to AWS)
              </span>
              <button
                onClick={handleCopyTrustPolicy}
                className="flex items-center gap-1 text-xs font-semibold text-[#3157C8] hover:underline"
              >
                {copiedTrustPolicy ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#111827] text-slate-200 p-3 rounded-md font-mono text-[11px] max-h-44 overflow-y-auto leading-relaxed border border-slate-700">
              {trustPolicyJson}
            </pre>
          </div>

          {/* Read-Only Permissions Policy */}
          <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E0E5EC]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                2. Read-Only IAM Permissions Policy
              </span>
              <button
                onClick={handleCopyPermissionsPolicy}
                className="flex items-center gap-1 text-xs font-semibold text-[#3157C8] hover:underline"
              >
                {copiedPermissionsPolicy ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#111827] text-slate-200 p-3 rounded-md font-mono text-[11px] max-h-44 overflow-y-auto leading-relaxed border border-slate-700">
              {permissionsPolicyJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
