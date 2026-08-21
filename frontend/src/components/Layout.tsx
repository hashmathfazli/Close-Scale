import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, BriefcaseBusiness, ChartNoAxesCombined, ChevronLeft, ChevronRight, CircleDollarSign, LayoutDashboard, LogOut, Users, Wrench } from "lucide-react";
import { useState } from "react";
import { useAuth, type UserRole } from "../context/AuthContext";
import "./Layout.css";

const roleNavigation: Record<UserRole, { label: string; dashboard: string; items: { label: string; to: string; icon: typeof LayoutDashboard }[] }> = {
  SALES_REP: { label: "Sales Rep", dashboard: "/sales-rep", items: [{ label: "Dashboard", to: "/sales-rep", icon: LayoutDashboard }, { label: "My deals", to: "/sales-rep/deals", icon: BriefcaseBusiness }] },
  SALES_MANAGER: { label: "Sales Manager", dashboard: "/sales-manager", items: [{ label: "Dashboard", to: "/sales-manager", icon: LayoutDashboard }, { label: "Team pipeline", to: "/sales-manager/team", icon: ChartNoAxesCombined }] },
  TECH_LEAD: { label: "Tech Lead", dashboard: "/tech-lead", items: [{ label: "Dashboard", to: "/tech-lead", icon: LayoutDashboard }, { label: "Projects", to: "/tech-lead/projects", icon: Wrench }] },
  FINANCE_OFFICER: { label: "Finance", dashboard: "/finance", items: [{ label: "Overview", to: "/finance", icon: LayoutDashboard }, { label: "Finance queue", to: "/finance/invoices", icon: CircleDollarSign }] },
  ADMIN: { label: "Administrator", dashboard: "/admin", items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }, { label: "Users", to: "/admin/users", icon: Users }] },
};

export default function Layout() {
  const { currentUser, logout } = useAuth(); const navigate = useNavigate(); const [collapsed, setCollapsed] = useState(false);
  const nav = roleNavigation[currentUser?.role ?? "ADMIN"];
  const initials = (currentUser?.full_name || currentUser?.username || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const handleLogout = async () => { await logout(); navigate("/login"); };
  return <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}><aside className="left-sidebar"><div className="sidebar-header"><NavLink className="brand" to={nav.dashboard}><span className="brand-mark" />{!collapsed && <span>CloseScale</span>}</NavLink><button className="collapse-btn" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle sidebar">{collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}</button></div><nav className="sidebar-nav">{!collapsed && <p className="nav-group-label">{nav.label}</p>}{nav.items.map(({ label, to, icon: Icon }, index) => <NavLink key={label} to={to} end={index === 0} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} title={collapsed ? label : undefined}><Icon size={17} />{!collapsed && <span>{label}</span>}</NavLink>)}</nav><div className="sidebar-bottom">{!collapsed && <div className="user-details"><strong>{currentUser?.full_name || currentUser?.username}</strong><span>{nav.label}</span></div>}<button className="signout-btn" onClick={handleLogout} title="Sign out"><LogOut size={17} />{!collapsed && <span>Sign out</span>}</button></div></aside><section className="main-wrapper"><header className="topbar"><div><p className="topbar-kicker">{nav.label}</p><h1>Workspace</h1></div><div className="topbar-actions"><button className="icon-btn" aria-label="Notifications"><Bell size={17} /><span className="notification-dot" /></button><div className="user-avatar" title={currentUser?.username}>{initials}</div></div></header><main className="content-area"><Outlet /></main></section></div>;
}
