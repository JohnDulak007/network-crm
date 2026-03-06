import { useState, useEffect } from "react";

const STATUS_CONFIG = {
  "reached_out": { label: "Reached Out", color: "#6b8cba", bg: "rgba(107,140,186,0.15)" },
  "had_call":    { label: "Had Call",     color: "#c9a84c", bg: "rgba(201,168,76,0.15)" },
  "warm":        { label: "Warm",         color: "#7fba7a", bg: "rgba(127,186,122,0.15)" },
  "strong":      { label: "Strong",       color: "#b07fd1", bg: "rgba(176,127,209,0.15)" },
  "lost_touch":  { label: "Lost Touch",   color: "#888",    bg: "rgba(136,136,136,0.12)" },
  "no_reply":    { label: "No Reply",     color: "#c47a5a", bg: "rgba(196,122,90,0.15)" },
};

const HOW_MET_OPTIONS = ["LinkedIn","Cold Outreach","Referral","Event/Conference","Twitter/X","In Person","Class/School","Other"];

const EMPTY_FORM = {
  name:"", company:"", role:"", email:"", linkedin:"",
  howMet:"", status:"reached_out", tags:"",
  lastContact:"", followUpDate:"", notes:""
};

const AVATAR_COLORS = ["#c9a84c","#6b8cba","#7fba7a","#b07fd1","#c47a5a","#5ab5c4","#ba7f8b"];

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
  border: "rgba(255,255,255,0.07)", gold: "#c9a84c",
  text: "#e8e4dc", muted: "#8a8070",
};

const s = {
  root: { display:"flex", height:"100vh", background:T.bg, color:T.text, fontFamily:"'DM Sans', sans-serif", fontSize:"14px", overflow:"hidden" },
  sidebar: { width:"220px", minWidth:"220px", background:T.surface, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", padding:"1.5rem 1rem", gap:"0.5rem" },
  brand: { display:"flex", alignItems:"center", gap:"8px", marginBottom:"1.5rem", paddingLeft:"4px" },
  brandIcon: { color:T.gold, fontSize:"1.2rem" },
  brandText: { fontFamily:"'Cormorant Garant', serif", fontSize:"1.3rem", fontWeight:600, color:T.text, letterSpacing:"0.05em" },
  nav: { display:"flex", flexDirection:"column", gap:"2px", marginBottom:"auto" },
  navItem: { display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", borderRadius:"8px", border:"none", background:"transparent", color:T.muted, cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.15s", fontFamily:"'DM Sans', sans-serif" },
  navItemActive: { background:"rgba(201,168,76,0.1)", color:T.gold },
  navIcon: { fontSize:"0.9rem", width:"16px" },
  navLabel: { flex:1, fontSize:"0.82rem" },
  navCount: { background:T.surface2, color:T.muted, fontSize:"0.7rem", padding:"1px 6px", borderRadius:"10px" },
  navCountUrgent: { background:"rgba(196,122,90,0.2)", color:"#c47a5a" },
  statsBox: { display:"flex", marginTop:"1.5rem", marginBottom:"1rem", borderTop:`1px solid ${T.border}`, paddingTop:"1rem" },
  statItem: { flex:1, textAlign:"center" },
  statVal: { fontFamily:"'Cormorant Garant', serif", fontSize:"1.4rem", fontWeight:600, color:T.gold },
  statLabel: { fontSize:"0.65rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em" },
  addBtn: { background:T.gold, color:"#0d0c0b", border:"none", borderRadius:"8px", padding:"10px", fontWeight:500, cursor:"pointer", fontSize:"0.82rem", width:"100%", marginTop:"0.5rem", fontFamily:"'DM Sans', sans-serif" },
  main: { flex:1, overflow:"auto", padding:"2rem 2.5rem" },
  viewWrap: { maxWidth:"860px" },
  viewHeader: { marginBottom:"1.5rem" },
  viewTitle: { fontFamily:"'Cormorant Garant', serif", fontSize:"2rem", fontWeight:600, margin:0, color:T.text },
  viewSub: { margin:"4px 0 0", color:T.muted, fontSize:"0.82rem" },
  toolbar: { display:"flex", gap:"10px", marginBottom:"1.5rem", flexWrap:"wrap" },
  searchInput: { flex:1, minWidth:"180px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:"8px", padding:"8px 12px", color:T.text, fontSize:"0.82rem", outline:"none", fontFamily:"'DM Sans', sans-serif" },
  select: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"8px", padding:"8px 10px", color:T.muted, fontSize:"0.78rem", cursor:"pointer", outline:"none", fontFamily:"'DM Sans', sans-serif" },
  contactGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"12px" },
  card: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"12px", padding:"16px", cursor:"pointer", transition:"all 0.15s" },
  cardTop: { display:"flex", alignItems:"center", gap:"12px", marginBottom:"10px" },
  avatar: { width:"38px", height:"38px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cormorant Garant', serif", fontSize:"1rem", fontWeight:600, color:"#0d0c0b", flexShrink:0 },
  avatarLg: { width:"60px", height:"60px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cormorant Garant', serif", fontSize:"1.4rem", fontWeight:600, color:"#0d0c0b", flexShrink:0 },
  avatarSm: { width:"34px", height:"34px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cormorant Garant', serif", fontSize:"0.9rem", fontWeight:600, color:"#0d0c0b", flexShrink:0 },
  cardInfo: { flex:1, minWidth:0 },
  cardName: { fontWeight:500, fontSize:"0.88rem", color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  cardRole: { fontSize:"0.75rem", color:T.muted, marginTop:"2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  cardMeta: { fontSize:"0.72rem", color:T.muted, marginBottom:"8px" },
  cardBottom: { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"10px" },
  cardDate: { fontSize:"0.7rem", color:T.muted },
  tagRow: { display:"flex", gap:"4px", flexWrap:"wrap", marginBottom:"6px" },
  tag: { background:"rgba(201,168,76,0.1)", color:T.gold, fontSize:"0.65rem", padding:"2px 7px", borderRadius:"4px" },
  statusBadge: { fontSize:"0.68rem", padding:"3px 8px", borderRadius:"20px", whiteSpace:"nowrap", fontWeight:500 },
  followUpChip: { fontSize:"0.68rem", color:T.muted, padding:"2px 7px", background:T.surface2, borderRadius:"4px" },
  overdue: { color:"#c47a5a", background:"rgba(196,122,90,0.15)" },
  soon: { color:"#c9a84c", background:"rgba(201,168,76,0.15)" },
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
  link: { color:T.gold, textDecoration:"none" },
  notesBox: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"10px", padding:"16px" },
  notesLabel: { fontSize:"0.68rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px" },
  notesText: { fontSize:"0.85rem", color:T.text, lineHeight:1.7, whiteSpace:"pre-wrap" },
  pipelineSection: { fontSize:"0.72rem", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.1em", borderLeft:"2px solid", paddingLeft:"10px", marginBottom:"0.75rem" },
  pipelineRow: { display:"flex", alignItems:"center", gap:"12px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:"10px", padding:"12px 14px", marginBottom:"8px", cursor:"pointer", transition:"all 0.15s" },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:"1rem" },
  modal: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"16px", width:"100%", maxWidth:"600px", maxHeight:"90vh", display:"flex", flexDirection:"column", overflow:"hidden" },
  modalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1.25rem 1.5rem", borderBottom:`1px solid ${T.border}` },
  modalTitle: { fontFamily:"'Cormorant Garant', serif", fontSize:"1.2rem", fontWeight:600 },
  closeBtn: { background:"transparent", border:"none", color:T.muted, fontSize:"1rem", cursor:"pointer" },
  modalBody: { padding:"1.5rem", overflow:"auto", display:"flex", flexDirection:"column", gap:"12px" },
  modalFooter: { padding:"1rem 1.5rem", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"flex-end", gap:"8px" },
  formRow: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
  formGroup: { display:"flex", flexDirection:"column", gap:"5px" },
  formLabel: { fontSize:"0.72rem", color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  input: { background:T.surface2, border:`1px solid ${T.border}`, borderRadius:"8px", padding:"8px 10px", color:T.text, fontSize:"0.82rem", outline:"none", fontFamily:"'DM Sans', sans-serif", width:"100%", boxSizing:"border-box" },
  cancelBtn: { background:"transparent", border:`1px solid ${T.border}`, color:T.muted, borderRadius:"8px", padding:"8px 16px", cursor:"pointer", fontSize:"0.82rem", fontFamily:"'DM Sans', sans-serif" },
  submitBtn: { background:T.gold, color:"#0d0c0b", border:"none", borderRadius:"8px", padding:"8px 20px", fontWeight:500, cursor:"pointer", fontSize:"0.82rem", fontFamily:"'DM Sans', sans-serif" },
  deleteBtn: { background:"rgba(196,122,90,0.15)", border:"1px solid rgba(196,122,90,0.3)", color:"#c47a5a", borderRadius:"8px", padding:"8px 16px", cursor:"pointer", fontSize:"0.82rem", fontFamily:"'DM Sans', sans-serif" },
  confirmBox: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:"12px", padding:"1.5rem", maxWidth:"320px", width:"100%" },
  confirmTitle: { fontFamily:"'Cormorant Garant', serif", fontSize:"1.2rem", marginBottom:"6px" },
  confirmText: { color:T.muted, fontSize:"0.82rem", marginBottom:"1.2rem" },
  confirmBtns: { display:"flex", gap:"8px", justifyContent:"flex-end" },
};

// ── STORAGE (localStorage) ────────────────────────────────────────────────
const STORAGE_KEY = "network_crm_contacts";
function loadContacts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveContacts(c) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch {}
}

// ── MAIN APP ──────────────────────────────────────────────────────────────
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
    if (selectedId === id) { setSelectedId(null); }
    setDeleteConfirm(null);
  }

  const selected = contacts.find(c => c.id === selectedId);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.role?.toLowerCase().includes(q) || c.tags?.toLowerCase().includes(q))
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
      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <span style={s.brandIcon}>◈</span>
          <span style={s.brandText}>Network</span>
        </div>
        <nav style={s.nav}>
          {[
            { id:"all", icon:"⬡", label:"All Contacts", count:contacts.length },
            { id:"pipeline", icon:"◎", label:"Follow-Up Queue", count:needFollowUp.length },
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

      {/* MAIN */}
      <main style={s.main}>
        {selectedId && selected ? (
          <DetailView contact={selected} onBack={() => setSelectedId(null)} onEdit={() => openEdit(selected)} onDelete={() => setDeleteConfirm(selected.id)} />
        ) : view === "pipeline" ? (
          <PipelineView contacts={needFollowUp} onSelect={setSelectedId} />
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

function AllContactsView({ contacts, search, setSearch, filterStatus, setFilterStatus, sortBy, setSortBy, onSelect, onEdit }) {
  return (
    <div style={s.viewWrap}>
      <div style={s.viewHeader}>
        <h1 style={s.viewTitle}>All Contacts</h1>
        <p style={s.viewSub}>{contacts.length} {contacts.length === 1 ? "person" : "people"} in your network</p>
      </div>
      <div style={s.toolbar}>
        <input style={s.searchInput} placeholder="Search by name, company, tags..." value={search} onChange={e => setSearch(e.target.value)} />
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
          {contacts.map(c => <ContactCard key={c.id} contact={c} onSelect={onSelect} onEdit={onEdit} />)}
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
      {c.howMet && <div style={s.cardMeta}>Met via {c.howMet}</div>}
      {c.tags && (
        <div style={s.tagRow}>
          {c.tags.split(",").map(t=>t.trim()).filter(Boolean).map(t => <span key={t} style={s.tag}>{t}</span>)}
        </div>
      )}
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
          { label:"How You Met", value:c.howMet },
          { label:"Email", value:c.email },
          { label:"LinkedIn", value:c.linkedin, link:true },
          { label:"Last Contact", value:formatDate(c.lastContact) },
          { label:"Follow-Up", value:c.followUpDate ? `${formatDate(c.followUpDate)}${days !== null ? ` (${days === 0 ? "today" : days < 0 ? `${Math.abs(days)}d overdue` : `in ${days}d`})` : ""}` : "—" },
          { label:"Tags", value:c.tags },
        ].map(f => (
          <div key={f.label} style={s.detailField}>
            <div style={s.detailFieldLabel}>{f.label}</div>
            <div style={s.detailFieldVal}>
              {f.link && f.value ? <a href={f.value.startsWith("http") ? f.value : `https://${f.value}`} target="_blank" rel="noreferrer" style={s.link}>{f.value}</a> : (f.value || "—")}
            </div>
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
  const today = contacts.filter(c => daysUntil(c.followUpDate) === 0);
  const soon = contacts.filter(c => { const d = daysUntil(c.followUpDate); return d > 0 && d <= 7; });
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
          {today.length > 0 && <PipelineSection title="Due Today" contacts={today} onSelect={onSelect} accent="#c9a84c" />}
          {soon.length > 0 && <PipelineSection title="This Week" contacts={soon} onSelect={onSelect} accent="#6b8cba" />}
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
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <span style={s.modalTitle}>{editing ? "Edit Contact" : "Add Contact"}</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={s.modalBody}>
          <div style={s.formRow}>
            <FF label="Name *" value={form.name} onChange={v => set("name",v)} placeholder="Full name" />
            <FF label="Company" value={form.company} onChange={v => set("company",v)} placeholder="Company" />
          </div>
          <div style={s.formRow}>
            <FF label="Role / Title" value={form.role} onChange={v => set("role",v)} placeholder="e.g. VP Sales" />
            <FF label="Email" value={form.email} onChange={v => set("email",v)} placeholder="email@example.com" type="email" />
          </div>
          <div style={s.formRow}>
            <FF label="LinkedIn URL" value={form.linkedin} onChange={v => set("linkedin",v)} placeholder="linkedin.com/in/..." />
            <div style={s.formGroup}>
              <label style={s.formLabel}>How You Met</label>
              <select style={s.input} value={form.howMet} onChange={e => set("howMet",e.target.value)}>
                <option value="">Select...</option>
                {HOW_MET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Status</label>
              <select style={s.input} value={form.status} onChange={e => set("status",e.target.value)}>
                {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <FF label="Tags (comma separated)" value={form.tags} onChange={v => set("tags",v)} placeholder="investor, mentor, sales..." />
          </div>
          <div style={s.formRow}>
            <FF label="Last Contact" value={form.lastContact} onChange={v => set("lastContact",v)} type="date" />
            <FF label="Follow-Up Date" value={form.followUpDate} onChange={v => set("followUpDate",v)} type="date" />
          </div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Notes</label>
            <textarea style={{ ...s.input, height:"90px", resize:"vertical" }}
              value={form.notes} onChange={e => set("notes",e.target.value)}
              placeholder="Key takeaways, context, what you talked about..." />
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

function FF({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={s.formGroup}>
      <label style={s.formLabel}>{label}</label>
      <input style={s.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
