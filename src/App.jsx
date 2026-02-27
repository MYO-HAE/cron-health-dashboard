import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Calendar,
  Server,
  Zap,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

// Initial cron data from the system
const initialCronData = [
  {
    id: "794f7270-082d-4243-a42b-859c641f90fa",
    name: "Nightly Build (01:00 KST)",
    schedule: "0 1 * * *",
    lastStatus: "error",
    lastRunAtMs: 1772121600020,
    nextRunAtMs: 1772208000000,
    consecutiveErrors: 2,
    lastError: "Previous execution failed",
    timeoutSeconds: 3600
  },
  {
    id: "3e270eff-7814-4655-9575-f8f486762a31",
    name: "System Health Check (06:00 KST)",
    schedule: "0 6 * * *",
    lastStatus: "error",
    lastRunAtMs: 1772139600016,
    nextRunAtMs: 1772226000000,
    consecutiveErrors: 2,
    lastError: "Slack channels require a channel id",
    timeoutSeconds: 120
  },
  {
    id: "51ace519-4ac1-420e-907e-712d507bdb67",
    name: "Morning Brief (09:00 KST)",
    schedule: "0 8 * * *",
    lastStatus: "error",
    lastRunAtMs: 1772146800015,
    nextRunAtMs: 1772233200000,
    consecutiveErrors: 2,
    lastError: "Job execution timed out",
    timeoutSeconds: 300
  },
  {
    id: "e482a0d5-48f8-44ea-ae75-0c17eff1edec",
    name: "Heartbeat (09:00 KST)",
    schedule: "0 9 * * *",
    lastStatus: "error",
    lastRunAtMs: 1772150400017,
    nextRunAtMs: 1772236800000,
    consecutiveErrors: 2,
    lastError: "Job execution timed out",
    timeoutSeconds: 180
  },
  {
    id: "a530c0cc-2d83-4f07-b494-052c7641f09d",
    name: "Alice Task Executor",
    schedule: "0 10,16 * * *",
    lastStatus: "ok",
    lastRunAtMs: 1772175600024,
    nextRunAtMs: 1772240400000,
    consecutiveErrors: 0,
    lastError: null,
    timeoutSeconds: 600
  },
  {
    id: "1fb3260d-b7fa-49bb-936d-2b6c2f0ca60f",
    name: "Heartbeat (15:00 KST)",
    schedule: "0 15 * * *",
    lastStatus: "ok",
    lastRunAtMs: 1772172000016,
    nextRunAtMs: 1772258400000,
    consecutiveErrors: 0,
    lastError: null,
    timeoutSeconds: 180
  },
  {
    id: "22eccc4e-c047-4553-ac2a-8b47de3273bf",
    name: "Heartbeat (21:00 KST)",
    schedule: "0 21 * * *",
    lastStatus: "ok",
    lastRunAtMs: 1772193600017,
    nextRunAtMs: 1772280000000,
    consecutiveErrors: 0,
    lastError: null,
    timeoutSeconds: 300
  },
  {
    id: "cbe3198c-d487-4750-8a3d-ad21b044a857",
    name: "Weekly Self-Review (Sun 21:00)",
    schedule: "0 21 * * 0",
    lastStatus: "ok",
    lastRunAtMs: 1771761761603,
    nextRunAtMs: 1772366400000,
    consecutiveErrors: 0,
    lastError: null,
    timeoutSeconds: 60
  },
  {
    id: "fb09c240-de73-472d-9054-f304d7329e72",
    name: "Weekly Health Check (Mon 09:00)",
    schedule: "0 9 * * 1",
    lastStatus: "ok",
    lastRunAtMs: 1771804800021,
    nextRunAtMs: 1772409600000,
    consecutiveErrors: 0,
    lastError: null,
    timeoutSeconds: 60
  },
  {
    id: "6e0d5480-6162-4f17-9fc1-c7e59b5a2461",
    name: "Weekly Grant Search",
    schedule: "0 10 * * 1",
    lastStatus: "ok",
    lastRunAtMs: 1771808400020,
    nextRunAtMs: 1772413200000,
    consecutiveErrors: 0,
    lastError: null,
    timeoutSeconds: 60
  }
];

function formatTimestamp(ms) {
  if (!ms) return 'Never';
  const date = new Date(ms);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Asia/Seoul'
  }) + ' KST';
}

function timeAgo(ms) {
  if (!ms) return 'Never';
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getHealthStatus(job) {
  if (job.consecutiveErrors >= 2) return 'critical';
  if (job.consecutiveErrors === 1) return 'warning';
  if (job.lastStatus === 'error') return 'warning';
  return 'healthy';
}

function StatusIcon({ status }) {
  const icons = {
    healthy: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    critical: <XCircle className="w-5 h-5 text-red-400" />
  };
  return icons[status] || icons.warning;
}

function StatusBadge({ status }) {
  const styles = {
    healthy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20'
  };
  const labels = {
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
    green: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/30'
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${colors[color]} p-6`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function CronJobCard({ job, expanded, onToggle }) {
  const status = getHealthStatus(job);
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
    >
      <div 
        onClick={onToggle}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <StatusIcon status={status} />
          <div>
            <h3 className="font-medium text-white">{job.name}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {job.schedule}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {timeAgo(job.lastRunAtMs)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-800 bg-slate-900/30"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Last Run</p>
                <p className="mt-1 text-slate-300">{formatTimestamp(job.lastRunAtMs)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Next Run</p>
                <p className="mt-1 text-slate-300">{formatTimestamp(job.nextRunAtMs)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Timeout</p>
                <p className="mt-1 text-slate-300">{job.timeoutSeconds}s</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Consecutive Errors</p>
                <p className={`mt-1 font-medium ${job.consecutiveErrors > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {job.consecutiveErrors}
                </p>
              </div>
            </div>
            {job.lastError && (
              <div className="px-4 pb-4">
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                  <p className="text-xs text-red-400 font-medium">Last Error</p>
                  <p className="mt-1 text-sm text-red-300">{job.lastError}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function App() {
  const [jobs, setJobs] = useState(initialCronData);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const healthyCount = jobs.filter(j => getHealthStatus(j) === 'healthy').length;
  const warningCount = jobs.filter(j => getHealthStatus(j) === 'warning').length;
  const criticalCount = jobs.filter(j => getHealthStatus(j) === 'critical').length;

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return getHealthStatus(job) === filter;
  });

  const refreshData = () => {
    setLastUpdated(new Date());
    // In a real implementation, this would fetch from the API
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-2">
                <Server className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Cron Health Dashboard</h1>
                <p className="text-xs text-slate-400">OpenClaw Automation Monitor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Updated: {lastUpdated.toLocaleTimeString('en-US', { timeZone: 'Asia/Seoul' })} KST
              </span>
              <button 
                onClick={refreshData}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Jobs" 
            value={jobs.length} 
            subtitle="Active cron jobs"
            icon={Calendar}
            color="blue"
          />
          <StatCard 
            title="Healthy" 
            value={healthyCount} 
            subtitle={`${Math.round(healthyCount/jobs.length*100)}% operational`}
            icon={CheckCircle}
            color="green"
          />
          <StatCard 
            title="Warnings" 
            value={warningCount} 
            subtitle="Needs attention"
            icon={AlertCircle}
            color="amber"
          />
          <StatCard 
            title="Critical" 
            value={criticalCount} 
            subtitle="Requires immediate fix"
            icon={Zap}
            color="red"
          />
        </div>

        {/* Quick Actions */}
        {criticalCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-400">Action Required</h3>
                <p className="mt-1 text-sm text-red-300">
                  {criticalCount} job{criticalCount > 1 ? 's' : ''} with consecutive failures detected. 
                  Check the error details below and fix configuration issues.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'all', label: 'All Jobs', count: jobs.length },
            { key: 'healthy', label: 'Healthy', count: healthyCount },
            { key: 'warning', label: 'Warning', count: warningCount },
            { key: 'critical', label: 'Critical', count: criticalCount }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === key 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Job List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredJobs.map((job) => (
              <CronJobCard
                key={job.id}
                job={job}
                expanded={expandedId === job.id}
                onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No jobs match the selected filter.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-500">
            OpenClaw Nightly Build • February 28, 2026
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Data sourced from Gateway Cron API
          </p>
        </footer>
      </main>
    </div>
  );
}
