import { useState, useRef, useEffect } from "react";
import altriumLogo from "@/imports/Altrium-logo-1-1024x268.png";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "Sales Manager" | "Sales Rep" | "Tech Lead" | "Finance Officer" | "Admin";
type View = "dashboard" | "leads" | "deals" | "users" | "assessments" | "resources";

const ROLES: Role[] = ["Sales Manager", "Sales Rep", "Tech Lead", "Finance Officer", "Admin"];

const ROLE_COLORS: Record<Role, string> = {
  "Sales Manager": "#1ed760",
  "Sales Rep": "#34d399",
  "Tech Lead": "#1a6fe8",
  "Finance Officer": "#a78bfa",
  "Admin": "#fc4f37",
};

const ROLE_INITIALS: Record<Role, string> = {
  "Sales Manager": "SM",
  "Sales Rep": "SR",
  "Tech Lead": "TL",
  "Finance Officer": "FO",
  "Admin": "AD",
};

// ─── Nav config per role ──────────────────────────────────────────────────────

type NavItem = { label: string; view: View; icon: string };

const ROLE_NAV: Record<Role, NavItem[]> = {
  "Sales Manager": [
    { label: "Dashboard",    view: "dashboard",    icon: "⬡" },
    { label: "Leads",        view: "leads",        icon: "◎" },
    { label: "Assessments",  view: "assessments",  icon: "◉" },
    { label: "Deals",        view: "deals",        icon: "◈" },
  ],
  "Sales Rep": [
    { label: "Dashboard",    view: "dashboard",    icon: "⬡" },
    { label: "My Leads",     view: "leads",        icon: "◎" },
  ],
  "Tech Lead": [
    { label: "Dashboard",    view: "dashboard",    icon: "⬡" },
    { label: "Assessments",  view: "assessments",  icon: "◉" },
    { label: "Resources",    view: "resources",    icon: "◷" },
  ],
  "Finance Officer": [
    { label: "Dashboard",    view: "dashboard",    icon: "⬡" },
    { label: "Assessments",  view: "assessments",  icon: "◉" },
  ],
  "Admin": [
    { label: "Dashboard",    view: "dashboard",    icon: "⬡" },
    { label: "Users",        view: "users",        icon: "◎" },
    { label: "Leads",        view: "leads",        icon: "◐" },
  ],
};


type AssessmentRecord = {
  id: number;
  leadName: string;
  type: "Technical" | "Financial";
  status: "Pending" | "In Review" | "Submitted" | "Approved" | "Rejected";
  risk: "Low" | "Medium" | "High";
  assessor: string;
  date: string;
  notes: string;
};

const ASSESSMENTS: AssessmentRecord[] = [
  { id: 1, leadName: "Meridian Holdings",  type: "Technical",  status: "Submitted",  risk: "Medium", assessor: "Ravidu Pasan",    date: "Aug 14", notes: "Architecture is sound. Redis cache layer recommended. Medium complexity." },
  { id: 2, leadName: "CloudBridge Inc.",   type: "Financial",  status: "Pending",    risk: "High",   assessor: "Hashmath Fazli",  date: "—",      notes: "" },
  { id: 3, leadName: "NexGen Pharma",      type: "Technical",  status: "In Review",  risk: "Low",    assessor: "Ravidu Pasan",    date: "Aug 11", notes: "Reviewing integration requirements." },
  { id: 4, leadName: "Orbit Retail Ltd",   type: "Financial",  status: "Submitted",  risk: "Low",    assessor: "Hashmath Fazli",  date: "Aug 8",  notes: "Margins acceptable. Recommend proceeding." },
  { id: 5, leadName: "Apex Dynamics",      type: "Technical",  status: "Approved",   risk: "Low",    assessor: "Ravidu Pasan",    date: "Aug 6",  notes: "Clean requirements. Straightforward implementation." },
];

const RESOURCES = [
  { id: 1,  name: "Ravidu Pasan",        role: "Tech Lead",       skills: ["React", "Node.js", "AWS", "TypeScript"],        availability: "80%", project: "Meridian ERP" },
  { id: 4,  name: "Chamil Wijeratne",    role: "Senior Engineer", skills: ["Java", "Spring Boot", "Kubernetes", "CI/CD"],   availability: "70%", project: "Meridian ERP" },
  { id: 5,  name: "Dulith Abeywickrama", role: "Full-Stack Dev",  skills: ["Vue.js", "Django", "PostgreSQL", "Redis"],      availability: "60%", project: "NexGen CRM" },
  { id: 6,  name: "Thilini Gunarathna",  role: "Frontend Dev",    skills: ["React", "Figma", "TailwindCSS", "Storybook"],   availability: "90%", project: "—" },
  { id: 7,  name: "Nuwan Ekanayake",     role: "Backend Dev",     skills: ["Go", "gRPC", "MySQL", "Terraform"],             availability: "40%", project: "CloudBridge" },
  { id: 8,  name: "Rashmi Bandara",      role: "QA Engineer",     skills: ["Selenium", "Cypress", "Jest", "Postman"],       availability: "75%", project: "Orbit Analytics" },
  { id: 9,  name: "Lasith Maduwantha",   role: "DevOps Engineer", skills: ["AWS", "Docker", "Jenkins", "Ansible"],          availability: "55%", project: "Apex DevOps" },
  { id: 10, name: "Kaveesha Jayasena",   role: "Data Engineer",   skills: ["Spark", "Airflow", "Snowflake", "dbt"],         availability: "85%", project: "—" },
  { id: 11, name: "Prageeth Nissanka",   role: "Mobile Dev",      skills: ["React Native", "Swift", "Kotlin", "Firebase"],  availability: "65%", project: "NexGen CRM" },
];

// ─── Chips ────────────────────────────────────────────────────────────────────

function LeadStatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    New:         "bg-[#1ed76020] text-[#1ed760] border-[#1ed76030]",
    Contacted:   "bg-[#1a6fe820] text-[#60a5fa] border-[#1a6fe830]",
    Assessment:  "bg-[#f59e0b20] text-[#f59e0b] border-[#f59e0b30]",
    Closed:      "bg-[#22222e] text-[#7a7a90] border-[#22222e]",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}

function PriorityChip({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    High: "text-[#fc4f37]",
    Medium: "text-[#f59e0b]",
    Low: "text-[#7a7a90]",
  };
  return <span className={`text-xs font-semibold uppercase tracking-wider ${map[priority] ?? ""}`}>{priority}</span>;
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "#1ed760",
    Inactive: "#7a7a90",
    "In Progress": "#1a6fe8",
    "To Do": "#7a7a90",
    Done: "#1ed760",
    "On Hold": "#fc4f37",
    Planning: "#f59e0b",
    Completed: "#1ed760",
    Submitted: "#1a6fe8",
    Pending: "#f59e0b",
    "In Review": "#a78bfa",
    Approved: "#1ed760",
  };
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: map[status] ?? "#7a7a90" }} />
      <span className="text-sm text-[var(--foreground)]">{status}</span>
    </span>
  );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ background: accent }} />
      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
        {value}
      </span>
      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        {sub}
      </span>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color = "var(--primary)" }: { value: number; color?: string }) {
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

// ─── Views ────────────────────────────────────────────────────────────────────

function DashboardView({ role, activityLog }: { role: Role; activityLog: { time: string; event: string; type: string }[] }) {
  const kpiSets: Record<Role, { label: string; value: string; sub: string; accent: string }[]> = {
    "Sales Manager": [
      { label: "Active Leads", value: "47", sub: "+8 this week", accent: "#1ed760" },
      { label: "Deals in Pipeline", value: "12", sub: "$1.07M total value", accent: "#1a6fe8" },
      { label: "Win Rate", value: "38%", sub: "vs 31% last quarter", accent: "#fc4f37" },
      { label: "Avg Deal Size", value: "$89K", sub: "↑ $12K from last month", accent: "#a78bfa" },
    ],
    "Tech Lead": [
      { label: "Pending Assessments", value: "5", sub: "2 high priority", accent: "#1a6fe8" },
      { label: "Active Projects", value: "3", sub: "1 at risk", accent: "#fc4f37" },
      { label: "Skills Gaps Flagged", value: "7", sub: "across 2 projects", accent: "#f59e0b" },
      { label: "Docs Uploaded", value: "23", sub: "this month", accent: "#1ed760" },
    ],
    "Finance Officer": [
      { label: "Deals Under Review", value: "4", sub: "$690K total exposure", accent: "#a78bfa" },
      { label: "Assessments Done", value: "11", sub: "this quarter", accent: "#1ed760" },
      { label: "Pending Approvals", value: "2", sub: "avg 3.2 days to close", accent: "#f59e0b" },
      { label: "Total Deal Value", value: "$1.07M", sub: "pipeline this quarter", accent: "#1a6fe8" },
    ],
    "Admin": [
      { label: "Total Users", value: "32", sub: "4 inactive", accent: "#fc4f37" },
      { label: "New This Month", value: "5", sub: "3 pending activation", accent: "#1ed760" },
      { label: "Roles Assigned", value: "100%", sub: "all users have a role", accent: "#1a6fe8" },
      { label: "Password Resets", value: "3", sub: "last 30 days", accent: "#f59e0b" },
    ],
    "Sales Rep": [
      { label: "My Open Leads", value: "3", sub: "2 need follow-up", accent: "#34d399" },
      { label: "My Active Deals", value: "2", sub: "$178K in pipeline", accent: "#1a6fe8" },
      { label: "Follow-ups Due", value: "4", sub: "1 overdue", accent: "#fc4f37" },
      { label: "Closed This Month", value: "1", sub: "Apex DevOps Pipeline", accent: "#f59e0b" },
    ],
  };

  const kpis = kpiSets[role];

  const actColor: Record<string, string> = {
    lead: "#1ed760", deal: "#1a6fe8", assess: "#a78bfa", user: "#f59e0b", project: "#fc4f37",
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Good morning 👋</h2>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Here's what's happening across your pipeline today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Pipeline funnel */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--muted-foreground)" }}>
            Deal Stage Distribution
          </h3>
          {[
            { stage: "Technical Review", count: 2, value: "$454K", pct: 85 },
            { stage: "Financial Review", count: 1, value: "$330K", pct: 65 },
            { stage: "Negotiation", count: 2, value: "$265K", pct: 50 },
            { stage: "Proposal", count: 1, value: "$210K", pct: 38 },
            { stage: "Closed Won", count: 1, value: "$45K", pct: 20 },
          ].map((row) => (
            <div key={row.stage} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{row.stage}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{row.count} deal{row.count !== 1 ? "s" : ""}</span>
                  <span className="font-mono text-xs font-semibold" style={{ color: "var(--primary)" }}>{row.value}</span>
                </div>
              </div>
              <ProgressBar value={row.pct} />
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--muted-foreground)" }}>
            Recent Activity
          </h3>
          <div className="flex flex-col gap-4">
            {activityLog.map((a, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: actColor[a.type] }} />
                <div>
                  <p className="text-sm leading-snug">{a.event}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadDetailPanel({ lead, onClose }: { lead: typeof LEADS[number] | null; onClose: () => void }) {
  if (!lead) return null;

  const statusColors: Record<string, string> = {
    New: "#1ed760", Contacted: "#60a5fa", Assessment: "#f59e0b", Closed: "#7a7a90",
  };
  const color = statusColors[lead.status] ?? "#7a7a90";

  const fields = [
    { label: "Company", value: lead.name },
    { label: "Primary Contact", value: lead.contact },
    { label: "Deal Value", value: lead.value },
    { label: "Status", value: lead.status, colored: true },
    { label: "Assigned To", value: lead.rep || "Unassigned" },
    { label: "Date Added", value: lead.date },
  ];

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="ml-auto h-full w-full max-w-md flex flex-col overflow-y-auto"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: color + "20", color }}
            >
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10] transition-colors" style={{ color: "var(--muted-foreground)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          <h2 className="text-xl font-bold tracking-tight">{lead.name}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium border"
              style={{ background: color + "20", color, borderColor: color + "40" }}
            >
              {lead.status}
            </span>
            <span className="text-xs font-mono font-semibold" style={{ color: "var(--primary)" }}>{lead.value}</span>
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Company Info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>Company Info</p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              {[
                { label: "Company Name", value: lead.name },
                { label: "Industry", value: "Technology" },
                { label: "Company Size", value: "51–200 employees" },
                { label: "Region", value: "Asia Pacific" },
              ].map((f, i, arr) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    background: i % 2 === 0 ? "var(--card)" : "var(--muted)",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{f.label}</span>
                  <span className="text-sm font-medium">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>Contact Info</p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              {[
                { label: "Contact Name", value: lead.contact },
                { label: "Email", value: lead.contact.toLowerCase().replace(" ", ".") + "@" + lead.name.toLowerCase().replace(/\s+/g, "") + ".com" },
                { label: "Phone", value: "+94 77 " + Math.floor(1000000 + Math.random() * 9000000) },
                { label: "Role", value: "Head of Operations" },
              ].map((f, i, arr) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    background: i % 2 === 0 ? "var(--card)" : "var(--muted)",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{f.label}</span>
                  <span className="text-sm font-medium">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deal Details */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>Deal Details</p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              {[
                { label: "Deal Value", value: lead.value },
                { label: "Status", value: lead.status },
                { label: "Assigned Rep", value: lead.rep || "Unassigned" },
                { label: "Date Added", value: lead.date },
                { label: "Source", value: "Inbound — Website" },
                { label: "Expected Close", value: "Q4 2026" },
              ].map((f, i, arr) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    background: i % 2 === 0 ? "var(--card)" : "var(--muted)",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{f.label}</span>
                  <span className="text-sm font-medium" style={f.label === "Deal Value" ? { color: "var(--primary)", fontFamily: "monospace" } : {}}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity timeline */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>Recent Activity</p>
            <div className="flex flex-col gap-3">
              {[
                { time: "Today", event: "Lead status updated to " + lead.status, icon: "◎" },
                { time: "2 days ago", event: "Rep " + (lead.rep || "—") + " assigned", icon: "◉" },
                { time: lead.date, event: "Lead created by " + lead.assigned, icon: "◫" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-sm mt-0.5 shrink-0" style={{ color: "var(--primary)" }}>{a.icon}</span>
                  <div>
                    <p className="text-sm">{a.event}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadsView({
  leads,
  onNewLead,
  onAssignRep,
  onDeleteLead,
  onConvertLead,
  isSalesRep,
  isSalesManager,
  repName,
  onSubmitForAssessment,
  onUpdateStatus,
}: {
  leads: typeof LEADS;
  onNewLead: () => void;
  onAssignRep: (leadId: number, rep: string) => void;
  onDeleteLead?: (id: number) => void;
  onConvertLead?: (lead: typeof LEADS[number]) => void;
  isSalesRep?: boolean;
  isSalesManager?: boolean;
  repName?: string;
  onSubmitForAssessment?: (leadId: number) => void;
  onUpdateStatus?: (leadId: number, status: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [repFilter, setRepFilter] = useState("All");
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [detailLead, setDetailLead] = useState<typeof LEADS[number] | null>(null);

  const statuses = ["All", "New", "Contacted", "Assessment", "Closed"];

  const visibleLeads = isSalesRep ? leads.filter((l) => l.rep === repName) : leads;
  const filtered = visibleLeads.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    const matchRep = repFilter === "All" || l.rep === repFilter;
    return matchSearch && matchStatus && matchRep;
  });

  return (
    <>
    <LeadDetailPanel lead={detailLead} onClose={() => setDetailLead(null)} />
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{isSalesRep ? "My Leads" : "Leads"}</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {isSalesRep
              ? `${filtered.length} leads assigned to you`
              : `${leads.length} total leads in pipeline`}
          </p>
        </div>
        {isSalesManager && (
          <button
            onClick={onNewLead}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            + New Lead
          </button>
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by company or contact…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", minWidth: 220 }}
        />
        {isSalesManager && (
          <>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: statusFilter === "All" ? "var(--muted-foreground)" : "var(--foreground)" }}
            >
              {statuses.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
            </select>
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: repFilter === "All" ? "var(--muted-foreground)" : "var(--foreground)" }}
            >
              <option value="All">All Reps</option>
              {SALES_REPS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {(statusFilter !== "All" || repFilter !== "All") && (
              <button
                onClick={() => { setStatusFilter("All"); setRepFilter("All"); }}
                className="text-xs px-3 py-2.5 rounded-lg font-medium transition-colors hover:opacity-80"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
              >
                Clear filters
              </button>
            )}
          </>
        )}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              {(isSalesRep
                ? ["Company", "Contact", "Value", "Status", "Assigned Rep", "Date"]
                : ["Company", "Contact", "Value", "Status", "Sales Rep", "Date", "Action"]
              ).map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr
                key={l.id}
                className="transition-colors hover:bg-[#1ed76008] cursor-pointer"
                style={{
                  background: i % 2 === 0 ? "var(--card)" : "var(--background)",
                  borderBottom: "1px solid var(--border)",
                }}
                onClick={() => setDetailLead(l)}
              >
                <td className="px-5 py-4 font-medium">{l.name}</td>
                <td className="px-5 py-4" style={{ color: "var(--muted-foreground)" }}>{l.contact}</td>
                <td className="px-5 py-4 font-mono font-semibold" style={{ color: "var(--primary)" }}>{l.value}</td>
                <td className="px-5 py-4">
                  {isSalesRep && l.status !== "Assessment" && l.status !== "Closed" && onUpdateStatus ? (
                    <select
                      value={l.status}
                      onChange={(e) => onUpdateStatus(l.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg outline-none"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                    </select>
                  ) : (
                    <LeadStatusChip status={l.status} />
                  )}
                </td>
                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                  {isSalesRep ? (
                    <span style={{ color: "var(--muted-foreground)" }}>{l.rep}</span>
                  ) : (
                    <div className="relative">
                      {assigningId === l.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            autoFocus
                            defaultValue={l.rep}
                            onChange={(e) => { onAssignRep(l.id, e.target.value); setAssigningId(null); }}
                            onBlur={() => setAssigningId(null)}
                            className="text-xs px-2 py-1.5 rounded-lg outline-none"
                            style={{ background: "var(--muted)", border: "1px solid var(--primary)", color: "var(--foreground)" }}
                          >
                            <option value="">Unassigned</option>
                            {SALES_REPS.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningId(l.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors hover:bg-[#34d39920]"
                          style={{
                            color: l.rep ? "#34d399" : "var(--muted-foreground)",
                            border: "1px solid",
                            borderColor: l.rep ? "#34d39940" : "var(--border)",
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.rep ? "#34d399" : "var(--border)" }} />
                          {l.rep || "Assign rep"}
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{l.date}</td>
                {!isSalesRep && (
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {isSalesManager && l.status === "Contacted" && onSubmitForAssessment && (
                        <button
                          onClick={() => onSubmitForAssessment(l.id)}
                          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all hover:opacity-80"
                          style={{ background: "#a78bfa20", color: "#a78bfa", border: "1px solid #a78bfa30" }}
                        >
                          Submit
                        </button>
                      )}
                      {onConvertLead && (
                        <button
                          onClick={() => onConvertLead(l)}
                          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all hover:opacity-80"
                          style={{ background: "#1a6fe820", color: "#60a5fa", border: "1px solid #1a6fe830" }}
                        >
                          → Deal
                        </button>
                      )}
                      {isSalesManager && onDeleteLead && (
                        confirmDeleteId === l.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { onDeleteLead(l.id); setConfirmDeleteId(null); }}
                              className="text-xs px-2 py-1 rounded-lg font-semibold"
                              style={{ background: "#fc4f37", color: "#fff" }}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs px-2 py-1 rounded-lg"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(l.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors hover:bg-[#fc4f3720] hover:text-[#fc4f37]"
                            style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                            title="Delete lead"
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 2.5h7M4 2.5V2a1 1 0 0 1 2 0v.5M8 2.5l-.5 6a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5L2 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}

function DealsView({
  deals,
  onNewDeal,
  onConvertDeal,
  isSalesRep,
  isSalesManager,
}: {
  deals: typeof DEALS;
  onNewDeal?: () => void;
  onConvertDeal?: (deal: typeof DEALS[number]) => void;
  isSalesRep?: boolean;
  isSalesManager?: boolean;
}) {
  const stageColors: Record<string, string> = {
    "Technical Review": "#1a6fe8",
    "Financial Review": "#a78bfa",
    "Negotiation": "#f59e0b",
    "Proposal": "#38bdf8",
    "Closed Won": "#1ed760",
    "Closed Lost": "#7a7a90",
  };

  const totalValue = deals
    .filter((d) => !["Closed Lost"].includes(d.stage))
    .reduce((sum, d) => sum + parseInt(d.value.replace(/[$,]/g, "") || "0"), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{isSalesRep ? "My Deals" : "Deals"}</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {deals.length} {isSalesRep ? "deals assigned to you" : "active deals"} · ${(totalValue / 1000).toFixed(0)}K pipeline
          </p>
        </div>
        {onNewDeal && (
          <button
            onClick={onNewDeal}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            + New Deal
          </button>
        )}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              {(isSalesManager && onConvertDeal
                ? ["Deal", "Client", "Stage", "Value", "Priority", "Due", "Action"]
                : ["Deal", "Client", "Stage", "Value", "Priority", "Due"]
              ).map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deals.map((d, i) => (
              <tr
                key={d.id}
                className="transition-colors hover:bg-[#1ed76008] cursor-pointer"
                style={{
                  background: i % 2 === 0 ? "var(--card)" : "var(--background)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <td className="px-5 py-4 font-medium">{d.name}</td>
                <td className="px-5 py-4" style={{ color: "var(--muted-foreground)" }}>{d.client}</td>
                <td className="px-5 py-4">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: stageColors[d.stage] + "20",
                      color: stageColors[d.stage],
                    }}
                  >
                    {d.stage}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono font-semibold" style={{ color: "var(--primary)" }}>{d.value}</td>
                <td className="px-5 py-4"><PriorityChip priority={d.priority} /></td>
                <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{d.due}</td>
                {isSalesManager && onConvertDeal && (
                  <td className="px-5 py-4">
                    {d.stage === "Closed Won" ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onConvertDeal(d); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity hover:opacity-80"
                        style={{ background: "#1a6fe820", color: "#1a6fe8", border: "1px solid #1a6fe840" }}
                      >
                        → Project
                      </button>
                    ) : (
                      <span style={{ color: "var(--muted-foreground)" }}>—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectsView({
  projects,
  isTechLead,
  onAllocate,
}: {
  projects: typeof PROJECTS;
  isTechLead?: boolean;
  onAllocate?: (project: typeof PROJECTS[number]) => void;
}) {
  const statusColors: Record<string, string> = {
    "In Progress": "#1a6fe8",
    "Planning": "#f59e0b",
    "Completed": "#1ed760",
    "On Hold": "#fc4f37",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {projects.filter((p) => p.status !== "Completed").length} active projects
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className="rounded-xl p-5 transition-all hover:scale-[1.01]"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-base">{p.name}</h3>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                  Lead: {p.lead} · {p.team} members
                </p>
              </div>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0"
                style={{
                  background: (statusColors[p.status] ?? "#7a7a90") + "20",
                  color: statusColors[p.status] ?? "#7a7a90",
                }}
              >
                {p.status}
              </span>
            </div>
            <ProgressBar value={p.progress} color={statusColors[p.status] ?? "#7a7a90"} />
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs font-semibold" style={{ color: statusColors[p.status] ?? "#7a7a90" }}>
                {p.progress}% complete
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>
                Due {p.deadline}
              </span>
            </div>
            {isTechLead && onAllocate && p.status !== "Completed" && (
              <button
                onClick={() => onAllocate(p)}
                className="mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: "#1a6fe815", color: "#60a5fa", border: "1px solid #1a6fe830" }}
              >
                Allocate Resources
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksView() {
  const [filter, setFilter] = useState<"All" | "To Do" | "In Progress" | "Done">("All");
  const tabs = ["All", "To Do", "In Progress", "Done"] as const;
  const filtered = filter === "All" ? TASKS : TASKS.filter((t) => t.status === filter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {TASKS.filter((t) => t.status !== "Done").length} open tasks
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          + New Task
        </button>
      </div>

      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: "var(--muted)" }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
            style={{
              background: filter === t ? "var(--card)" : "transparent",
              color: filter === t ? "var(--foreground)" : "var(--muted-foreground)",
              border: filter === t ? "1px solid var(--border)" : "1px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer transition-colors hover:bg-[#1ed76008]"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-4 h-4 rounded-full shrink-0 border-2 flex items-center justify-center"
              style={{
                borderColor: task.status === "Done" ? "var(--primary)" : "var(--border)",
                background: task.status === "Done" ? "var(--primary)" : "transparent",
              }}
            >
              {task.status === "Done" && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 4l2 2 4-4" stroke="var(--primary-foreground)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ textDecoration: task.status === "Done" ? "line-through" : "none", opacity: task.status === "Done" ? 0.5 : 1 }}>
                {task.title}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>
                {task.project}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <PriorityChip priority={task.priority} />
              <StatusDot status={task.status} />
              <span className="font-mono text-xs w-14 text-right" style={{ color: "var(--muted-foreground)" }}>
                {task.due}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type UserRecord = typeof USERS[number];

function UsersView({
  users,
  onAddUser,
  onRemoveUser,
}: {
  users: UserRecord[];
  onAddUser: () => void;
  onRemoveUser: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  function handleRemove(id: number) {
    onRemoveUser(id);
    setConfirmId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {users.length} registered users · {users.filter((u) => u.status === "Active").length} active
          </p>
        </div>
        <button
          onClick={onAddUser}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          + Add User
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name, role or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2.5 rounded-lg text-sm outline-none"
        style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
      />

      <div className="flex flex-col gap-2">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-4 px-5 py-4 rounded-xl transition-colors"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: (ROLE_COLORS[u.role as Role] ?? "#7a7a90") + "20",
                color: ROLE_COLORS[u.role as Role] ?? "#7a7a90",
              }}
            >
              {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{u.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{u.email}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-end gap-1">
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: (ROLE_COLORS[u.role as Role] ?? "#7a7a90") + "20",
                    color: ROLE_COLORS[u.role as Role] ?? "#7a7a90",
                  }}
                >
                  {u.role}
                </span>
                <span className="text-xs" style={{ color: u.status === "Active" ? "#1ed760" : "#7a7a90" }}>
                  ● {u.status}
                </span>
              </div>
              {/* Remove / confirm */}
              {confirmId === u.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRemove(u.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: "#fc4f37", color: "#fff" }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors hover:bg-[#ffffff10]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(u.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[#fc4f3720] hover:text-[#fc4f37]"
                  style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                  title="Remove user"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm py-8 text-center" style={{ color: "var(--muted-foreground)" }}>No users match your search.</p>
        )}
      </div>
    </div>
  );
}

// ─── New User Panel ───────────────────────────────────────────────────────────

function NewUserPanel({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (u: Omit<UserRecord, "id" | "lastLogin">) => void }) {
  const [form, setForm] = useState({ name: "", email: "", role: "Sales Rep" as Role, status: "Active" });
  const [saved, setSaved] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setForm({ name: "", email: "", role: "Sales Rep", status: "Active" }); setSaved(false); }
  }, [open]);

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSave({ name: form.name, email: form.email, role: form.role, status: form.status });
    setSaved(true);
    setTimeout(onClose, 1100);
  }

  if (!open) return null;

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all";
  const inputStyle = { background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" };
  const labelCls = "text-xs font-semibold uppercase tracking-widest block mb-1.5";
  const labelStyle = { color: "var(--muted-foreground)" };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="w-full max-w-md h-full flex flex-col shadow-2xl"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Add User</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Create a new account and assign a role</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10]" style={{ color: "var(--muted-foreground)" }}>✕</button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Identity</p>
            <div>
              <label className={labelCls} style={labelStyle}>Full Name *</label>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Kamal Jayasuriya" className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Email Address *</label>
              <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="name@altrium.io" className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
          </div>

          <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Role & Access</p>
            <div>
              <label className={labelCls} style={labelStyle}>Role *</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button key={r} type="button" onClick={() => set("role", r)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: form.role === r ? ROLE_COLORS[r] + "25" : "var(--muted)",
                      color: form.role === r ? ROLE_COLORS[r] : "var(--muted-foreground)",
                      border: `1px solid ${form.role === r ? ROLE_COLORS[r] + "50" : "transparent"}`,
                    }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Status</label>
              <div className="flex gap-2">
                {["Active", "Inactive"].map((s) => (
                  <button key={s} type="button" onClick={() => set("status", s)}
                    className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: form.status === s ? (s === "Active" ? "#1ed76025" : "#7a7a9025") : "var(--muted)",
                      color: form.status === s ? (s === "Active" ? "#1ed760" : "#7a7a90") : "var(--muted-foreground)",
                      border: `1px solid ${form.status === s ? (s === "Active" ? "#1ed76040" : "#7a7a9040") : "transparent"}`,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.name && (
            <div className="p-4 rounded-xl" style={{ background: "#1ed76010", border: "1px solid #1ed76030" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>Preview</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: ROLE_COLORS[form.role] + "25", color: ROLE_COLORS[form.role] }}>
                  {form.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{form.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{form.email || "no email yet"}</p>
                </div>
                <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{ background: ROLE_COLORS[form.role] + "20", color: ROLE_COLORS[form.role] }}>
                  {form.role}
                </span>
              </div>
            </div>
          )}
        </form>

        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ffffff08]" style={{ color: "var(--muted-foreground)" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saved || !form.name || !form.email}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: saved ? "#1ed76030" : "var(--primary)", color: saved ? "var(--primary)" : "var(--primary-foreground)" }}>
            {saved ? "✓ User Added" : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssessmentsView({
  assessments,
  role,
  onSubmitAssessment,
  onApprove,
  onReject,
}: {
  assessments: AssessmentRecord[];
  role: Role;
  onSubmitAssessment: (id: number, notes: string, risk: "Low" | "Medium" | "High") => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [risk, setRisk] = useState<"Low" | "Medium" | "High">("Low");

  const isTechLead = role === "Tech Lead";
  const isFinance = role === "Finance Officer";
  const isManager = role === "Sales Manager";

  const visible = assessments.filter((a) => {
    if (isTechLead) return a.type === "Technical";
    if (isFinance) return a.type === "Financial";
    return true; // Sales Manager sees all
  });

  const riskColor: Record<string, string> = { High: "#fc4f37", Medium: "#f59e0b", Low: "#1ed760" };
  const typeColor: Record<string, string> = { Technical: "#1a6fe8", Financial: "#a78bfa" };
  const statusColor: Record<string, string> = {
    Pending: "#f59e0b", "In Review": "#a78bfa", Submitted: "#1a6fe8",
    Approved: "#1ed760", Rejected: "#fc4f37",
  };

  const title = isTechLead ? "Technical Assessments" : isFinance ? "Financial Assessments" : "All Assessments";
  const pendingCount = visible.filter((a) => a.status === "Pending" || a.status === "In Review").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {pendingCount} pending · {visible.length} total
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {visible.map((a) => (
          <div
            key={a.id}
            className="rounded-xl p-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-base">{a.leadName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: typeColor[a.type] + "20", color: typeColor[a.type] }}>
                    {a.type}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: statusColor[a.status] + "20", color: statusColor[a.status] }}>
                    {a.status}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: riskColor[a.risk] }}>
                    {a.risk} risk
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Assessor</p>
                <p className="text-sm font-medium">{a.assessor}</p>
                {a.date !== "—" && <p className="text-xs font-mono mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.date}</p>}
              </div>
            </div>

            {a.notes && (
              <p className="text-sm px-4 py-3 rounded-lg mb-3" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                {a.notes}
              </p>
            )}

            {/* Tech Lead / Finance Officer: submit assessment */}
            {(isTechLead || isFinance) && (a.status === "Pending" || a.status === "In Review") && (
              submittingId === a.id ? (
                <div className="flex flex-col gap-3 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <textarea
                    placeholder="Add assessment notes…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={risk}
                      onChange={(e) => setRisk(e.target.value as "Low" | "Medium" | "High")}
                      className="px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    >
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk</option>
                    </select>
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => setSubmittingId(null)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "var(--muted-foreground)" }}>
                        Cancel
                      </button>
                      <button
                        onClick={() => { onSubmitAssessment(a.id, notes, risk); setSubmittingId(null); setNotes(""); }}
                        disabled={!notes.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                        style={{ background: "var(--secondary)", color: "#fff" }}
                      >
                        Submit Assessment
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setSubmittingId(a.id); setNotes(a.notes); setRisk(a.risk); }}
                  className="mt-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "#1a6fe815", color: "#60a5fa", border: "1px solid #1a6fe830" }}
                >
                  {a.status === "In Review" ? "Continue Assessment" : "Start Assessment"}
                </button>
              )
            )}

            {/* Sales Manager: approve / reject submitted assessments */}
            {isManager && a.status === "Submitted" && (
              <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <span className="text-xs flex-1" style={{ color: "var(--muted-foreground)" }}>
                  Assessment ready for review
                </span>
                <button
                  onClick={() => onReject(a.id)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "#fc4f3715", color: "#fc4f37", border: "1px solid #fc4f3730" }}
                >
                  Reject
                </button>
                <button
                  onClick={() => onApprove(a.id)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        ))}

        {visible.length === 0 && (
          <div className="py-16 text-center" style={{ color: "var(--muted-foreground)" }}>
            <p className="text-lg mb-1">No assessments</p>
            <p className="text-sm">Assessments will appear here when leads are submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function availabilityColor(pct: number): string {
  if (pct >= 75) return "#1ed760";
  if (pct >= 50) return "#f59e0b";
  if (pct >= 25) return "#fc8c37";
  return "#fc4f37";
}

function ResourcesView({ resources }: { resources: ResourceRecord[] }) {
  const techResources = resources.filter((r) => TECH_ROLES.includes(r.role));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resources</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {techResources.length} technical team members
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
          {[{ label: "≥75%", color: "#1ed760" }, { label: "50–74%", color: "#f59e0b" }, { label: "25–49%", color: "#fc8c37" }, { label: "<25%", color: "#fc4f37" }].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {techResources.map((r) => {
          const pct = parseInt(r.availability);
          const avColor = availabilityColor(pct);
          return (
            <div
              key={r.id}
              className="flex items-center gap-5 px-5 py-4 rounded-xl"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background: (ROLE_COLORS[r.role as Role] ?? "#7a7a90") + "20",
                  color: ROLE_COLORS[r.role as Role] ?? "#7a7a90",
                }}
              >
                {r.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.role}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {r.skills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0 w-28">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Availability</span>
                  <span className="text-xs font-semibold" style={{ color: avColor }}>{r.availability}</span>
                </div>
                <ProgressBar value={pct} color={avColor} />
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {r.project !== "—" ? `On: ${r.project}` : "Available"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Login Page ──────────────────────────────────────────────────────────────

const DEMO_CREDENTIALS: { email: string; password: string; role: Role; name: string }[] = [
  { email: "yaqoob.s@altrium.io",   password: "Sales@123",   role: "Sales Manager",  name: "Yaqoob Sadikeen" },
  { email: "ishara.f@altrium.io",   password: "Rep@123",     role: "Sales Rep",      name: "Ishara Fonseka" },
  { email: "ravidu.p@altrium.io",   password: "Tech@123",    role: "Tech Lead",      name: "Ravidu Pasan" },
  { email: "hashmath.f@altrium.io", password: "Finance@123", role: "Finance Officer", name: "Hashmath Fazli" },
  { email: "natalia.d@altrium.io",  password: "Admin@123",   role: "Admin",          name: "Natalia Dilshani" },
];

function ForgotPasswordPage({ onBack }: { onBack: () => void }) {
  const [fpEmail, setFpEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setSent(true); setLoading(false); }, 900);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--background)" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Forgot Password</h2>
          {!sent && (
            <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
              Enter your email address and we will send you a link to reset your password.
            </p>
          )}
        </div>

        {sent ? (
          <>
            <div
              className="px-4 py-4 rounded-xl text-sm text-center leading-relaxed"
              style={{ background: "#1ed76018", color: "#1ed760", border: "1px solid #1ed76030" }}
            >
              If an account with that email exists, we have sent a password reset link. Please check your inbox.
            </div>
            <button
              onClick={onBack}
              className="text-sm text-center font-medium hover:underline transition-all"
              style={{ color: "var(--secondary)" }}
            >
              Return to login
            </button>
          </>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                Email Address
              </label>
              <input
                type="email"
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                placeholder="you@altrium.io"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--secondary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !fpEmail}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--secondary)", color: "#ffffff" }}
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-center font-medium hover:underline transition-all"
              style={{ color: "var(--secondary)" }}
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (role: Role, name: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  if (showForgot) return <ForgotPasswordPage onBack={() => setShowForgot(false)} />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const match = DEMO_CREDENTIALS.find(
        (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      );
      if (match) {
        onLogin(match.role, match.name);
      } else {
        setError("Invalid email or password. Try one of the demo accounts below.");
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--background)" }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12"
        style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        <div>
          <div className="mb-16">
            <img src={altriumLogo} alt="Altrium" className="h-8 object-contain" style={{ display: "block", filter: "invert(1) hue-rotate(180deg)" }} />
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight mb-4">
            Your leads.<br />
            Your team.<br />
            <span style={{ color: "var(--primary)" }}>One place.</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Manage leads, track deals through technical and financial assessments, coordinate project delivery, and monitor your pipeline — all from a single platform built for the way your team actually works.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="flex flex-col gap-4">
          {[
            { icon: "◎", label: "Lead & Deal Pipeline", desc: "From first contact to signed deal" },
            { icon: "◉", label: "Technical & Financial Assessments", desc: "Structured review workflows" },
            { icon: "◫", label: "Project Delivery", desc: "Resources, tasks, milestones" },
          ].map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <span className="text-base mt-0.5" style={{ color: "var(--primary)" }}>{f.icon}</span>
              <div>
                <p className="text-sm font-semibold">{f.label}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          © 2026 Altrium. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <img src={altriumLogo} alt="Altrium" className="h-7 object-contain" style={{ display: "block", filter: "invert(1) hue-rotate(180deg)" }} />
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-1">Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
            Sign in to your account to continue.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nexcrm.io"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                  Password
                </label>
                <button type="button" onClick={() => setShowForgot(true)} className="text-xs hover:underline" style={{ color: "var(--primary)" }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-[#ffffff10]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{ background: "#fc4f3718", color: "#fc4f37", border: "1px solid #fc4f3730" }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] mt-2"
              style={{
                background: loading ? "var(--muted)" : "var(--primary)",
                color: loading ? "var(--muted-foreground)" : "var(--primary-foreground)",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-8">
            <button
              onClick={() => setHintOpen(!hintOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-colors hover:bg-[#ffffff08]"
              style={{ border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
            >
              <span>Demo credentials</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: hintOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {hintOpen && (
              <div
                className="mt-2 rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border)", background: "var(--card)" }}
              >
                <div className="px-4 py-2.5" style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                    Click a row to auto-fill
                  </p>
                </div>
                {DEMO_CREDENTIALS.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => { setEmail(c.email); setPassword(c.password); setError(""); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#ffffff08] transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <div>
                      <p className="text-xs font-medium">{c.name}</p>
                      <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{c.email}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: ROLE_COLORS[c.role] + "20", color: ROLE_COLORS[c.role] }}
                    >
                      {c.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── New Lead Slide-over ──────────────────────────────────────────────────────

type NewLeadData = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  jobTitle: string;
  dealValue: string;
  currency: string;
  source: string;
  industry: string;
  assignedTo: string;
  priority: string;
  notes: string;
};

const EMPTY_LEAD: NewLeadData = {
  companyName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  jobTitle: "",
  dealValue: "",
  currency: "USD",
  source: "",
  industry: "",
  assignedTo: "",
  priority: "Medium",
  notes: "",
};

function NewLeadPanel({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (lead: NewLeadData) => void;
}) {
  const [form, setForm] = useState<NewLeadData>(EMPTY_LEAD);
  const [step, setStep] = useState<1 | 2>(1);
  const [saved, setSaved] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setForm(EMPTY_LEAD); setStep(1); setSaved(false); }
  }, [open]);

  function set(field: keyof NewLeadData, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(onClose, 1200);
  }

  if (!open) return null;

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all";
  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };
  const labelCls = "text-xs font-semibold uppercase tracking-widest block mb-1.5";
  const labelStyle = { color: "var(--muted-foreground)" };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 className="text-lg font-bold tracking-tight">New Lead</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Step {step} of 2 — {step === 1 ? "Company & Contact" : "Deal Details"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#ffffff10]"
            style={{ color: "var(--muted-foreground)" }}
          >
            ✕
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex px-6 pt-4 gap-2 shrink-0">
          {([1, 2] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: step === s ? "var(--primary)" : "var(--muted)",
                color: step === s ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
            >
              {s === 1 ? "Company & Contact" : "Deal Details"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 ? (
            <div className="flex flex-col gap-5">
              {/* Company */}
              <div
                className="p-4 rounded-xl"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>
                  Company
                </p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls} style={labelStyle}>Company Name *</label>
                    <input
                      required
                      value={form.companyName}
                      onChange={(e) => set("companyName", e.target.value)}
                      placeholder="e.g. Meridian Holdings"
                      className={inputCls}
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls} style={labelStyle}>Industry</label>
                      <select
                        value={form.industry}
                        onChange={(e) => set("industry", e.target.value)}
                        className={inputCls}
                        style={{ ...inputStyle, appearance: "none" }}
                      >
                        <option value="">Select…</option>
                        {["Technology", "Finance", "Healthcare", "Retail", "Energy", "Manufacturing", "Logistics", "Education", "Other"].map((i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls} style={labelStyle}>Lead Source</label>
                      <select
                        value={form.source}
                        onChange={(e) => set("source", e.target.value)}
                        className={inputCls}
                        style={{ ...inputStyle, appearance: "none" }}
                      >
                        <option value="">Select…</option>
                        {["Website", "Referral", "Cold Outreach", "LinkedIn", "Event", "Partner", "Other"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div
                className="p-4 rounded-xl"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#1a6fe8" }}>
                  Primary Contact
                </p>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls} style={labelStyle}>Full Name *</label>
                      <input
                        required
                        value={form.contactName}
                        onChange={(e) => set("contactName", e.target.value)}
                        placeholder="e.g. Hashmath Fazli"
                        className={inputCls}
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                      />
                    </div>
                    <div>
                      <label className={labelCls} style={labelStyle}>Job Title</label>
                      <input
                        value={form.jobTitle}
                        onChange={(e) => set("jobTitle", e.target.value)}
                        placeholder="e.g. CTO"
                        className={inputCls}
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Email Address *</label>
                    <input
                      required
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => set("contactEmail", e.target.value)}
                      placeholder="contact@company.com"
                      className={inputCls}
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Phone Number</label>
                    <input
                      type="tel"
                      value={form.contactPhone}
                      onChange={(e) => set("contactPhone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={inputCls}
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Deal value */}
              <div
                className="p-4 rounded-xl"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#a78bfa" }}>
                  Deal Value
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className={labelCls} style={labelStyle}>Estimated Value *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={form.dealValue}
                      onChange={(e) => set("dealValue", e.target.value)}
                      placeholder="125000"
                      className={inputCls}
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => set("currency", e.target.value)}
                      className={inputCls}
                      style={{ ...inputStyle, appearance: "none" }}
                    >
                      {["USD", "EUR", "GBP", "AED", "INR", "SGD"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Assignment */}
              <div
                className="p-4 rounded-xl"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#f59e0b" }}>
                  Assignment & Priority
                </p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls} style={labelStyle}>Assign to Sales Rep</label>
                    <select
                      value={form.assignedTo}
                      onChange={(e) => set("assignedTo", e.target.value)}
                      className={inputCls}
                      style={{ ...inputStyle, appearance: "none" }}
                    >
                      <option value="">Unassigned</option>
                      {SALES_REPS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Priority</label>
                    <div className="flex gap-2">
                      {["Low", "Medium", "High"].map((p) => {
                        const colors: Record<string, string> = { Low: "#7a7a90", Medium: "#f59e0b", High: "#fc4f37" };
                        const active = form.priority === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => set("priority", p)}
                            className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                              background: active ? colors[p] + "25" : "var(--muted)",
                              color: active ? colors[p] : "var(--muted-foreground)",
                              border: `1px solid ${active ? colors[p] + "50" : "transparent"}`,
                            }}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div
                className="p-4 rounded-xl"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--muted-foreground)" }}>
                  Notes
                </p>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Add any relevant context about this lead — pain points, timeline, decision makers…"
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
                  style={{
                    ...inputStyle,
                    lineHeight: "1.6",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>

              {/* Preview card */}
              {(form.companyName || form.dealValue) && (
                <div
                  className="p-4 rounded-xl"
                  style={{ background: "#1ed76010", border: "1px solid #1ed76030" }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>
                    Preview
                  </p>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{form.companyName || "—"}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {form.contactName || "No contact"} {form.jobTitle ? `· ${form.jobTitle}` : ""}
                      </p>
                    </div>
                    {form.dealValue && (
                      <span className="font-mono font-bold text-sm" style={{ color: "var(--primary)" }}>
                        {form.currency} {parseInt(form.dealValue).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {form.priority && (
                    <div className="mt-2.5 flex gap-2">
                      <LeadStatusChip status="New" />
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full border font-medium"
                        style={{
                          background: form.priority === "High" ? "#fc4f3720" : form.priority === "Medium" ? "#f59e0b20" : "#7a7a9020",
                          color: form.priority === "High" ? "#fc4f37" : form.priority === "Medium" ? "#f59e0b" : "#7a7a90",
                          borderColor: form.priority === "High" ? "#fc4f3730" : form.priority === "Medium" ? "#f59e0b30" : "#7a7a9030",
                        }}
                      >
                        {form.priority} Priority
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#ffffff08]"
                style={{ color: "var(--muted-foreground)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!form.companyName || !form.contactName || !form.contactEmail}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Next — Deal Details →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#ffffff08]"
                style={{ color: "var(--muted-foreground)" }}
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={saved || !form.dealValue}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                style={{
                  background: saved ? "#1ed76030" : "var(--primary)",
                  color: saved ? "var(--primary)" : "var(--primary-foreground)",
                }}
              >
                {saved ? "✓ Lead Created" : "Create Lead"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── New Deal Panel ──────────────────────────────────────────────────────────

type NewDealData = {
  dealName: string;
  clientCompany: string;
  contactName: string;
  value: string;
  currency: string;
  stage: string;
  priority: string;
  dueDate: string;
  description: string;
  owner: string;
};

const EMPTY_DEAL: NewDealData = {
  dealName: "",
  clientCompany: "",
  contactName: "",
  value: "",
  currency: "USD",
  stage: "Proposal",
  priority: "Medium",
  dueDate: "",
  description: "",
  owner: "",
};

function NewDealPanel({
  open,
  onClose,
  onSave,
  ownerName,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (deal: NewDealData) => void;
  ownerName: string;
}) {
  const [form, setForm] = useState<NewDealData>({ ...EMPTY_DEAL, owner: ownerName });
  const [saved, setSaved] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setForm({ ...EMPTY_DEAL, owner: ownerName }); setSaved(false); }
  }, [open, ownerName]);

  function set(field: keyof NewDealData, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(onClose, 1200);
  }

  if (!open) return null;

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all";
  const inputStyle = { background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" };
  const labelCls = "text-xs font-semibold uppercase tracking-widest block mb-1.5";
  const labelStyle = { color: "var(--muted-foreground)" };

  const stageColors: Record<string, string> = {
    "Proposal": "#38bdf8", "Technical Review": "#1a6fe8", "Financial Review": "#a78bfa",
    "Negotiation": "#f59e0b", "Closed Won": "#1ed760",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-lg font-bold tracking-tight">New Deal</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Create a deal to move through the assessment pipeline
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#ffffff10]" style={{ color: "var(--muted-foreground)" }}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Deal identity */}
          <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Deal Info</p>
            <div>
              <label className={labelCls} style={labelStyle}>Deal Name *</label>
              <input required value={form.dealName} onChange={(e) => set("dealName", e.target.value)}
                placeholder="e.g. Meridian ERP — Phase 2" className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} style={labelStyle}>Client Company *</label>
                <input required value={form.clientCompany} onChange={(e) => set("clientCompany", e.target.value)}
                  placeholder="e.g. Meridian Holdings" className={inputCls} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Contact Person</label>
                <input value={form.contactName} onChange={(e) => set("contactName", e.target.value)}
                  placeholder="e.g. Hashmath Fazli" className={inputCls} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Financials & Timeline</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelCls} style={labelStyle}>Deal Value *</label>
                <input required type="number" min="0" value={form.value} onChange={(e) => set("value", e.target.value)}
                  placeholder="250000" className={inputCls} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Currency</label>
                <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls} style={{ ...inputStyle, appearance: "none" }}>
                  {["USD", "EUR", "GBP", "AED", "INR", "SGD"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Target Close Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
          </div>

          {/* Stage & Priority */}
          <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f59e0b" }}>Stage & Priority</p>
            <div>
              <label className={labelCls} style={labelStyle}>Deal Stage</label>
              <div className="flex flex-wrap gap-2">
                {["Proposal", "Technical Review", "Financial Review", "Negotiation"].map((s) => (
                  <button key={s} type="button" onClick={() => set("stage", s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: form.stage === s ? (stageColors[s] + "25") : "var(--muted)",
                      color: form.stage === s ? stageColors[s] : "var(--muted-foreground)",
                      border: `1px solid ${form.stage === s ? stageColors[s] + "50" : "transparent"}`,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Priority</label>
              <div className="flex gap-2">
                {["Low", "Medium", "High"].map((p) => {
                  const c: Record<string, string> = { Low: "#7a7a90", Medium: "#f59e0b", High: "#fc4f37" };
                  return (
                    <button key={p} type="button" onClick={() => set("priority", p)}
                      className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: form.priority === p ? c[p] + "25" : "var(--muted)",
                        color: form.priority === p ? c[p] : "var(--muted-foreground)",
                        border: `1px solid ${form.priority === p ? c[p] + "50" : "transparent"}`,
                      }}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="p-4 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--muted-foreground)" }}>Description</p>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Scope, key requirements, decision-maker context…"
              rows={3} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
              style={{ ...inputStyle, lineHeight: "1.6" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
          </div>

          {/* Live preview */}
          {(form.dealName || form.value) && (
            <div className="p-4 rounded-xl" style={{ background: "#1ed76010", border: "1px solid #1ed76030" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>Preview</p>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{form.dealName || "—"}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{form.clientCompany || "No client"}</p>
                </div>
                {form.value && (
                  <span className="font-mono font-bold text-sm" style={{ color: "var(--primary)" }}>
                    {form.currency} {parseInt(form.value).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex gap-2 flex-wrap">
                {form.stage && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{ background: (stageColors[form.stage] ?? "#7a7a90") + "20", color: stageColors[form.stage] ?? "#7a7a90" }}>
                    {form.stage}
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full border font-medium"
                  style={{
                    background: form.priority === "High" ? "#fc4f3720" : form.priority === "Medium" ? "#f59e0b20" : "#7a7a9020",
                    color: form.priority === "High" ? "#fc4f37" : form.priority === "Medium" ? "#f59e0b" : "#7a7a90",
                    borderColor: form.priority === "High" ? "#fc4f3730" : form.priority === "Medium" ? "#f59e0b30" : "#7a7a9030",
                  }}>
                  {form.priority} Priority
                </span>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#ffffff08]" style={{ color: "var(--muted-foreground)" }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saved || !form.dealName || !form.clientCompany || !form.value}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
            style={{
              background: saved ? "#1ed76030" : "var(--primary)",
              color: saved ? "var(--primary)" : "var(--primary-foreground)",
            }}
          >
            {saved ? "✓ Deal Created" : "Create Deal"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Convert Lead → Deal Panel ───────────────────────────────────────────────

function ConvertLeadPanel({
  lead,
  onClose,
  onConfirm,
}: {
  lead: typeof LEADS[number] | null;
  onClose: () => void;
  onConfirm: (deal: typeof DEALS[number]) => void;
}) {
  const [dealName, setDealName] = useState("");
  const [stage, setStage] = useState("Proposal");
  const [priority, setPriority] = useState("Medium");
  const [due, setDue] = useState("");
  const [saved, setSaved] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lead) {
      setDealName(`${lead.name} — Deal`);
      setStage("Proposal");
      setPriority("Medium");
      setDue("");
      setSaved(false);
    }
  }, [lead]);

  if (!lead) return null;

  const stageColors: Record<string, string> = {
    "Proposal": "#38bdf8", "Technical Review": "#1a6fe8",
    "Financial Review": "#a78bfa", "Negotiation": "#f59e0b",
  };

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!lead) return;
    onConfirm({
      id: Date.now(),
      name: dealName,
      stage,
      value: lead.value,
      client: lead.name,
      priority,
      due: due
        ? new Date(due).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "TBD",
    });
    setSaved(true);
    setTimeout(onClose, 1100);
  }

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all";
  const inputStyle = { background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="w-full max-w-md h-full flex flex-col shadow-2xl"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>

        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Convert to Deal</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              This will create a new deal from <strong>{lead.name}</strong>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10]" style={{ color: "var(--muted-foreground)" }}>✕</button>
        </div>

        <form onSubmit={handleConfirm} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Lead summary */}
          <div className="p-4 rounded-xl" style={{ background: "#1a6fe812", border: "1px solid #1a6fe830" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#60a5fa" }}>From Lead</p>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">{lead.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Contact: {lead.contact}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Rep: {lead.rep || "Unassigned"}</p>
              </div>
              <span className="font-mono font-bold text-sm" style={{ color: "var(--primary)" }}>{lead.value}</span>
            </div>
          </div>

          {/* Deal details */}
          <div className="p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Deal Details</p>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: "var(--muted-foreground)" }}>Deal Name *</label>
              <input required value={dealName} onChange={(e) => setDealName(e.target.value)} className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: "var(--muted-foreground)" }}>Initial Stage</label>
              <div className="flex flex-wrap gap-2">
                {["Proposal", "Technical Review", "Financial Review", "Negotiation"].map((s) => (
                  <button key={s} type="button" onClick={() => setStage(s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: stage === s ? (stageColors[s] + "25") : "var(--muted)",
                      color: stage === s ? stageColors[s] : "var(--muted-foreground)",
                      border: `1px solid ${stage === s ? stageColors[s] + "50" : "transparent"}`,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: "var(--muted-foreground)" }}>Priority</label>
              <div className="flex gap-2">
                {["Low", "Medium", "High"].map((p) => {
                  const c: Record<string, string> = { Low: "#7a7a90", Medium: "#f59e0b", High: "#fc4f37" };
                  return (
                    <button key={p} type="button" onClick={() => setPriority(p)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: priority === p ? c[p] + "25" : "var(--muted)",
                        color: priority === p ? c[p] : "var(--muted-foreground)",
                        border: `1px solid ${priority === p ? c[p] + "50" : "transparent"}`,
                      }}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: "var(--muted-foreground)" }}>Target Close Date</label>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ffffff08]" style={{ color: "var(--muted-foreground)" }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={saved || !dealName}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: saved ? "#1ed76030" : "var(--primary)", color: saved ? "var(--primary)" : "var(--primary-foreground)" }}>
            {saved ? "✓ Deal Created" : "Convert to Deal →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Convert Deal → Project Panel ────────────────────────────────────────────

function ConvertDealPanel({
  deal,
  onClose,
  onConfirm,
}: {
  deal: typeof DEALS[number] | null;
  onClose: () => void;
  onConfirm: (project: typeof PROJECTS[number]) => void;
}) {
  const [projectName, setProjectName] = useState("");
  const [lead, setLead] = useState("Ravidu Pasan");
  const [deadline, setDeadline] = useState("");
  const [teamSize, setTeamSize] = useState("3");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (deal) {
      setProjectName(deal.name);
      setSaved(false);
    }
  }, [deal]);

  if (!deal) return null;

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!deal) return;
    onConfirm({
      id: Date.now(),
      name: projectName || deal.name,
      status: "Planning",
      progress: 0,
      lead,
      deadline: deadline
        ? new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "TBD",
      team: parseInt(teamSize) || 3,
    });
    setSaved(true);
    setTimeout(onClose, 1100);
  }

  const techLeads = ["Ravidu Pasan", "Inshiraff Thaseem", "Chamil Wijeratne"];

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="ml-auto h-full w-full max-w-md flex flex-col overflow-y-auto"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Convert Deal to Project</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{deal.client} · {deal.value}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10] transition-colors" style={{ color: "var(--muted-foreground)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <form onSubmit={handleConfirm} className="flex flex-col gap-5 px-6 py-6 flex-1">
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "#1a6fe810", border: "1px solid #1a6fe830" }}
          >
            <span style={{ color: "#1a6fe8", fontSize: 20 }}>📦</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#60a5fa" }}>Closed Won → Project</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>A new project will be created in Planning status.</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Project Name</label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Project Lead</label>
            <select
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            >
              {techLeads.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Target Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)", colorScheme: "dark" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Team Size</label>
              <input
                type="number"
                min={1}
                max={20}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#ffffff08]" style={{ color: "var(--muted-foreground)" }}>
            Cancel
          </button>
          <button
            onClick={(e) => handleConfirm(e as unknown as React.FormEvent)}
            disabled={saved || !projectName}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
            style={{
              background: saved ? "#1a6fe830" : "#1a6fe8",
              color: "#ffffff",
            }}
          >
            {saved ? "✓ Project Created" : "Create Project →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Allocate Resources Panel (Tech Lead) ────────────────────────────────────

const TECH_ROLES = ["Tech Lead", "Senior Engineer", "Full-Stack Dev", "Frontend Dev", "Backend Dev", "QA Engineer", "DevOps Engineer", "Data Engineer", "Mobile Dev", "Team Member"];

type ResourceRecord = typeof RESOURCES[number];

function AllocateResourcesPanel({
  project,
  resources,
  onClose,
  onSave,
}: {
  project: typeof PROJECTS[number] | null;
  resources: ResourceRecord[];
  onClose: () => void;
  onSave: (projectId: number, allocated: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (project) {
      setSelected([]);
      setSaved(false);
    }
  }, [project]);

  if (!project) return null;

  function toggle(name: string) {
    setSelected((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
  }

  function handleSave() {
    if (!project) return;
    onSave(project.id, selected);
    setSaved(true);
    setTimeout(onClose, 1000);
  }

  const shortName = (name: string) => {
    const parts = name.split(" ");
    return parts.length > 1 ? parts[0] + " " + parts[1][0] + "." : name;
  };

  const eligible = resources.filter((r) => TECH_ROLES.includes(r.role));
  const alreadyOnProject = eligible.filter((r) => r.project === project.name);
  const available = eligible.filter((r) => r.project !== project.name && parseInt(r.availability) > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="ml-auto h-full w-full max-w-md flex flex-col"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Allocate Resources</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{project.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#ffffff10] transition-colors" style={{ color: "var(--muted-foreground)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto flex flex-col gap-4">
          {/* Already allocated */}
          {alreadyOnProject.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>
                Already on this project ({alreadyOnProject.length})
              </p>
              <div className="flex flex-col gap-2">
                {alreadyOnProject.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl opacity-60"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "#1ed76020", color: "#1ed760" }}>
                      {r.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.role}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#1ed76015", color: "#1ed760" }}>Assigned</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available to add */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>
              Available to allocate ({available.length})
            </p>
            {available.length === 0 && (
              <p className="text-sm py-4 text-center" style={{ color: "var(--muted-foreground)" }}>No available members right now.</p>
            )}
            <div className="flex flex-col gap-2">
              {available.map((r) => {
                const isSelected = selected.includes(r.name);
                const pct = parseInt(r.availability);
                const avColor = availabilityColor(pct);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggle(r.name)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left w-full"
                    style={{
                      background: isSelected ? "#1a6fe815" : "var(--muted)",
                      border: isSelected ? "1px solid #1a6fe840" : "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: isSelected ? "#1a6fe830" : "var(--border)", color: isSelected ? "#60a5fa" : "var(--muted-foreground)" }}
                    >
                      {r.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{shortName(r.name)}</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.role}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--card)", color: "var(--muted-foreground)" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold" style={{ color: avColor }}>{r.availability}</span>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>free</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ background: "#1a6fe8", color: "#fff" }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 shrink-0 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {selected.length} member{selected.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#ffffff08]" style={{ color: "var(--muted-foreground)" }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saved || selected.length === 0}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: saved ? "#1a6fe830" : "#1a6fe8", color: "#ffffff" }}
            >
              {saved ? "✓ Allocated" : "Confirm Allocation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // ── all hooks unconditionally, in stable order ─────────────────────────────
  const [authed, setAuthed] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<{ time: string; event: string; type: string }[]>([
    { time: "2h ago",     event: "Lead qualified — Orbit Retail Ltd",             type: "lead" },
    { time: "4h ago",     event: "Deal moved to Negotiation — NexGen Pharma",     type: "deal" },
    { time: "Yesterday",  event: "Technical assessment submitted — Meridian ERP", type: "assess" },
    { time: "Yesterday",  event: "New user onboarded — Senula Silva",             type: "user" },
    { time: "Aug 17",     event: "Project created — CloudBridge Migration",       type: "project" },
    { time: "Aug 16",     event: "Deal closed won — Apex DevOps Pipeline",        type: "deal" },
  ]);
  const [userName, setUserName] = useState("Yaqoob Sadikeen");
  const [role, setRole] = useState<Role>("Sales Manager");
  const [view, setView] = useState<View>("dashboard");
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<typeof LEADS[number] | null>(null);
  const [convertingDeal, setConvertingDeal] = useState<typeof DEALS[number] | null>(null);
  const [allocatingProject, setAllocatingProject] = useState<typeof PROJECTS[number] | null>(null);
  const [leads, setLeads] = useState(LEADS);
  const [deals, setDeals] = useState(DEALS);
  const [projects, setProjects] = useState(PROJECTS);
  const [users, setUsers] = useState(USERS);
  const [resources, setResources] = useState(RESOURCES);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>(ASSESSMENTS);

  // const (not function declaration) so closure is never ambiguous
  const logActivity = (event: string, type: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setActivityLog((prev) => [{ time, event, type }, ...prev]);
  };

  if (!authed) {
    return (
      <LoginPage
        onLogin={(r, name) => {
          setRole(r);
          setUserName(name);
          setAuthed(true);
        }}
      />
    );
  }

  function handleNewLead(data: NewLeadData) {
    setLeads((prev) => [
      {
        id: prev.length + 1,
        name: data.companyName,
        contact: data.contactName,
        value: data.dealValue
          ? `${data.currency === "USD" ? "$" : data.currency + " "}${parseInt(data.dealValue).toLocaleString()}`
          : "—",
        status: "New",
        assigned: userName,
        rep: data.assignedTo || "",
        date: "Today",
      },
      ...prev,
    ]);
    logActivity(`New lead created — ${data.companyName}`, "lead");
  }

  function handleNewDeal(data: NewDealData) {
    setDeals((prev) => [
      {
        id: prev.length + 1,
        name: data.dealName,
        stage: data.stage,
        value: data.value
          ? `${data.currency === "USD" ? "$" : data.currency + " "}${parseInt(data.value).toLocaleString()}`
          : "—",
        client: data.clientCompany,
        priority: data.priority,
        due: data.dueDate
          ? new Date(data.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "TBD",
      },
      ...prev,
    ]);
  }

  function handleAssignRep(leadId: number, rep: string) {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, rep } : l));
  }

  function handleDeleteLead(id: number) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  function handleConvertLead(deal: typeof DEALS[number]) {
    setDeals((prev) => [deal, ...prev]);
    setLeads((prev) => prev.map((l) => l.name === deal.client ? { ...l, status: "Closed" } : l));
    setConvertingLead(null);
    logActivity(`Lead converted to deal — ${deal.name}`, "deal");
  }

  function handleAddUser(u: Omit<typeof USERS[number], "id" | "lastLogin">) {
    setUsers((prev) => [...prev, { ...u, id: prev.length + 1, lastLogin: "Just now" }]);
    // If new user is a Sales Rep, also add to SALES_REPS list dynamically
  }

  function handleRemoveUser(id: number) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function handleConvertDeal(deal: typeof DEALS[number]) {
    setConvertingDeal(deal);
  }

  function handleDealToProject(project: typeof PROJECTS[number]) {
    setProjects((prev) => [project, ...prev]);
    setDeals((prev) => prev.map((d) => d.id === convertingDeal?.id ? { ...d, stage: "Closed Won" } : d));
    setConvertingDeal(null);
    logActivity(`Deal converted to project — ${project.name}`, "project");
  }

  function handleAllocateResources(projectId: number, allocated: string[]) {
    const projectName = projects.find((p) => p.id === projectId)?.name ?? "";
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, team: p.team + allocated.length } : p));
    setResources((prev) => prev.map((r) => {
      if (!allocated.includes(r.name)) return r;
      const current = parseInt(r.availability);
      const reduced = Math.max(0, current - 20);
      return { ...r, availability: reduced + "%", project: projectName };
    }));
    setAllocatingProject(null);
  }

  function handleSubmitForAssessment(leadId: number) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: "Assessment" } : l));
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setAssessments((prev) => [
      ...prev,
      { id: Date.now(), leadName: lead.name, type: "Technical", status: "Pending", risk: "Low", assessor: "Ravidu Pasan", date: "—", notes: "" },
      { id: Date.now() + 1, leadName: lead.name, type: "Financial", status: "Pending", risk: "Low", assessor: "Hashmath Fazli", date: "—", notes: "" },
    ]);
    logActivity(`Lead submitted for assessment — ${lead.name}`, "assess");
  }

  function handleSubmitAssessment(id: number, notes: string, risk: "Low" | "Medium" | "High") {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setAssessments((prev) => prev.map((a) => a.id === id ? { ...a, status: "Submitted", notes, risk, date: dateStr } : a));
    const assessment = assessments.find((a) => a.id === id);
    logActivity(`${assessment?.type} assessment submitted — ${assessment?.leadName}`, "assess");
  }

  function handleApproveAssessment(id: number) {
    setAssessments((prev) => prev.map((a) => a.id === id ? { ...a, status: "Approved" } : a));
    const assessment = assessments.find((a) => a.id === id);
    logActivity(`Assessment approved — ${assessment?.leadName}`, "deal");
  }

  function handleRejectAssessment(id: number) {
    setAssessments((prev) => prev.map((a) => a.id === id ? { ...a, status: "Rejected" } : a));
  }

  function handleUpdateLeadStatus(leadId: number, status: string) {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status } : l));
    logActivity(`Lead status updated to ${status}`, "lead");
  }

  const nav = ROLE_NAV[role];

  // Reset to dashboard if current view isn't in nav
  const validViews = nav.map((n) => n.view);
  const activeView = validViews.includes(view) ? view : "dashboard";

  return (
    <>
    <NewLeadPanel open={newLeadOpen} onClose={() => setNewLeadOpen(false)} onSave={handleNewLead} />
    <NewDealPanel open={newDealOpen} onClose={() => setNewDealOpen(false)} onSave={handleNewDeal} ownerName={userName} />
    <NewUserPanel open={newUserOpen} onClose={() => setNewUserOpen(false)} onSave={handleAddUser} />
    <ConvertLeadPanel lead={convertingLead} onClose={() => setConvertingLead(null)} onConfirm={handleConvertLead} />
    <ConvertDealPanel deal={convertingDeal} onClose={() => setConvertingDeal(null)} onConfirm={handleDealToProject} />
    <AllocateResourcesPanel project={allocatingProject} resources={resources} onClose={() => setAllocatingProject(null)} onSave={handleAllocateResources} />
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col h-full"
        style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <img src={altriumLogo} alt="Altrium" className="h-6 object-contain" style={{ display: "block", filter: "invert(1) hue-rotate(180deg)" }} />
          <div style={{ display: "none" }}> {/* keep old closing structure */}
          </div>
        </div>

        {/* Signed-in user chip */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "var(--muted)" }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: ROLE_COLORS[role] + "30", color: ROLE_COLORS[role] }}
            >
              {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{userName}</p>
              <p className="text-xs truncate font-medium" style={{ color: ROLE_COLORS[role] }}>{role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {nav.map((item) => {
            const active = item.view === activeView;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all"
                style={{
                  background: active ? ROLE_COLORS[role] + "18" : "transparent",
                  color: active ? ROLE_COLORS[role] : "var(--muted-foreground)",
                  border: active ? `1px solid ${ROLE_COLORS[role]}28` : "1px solid transparent",
                }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="px-3 pb-2">
            <p className="text-xs font-medium truncate">{userName}</p>
            <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
              {DEMO_CREDENTIALS.find((c) => c.name === userName)?.email ?? ""}
            </p>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group"
            style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#fc4f3718";
              (e.currentTarget as HTMLButtonElement).style.color = "#fc4f37";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#fc4f3730";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--muted)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M6 2H2.5A1.5 1.5 0 0 0 1 3.5v8A1.5 1.5 0 0 0 2.5 13H6M10 10.5l3.5-3-3.5-3M13.5 7.5H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header
          className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
          style={{
            background: "var(--background)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <span>{role}</span>
            <span>/</span>
            <span style={{ color: "var(--foreground)" }} className="font-medium capitalize">{activeView}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Bell with activity dropdown */}
            <div className="relative">
              <button
                onClick={() => setBellOpen((v) => !v)}
                className="relative p-2 rounded-lg transition-colors hover:bg-[#ffffff08]"
                style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5A4.5 4.5 0 003.5 6v2.5L2 10.5h12l-1.5-2V6A4.5 4.5 0 008 1.5zM6 12a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {activityLog.length > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                )}
              </button>
              {bellOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 overflow-hidden"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="text-sm font-semibold">Recent Activity</span>
                    <button onClick={() => setBellOpen(false)} style={{ color: "var(--muted-foreground)" }} className="text-xs hover:opacity-70">✕</button>
                  </div>
                  <div className="flex flex-col max-h-80 overflow-y-auto">
                    {activityLog.length === 0 ? (
                      <p className="text-sm text-center py-6" style={{ color: "var(--muted-foreground)" }}>No recent activity</p>
                    ) : (
                      activityLog.map((a, i) => (
                        <div
                          key={i}
                          className="flex gap-3 items-start px-4 py-3"
                          style={{ borderBottom: i < activityLog.length - 1 ? "1px solid var(--border)" : "none" }}
                        >
                          <span
                            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                            style={{ background: { lead: "#1ed760", deal: "#1a6fe8", project: "#fc4f37", assess: "#a78bfa", user: "#f59e0b" }[a.type] ?? "#7a7a90" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-snug">{a.event}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: ROLE_COLORS[role] + "25", color: ROLE_COLORS[role] }}
            >
              {ROLE_INITIALS[role]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="px-8 py-8 max-w-6xl">
          {activeView === "dashboard" && <DashboardView role={role} activityLog={activityLog} />}
          {activeView === "leads" && (
            <LeadsView
              leads={leads}
              onNewLead={() => setNewLeadOpen(true)}
              onAssignRep={handleAssignRep}
              onDeleteLead={handleDeleteLead}
              onConvertLead={(l) => setConvertingLead(l)}
              isSalesRep={role === "Sales Rep"}
              isSalesManager={role === "Sales Manager"}
              repName={userName}
              onSubmitForAssessment={role === "Sales Manager" ? handleSubmitForAssessment : undefined}
              onUpdateStatus={role === "Sales Rep" ? handleUpdateLeadStatus : undefined}
            />
          )}
          {activeView === "deals" && (
            <DealsView
              deals={deals}
              onNewDeal={role === "Sales Manager" || role === "Sales Rep" ? () => setNewDealOpen(true) : undefined}
              onConvertDeal={role === "Sales Manager" ? handleConvertDeal : undefined}
              isSalesRep={role === "Sales Rep"}
              isSalesManager={role === "Sales Manager"}
            />
          )}
          {activeView === "users" && <UsersView users={users} onAddUser={() => setNewUserOpen(true)} onRemoveUser={handleRemoveUser} />}
          {activeView === "assessments" && (
            <AssessmentsView
              assessments={assessments}
              role={role}
              onSubmitAssessment={handleSubmitAssessment}
              onApprove={handleApproveAssessment}
              onReject={handleRejectAssessment}
            />
          )}
          {activeView === "resources" && <ResourcesView resources={resources} />}
        </div>
      </main>
    </div>
    </>
  );
}
