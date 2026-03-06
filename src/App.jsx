import { useState, useEffect } from "react";

const STATUS_CONFIG = {
  "reached_out": { label: "Reached Out", color: "#6b8cba", bg: "rgba(107,140,186,0.15)" },
  "had_call":    { label: "Had Call",     color: "#4a90d9", bg: "rgba(74,144,217,0.15)" },
  "warm":        { label: "Warm",         color: "#7fba7a", bg: "rgba(127,186,122,0.15)" },
  "strong":      { label: "Strong",       color: "#b07fd1", bg: "rgba(176,127,209,0.15)" },
  "lost_touch":  { label: "Lost Touch",   color: "#888",    bg: "rgba(136,136,136,0.12)" },
  "no_reply":    { label: "No Reply",     color: "#c47a5a", bg: "rgba(196,122,90,0.15)" },
};

const FOLLOW_UP_PRESETS = [
  { label: "Tomorrow",    days: 1 },
  { label: "In 3 days",   days: 3 },
  { label: "In 1 week",   days: 7 },
  { label: "In 2 weeks",  days: 14 },
  { label: "In 1 month",  days: 30 },
  { label: "In 3 months", days: 90 },
  { label: "Custom date", days: null },
];

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const EMPTY_FORM = {
  name: "", company: "", role: "", status: "reached_out",
  lastContact: "", followUpDate: "", notes: ""
};

const AVATAR_COLORS = ["#4a90d9","#6b8cba","#7fba7a","#b07fd1","#c47a5a","#5ab5c4","#ba7f8b"];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}

function daysUntil(d) {
  if (!d) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(d + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

const T = {
  bg: "#0d0c0b", surface: "#161512", surface2: "#1e1c18",
  border: "rgba(255,255,255,0.07)", blue: "#4a90d9",
  text: "#e8e4dc", muted: "#8a8070",
};

const s = {
  root: { display:"flex", height:"100vh", background:T.bg, color:T.text, fontFamily:"'DM Sans', sans-serif", fontSize:"14px", overflow:"hidden" },
  sidebar: { width:"220px", minWidth:"220px", background:T.surface, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", padding:"1.5rem 1rem", gap:"0.5rem" },
  brand: { display:"flex", flexDirection:"column", gap:"2px", marginBottom:"1.5rem", paddingLeft:"4px" },
  brandIcon: { color:T.blue, fontSize:"1.2rem", marginBottom:"4px" },
  brandName: { fontFamily:"'Cormorant Garant', serif", fontSize:"1.15rem", fontWeight:600, color:T.text, letterSpacing:"0.02em", lineHeight:1.25 },
  nav: { display:"flex", flexDirection:"column", gap:"2px", marginBottom:"auto" },
  navItem: { display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", borderRadius:"8px", border:"none", background:"transparent", color:T.muted, cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.15s", fontFamily:"'DM Sans', sans-serif" },
  navItemActive: { background:"rgba(74,144,217,0.12)", color:T.blue },
  navIcon: { fontSize:"0.9rem", width:"16px" },
  navLabel: { flex:1, fontSize:"0.82rem" },
  navCount: { background:T.surface2, color:T.muted, fontSize:"0.7rem", padding:"1px 6px", borderRadius:"10px" },
  navCountUrgent: { background:"rgba(196,122,90,0.2)", color:"#c47a5a" },
  statsBox: { display:"flex", marginTop:"1.5rem", marginBottom:"1rem", borderTop:`1px solid ${T.border}`, paddingTop:"1rem" },
  statItem: { flex:1, textAlign:"center" },
  statVal: { fontFamily:"'Cormorant Garant', serif", fontSize:"1.4rem", fontWeight:600, color:T.blue },
  statLabel: { fontSize:"0.65rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em" },
  addBtn: { background:T.blue, color:"#fff", border:"none", borderRadius:"8px", padding:"10px", fontWeight:500, cursor:"pointer", fontSize:"0.82rem", width:"100%", marginTop:"0.5rem", fontFamily:"'DM Sans', sans-serif" },
  main: { flex:1, overflow:"auto", padding:"2rem 2.5rem" },
  viewWrap: { maxWidth:"900px" },
  viewHeader: { marginBottom:"1.5rem" },
  viewTitle: { fontFamily:"'Cormorant Garant', serif", fontSize:"2rem", fontWeight:600, margin:0, color:T.text },
  viewSub: { margin:"4px 0 0", color:T.muted, fontSize:"0.82rem" },
  toolbar: { display:"flex", gap:"10px", marginBottom:"1.5rem", flexWrap:"wrap" },
  searchInput: { flex:1, minWidth:"180px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:"8px", padding:"8px 12px", color:T.text, fontSize:"0.82rem", outline:"none", fontFamily:"'DM Sans', sans-serif" },
  select: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"8px", padding:"8px 10px", color:T.muted, fontSize:"0.78rem", cursor:"pointer", outline:"none", fontFamily:"'DM Sans', sans-serif" },
  contactGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"12px" },
  card: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"12px", padding:"16px", cursor:"pointer", transition:"all 0.15s" },
  cardTop: { display:"flex", alignItems:"center", gap:"12px", marginBottom:"10px" },
  avatar: { width:"38px", height:"38px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cormorant Garant', serif", fontSize:"1rem", fontWeight:600, color:"#fff", flexShrink:0 },
  avatarLg: { width:"60px", height:"60px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cormorant Garant', serif", fontSize:"1.4rem", fontWeight:600, color:"#fff", flexShrink:0 },
  avatarSm: { width:"34px", height:"34px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cormorant Garant', serif", fontSize:"0.9rem", fontWeight:600, color:"#fff", flexShrink:0 },
  cardInfo: { flex:1, minWidth:0 },
  cardName: { fontWeight:500, fontSize:"0.88rem", color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  cardRole: { fontSize:"0.75rem", color:T.muted, marginTop:"2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  cardBottom: { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"10px" },
  cardDate: { fontSize:"0.7rem", color:T.muted },
  statusBadge: { fontSize:"0.68rem", padding:"3px 8px", borderRadius:"20px", whiteSpace:"nowrap", fontWeight:500 },
  followUpChip: { fontSize:"0.68rem", color:T.muted, padding:"2px 7px", background:T.surface2, borderRadius:"4px" },
  overdue: { color:"#c47a5a", background:"rgba(196,122,90,0.15)" },
  soon: { color:"#4a90d9", background:"rgba(74,144,217,0.15)" },
  empty: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"4rem", gap:"1rem", color:T.muted },
  emptyIcon: { fontSize:"2.5rem", opacity:0.3 },
  emptyText: { fontSize:"0.9rem" },
  detailWrap: { maxWidth:"640px" },
  backBtn: { background:"transparent", border:"none", color:T.muted, cursor:"pointer", fontSize:"0.82rem", padding:"0 0 1.5rem 0", fontFamily:"'DM Sans', sans-serif" },
  detailHeader: { display:"flex", alignItems:"flex-start", gap:"16px", marginBottom:"2rem" },
  detailName: { fontFamily:"'Cormorant Garant', serif", fontSize:"1.8rem", fontWeight:600, margin:"0 0 4px", color:T.text },
  detailRole: { fontSize:"0.85rem", color:T.muted, marginBottom:"8px" },
  detailActions: { marginLeft:"auto", display:"flex", gap:"8px" },
  editBtnSm: { background:T.surface2, border:`1px solid ${T.border}`, color:T.text, borderRadius:"7px", padding:"6px 14px", cursor:"pointer", fontSize:"0.78rem", fontFamily:"'DM Sans', sans-serif" },
  deleteBtnSm: { background:"rgba(196,122,90,0.12)", border:"1px solid rgba(196,122,90,0.2)", color:"#c47a5a", borderRadius:"7px", padding:"6px 14px", cursor:"pointer", fontSize:"0.78rem", fontFamily:"'DM Sans', sans-serif" },
  detailGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.5rem" },
  detailField: { background:T.surface, borderRadius:"10px", padding:"12px 14px", border:`1px solid ${T.border}` },
  detailFieldLabel: { fontSize:"0.68rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"4px" },
  detailFieldVal: { fontSize:"0.85rem", color:T.text },
  notesBox: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"10px", padding:"16px" },
  notesLabel: { fontSize:"0.68rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px" },
  notesText: { fontSize:"0.85rem", color:T.text, lineHeight:1.7, whiteSpace:"pre-wrap" },
  pipelineSection: { fontSize:"0.72rem", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.1em", borderLeft:"2px solid", paddingLeft:"10px", marginBottom:"0.75rem" },
  pipelineRow: { display:"flex", alignItems:"center", gap:"12px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:"10px", padding:"12px 14px", marginBottom:"8px", cursor:"pointer", transition:"all 0.15s" },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:"1rem" },
  modal: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"16px", width:"100%", maxWidth:"480px", maxHeight:"90vh", display:"flex", flexDirection:"column", overflow:"hidden" },
  modalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1.25rem 1.5rem", borderBottom:`1px solid ${T.border}` },
  modalTitle: { fontFamily:"'Cormorant Garant', serif", fontSize:"1.2rem", fontWeight:600 },
  closeBtn: { background:"transparent", border:"none", color:T.muted, fontSize:"1rem", cursor:"pointer" },
  modalBody: { padding:"1.5rem", overflow:"auto", display:"flex", flexDirection:"column", gap:"14px" },
  modalFooter: { padding:"1rem 1.5rem", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"flex-end", gap:"8px" },
  formRow: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
  formGroup: { display:"flex", flexDirection:"column", gap:"5px" },
  formLabel: { fontSize:"0.72rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  input: { background:T.surface2, border:`1px solid ${T.border}`, borderRadius:"8px", padding:"8px 10px", color:T.text, fontSize:"0.82rem", outline:"none", fontFamily:"'DM Sans', sans-serif", width:"100%", boxSizing:"border-box" },
  presetRow: { display:"flex", gap:"6px", flexWrap:"wrap", marginTop:"4px" },
  presetBtn: { background:T.surface2, border:`1px solid ${T.border}`, borderRadius:"6px", padding:"4px 10px", color:T.muted, fontSize:"0.72rem", cursor:"pointer", fontFamily:"'DM Sans', sans-serif", transition:"all 0.1s" },
  presetBtnActive: { background:"rgba(74,144,217,0.15)", borderColor:"rgba(74,144,217,0.4)", color:T.blue },
  cancelBtn: { background:"transparent", border:`1px solid ${T.border}`, color:T.muted, borderRadius:"8px", padding:"8px 16px", cursor:"pointer", fontSize:"0.82rem", fontFamily:"'DM Sans', sans-serif" },
  submitBtn: { background:T.blue, color:"#fff", border:"none", borderRadius:"8px", padding:"8px 20px", fontWeight:500, cursor:"pointer", fontSize:"0.82rem", fontFamily:"'DM Sans', sans-serif" },
  deleteBtn: { background:"rgba(196,122,90,0.15)", border:"1px solid rgba(196,122,90,0.3)", color:"#c47a5a", borderRadius:"8px", padding:"8px 16px", cursor:"pointer", fontSize:"0.82rem", fontFamily:"'DM Sans', sans-serif" },
  confirmBox: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"12px", padding:"1.5rem", maxWidth:"320px", width:"100%" },
  confirmTitle: { fontFamily:"'Cormorant Garant', serif", fontSize:"1.2rem", marginBottom:"6px" },
  confirmText: { color:T.muted, fontSize:"0.82rem", marginBottom:"1.2rem" },
  confirmBtns: { display:"flex", gap:"8px", justifyContent:"flex-end" },
  analyticsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(175px, 1fr))", gap:"12px", marginBottom:"2rem" },
  statCard: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"12px", padding:"20px 16px" },
  statCardVal: { fontFamily:"'Cormorant Garant', serif", fontSize:"2.2rem", fontWeight:600, color:T.blue, lineHeight:1 },
  statCardLabel: { fontSize:"0.72rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:"6px" },
  statCardSub: { fontSize:"0.75rem", color:T.muted, marginTop:"4px" },
  sectionTitle: { fontFamily:"'Cormorant Garant', serif", fontSize:"1.2rem", fontWeight:600, marginBottom:"1rem", color:T.text },
  funnelWrap: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"12px", padding:"1.5rem", marginBottom:"2rem" },
  funnelRow: { display:"flex", alignItems:"center", gap:"12px", marginBottom:"10px" },
  funnelLabel: { width:"120px", fontSize:"0.78rem", color:T.muted, textAlign:"right", flexShrink:0 },
  funnelBarWrap: { flex:1, background:T.surface2, borderRadius:"4px", height:"28px", overflow:"hidden" },
  funnelBar: { height:"100%", borderRadius:"4px", display:"flex", alignItems:"center", paddingLeft:"10px", fontSize:"0.75rem", color:"#fff", fontWeight:500, minWidth:"2px" },
  funnelCount: { width:"40px", fontSize:"0.78rem", color:T.muted, flexShrink:0 },
  healthWrap: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"2rem" },
  healthCard: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"12px", padding:"1.25rem" },
  healthTitle: { fontSize:"0.72rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"1rem" },
  healthRow: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" },
  healthLabel: { fontSize:"0.8rem", color:T.text },
  healthVal: { fontSize:"0.8rem", color:T.blue, fontWeight:500 },
};

const STORAGE_KEY = "network_crm_contacts";
function loadContacts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveContacts(c) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch {}
}

export default function App() {
  const [contacts, setContacts] = useState(() => loadContacts());
  const [view, setView] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("lastContact");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { saveContacts(contacts); }, [contacts]);

  function openAdd() { setEditingContact(null); setForm(EMPTY_FORM); setShowModal(true); }
  function openEdit(c) { setEditingContact(c); setForm({ ...c }); setShowModal(true); }

  function submitForm() {
    if (!form.name.trim()) return;
    if (editingContact) {
      setContacts(cs => cs.map(c => c.id === editingContact.id ? { ...form, id: c.id } : c));
    } else {
      setContacts(cs => [{ ...form, id: Date.now().toString() }, ...cs]);
    }
    setShowModal(false);
  }

  function deleteContact(id) {
    setContacts(cs => cs.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
    setDeleteConfirm(null);
  }

  const selected = contacts.find(c => c.id === selectedId);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.role?.toLowerCase().includes(q))
      && (filterStatus === "all" || c.status === filterStatus);
  }).sort((a, b) => {
    if (sortBy === "lastContact") return (b.lastContact || "") > (a.lastContact || "") ? 1 : -1;
    if (sortBy === "followUp") return (a.followUpDate || "9999") > (b.followUpDate || "9999") ? 1 : -1;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const needFollowUp = contacts.filter(c => {
    const d = daysUntil(c.followUpDate);
    return d !== null && d <= 7;
  }).sort((a, b) => (a.followUpDate > b.followUpDate ? 1 : -1));

  const stats = {
    total: contacts.length,
    calls: contacts.filter(c => ["had_call","warm","strong"].includes(c.status)).length,
    warm: contacts.filter(c => ["warm","strong"].includes(c.status)).length,
  };

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <span style={s.brandIcon}>◈</span>
          <span style={s.brandName}>John Dulak's<br/>Network</span>
        </div>
        <nav style={s.nav}>
          {[
            { id:"all",       icon:"⬡", label:"All Contacts",    count:contacts.length },
            { id:"pipeline",  icon:"◎", label:"Follow-Up Queue", count:needFollowUp.length },
            { id:"analytics", icon:"◈", label:"Analytics",       count:0 },
          ].map(item => (
            <button key={item.id}
              style={{ ...s.navItem, ...(view === item.id && !selectedId ? s.navItemActive : {}) }}
              onClick={() => { setView(item.id); setSelectedId(null); }}>
              <span style={s.navIcon}>{item.icon}</span>
              <span style={s.navLabel}>{item.label}</span>
              {item.count > 0 && <span style={{ ...s.navCount, ...(item.id === "pipeline" ? s.navCountUrgent : {}) }}>{item.count}</span>}
            </button>
          ))}
        </nav>
        <div style={s.statsBox}>
          {[{label:"Total",val:stats.total},{label:"Had Call",val:stats.calls},{label:"Warm+",val:stats.warm}].map(st => (
            <div key={st.label} style={s.statItem}>
              <div style={s.statVal}>{st.val}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>
        <button style={s.addBtn} onClick={openAdd}>+ Add Contact</button>
      </aside>

      <main style={s.main}>
        {selectedId && selected ? (
          <DetailView contact={selected} onBack={() => setSelectedId(null)} onEdit={() => openEdit(selected)} onDelete={() => setDeleteConfirm(selected.id)} />
        ) : view === "pipeline" ? (
          <PipelineView contacts={needFollowUp} onSelect={setSelectedId} />
        ) : view === "analytics" ? (
          <AnalyticsView contacts={contacts} />
        ) : (
          <AllContactsView contacts={filtered} search={search} setSearch={setSearch}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            sortBy={sortBy} setSortBy={setSortBy}
            onSelect={setSelectedId} onEdit={openEdit} />
        )}
      </main>

      {showModal && <ContactModal form={form} setForm={setForm} editing={!!editingContact} onSubmit={submitForm} onClose={() => setShowModal(false)} />}

      {deleteConfirm && (
        <div style={s.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={s.confirmBox} onClick={e => e.stopPropagation()}>
            <div style={s.confirmTitle}>Remove Contact?</div>
            <div style={s.confirmText}>This can't be undone.</div>
            <div style={s.confirmBtns}>
              <button style={s.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={s.deleteBtn} onClick={() => deleteContact(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsView({ contacts }) {
  const total = contacts.length;
  const byStatus = Object.keys(STATUS_CONFIG).reduce((acc, k) => {
    acc[k] = contacts.filter(c => c.status === k).length;
    return acc;
  }, {});

  const hadCall = byStatus.had_call + byStatus.warm + byStatus.strong;
  const warm = byStatus.warm + byStatus.strong;
  const strong = byStatus.strong;
  const noReply = byStatus.no_reply;
  const lostTouch = byStatus.lost_touch;

  const callRate = total > 0 ? Math.round((hadCall / total) * 100) : 0;
  const warmRate = hadCall > 0 ? Math.round((warm / hadCall) * 100) : 0;
  const overdue = contacts.filter(c => { const d = daysUntil(c.followUpDate); return d !== null && d < 0; }).length;
  const dueThisWeek = contacts.filter(c => { const d = daysUntil(c.followUpDate); return d !== null && d >= 0 && d <= 7; }).length;
  const noFollowUp = contacts.filter(c => !c.followUpDate).length;

  const companyCounts = {};
  contacts.forEach(c => { if (c.company) companyCounts[c.company] = (companyCounts[c.company] || 0) + 1; });
  const topCompanies = Object.entries(companyCounts).sort((a,b) => b[1]-a[1]).slice(0,5);

  const funnel = [
    { label: "Total Reached", count: total,   color: "#6b8cba" },
    { label: "Had a Call",    count: hadCall,  color: "#4a90d9" },
    { label: "Warm",          count: warm,     color: "#7fba7a" },
    { label: "Strong",        count: strong,   color: "#b07fd1" },
  ];
  const maxFunnel = total || 1;

  if (total === 0) {
    return (
      <div style={s.viewWrap}>
        <div style={s.viewHeader}>
          <h1 style={s.viewTitle}>Analytics</h1>
          <p style={s.viewSub}>Add contacts to see your network stats</p>
        </div>
        <div style={s.empty}><div style={s.emptyIcon}>◈</div><div style={s.emptyText}>No data yet.</div></div>
      </div>
    );
  }

  return (
    <div style={s.viewWrap}>
      <div style={s.viewHeader}>
        <h1 style={s.viewTitle}>Analytics</h1>
        <p style={s.viewSub}>How your network is performing</p>
      </div>

      <div style={s.analyticsGrid}>
        {[
          { val: total,        label: "Total Contacts",     sub: "in your network",      alert: false },
          { val: hadCall,      label: "Calls Had",          sub: `${callRate}% of outreach`, alert: false },
          { val: warm,         label: "Warm Relationships", sub: `${warmRate}% of calls`, alert: false },
          { val: noReply,      label: "No Reply",           sub: "need a nudge",         alert: false },
          { val: overdue,      label: "Overdue Follow-Ups", sub: "need attention now",   alert: overdue > 0 },
          { val: dueThisWeek,  label: "Due This Week",      sub: "upcoming follow-ups",  alert: false },
        ].map(c => (
          <div key={c.label} style={s.statCard}>
            <div style={{ ...s.statCardVal, ...(c.alert ? { color:"#c47a5a" } : {}) }}>{c.val}</div>
            <div style={s.statCardLabel}>{c.label}</div>
            <div style={s.statCardSub}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={s.funnelWrap}>
        <div style={s.sectionTitle}>Relationship Funnel</div>
        {funnel.map(f => (
          <div key={f.label} style={s.funnelRow}>
            <div style={s.funnelLabel}>{f.label}</div>
            <div style={s.funnelBarWrap}>
              <div style={{ ...s.funnelBar, width:`${Math.max((f.count/maxFunnel)*100, f.count > 0 ? 3 : 0)}%`, background:f.color }}>
                {f.count > 0 && f.count}
              </div>
            </div>
            <div style={s.funnelCount}>{total > 0 ? `${Math.round((f.count/total)*100)}%` : "0%"}</div>
          </div>
        ))}
      </div>

      <div style={s.healthWrap}>
        <div style={s.healthCard}>
          <div style={s.healthTitle}>Network Health</div>
          {[
            { label:"Follow-up set",   val:`${contacts.filter(c=>c.followUpDate).length} / ${total}` },
            { label:"No follow-up",    val:noFollowUp },
            { label:"Lost touch",      val:lostTouch },
            { label:"Active (warm+)",  val:warm },
          ].map(r => (
            <div key={r.label} style={s.healthRow}>
              <span style={s.healthLabel}>{r.label}</span>
              <span style={s.healthVal}>{r.val}</span>
            </div>
          ))}
        </div>

        <div style={s.healthCard}>
          <div style={s.healthTitle}>Top Companies</div>
          {topCompanies.length === 0 ? (
            <div style={{ color:T.muted, fontSize:"0.8rem" }}>No company data yet</div>
          ) : topCompanies.map(([company, count]) => (
            <div key={company} style={s.healthRow}>
              <span style={s.healthLabel}>{company}</span>
              <span style={s.healthVal}>{count} {count === 1 ? "contact" : "contacts"}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.healthCard}>
        <div style={s.healthTitle}>Status Breakdown</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginTop:"4px" }}>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <div key={k} style={{ background:v.bg, borderRadius:"8px", padding:"10px 16px", minWidth:"120px" }}>
              <div style={{ fontFamily:"'Cormorant Garant', serif", fontSize:"1.6rem", fontWeight:600, color:v.color }}>{byStatus[k]}</div>
              <div style={{ fontSize:"0.7rem", color:T.muted, marginTop:"2px" }}>{v.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AllContactsView({ contacts, search, setSearch, filterStatus, setFilterStatus, sortBy, setSortBy, onSelect }) {
  return (
    <div style={s.viewWrap}>
      <div style={s.viewHeader}>
        <h1 style={s.viewTitle}>All Contacts</h1>
        <p style={s.viewSub}>{contacts.length} {contacts.length === 1 ? "person" : "people"} in your network</p>
      </div>
      <div style={s.toolbar}>
        <input style={s.searchInput} placeholder="Search by name, company, role..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select style={s.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="lastContact">Recent Contact</option>
          <option value="followUp">Follow-Up Date</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
      {contacts.length === 0 ? (
        <div style={s.empty}><div style={s.emptyIcon}>◈</div><div style={s.emptyText}>No contacts yet. Add your first one.</div></div>
      ) : (
        <div style={s.contactGrid}>
          {contacts.map(c => <ContactCard key={c.id} contact={c} onSelect={onSelect} />)}
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact: c, onSelect }) {
  const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.reached_out;
  const days = daysUntil(c.followUpDate);
  return (
    <div style={s.card} onClick={() => onSelect(c.id)} className="contact-card">
      <div style={s.cardTop}>
        <div style={{ ...s.avatar, background: avatarColor(c.name) }}>{initials(c.name)}</div>
        <div style={s.cardInfo}>
          <div style={s.cardName}>{c.name}</div>
          <div style={s.cardRole}>{[c.role, c.company].filter(Boolean).join(" · ") || "—"}</div>
        </div>
        <span style={{ ...s.statusBadge, color:st.color, background:st.bg }}>{st.label}</span>
      </div>
      <div style={s.cardBottom}>
        <span style={s.cardDate}>Last contact: {formatDate(c.lastContact)}</span>
        {c.followUpDate && days !== null && (
          <span style={{ ...s.followUpChip, ...(days < 0 ? s.overdue : days <= 3 ? s.soon : {}) }}>
            {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `in ${days}d`}
          </span>
        )}
      </div>
    </div>
  );
}

function DetailView({ contact: c, onBack, onEdit, onDelete }) {
  const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.reached_out;
  const days = daysUntil(c.followUpDate);
  return (
    <div style={s.detailWrap}>
      <button style={s.backBtn} onClick={onBack}>← Back</button>
      <div style={s.detailHeader}>
        <div style={{ ...s.avatarLg, background: avatarColor(c.name) }}>{initials(c.name)}</div>
        <div>
          <h1 style={s.detailName}>{c.name}</h1>
          <div style={s.detailRole}>{[c.role, c.company].filter(Boolean).join(" · ") || "No role info"}</div>
          <span style={{ ...s.statusBadge, color:st.color, background:st.bg, fontSize:"0.75rem" }}>{st.label}</span>
        </div>
        <div style={s.detailActions}>
          <button style={s.editBtnSm} onClick={onEdit}>Edit</button>
          <button style={s.deleteBtnSm} onClick={onDelete}>Delete</button>
        </div>
      </div>
      <div style={s.detailGrid}>
        {[
          { label:"Last Contact", value:formatDate(c.lastContact) },
          { label:"Follow-Up", value:c.followUpDate ? `${formatDate(c.followUpDate)}${days !== null ? ` (${days === 0 ? "today" : days < 0 ? `${Math.abs(days)}d overdue` : `in ${days}d`})` : ""}` : "—" },
        ].map(f => (
          <div key={f.label} style={s.detailField}>
            <div style={s.detailFieldLabel}>{f.label}</div>
            <div style={s.detailFieldVal}>{f.value || "—"}</div>
          </div>
        ))}
      </div>
      {c.notes && (
        <div style={s.notesBox}>
          <div style={s.notesLabel}>Notes</div>
          <div style={s.notesText}>{c.notes}</div>
        </div>
      )}
    </div>
  );
}

function PipelineView({ contacts, onSelect }) {
  const overdue = contacts.filter(c => daysUntil(c.followUpDate) < 0);
  const today   = contacts.filter(c => daysUntil(c.followUpDate) === 0);
  const soon    = contacts.filter(c => { const d = daysUntil(c.followUpDate); return d > 0 && d <= 7; });
  return (
    <div style={s.viewWrap}>
      <div style={s.viewHeader}>
        <h1 style={s.viewTitle}>Follow-Up Queue</h1>
        <p style={s.viewSub}>{contacts.length} contacts need attention</p>
      </div>
      {contacts.length === 0 ? (
        <div style={s.empty}><div style={s.emptyIcon}>✓</div><div style={s.emptyText}>You're all caught up.</div></div>
      ) : (
        <>
          {overdue.length > 0 && <PipelineSection title="Overdue" contacts={overdue} onSelect={onSelect} accent="#c47a5a" />}
          {today.length > 0  && <PipelineSection title="Due Today" contacts={today} onSelect={onSelect} accent="#4a90d9" />}
          {soon.length > 0   && <PipelineSection title="This Week" contacts={soon} onSelect={onSelect} accent="#6b8cba" />}
        </>
      )}
    </div>
  );
}

function PipelineSection({ title, contacts, onSelect, accent }) {
  return (
    <div style={{ marginBottom:"2rem" }}>
      <div style={{ ...s.pipelineSection, borderColor:accent, color:accent }}>{title}</div>
      {contacts.map(c => {
        const days = daysUntil(c.followUpDate);
        const st = STATUS_CONFIG[c.status];
        return (
          <div key={c.id} style={s.pipelineRow} onClick={() => onSelect(c.id)} className="contact-card">
            <div style={{ ...s.avatarSm, background: avatarColor(c.name) }}>{initials(c.name)}</div>
            <div style={{ flex:1 }}>
              <div style={s.cardName}>{c.name}</div>
              <div style={s.cardRole}>{[c.role, c.company].filter(Boolean).join(" · ") || "—"}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <span style={{ ...s.statusBadge, color:st?.color, background:st?.bg }}>{st?.label}</span>
              <div style={{ fontSize:"0.72rem", color:accent, marginTop:"4px" }}>
                {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `in ${days}d`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContactModal({ form, setForm, editing, onSubmit, onClose }) {
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function selectPreset(preset) {
    if (preset.days === null) {
      setShowCustomDate(true);
      setActivePreset("custom");
    } else {
      setShowCustomDate(false);
      setActivePreset(preset.label);
      set("followUpDate", addDays(preset.days));
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <span style={s.modalTitle}>{editing ? "Edit Contact" : "Add Contact"}</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={s.modalBody}>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Name *</label>
            <input style={s.input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name" />
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Company</label>
              <input style={s.input} value={form.company} onChange={e => set("company", e.target.value)} placeholder="Company" />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Role / Title</label>
              <input style={s.input} value={form.role} onChange={e => set("role", e.target.value)} placeholder="e.g. VP Sales" />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Status</label>
            <select style={s.input} value={form.status} onChange={e => set("status", e.target.value)}>
              {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Last Contact</label>
            <input style={s.input} type="date" value={form.lastContact} onChange={e => set("lastContact", e.target.value)} />
          </div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Follow-Up</label>
            <div style={s.presetRow}>
              {FOLLOW_UP_PRESETS.map(p => (
                <button key={p.label}
                  style={{ ...s.presetBtn, ...(activePreset === (p.days === null ? "custom" : p.label) ? s.presetBtnActive : {}) }}
                  onClick={() => selectPreset(p)}>
                  {p.label}
                </button>
              ))}
            </div>
            {(showCustomDate || form.followUpDate) && (
              <input style={{ ...s.input, marginTop:"8px" }} type="date" value={form.followUpDate}
                onChange={e => { set("followUpDate", e.target.value); setActivePreset("custom"); setShowCustomDate(true); }} />
            )}
          </div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Notes</label>
            <textarea style={{ ...s.input, height:"90px", resize:"vertical" }}
              value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Key takeaways, what you talked about..." />
          </div>
        </div>
        <div style={s.modalFooter}>
          <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={s.submitBtn} onClick={onSubmit} disabled={!form.name.trim()}>
            {editing ? "Save Changes" : "Add Contact"}
          </button>
        </div>
      </div>
    </div>
  );
}
