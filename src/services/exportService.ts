/**
 * CloudWatch Sentinel - Export & Reporting Service
 * Supports CSV generation, printable executive reports, and PDF documents
 * with explicit Data Source attribution (Demo vs Customer Collector vs Live AWS).
 */

import { jsPDF } from 'jspdf';
import {
  CloudResource,
  CostSummary,
  Pipeline,
  Anomaly,
  Alert,
  OperatingMode,
  DataSourceType,
} from '../types/cloudwatch-sentinel';

export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || rows.length === 0) {
    alert('No data available to export.');
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateExecutivePDF(params: {
  accountAlias: string;
  region: string;
  resources: CloudResource[];
  costSummary: CostSummary;
  pipelines: Pipeline[];
  anomalies: Anomaly[];
  alerts: Alert[];
  operatingMode: OperatingMode;
  dataSource: DataSourceType;
}): void {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(17, 24, 39); // #111827
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CLOUDWATCH SENTINEL', 14, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Privacy-First AWS Cloud Observability & CI/CD Pipeline Intelligence', 14, 21);

  const reportDate = new Date().toLocaleString();
  doc.text(`Generated: ${reportDate}`, 145, 14);
  doc.text(`Tenant: ${params.accountAlias} (${params.region})`, 145, 21);

  // Data Source & Custody Mode Banner
  let y = 37;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  if (params.dataSource === 'DEMO') {
    doc.setTextColor(161, 92, 7); // Warning / Amber
    doc.text('[DATA SOURCE: DEMO MODE — OFFLINE DETERMINISTIC SIMULATION]', 14, y);
  } else if (params.dataSource === 'CUSTOMER_COLLECTOR') {
    doc.setTextColor(49, 87, 200); // Brand Blue
    doc.text('[DATA SOURCE: CUSTOMER-CONTROLLED IN-VPC COLLECTOR — SANITISED INGESTION]', 14, y);
  } else {
    doc.setTextColor(22, 128, 93); // Success / Emerald
    doc.text('[DATA SOURCE: LIVE AWS CROSS-ACCOUNT STS ASSUMEROLE WITH EXTERNAL ID]', 14, y);
  }

  y += 8;
  doc.setDrawColor(224, 229, 236);
  doc.line(14, y, 196, y);

  // Section 1: Executive Summary
  y += 8;
  doc.setTextColor(23, 32, 51);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Infrastructure & FinOps Summary', 14, y);

  y += 7;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 112, 133);

  const healthyCount = params.resources.filter((r) => r.healthStatus === 'HEALTHY').length;
  const criticalCount = params.resources.filter((r) => r.healthStatus === 'CRITICAL').length;
  const warningCount = params.resources.filter((r) => r.healthStatus === 'WARNING').length;

  doc.text(`• Monitored Entities: ${params.resources.length} (${healthyCount} Healthy, ${warningCount} Warning, ${criticalCount} Critical)`, 16, y);
  y += 5.5;
  doc.text(`• MTD Spend: $${params.costSummary.mtdCost.toLocaleString()} USD (Budget: $${params.costSummary.budgetLimit.toLocaleString()} USD, ${params.costSummary.budgetUtilizedPercent}% utilized)`, 16, y);
  y += 5.5;
  doc.text(`• Statistical Anomalies (|Z| >= 1.8 sigma): ${params.anomalies.length} items flagged`, 16, y);
  y += 5.5;
  doc.text(`• Active Incidents / Alarms: ${params.alerts.filter((a) => a.status === 'OPEN').length} requiring attention`, 16, y);

  // Section 2: CI/CD Pipeline Health
  y += 9;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 32, 51);
  doc.text('2. CI/CD CodePipeline Observability (Sanitised Metadata)', 14, y);

  y += 7;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 112, 133);

  const succPipes = params.pipelines.filter((p) => p.status === 'Succeeded').length;
  const failPipes = params.pipelines.filter((p) => p.status === 'Failed').length;
  const inProgPipes = params.pipelines.filter((p) => p.status === 'InProgress').length;

  doc.text(`• CodePipelines Monitored: ${params.pipelines.length} (${succPipes} Passed, ${failPipes} Failed, ${inProgPipes} In Progress)`, 16, y);

  for (const pipe of params.pipelines.slice(0, 3)) {
    y += 5.5;
    const statusText = `[${pipe.status.toUpperCase()}] ${pipe.name} (Duration: ${pipe.durationSeconds || 0}s)`;
    doc.text(`  - ${statusText}`, 20, y);
  }

  // Section 3: Anomaly Evidence
  y += 9;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 32, 51);
  doc.text('3. Gaussian Z-Score Anomaly Evidence', 14, y);

  for (const anom of params.anomalies.slice(0, 2)) {
    y += 6.5;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(196, 50, 50);
    doc.text(`• ${anom.title} [Z = ${anom.zScore.toFixed(2)} sigma]`, 16, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(23, 32, 51);
    const splitExplanation = doc.splitTextToSize(anom.explanation, 175);
    doc.text(splitExplanation, 20, y);
    y += splitExplanation.length * 4;
  }

  // Footer: Academic Attribution
  doc.setDrawColor(224, 229, 236);
  doc.line(14, 270, 196, 270);
  doc.setFontSize(8);
  doc.setTextColor(102, 112, 133);
  doc.text('Kumaraguru College of Technology — Department of Computer Science & Engineering', 14, 276);
  doc.text('Cloud Application and Development | Team: Dinakar S, Kabileshwara Y, Pranesh Sachin M, Santhosh TMA, Nikhil R', 14, 281);
  doc.text('Page 1 of 1', 180, 281);

  doc.save(`CloudWatch-Sentinel-Audit-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
