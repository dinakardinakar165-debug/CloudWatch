import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { exportToCSV } from '../../services/exportService';
import {
  Layers,
  Search,
  Filter,
  Download,
  Server,
  Database,
  HardDrive,
  Cloud,
  Share2,
} from 'lucide-react';

export const ResourceExplorer: React.FC = () => {
  const { resources, selectedRegion } = useApp();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleExport = () => {
    const exportRows = filtered.map((r) => ({
      ID: r.id,
      Name: r.name,
      Type: r.type,
      Region: r.region,
      State: r.state,
      Health: r.healthStatus,
      CPU: `${r.metrics.cpuUtilization}%`,
      LaunchTime: r.launchTime,
    }));
    exportToCSV('AWS-Resource-Inventory', exportRows);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'AWS::EC2::Instance':
        return Server;
      case 'AWS::RDS::DBInstance':
        return Database;
      case 'AWS::EC2::Volume':
        return HardDrive;
      case 'AWS::S3::Bucket':
        return Cloud;
      default:
        return Share2;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            AWS Unified Resource Explorer
          </h2>
          <p className="text-xs text-[#667085]">
            Consolidated inventory of compute, storage, relational database, and load balancer entities in {selectedRegion}
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E0E5EC] text-xs font-semibold text-[#263445] hover:bg-slate-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#3157C8]" />
          <span>Export Inventory (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#667085]" />
          <input
            type="text"
            placeholder="Search by resource name, identifier, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs outline-none text-[#263445]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#667085]" />
          <span className="text-[#667085] font-semibold">Service Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-[#E0E5EC] rounded px-2.5 py-1 bg-white text-[#263445] outline-none"
          >
            <option value="ALL">All Types ({resources.length})</option>
            <option value="AWS::EC2::Instance">EC2 Instances</option>
            <option value="AWS::RDS::DBInstance">RDS Relational DBs</option>
            <option value="AWS::EC2::Volume">EBS Volumes</option>
            <option value="AWS::ElasticLoadBalancingV2::LoadBalancer">Load Balancers</option>
          </select>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F4F6F9] border-b border-[#E0E5EC] text-[#667085] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Resource Name / ARN</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4">Specs / Type</th>
                <th className="py-3 px-4">CPU / Telemetry</th>
                <th className="py-3 px-4">Region / AZ</th>
                <th className="py-3 px-4">Launch Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5EC]">
              {filtered.map((item) => {
                const Icon = getIconForType(item.type);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded bg-slate-100 text-[#14243A]">
                          <Icon className="w-4 h-4 text-[#3157C8]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#263445]">{item.name}</span>
                          <span className="font-mono text-[11px] text-[#667085]">
                            {item.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#667085]">
                      {item.type.replace('AWS::', '')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-[#263445]">
                        {item.state}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.healthStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#263445]">
                      {item.instanceType || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {item.metrics?.cpuUtilization !== undefined ? (
                        <span
                          className={
                            item.metrics.cpuUtilization > 80
                              ? 'text-rose-700 font-bold'
                              : 'text-[#263445]'
                          }
                        >
                          {item.metrics.cpuUtilization}%
                        </span>
                      ) : (
                        <span className="text-[#667085]">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#667085]">
                      {item.availabilityZone || item.region}
                    </td>
                    <td className="py-3 px-4 text-[#667085] font-mono text-[11px]">
                      {new Date(item.launchTime).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
