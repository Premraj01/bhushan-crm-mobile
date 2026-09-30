import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  ClipboardPlus,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { type FormEvent, type LucideIcon, useState } from "react";

import logoMark from "@/assets/logo-mark.png";
import authDoodle from "@/assets/auth-doodle.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clinic CRM — Dr. Bhushan’s Rejuvenation" },
      { name: "description", content: "Mobile clinic workspace for patients, leads, appointments, and treatments." },
      { property: "og:title", content: "Clinic CRM — Dr. Bhushan’s Rejuvenation" },
      { property: "og:description", content: "A focused mobile workspace for the Dr. Bhushan’s Rejuvenation team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MobileCrm,
});

type NavItem = { label: string; icon: LucideIcon };

const navigation: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Patients", icon: UsersRound },
  { label: "Leads", icon: Sparkles },
  { label: "Appointments", icon: CalendarDays },
  { label: "Treatments", icon: Stethoscope },
];

const appointments = [
  { time: "10:30", period: "AM", name: "Ananya Mehta", service: "PRP session · 45 min", initials: "AM", tone: "mint" },
  { time: "12:00", period: "PM", name: "Rohit Shah", service: "Hair assessment · 30 min", initials: "RS", tone: "blue" },
  { time: "02:15", period: "PM", name: "Neha Kulkarni", service: "Follow-up · 20 min", initials: "NK", tone: "gold" },
];

const leads = [
  { name: "Aarav Deshmukh", interest: "Hair transplant", time: "18 min ago", initials: "AD" },
  { name: "Meera Joshi", interest: "Skin rejuvenation", time: "1 hr ago", initials: "MJ" },
];

function MobileCrm() {
  const [signedIn, setSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState("Dashboard");

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignedIn(true);
  }

  if (!signedIn) {
    return (
      <main className="auth-screen">
        <div className="auth-art" aria-hidden="true">
          <img src={authDoodle} alt="" />
          <div className="auth-art-overlay" />
          <div className="auth-art-copy">
            <span className="auth-art-icon"><Activity /></span>
            <p>Thoughtful care.<br />Organised beautifully.</p>
          </div>
        </div>
        <section className="auth-panel">
          <div className="auth-content">
            <header className="auth-brand">
              <span className="logo-tile"><img src={logoMark} alt="Dr. Bhushan’s Rejuvenation" /></span>
              <div><strong>Dr. Bhushan’s</strong><span>REJUVENATION</span></div>
            </header>
            <div className="auth-heading">
              <span className="welcome-mark"><Sparkles /></span>
              <h1>Welcome back</h1>
              <p>Sign in to your clinic workspace.</p>
            </div>
            <form className="login-form" onSubmit={signIn}>
              <label htmlFor="email">Email address</label>
              <Input id="email" type="email" placeholder="name@clinic.com" defaultValue="admin@drbhushan.com" required />
              <div className="password-label"><label htmlFor="password">Password</label><button type="button">Forgot password?</button></div>
              <div className="password-field">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" defaultValue="clinic123" required />
                <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <Button className="login-button" size="lg" type="submit">Sign in <ChevronRight /></Button>
            </form>
            <p className="secure-note"><span /> Secure access for authorised clinic staff</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="mobile-shell">
      <div className={cn("drawer-scrim", drawerOpen && "is-open")} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      <aside className={cn("app-drawer", drawerOpen && "is-open")}>
        <div className="drawer-brand">
          <span className="logo-tile"><img src={logoMark} alt="Dr. Bhushan’s Rejuvenation" /></span>
          <div><strong>Dr. Bhushan’s</strong><span>REJUVENATION</span></div>
          <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label="Close menu"><X /></Button>
        </div>
        <p className="drawer-label">Clinic workspace</p>
        <nav className="drawer-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <Button key={item.label} variant="ghost" className={cn(activeView === item.label && "active")} onClick={() => { setActiveView(item.label); setDrawerOpen(false); }}>
              <item.icon /><span>{item.label}</span>{activeView === item.label && <ChevronRight />}
            </Button>
          ))}
        </nav>
        <div className="drawer-profile"><span>DB</span><div><strong>Dr. Bhushan</strong><small>Administrator</small></div></div>
        <Button variant="ghost" className="logout-button" onClick={() => { setSignedIn(false); setDrawerOpen(false); }}><LogOut /> Sign out</Button>
      </aside>

      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Menu /></Button>
        <div className="compact-brand"><img src={logoMark} alt="" /><span>Clinic CRM</span></div>
        <Button variant="ghost" size="icon" aria-label="Search"><Search /></Button>
      </header>

      <main className="dashboard">
        {activeView !== "Dashboard" ? (
          <section className="empty-view">
            {(() => { const item = navigation.find((entry) => entry.label === activeView); const Icon = item?.icon ?? LayoutDashboard; return <Icon />; })()}
            <h1>{activeView}</h1><p>This area is ready for the next release.</p>
          </section>
        ) : (
          <>
            <section className="greeting">
              <div><p>Wednesday, 30 September</p><h1>Good afternoon, Doctor.</h1><span>Here’s what’s happening at the clinic today.</span></div>
              <span className="status-pill"><i /> Clinic open</span>
            </section>

            <section className="metric-grid" aria-label="Clinic summary">
              <article className="metric-card featured"><div className="metric-icon"><UsersRound /></div><p>Total patients</p><strong>1,248</strong><span>+12 this month</span></article>
              <article className="metric-card"><div className="metric-icon"><CalendarDays /></div><p>Today’s visits</p><strong>08</strong><span>Next at 10:30 AM</span></article>
              <article className="metric-card"><div className="metric-icon"><Sparkles /></div><p>New leads</p><strong>24</strong><span>6 need follow-up</span></article>
            </section>

            <section className="quick-section">
              <div className="section-title"><h2>Quick actions</h2></div>
              <div className="quick-grid">
                <Button variant="outline"><span><Plus /></span>Add patient</Button>
                <Button variant="outline"><span><CalendarDays /></span>Book visit</Button>
                <Button variant="outline"><span><ClipboardPlus /></span>New lead</Button>
                <Button variant="outline"><span><FileText /></span>Create invoice</Button>
              </div>
            </section>

            <section className="content-panel">
              <div className="section-title"><div><p>Schedule</p><h2>Today’s appointments</h2></div><Button variant="ghost">View all <ChevronRight /></Button></div>
              <div className="appointment-list">
                {appointments.map((appointment) => (
                  <article className="appointment" key={appointment.time}>
                    <time>{appointment.time}<small>{appointment.period}</small></time>
                    <span className={cn("avatar", appointment.tone)}>{appointment.initials}</span>
                    <div><strong>{appointment.name}</strong><p>{appointment.service}</p></div>
                    <Button variant="ghost" size="icon" aria-label={`Open ${appointment.name}`}><ChevronRight /></Button>
                  </article>
                ))}
              </div>
            </section>

            <section className="content-panel recent-leads">
              <div className="section-title"><div><p>Pipeline</p><h2>Recent leads</h2></div><Button variant="ghost">View all <ChevronRight /></Button></div>
              {leads.map((lead) => <article className="lead-row" key={lead.name}><span className="avatar">{lead.initials}</span><div><strong>{lead.name}</strong><p>{lead.interest}</p></div><time>{lead.time}</time></article>)}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
