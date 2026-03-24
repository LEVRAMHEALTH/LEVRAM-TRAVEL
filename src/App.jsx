import { useState, useCallback, useRef, useEffect } from "react";

// ══════════════════════════════════════════════════════════
// LEVRAM LIFESCIENCES — EMPLOYEE DATABASE (simulated)
// ══════════════════════════════════════════════════════════
const EMPLOYEE_DB = {
  "EMP-1001": { name: "Arjun Mehta", email: "arjun.mehta@levram.com", phone: "9876543210", grade: "middle", region: "Mumbai", department: "Sales - West" },
  "EMP-1002": { name: "Priya Sharma", email: "priya.sharma@levram.com", phone: "9876541234", grade: "executive", region: "Delhi", department: "Sales - North" },
  "EMP-1003": { name: "Ravi Kumar", email: "ravi.kumar@levram.com", phone: "9876549876", grade: "top", region: "Chennai", department: "Sales - South" },
  "EMP-1004": { name: "Sneha Patel", email: "sneha.patel@levram.com", phone: "9123456780", grade: "executive", region: "Ahmedabad", department: "Sales - West" },
  "EMP-1005": { name: "Vikram Singh", email: "vikram.singh@levram.com", phone: "9988776655", grade: "middle", region: "Pune", department: "Sales - West" },
  "EMP-1006": { name: "Anita Desai", email: "anita.desai@levram.com", phone: "9871234560", grade: "top", region: "Mumbai", department: "Sales - National" },
  "EMP-1007": { name: "Rohit Jain", email: "rohit.jain@levram.com", phone: "9765432100", grade: "executive", region: "Kolkata", department: "Sales - East" },
  "EMP-1008": { name: "Meera Nair", email: "meera.nair@levram.com", phone: "9654321098", grade: "middle", region: "Bangalore", department: "Sales - South" },
  "EMP-1009": { name: "Karan Malhotra", email: "karan.malhotra@levram.com", phone: "9543210987", grade: "middle", region: "Hyderabad", department: "Sales - South" },
  "EMP-1010": { name: "Pooja Reddy", email: "pooja.reddy@levram.com", phone: "9432109876", grade: "executive", region: "Lucknow", department: "Sales - North" },
};

// ══════════════════════════════════════════════════════════
// TRAVEL POLICY w.e.f. 01/05/2024
// ══════════════════════════════════════════════════════════
const GRADES = [
  { id: "executive", label: "Executive", salary: "< ₹20K" },
  { id: "middle", label: "Middle Management", salary: "₹20K – ₹50K" },
  { id: "top", label: "Top Management", salary: "> ₹50K" },
];
const METRO = ["Mumbai", "Delhi", "Chennai", "Kolkata", "Bangalore", "Pune", "Hyderabad", "Lucknow"];
const DA = {
  executive: { lm: 300, ln: 250, tm: 700, tn: 600 },
  middle: { lm: 400, ln: 300, tm: 800, tn: 700 },
  top: { lm: 500, ln: 400, tm: 1000, tn: 800 },
};
const LODGE = { executive: { m: 1100, n: 800 }, middle: { m: 1500, n: 1100 }, top: { m: 2500, n: 2000 } };
const TCLASS = { executive: "3 Tier AC / Bus", middle: "3 Tier AC / Bus", top: "2 Tier AC / Air Fare" };
const TSUB = { executive: ["3 Tier AC", "Bus"], middle: ["3 Tier AC", "Bus"], top: ["2 Tier AC", "Air Fare", "Bus"] };
const VRATE = { executive: { w4: null, w2: 3 }, middle: { w4: null, w2: 4 }, top: { w4: 9, w2: 4 } };
const NOTES = [
  "Metro: Mumbai, Delhi, Chennai, Kolkata, Bangalore, Pune, Hyderabad, Lucknow. Others = Non-Metro.",
  "All employees travelling for official purpose can avail this policy.",
  "Outstation visits must be planned & submitted to accounts 1 week prior, approved by seniors.",
  "All claims must be supported by Bills/Tickets & reach accounts within 1-2 days after tour.",
  "Travelling tickets & Hotel Bills submission is mandatory.",
  "Misc expenses (postage, stationery, courier, xerox) paid as actual against bills.",
  "Expenses outside this policy require Reporting Manager / Management approval.",
  "Vouchers settled after scrutiny by accounts team.",
  "Unspent advance must be returned to company accounts.",
];

const CATS = [
  { id: "da", label: "Daily Allowance", icon: "🍽", color: "#059669", desc: "Food + Local Conveyance (auto-calculated)", auto: true },
  { id: "lodge", label: "Lodging & Boarding", icon: "🏨", color: "#7C3AED", desc: "Hotel / Guest House", needHotel: true },
  { id: "ticket", label: "Travel Ticket", icon: "✈", color: "#2563EB", desc: "Train / Flight / Bus as per grade", needRoute: true, needTicket: true },
  { id: "cab", label: "Local Cab / Auto", icon: "🚕", color: "#D97706", desc: "Auto, Cab, Rickshaw", needRoute: true },
  { id: "vehicle", label: "Personal Vehicle", icon: "🚗", color: "#0891B2", desc: "Per-km rate – Log Book mandatory", needKm: true },
  { id: "misc", label: "Miscellaneous", icon: "📦", color: "#6B7280", desc: "Courier, Stationery, Xerox, etc.", subs: ["Postage", "Stationery", "Courier", "Xerox/Printouts", "Other"] },
];

const PURPOSES = ["Client Meeting", "Site Visit", "Product Demo", "Conference/Seminar", "Training", "Market Survey", "Delivery/Dispatch", "Other"];
const isMet = (c) => METRO.some(m => c?.toLowerCase().includes(m.toLowerCase()));
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const font = "'Outfit', system-ui, sans-serif";
const P = { bg: "#F3F1EB", card: "#fff", dk: "#181818", acc: "#1746A2", accL: "#DBEAFE", gn: "#059669", gnB: "#ECFDF5", rd: "#DC2626", rdB: "#FEF2F2", am: "#D97706", amB: "#FFFBEB", br: "#E0DDD6", mu: "#8A857E", sf: "#FAF8F4" };
const cd = { background: P.card, borderRadius: 14, border: `1px solid ${P.br}`, padding: "22px 26px", marginBottom: 16 };
const ip = (e) => ({ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${e ? P.rd : P.br}`, fontSize: 13.5, fontFamily: font, outline: "none", boxSizing: "border-box", background: "#fff", transition: "border .2s" });
const ipDis = { ...ip(), background: "#F0EDE7", color: "#666", cursor: "not-allowed" };
const lb = { fontSize: 10.5, fontWeight: 700, color: P.mu, marginBottom: 5, display: "block", letterSpacing: ".5px", textTransform: "uppercase" };
const bt = (v) => { const b = { padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 7, fontFamily: font, transition: "all .15s" }; return v === "p" ? { ...b, background: P.acc, color: "#fff" } : v === "s" ? { ...b, background: P.gn, color: "#fff" } : v === "d" ? { ...b, background: P.rd, color: "#fff" } : v === "w" ? { ...b, background: P.am, color: "#fff" } : v === "lg" ? { ...b, background: P.acc, color: "#fff", padding: "14px 32px", fontSize: 15, borderRadius: 12 } : v === "lgs" ? { ...b, background: P.gn, color: "#fff", padding: "14px 32px", fontSize: 15, borderRadius: 12 } : { ...b, background: P.sf, color: P.dk, border: `1.5px solid ${P.br}` }; };

function Badge({ s }) { const m = { pending: { b: P.amB, c: P.am, l: "Pending" }, approved: { b: P.gnB, c: P.gn, l: "Approved" }, rejected: { b: P.rdB, c: P.rd, l: "Rejected" }, flagged: { b: P.rdB, c: P.rd, l: "Flagged" }, draft: { b: "#E8E6E0", c: "#666", l: "Draft" }, submitted: { b: P.accL, c: P.acc, l: "Submitted" } }; const x = m[s] || m.draft; return <span style={{ background: x.b, color: x.c, padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: ".4px", textTransform: "uppercase" }}>{x.l}</span>; }
function Chip({ file, onRm }) { const im = file.type?.startsWith("image/"); return <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: im ? "#EFF6FF" : "#FEF2F2", borderRadius: 8, fontSize: 11, fontWeight: 600, border: `1px solid ${im ? "#BFDBFE" : "#FECACA"}` }}>{im ? "🖼" : "📄"} <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span><span style={{ color: P.mu, fontSize: 9.5 }}>({(file.size / 1024).toFixed(0)}KB)</span>{onRm && <span onClick={onRm} style={{ cursor: "pointer", color: P.rd, fontWeight: 800 }}>×</span>}</div>; }

function getDaLimit(grade, visitType, city) {
  if (!grade) return 0;
  const met = isMet(city);
  if (visitType === "Local Visit") return DA[grade][met ? "lm" : "ln"];
  return DA[grade][met ? "tm" : "tn"];
}
function getLodgeLimit(grade, city) {
  if (!grade) return 0;
  return LODGE[grade][isMet(city) ? "m" : "n"];
}

// ══════════════════════════════════════════════════════════
// PERSISTENT STORAGE (simulated with state — in production this would be API calls)
// ══════════════════════════════════════════════════════════

const today = new Date();
const INIT_MONTHS = (() => {
  // Create a sample draft month for demo
  const m = today.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  return {
    "EMP-1001": {
      [m]: {
        status: "draft", // draft | submitted | approved | rejected | flagged
        visitType: "On Tour (Outstation)",
        visitCity: "Pune",
        purpose: "Client Meeting",
        travelRoute: "Mumbai → Pune → Mumbai",
        entries: [
          { id: 1, date: "2026-03-03", categoryId: "da", description: "DA – Pune tour", amount: 800, visitType: "On Tour (Outstation)", autoCalc: true, days: 1, files: [{ name: "food_bill.jpg", size: 210000, type: "image/jpeg" }], verified: null },
          { id: 2, date: "2026-03-03", categoryId: "lodge", description: "Hotel Lemon Tree, Pune", amount: 1500, days: 1, files: [{ name: "hotel_inv.pdf", size: 450000, type: "application/pdf" }], verified: null },
          { id: 3, date: "2026-03-03", categoryId: "ticket", subType: "3 Tier AC", description: "Mumbai–Pune Shatabdi", amount: 720, fromCity: "Mumbai", toCity: "Pune", files: [{ name: "ticket.pdf", size: 180000, type: "application/pdf" }], verified: null },
          { id: 4, date: "2026-03-10", categoryId: "da", description: "DA – Local visits", amount: 400, visitType: "Local Visit", autoCalc: true, days: 1, files: [{ name: "receipt.jpg", size: 150000, type: "image/jpeg" }], verified: null },
          { id: 5, date: "2026-03-10", categoryId: "vehicle", description: "Client site visits", amount: 200, km: 50, vehicleType: "2w", files: [{ name: "logbook.pdf", size: 300000, type: "application/pdf" }], verified: null },
          { id: 6, date: "2026-03-15", categoryId: "cab", description: "Auto to warehouse", amount: 180, fromCity: "Office", toCity: "Bhiwandi warehouse", files: [{ name: "auto_rcpt.jpg", size: 120000, type: "image/jpeg" }], verified: null },
        ]
      }
    }
  };
})();

// Admin submitted claims (for the admin view)
const ADMIN_CLAIMS = [
  { id: "LV-2026-041", empId: "EMP-1005", month: "February 2026", status: "pending", visitType: "On Tour (Outstation)", visitCity: "Nashik", purpose: "Client Meeting", travelRoute: "Pune → Nashik → Pune",
    entries: [
      { id: 1, date: "2026-02-05", categoryId: "da", description: "DA Nashik tour", amount: 700, visitType: "On Tour (Outstation)", autoCalc: true, days: 1, files: [{ name: "bills.jpg", size: 200000, type: "image/jpeg" }], verified: null },
      { id: 2, date: "2026-02-05", categoryId: "lodge", description: "Hotel, Nashik", amount: 1100, days: 1, files: [{ name: "hotel.pdf", size: 400000, type: "application/pdf" }], verified: null },
      { id: 3, date: "2026-02-05", categoryId: "ticket", subType: "Bus", description: "Pune–Nashik bus", amount: 450, fromCity: "Pune", toCity: "Nashik", files: [{ name: "bus.pdf", size: 150000, type: "application/pdf" }], verified: null },
      { id: 4, date: "2026-02-20", categoryId: "vehicle", description: "Local visits", amount: 320, km: 80, vehicleType: "2w", files: [{ name: "log.pdf", size: 180000, type: "application/pdf" }], verified: null },
    ]},
  { id: "LV-2026-040", empId: "EMP-1003", month: "February 2026", status: "approved", visitType: "On Tour (Outstation)", visitCity: "Bangalore", purpose: "Site Visit", travelRoute: "Chennai → Bangalore → Chennai",
    entries: [
      { id: 1, date: "2026-02-08", categoryId: "ticket", subType: "Air Fare", description: "Flight Chennai–BLR", amount: 4800, fromCity: "Chennai", toCity: "Bangalore", files: [{ name: "flight.pdf", size: 350000, type: "application/pdf" }], verified: true },
      { id: 2, date: "2026-02-08", categoryId: "da", description: "DA BLR 2 days", amount: 1600, days: 2, visitType: "On Tour (Outstation)", autoCalc: true, files: [{ name: "food.jpg", size: 200000, type: "image/jpeg" }], verified: true },
      { id: 3, date: "2026-02-08", categoryId: "lodge", description: "Hotel BLR", amount: 2400, days: 1, files: [{ name: "hotel.pdf", size: 300000, type: "application/pdf" }], verified: true },
    ]},
];

// ══════════════════════════════════════════════════════════
// DAILY ENTRY VIEW (Salesperson)
// ══════════════════════════════════════════════════════════
function DailyEntry({ empData, monthData, monthKey, onSaveEntry, onDeleteEntry, onUpdateMonth, onSubmitMonth }) {
  const [adding, setAdding] = useState(null);
  const [err, setErr] = useState({});
  const fileRef = useRef(null);
  const grade = empData.grade;
  const city = monthData.visitCity || empData.region;
  const entries = monthData.entries || [];
  const total = entries.reduce((s, e) => s + (e.amount || 0), 0);

  // Group entries by date
  const byDate = {};
  entries.forEach(e => { if (!byDate[e.date]) byDate[e.date] = []; byDate[e.date].push(e); });
  const sortedDates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a));

  const startAdd = (catId) => {
    const cat = CATS.find(c => c.id === catId);
    const base = { id: Date.now(), categoryId: catId, date: today.toISOString().split("T")[0], description: "", amount: "", subType: "", fromCity: "", toCity: "", days: 1, km: "", vehicleType: "2w", visitType: monthData.visitType || "Local Visit", miscType: "", files: [], verified: null };
    // Auto-calculate DA
    if (cat.auto) {
      const daLim = getDaLimit(grade, base.visitType, city);
      base.amount = daLim;
      base.autoCalc = true;
      base.description = `Daily Allowance – ${base.visitType === "Local Visit" ? "Local" : "Tour"} (${isMet(city) ? "Metro" : "Non-Metro"})`;
    }
    setAdding(base);
    setErr({});
  };

  const updDA = (field, val) => {
    setAdding(p => {
      const n = { ...p, [field]: val };
      if (p.categoryId === "da" && (field === "visitType" || field === "days")) {
        const vt = field === "visitType" ? val : p.visitType;
        const d = field === "days" ? parseInt(val) || 1 : parseInt(p.days) || 1;
        const rate = getDaLimit(grade, vt, city);
        n.amount = rate * d;
        n.autoCalc = true;
        n.description = `Daily Allowance – ${vt === "Local Visit" ? "Local" : "Tour"} (${isMet(city) ? "Metro" : "Non-Metro"}) × ${d} day${d > 1 ? "s" : ""}`;
      }
      if (p.categoryId === "lodge" && field === "days") {
        const d = parseInt(val) || 1;
        const lim = getLodgeLimit(grade, city);
        n.maxAmount = lim * d;
      }
      return n;
    });
  };

  const validate = () => {
    const e = {};
    if (!adding.date) e.date = "Required";
    if (!adding.description.trim() && !adding.autoCalc) e.description = "Required";
    if (!adding.amount || parseFloat(adding.amount) <= 0) e.amount = "Required";
    const cat = CATS.find(c => c.id === adding.categoryId);
    if (cat.needRoute) { if (!adding.fromCity.trim()) e.fromCity = "Required"; if (!adding.toCity.trim()) e.toCity = "Required"; }
    if (cat.needTicket && !adding.subType) e.subType = "Select type";
    if (cat.needKm && (!adding.km || parseFloat(adding.km) <= 0)) e.km = "Required";
    if (adding.files.length === 0) e.files = "Receipt upload is MANDATORY";
    // Check lodge limit
    if (adding.categoryId === "lodge") {
      const lim = getLodgeLimit(grade, city) * (parseInt(adding.days) || 1);
      if (parseFloat(adding.amount) > lim) e.amount = `Exceeds limit of ${fmt(lim)} (${fmt(getLodgeLimit(grade, city))}/day × ${adding.days}d)`;
    }
    // Check vehicle
    if (adding.categoryId === "vehicle") {
      const rate = VRATE[grade]?.[adding.vehicleType === "4w" ? "w4" : "w2"];
      if (rate === null) e.vehicleType = `4 Wheeler not permitted for your grade`;
      else if (parseFloat(adding.amount) > rate * parseFloat(adding.km || 0)) e.amount = `Max ${fmt(rate * parseFloat(adding.km || 0))} (₹${rate}/km × ${adding.km}km)`;
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    onSaveEntry({ ...adding, amount: parseFloat(adding.amount), km: adding.km ? parseFloat(adding.km) : undefined, days: adding.days ? parseInt(adding.days) : undefined });
    setAdding(null);
    setErr({});
  };

  const handleFiles = (ev) => {
    const nf = Array.from(ev.target.files || []).filter(f => (f.type === "application/pdf" || f.type.startsWith("image/")) && f.size <= 10485760).map(f => ({ name: f.name, size: f.size, type: f.type, preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null }));
    setAdding(p => ({ ...p, files: [...p.files, ...nf] }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const missingFiles = entries.filter(e => e.files.length === 0).length;
  const canSubmit = entries.length > 0 && missingFiles === 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Month Header */}
      <div style={{ ...cd, display: "flex", justifyContent: "space-between", alignItems: "center", background: P.accL, borderColor: `${P.acc}33` }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{monthKey}</div>
          <div style={{ fontSize: 12.5, color: P.mu, marginTop: 2 }}>{empData.name} · {empData.department} · <strong>{GRADES.find(g => g.id === grade)?.label}</strong></div>
          <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12 }}>
            <Badge s={monthData.status} />
            <span style={{ color: P.mu }}>{entries.length} entries · {fmt(total)}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: P.acc }}>{fmt(total)}</div>
          <div style={{ fontSize: 11, color: P.mu, marginTop: 2 }}>Month Total</div>
        </div>
      </div>

      {/* Month Settings (if draft) */}
      {monthData.status === "draft" && (
        <div style={cd}>
          <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 14 }}>📋 Month Settings</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><label style={lb}>Visit Type</label><select value={monthData.visitType || ""} onChange={e => onUpdateMonth({ visitType: e.target.value })} style={ip()}>
              <option value="">Select</option><option value="Local Visit">Local Visit</option><option value="On Tour (Outstation)">On Tour (Outstation)</option>
            </select></div>
            <div><label style={lb}>Visit City (if outstation)</label><input value={monthData.visitCity || ""} onChange={e => onUpdateMonth({ visitCity: e.target.value })} style={ip()} placeholder="e.g. Pune, Jaipur" /></div>
            <div><label style={lb}>Purpose</label><select value={monthData.purpose || ""} onChange={e => onUpdateMonth({ purpose: e.target.value })} style={ip()}><option value="">Select</option>{PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={lb}>Travel Route</label><input value={monthData.travelRoute || ""} onChange={e => onUpdateMonth({ travelRoute: e.target.value })} style={ip()} placeholder="Mumbai → Pune → Mumbai" /></div>
          </div>

          {/* Policy limits display */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 14, padding: 12, background: P.sf, borderRadius: 10, fontSize: 12 }}>
            <div><div style={{ fontWeight: 700, color: P.mu, fontSize: 9.5, textTransform: "uppercase", marginBottom: 3 }}>DA / Day</div>
              <div style={{ fontWeight: 800 }}>{fmt(getDaLimit(grade, monthData.visitType, monthData.visitCity || empData.region))}</div>
              <div style={{ fontSize: 10, color: P.mu }}>{monthData.visitType === "Local Visit" ? "Local" : "Tour"} · {isMet(monthData.visitCity || empData.region) ? "Metro" : "Non-Metro"}</div>
            </div>
            <div><div style={{ fontWeight: 700, color: P.mu, fontSize: 9.5, textTransform: "uppercase", marginBottom: 3 }}>Lodge / Day</div><div style={{ fontWeight: 800 }}>{fmt(getLodgeLimit(grade, monthData.visitCity || empData.region))}</div></div>
            <div><div style={{ fontWeight: 700, color: P.mu, fontSize: 9.5, textTransform: "uppercase", marginBottom: 3 }}>Travel Class</div><div style={{ fontWeight: 800 }}>{TCLASS[grade]}</div></div>
            <div><div style={{ fontWeight: 700, color: P.mu, fontSize: 9.5, textTransform: "uppercase", marginBottom: 3 }}>Vehicle Rate</div><div style={{ fontWeight: 800 }}>2W: ₹{VRATE[grade].w2}/km</div>{VRATE[grade].w4 && <div style={{ fontWeight: 800 }}>4W: ₹{VRATE[grade].w4}/km</div>}</div>
          </div>
        </div>
      )}

      {/* Add Daily Expense */}
      {monthData.status === "draft" && !adding && (
        <div style={cd}>
          <div style={{ fontWeight: 800, marginBottom: 4, fontSize: 14 }}>➕ Add Today's Expense</div>
          <div style={{ fontSize: 12, color: P.mu, marginBottom: 14 }}>Select a category. DA is auto-calculated per your grade.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {CATS.map(cat => (
              <div key={cat.id} onClick={() => startAdd(cat.id)} style={{ padding: 14, background: P.sf, borderRadius: 12, cursor: "pointer", border: "2px solid transparent", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{cat.icon}</span>
                  <div><div style={{ fontWeight: 800, fontSize: 12.5 }}>{cat.label}</div><div style={{ fontSize: 10.5, color: P.mu }}>{cat.auto ? `Auto: ${fmt(getDaLimit(grade, monthData.visitType, city))}/day` : cat.desc}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Entry Form */}
      {adding && (() => {
        const cat = CATS.find(c => c.id === adding.categoryId);
        return (
          <div style={{ ...cd, borderLeft: `4px solid ${cat.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 24 }}>{cat.icon}</span><div><div style={{ fontWeight: 800, fontSize: 15 }}>{cat.label}</div><div style={{ fontSize: 11.5, color: P.mu }}>{cat.desc}</div></div></div>
              <button onClick={() => { setAdding(null); setErr({}); }} style={bt("g")}>Cancel</button>
            </div>

            {/* DA hint */}
            {cat.auto && <div style={{ padding: "10px 14px", background: P.gnB, borderRadius: 8, fontSize: 12, color: P.gn, fontWeight: 600, marginBottom: 14 }}>✨ DA auto-calculated: {fmt(getDaLimit(grade, adding.visitType, city))}/day based on your grade ({GRADES.find(g => g.id === grade)?.label}) and city ({isMet(city) ? "Metro" : "Non-Metro"})</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><label style={lb}>Date *</label><input type="date" value={adding.date} onChange={e => updDA("date", e.target.value)} style={ip(err.date)} max={today.toISOString().split("T")[0]} />{err.date && <span style={{ color: P.rd, fontSize: 10.5 }}>{err.date}</span>}</div>
              {cat.auto && <div><label style={lb}>Visit Type</label><select value={adding.visitType} onChange={e => updDA("visitType", e.target.value)} style={ip()}><option value="Local Visit">Local Visit</option><option value="On Tour (Outstation)">On Tour (Outstation)</option></select></div>}
              {cat.needTicket && <div><label style={lb}>Ticket Type *</label><select value={adding.subType} onChange={e => updDA("subType", e.target.value)} style={ip(err.subType)}><option value="">Select</option>{(TSUB[grade] || []).map(s => <option key={s} value={s}>{s}</option>)}</select>{err.subType && <span style={{ color: P.rd, fontSize: 10.5 }}>{err.subType}</span>}</div>}
              {(cat.auto || cat.needHotel) && <div><label style={lb}>No. of Days</label><input type="number" min="1" max="31" value={adding.days} onChange={e => updDA("days", e.target.value)} style={ip()} /></div>}
              {cat.needKm && <><div><label style={lb}>Vehicle Type</label><select value={adding.vehicleType} onChange={e => updDA("vehicleType", e.target.value)} style={ip(err.vehicleType)}><option value="2w">2 Wheeler</option>{VRATE[grade].w4 !== null && <option value="4w">4 Wheeler</option>}</select>{err.vehicleType && <span style={{ color: P.rd, fontSize: 10.5 }}>{err.vehicleType}</span>}</div><div><label style={lb}>Kilometres *</label><input type="number" min="1" value={adding.km} onChange={e => updDA("km", e.target.value)} style={ip(err.km)} />{err.km && <span style={{ color: P.rd, fontSize: 10.5 }}>{err.km}</span>}{adding.km && <div style={{ fontSize: 11, color: P.gn, marginTop: 3, fontWeight: 600 }}>Max: {fmt((VRATE[grade]?.[adding.vehicleType === "4w" ? "w4" : "w2"] || 0) * (parseFloat(adding.km) || 0))}</div>}</div></>}
              {cat.id === "misc" && <div><label style={lb}>Type</label><select value={adding.miscType} onChange={e => updDA("miscType", e.target.value)} style={ip()}><option value="">Select</option>{cat.subs.map(s => <option key={s} value={s}>{s}</option>)}</select></div>}
            </div>

            {!cat.auto && <div style={{ marginBottom: 12 }}><label style={lb}>Description *</label><input value={adding.description} onChange={e => updDA("description", e.target.value)} style={ip(err.description)} placeholder="What was this expense for?" />{err.description && <span style={{ color: P.rd, fontSize: 10.5 }}>{err.description}</span>}</div>}
            {cat.auto && <div style={{ marginBottom: 12 }}><label style={lb}>Description (auto-filled)</label><input value={adding.description} readOnly style={ipDis} /></div>}

            {cat.needRoute && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}><div><label style={lb}>From *</label><input value={adding.fromCity} onChange={e => updDA("fromCity", e.target.value)} style={ip(err.fromCity)} />{err.fromCity && <span style={{ color: P.rd, fontSize: 10.5 }}>{err.fromCity}</span>}</div><div><label style={lb}>To *</label><input value={adding.toCity} onChange={e => updDA("toCity", e.target.value)} style={ip(err.toCity)} />{err.toCity && <span style={{ color: P.rd, fontSize: 10.5 }}>{err.toCity}</span>}</div></div>}

            <div style={{ marginBottom: 14 }}>
              <label style={lb}>Amount (₹) {cat.auto ? "(auto-calculated)" : "*"}</label>
              <div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: P.mu }}>₹</span>
                <input type="number" min="1" value={adding.amount} onChange={e => updDA("amount", e.target.value)} readOnly={cat.auto} style={{ ...(cat.auto ? ipDis : ip(err.amount)), paddingLeft: 34, fontSize: 16, fontWeight: 700 }} />
              </div>
              {err.amount && <div style={{ color: P.rd, fontSize: 11, marginTop: 3, fontWeight: 600 }}>{err.amount}</div>}
              {cat.needHotel && <div style={{ fontSize: 11, color: P.am, marginTop: 3, fontWeight: 600 }}>Limit: {fmt(getLodgeLimit(grade, city))}/day × {adding.days || 1} days = {fmt(getLodgeLimit(grade, city) * (parseInt(adding.days) || 1))}</div>}
            </div>

            {/* Upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...lb, color: err.files ? P.rd : P.mu }}>Upload Receipt / Bill / Ticket * (PDF or Image)</label>
              <div onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = P.acc; }} onDragLeave={e => { e.currentTarget.style.borderColor = P.br; }} onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = P.br; handleFiles({ target: { files: e.dataTransfer.files } }); }}
                style={{ padding: 20, border: `2px dashed ${err.files ? P.rd : P.br}`, borderRadius: 12, textAlign: "center", cursor: "pointer", background: P.sf, transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = P.acc; e.currentTarget.style.background = P.accL; }} onMouseLeave={e => { e.currentTarget.style.borderColor = err.files ? P.rd : P.br; e.currentTarget.style.background = P.sf; }}>
                <div style={{ fontSize: 26 }}>📤</div><div style={{ fontWeight: 700, fontSize: 13 }}>Click or drag & drop</div><div style={{ fontSize: 11, color: P.mu }}>PDF, JPG, PNG — Max 10MB</div>
              </div>
              <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf" onChange={handleFiles} style={{ display: "none" }} />
              {err.files && <div style={{ color: P.rd, fontSize: 11, marginTop: 4, fontWeight: 700 }}>⚠ {err.files}</div>}
              {adding.files.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>{adding.files.map((f, i) => <div key={i}>{f.preview && <img src={f.preview} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: `2px solid ${P.br}`, marginBottom: 3, display: "block" }} />}<Chip file={f} onRm={() => setAdding(p => ({ ...p, files: p.files.filter((_, j) => j !== i) }))} /></div>)}</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}><button onClick={() => { setAdding(null); setErr({}); }} style={bt("g")}>Cancel</button><button onClick={save} style={bt("p")}>✓ Save Entry</button></div>
          </div>
        );
      })()}

      {/* Entries grouped by date */}
      {sortedDates.map(date => (
        <div key={date} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: P.mu, padding: "6px 0", borderBottom: `1px solid ${P.br}`, marginBottom: 8 }}>📅 {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} — Day Total: <strong style={{ color: P.dk }}>{fmt(byDate[date].reduce((s, e) => s + e.amount, 0))}</strong></div>
          {byDate[date].map(exp => {
            const cat = CATS.find(c => c.id === exp.categoryId);
            return (
              <div key={exp.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: P.sf, borderRadius: 10, marginBottom: 6, borderLeft: `4px solid ${cat?.color || P.mu}` }}>
                <span style={{ fontSize: 20 }}>{cat?.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{exp.subType || exp.miscType || cat?.label} {exp.autoCalc && <span style={{ fontSize: 10, color: P.gn, fontWeight: 600 }}>(auto-calc)</span>}</div>
                  <div style={{ fontSize: 11, color: P.mu }}>{exp.description} {exp.fromCity ? `· ${exp.fromCity}→${exp.toCity}` : ""} {exp.km ? `· ${exp.km}km` : ""} {exp.days > 1 ? `· ${exp.days}d` : ""}</div>
                  {exp.files.length > 0 && <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>{exp.files.map((f, i) => <Chip key={i} file={f} />)}</div>}
                  {exp.files.length === 0 && <div style={{ fontSize: 10.5, color: P.rd, fontWeight: 700, marginTop: 2 }}>⚠ No receipt</div>}
                </div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(exp.amount)}</div>
                {monthData.status === "draft" && <button onClick={() => onDeleteEntry(exp.id)} style={{ ...bt("g"), padding: "4px 8px", fontSize: 10.5, color: P.rd }}>×</button>}
              </div>
            );
          })}
        </div>
      ))}

      {entries.length === 0 && <div style={{ ...cd, textAlign: "center", color: P.mu, padding: 40 }}>No expenses added yet. Start by adding today's expenses above.</div>}

      {/* Month-end Submit */}
      {monthData.status === "draft" && entries.length > 0 && (
        <div style={{ ...cd, background: missingFiles > 0 ? P.rdB : P.gnB, borderColor: missingFiles > 0 ? `${P.rd}33` : `${P.gn}33` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>📤 Month-End Submission</div>
              <div style={{ fontSize: 12.5, color: P.mu, marginTop: 3 }}>{entries.length} entries · {fmt(total)} total · {entries.filter(e => e.files.length > 0).length}/{entries.length} receipts attached</div>
              {missingFiles > 0 && <div style={{ color: P.rd, fontSize: 12, fontWeight: 700, marginTop: 3 }}>⚠ {missingFiles} entries missing receipts — upload before submitting</div>}
            </div>
            <button onClick={canSubmit ? onSubmitMonth : undefined} disabled={!canSubmit} style={{ ...bt("lgs"), opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? "pointer" : "not-allowed" }}>✓ Verify & Submit for Approval</button>
          </div>
        </div>
      )}
      {monthData.status === "submitted" && <div style={{ ...cd, background: P.accL }}><div style={{ fontWeight: 800, color: P.acc }}>📨 Submitted for approval on {monthData.submittedDate || "—"}</div><div style={{ fontSize: 12.5, color: P.mu, marginTop: 3 }}>Your claim is under review by the accounts team.</div></div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ADMIN DETAIL
// ══════════════════════════════════════════════════════════
function AdminDetail({ claim, onBack, onStatus, onVerify }) {
  const emp = EMPLOYEE_DB[claim.empId] || {};
  const total = claim.entries.reduce((s, e) => s + e.amount, 0);
  const tf = claim.entries.reduce((s, e) => s + e.files.length, 0);
  const vc = claim.entries.filter(e => e.verified === true).length;
  return (
    <div>
      <button onClick={onBack} style={{ ...bt("g"), marginBottom: 12 }}>← Back</button>
      <div style={{ display: "grid", gridTemplateColumns: "5fr 2fr", gap: 16 }}>
        <div>
          <div style={cd}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div><div style={{ fontSize: 20, fontWeight: 900 }}>{emp.name || claim.empId}</div><div style={{ fontSize: 12, color: P.mu, marginTop: 2 }}>{claim.empId} · {emp.email} · {GRADES.find(g => g.id === emp.grade)?.label} · {emp.region}</div><div style={{ display: "flex", gap: 8, marginTop: 8 }}><Badge s={claim.status} /><span style={{ fontSize: 11, color: P.mu }}>{claim.month} · {claim.visitType} · {claim.purpose}</span></div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, fontWeight: 700, color: P.mu, textTransform: "uppercase" }}>Total</div><div style={{ fontSize: 26, fontWeight: 900, color: P.acc }}>{fmt(total)}</div></div>
            </div>
            {claim.entries.map(exp => { const cat = CATS.find(c => c.id === exp.categoryId); return (
              <div key={exp.id} style={{ padding: "12px 14px", background: P.sf, borderRadius: 10, marginBottom: 6, borderLeft: `4px solid ${cat?.color || P.mu}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{cat?.icon} {exp.subType || cat?.label} <span style={{ fontSize: 11, color: P.mu }}>· {exp.date}</span> {exp.autoCalc && <span style={{ fontSize: 10, color: P.gn }}>(auto)</span>}</div><div style={{ fontSize: 11.5, color: P.mu }}>{exp.description} {exp.fromCity ? `· ${exp.fromCity}→${exp.toCity}` : ""} {exp.km ? `· ${exp.km}km` : ""}</div>{exp.files.length > 0 && <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>{exp.files.map((f, i) => <Chip key={i} file={f} />)}</div>}</div>
                <div style={{ textAlign: "right", minWidth: 100 }}><div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(exp.amount)}</div><div style={{ marginTop: 6 }}>{exp.verified === true ? <span style={{ color: P.gn, fontSize: 11, fontWeight: 700 }}>✓ Verified</span> : exp.verified === false ? <span style={{ color: P.rd, fontSize: 11, fontWeight: 700 }}>✗ Rejected</span> : exp.files.length > 0 ? <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}><button onClick={() => onVerify(claim.id, exp.id, true)} style={{ ...bt("s"), padding: "3px 8px", fontSize: 10 }}>✓</button><button onClick={() => onVerify(claim.id, exp.id, false)} style={{ ...bt("d"), padding: "3px 8px", fontSize: 10 }}>✗</button></div> : <span style={{ color: P.rd, fontSize: 10, fontWeight: 700 }}>No file</span>}</div></div>
              </div>
            ); })}
          </div>
        </div>
        <div>
          <div style={cd}><div style={{ fontWeight: 800, marginBottom: 10 }}>Documents</div><div style={{ fontSize: 13 }}>Files: <strong>{tf}</strong> · Verified: <strong style={{ color: P.gn }}>{vc}</strong></div><div style={{ height: 6, background: "#eee", borderRadius: 3, marginTop: 8 }}><div style={{ height: "100%", width: `${tf > 0 ? (vc / tf) * 100 : 0}%`, background: P.gn, borderRadius: 3 }} /></div></div>
          {(claim.status === "pending" || claim.status === "flagged") && <div style={cd}><div style={{ fontWeight: 800, marginBottom: 10 }}>Actions</div><div style={{ display: "flex", flexDirection: "column", gap: 8 }}><button onClick={() => onStatus(claim.id, "approved")} style={{ ...bt("s"), width: "100%", justifyContent: "center", padding: 13 }}>✓ Approve</button><button onClick={() => onStatus(claim.id, "flagged")} style={{ ...bt("w"), width: "100%", justifyContent: "center", padding: 13 }}>⚠ Flag</button><button onClick={() => onStatus(claim.id, "rejected")} style={{ ...bt("d"), width: "100%", justifyContent: "center", padding: 13 }}>✗ Reject</button></div></div>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════
export default function App() {
  const [pg, setPg] = useState("login");
  const [empId, setEmpId] = useState("");
  const [empData, setEmpData] = useState(null);
  const [loginErr, setLoginErr] = useState("");
  const [monthStore, setMonthStore] = useState(INIT_MONTHS);
  const [selMonth, setSelMonth] = useState(null);
  const [adminClaims, setAdminClaims] = useState(ADMIN_CLAIMS);
  const [adminSel, setAdminSel] = useState(null);
  const [toast, setToast] = useState(null);
  const [role, setRole] = useState("sales"); // sales | admin
  const [adminFlt, setAdminFlt] = useState("all");

  const show = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const currentMonth = today.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const getMonths = () => {
    const m = []; for (let i = 0; i < 6; i++) { const d = new Date(today.getFullYear(), today.getMonth() - i, 1); m.push(d.toLocaleDateString("en-IN", { month: "long", year: "numeric" })); } return m;
  };

  // Login
  const handleLogin = () => {
    const id = empId.trim().toUpperCase();
    if (id === "ADMIN") { setRole("admin"); setPg("admin_dash"); setLoginErr(""); return; }
    const emp = EMPLOYEE_DB[id];
    if (!emp) { setLoginErr("Employee ID not found. Try EMP-1001 to EMP-1010, or ADMIN."); return; }
    setEmpData({ ...emp, empId: id });
    setRole("sales");
    setPg("my_months");
    setLoginErr("");
    // Init month store if needed
    if (!monthStore[id]) setMonthStore(p => ({ ...p, [id]: {} }));
  };

  const getMonthData = (mKey) => {
    const eid = empData?.empId;
    return monthStore[eid]?.[mKey] || { status: "draft", entries: [], visitType: "", visitCity: "", purpose: "", travelRoute: "" };
  };

  const updateMonthData = (mKey, updates) => {
    const eid = empData.empId;
    setMonthStore(p => ({ ...p, [eid]: { ...p[eid], [mKey]: { ...getMonthData(mKey), ...updates } } }));
  };

  const saveEntry = (mKey, entry) => {
    const md = getMonthData(mKey);
    const exists = md.entries.find(e => e.id === entry.id);
    const newEntries = exists ? md.entries.map(e => e.id === entry.id ? entry : e) : [...md.entries, entry];
    updateMonthData(mKey, { entries: newEntries });
    show("Expense saved!");
  };

  const deleteEntry = (mKey, entryId) => {
    const md = getMonthData(mKey);
    updateMonthData(mKey, { entries: md.entries.filter(e => e.id !== entryId) });
  };

  const submitMonth = (mKey) => {
    const md = getMonthData(mKey);
    const total = md.entries.reduce((s, e) => s + e.amount, 0);
    updateMonthData(mKey, { status: "submitted", submittedDate: today.toISOString().split("T")[0] });
    // Add to admin claims
    const claimId = `LV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setAdminClaims(p => [{ id: claimId, empId: empData.empId, month: mKey, status: "pending", ...md, entries: md.entries }, ...p]);
    show(`Claim ${claimId} submitted for ${mKey}!`);
    setSelMonth(null);
  };

  const onAdminStatus = useCallback((id, s) => {
    setAdminClaims(p => p.map(c => c.id === id ? { ...c, status: s } : c));
    if (adminSel?.id === id) setAdminSel(p => ({ ...p, status: s }));
    show(`Claim ${id} ${s}`);
  }, [adminSel]);

  const onAdminVerify = useCallback((cid, eid, r) => {
    setAdminClaims(p => p.map(c => c.id === cid ? { ...c, entries: c.entries.map(e => e.id === eid ? { ...e, verified: r } : e) } : c));
    if (adminSel?.id === cid) setAdminSel(p => ({ ...p, entries: p.entries.map(e => e.id === eid ? { ...e, verified: r } : e) }));
  }, [adminSel]);

  const filteredAdmin = adminFlt === "all" ? adminClaims : adminClaims.filter(c => c.status === adminFlt);

  // ── LOGIN SCREEN ──
  if (pg === "login") return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, background: `linear-gradient(135deg, ${P.dk} 0%, #2a2a2a 100%)` }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ width: 400, background: P.card, borderRadius: 20, padding: "40px 36px", boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ width: 56, height: 56, background: P.acc, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 24, color: "#fff", fontWeight: 900 }}>₹</div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>Levram Travel</div>
          <div style={{ fontSize: 12.5, color: P.mu, marginTop: 4 }}>Reimbursement Management System</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lb}>Employee ID</label>
          <input value={empId} onChange={e => { setEmpId(e.target.value.toUpperCase()); setLoginErr(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ ...ip(loginErr), fontSize: 16, fontWeight: 700, padding: "14px 16px", textAlign: "center", letterSpacing: 1 }} placeholder="e.g. EMP-1001" autoFocus />
          {loginErr && <div style={{ color: P.rd, fontSize: 11.5, marginTop: 6, textAlign: "center" }}>{loginErr}</div>}
        </div>
        {empId.trim() && EMPLOYEE_DB[empId.trim().toUpperCase()] && (
          <div style={{ padding: "12px 16px", background: P.gnB, borderRadius: 10, marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontWeight: 800, color: P.gn, fontSize: 14 }}>✓ {EMPLOYEE_DB[empId.trim().toUpperCase()].name}</div>
            <div style={{ fontSize: 12, color: P.mu, marginTop: 2 }}>
              {GRADES.find(g => g.id === EMPLOYEE_DB[empId.trim().toUpperCase()].grade)?.label} · {EMPLOYEE_DB[empId.trim().toUpperCase()].region} · {EMPLOYEE_DB[empId.trim().toUpperCase()].department}
            </div>
            <div style={{ fontSize: 10.5, color: P.gn, fontWeight: 700, marginTop: 6, padding: "4px 10px", background: "#fff", borderRadius: 6, display: "inline-block" }}>Grade auto-detected & locked 🔒</div>
          </div>
        )}
        <button onClick={handleLogin} style={{ ...bt("lg"), width: "100%", justifyContent: "center" }}>Sign In</button>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11.5, color: P.mu }}>
          Demo IDs: <strong>EMP-1001</strong> to <strong>EMP-1010</strong> · Admin: <strong>ADMIN</strong>
        </div>
      </div>
    </div>
  );

  // ── MAIN LAYOUT ──
  const sideItems = role === "sales"
    ? [["my_months", "📅", "My Months"], ["policy", "📜", "Policy"]]
    : [["admin_dash", "📊", "Dashboard"], ["admin_list", "📋", "All Claims"], ["policy", "📜", "Policy"]];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: font, background: P.bg, color: P.dk, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, padding: "12px 24px", borderRadius: 12, background: P.gn, color: "#fff", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 30px rgba(0,0,0,.15)" }}>{toast}</div>}

      {/* Sidebar */}
      <div style={{ width: 210, background: P.dk, color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 14px", borderBottom: "1px solid #333" }}>
          <div style={{ fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 26, height: 26, background: P.acc, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>₹</span>Levram Travel</div>
          {empData && <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>{empData.name}<br /><span style={{ fontSize: 10, color: "#666" }}>{GRADES.find(g => g.id === empData.grade)?.label} · {empData.region}</span></div>}
          {role === "admin" && <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>Admin Panel</div>}
        </div>
        <nav style={{ padding: "10px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {sideItems.map(([id, ic, la]) => (
            <div key={id} onClick={() => { setPg(id); setSelMonth(null); setAdminSel(null); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: pg === id ? 700 : 400, background: pg === id ? "#333" : "transparent", color: pg === id ? "#fff" : "#999" }}><span style={{ fontSize: 14 }}>{ic}</span>{la}</div>
          ))}
        </nav>
        <div onClick={() => { setPg("login"); setEmpData(null); setEmpId(""); setRole("sales"); }} style={{ padding: "12px 14px", borderTop: "1px solid #333", fontSize: 12, color: "#666", cursor: "pointer" }}>🚪 Sign Out</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 28px", background: "#fff", borderBottom: `1px solid ${P.br}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>
            {selMonth ? `${selMonth} — Daily Expenses` : adminSel ? `Claim ${adminSel.id}` : pg === "my_months" ? "My Monthly Claims" : pg === "admin_dash" ? "Admin Dashboard" : pg === "admin_list" ? "All Claims" : "Travel Policy"}
          </div>
          <div style={{ fontSize: 12, color: P.mu }}>{today.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "22px 28px" }}>

          {/* ── SALESPERSON: My Months ── */}
          {pg === "my_months" && !selMonth && (
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <div style={{ ...cd, background: P.accL, borderColor: `${P.acc}33` }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>👋 Welcome, {empData?.name}</div>
                <div style={{ fontSize: 12.5, color: P.mu }}>Select a month to add daily expenses. Submit at month-end after verifying all entries and receipts.</div>
              </div>
              {getMonths().map(mKey => {
                const md = getMonthData(mKey);
                const total = (md.entries || []).reduce((s, e) => s + e.amount, 0);
                const cnt = (md.entries || []).length;
                const isCurrent = mKey === currentMonth;
                return (
                  <div key={mKey} onClick={() => setSelMonth(mKey)} style={{ ...cd, cursor: "pointer", transition: "all .15s", borderLeft: isCurrent ? `4px solid ${P.acc}` : undefined }}
                    onMouseEnter={e => e.currentTarget.style.background = P.sf} onMouseLeave={e => e.currentTarget.style.background = P.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>📅 {mKey} {isCurrent && <span style={{ fontSize: 10, background: P.accL, color: P.acc, padding: "2px 8px", borderRadius: 10, fontWeight: 700, marginLeft: 6 }}>CURRENT</span>}</div>
                        <div style={{ fontSize: 12, color: P.mu, marginTop: 3 }}>{cnt} entries · {(md.entries || []).filter(e => e.files?.length > 0).length} receipts</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, fontSize: 18, color: total > 0 ? P.acc : P.mu }}>{total > 0 ? fmt(total) : "—"}</div>
                        <div style={{ marginTop: 3 }}><Badge s={md.status || "draft"} /></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── SALESPERSON: Daily Entry for selected month ── */}
          {pg === "my_months" && selMonth && (
            <div>
              <button onClick={() => setSelMonth(null)} style={{ ...bt("g"), marginBottom: 12 }}>← Back to Months</button>
              <DailyEntry
                empData={empData}
                monthData={getMonthData(selMonth)}
                monthKey={selMonth}
                onSaveEntry={(entry) => saveEntry(selMonth, entry)}
                onDeleteEntry={(id) => deleteEntry(selMonth, id)}
                onUpdateMonth={(updates) => updateMonthData(selMonth, updates)}
                onSubmitMonth={() => submitMonth(selMonth)}
              />
            </div>
          )}

          {/* ── ADMIN DASHBOARD ── */}
          {pg === "admin_dash" && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
                {[{ l: "Total", v: adminClaims.length, a: P.acc }, { l: "Pending", v: adminClaims.filter(c => c.status === "pending").length, a: P.am }, { l: "Flagged", v: adminClaims.filter(c => c.status === "flagged").length, a: P.rd }, { l: "Amount", v: fmt(adminClaims.reduce((s, c) => s + c.entries.reduce((t, e) => t + e.amount, 0), 0)), a: P.gn }].map((s, i) => (
                  <div key={i} style={{ ...cd, flex: 1, minWidth: 150, marginBottom: 0, borderTop: `3px solid ${s.a}`, padding: "16px" }}><div style={{ fontSize: 10, fontWeight: 700, color: P.mu, textTransform: "uppercase" }}>{s.l}</div><div style={{ fontSize: 24, fontWeight: 900, marginTop: 4, color: s.a }}>{s.v}</div></div>
                ))}
              </div>
              <div style={cd}>
                <div style={{ fontWeight: 800, marginBottom: 12 }}>Recent Claims</div>
                {adminClaims.slice(0, 6).map(c => { const emp = EMPLOYEE_DB[c.empId] || {}; const total = c.entries.reduce((s, e) => s + e.amount, 0); return (
                  <div key={c.id} onClick={() => { setPg("admin_list"); setAdminSel(c); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: P.sf, borderRadius: 10, marginBottom: 6, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = P.accL} onMouseLeave={e => e.currentTarget.style.background = P.sf}>
                    <div><div style={{ fontWeight: 700, fontSize: 13 }}>{emp.name || c.empId} <span style={{ color: P.mu, fontWeight: 400, fontSize: 11 }}>· {c.empId} · {GRADES.find(g => g.id === emp.grade)?.label}</span></div><div style={{ fontSize: 11, color: P.mu }}>{c.id} · {c.month} · {c.entries.length} entries</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(total)}</div><Badge s={c.status} /></div>
                  </div>
                ); })}
              </div>
            </div>
          )}

          {/* ── ADMIN LIST ── */}
          {pg === "admin_list" && !adminSel && (
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>{["all", "pending", "flagged", "approved", "rejected"].map(f => <button key={f} onClick={() => setAdminFlt(f)} style={{ ...bt(f === adminFlt ? "p" : "g"), textTransform: "capitalize", fontSize: 12 }}>{f} ({f === "all" ? adminClaims.length : adminClaims.filter(c => c.status === f).length})</button>)}</div>
              <div style={cd}>{filteredAdmin.map(c => { const emp = EMPLOYEE_DB[c.empId] || {}; const total = c.entries.reduce((s, e) => s + e.amount, 0); return (
                <div key={c.id} onClick={() => setAdminSel(c)} style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: `1px solid ${P.br}`, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = P.sf} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13.5 }}>{emp.name || c.empId} <span style={{ color: P.mu, fontWeight: 400, fontSize: 11 }}>· {c.empId} · {GRADES.find(g => g.id === emp.grade)?.label} · {emp.region}</span></div><div style={{ fontSize: 11, color: P.mu }}>{c.id} · {c.month} · {c.visitType} · {c.entries.length} entries · {c.entries.reduce((s, e) => s + e.files.length, 0)} files</div></div>
                  <div style={{ textAlign: "right", marginRight: 12 }}><div style={{ fontWeight: 800, fontSize: 16 }}>{fmt(total)}</div><div style={{ marginTop: 3 }}><Badge s={c.status} /></div></div>
                  <span style={{ color: P.mu }}>›</span>
                </div>
              ); })}</div>
            </div>
          )}
          {pg === "admin_list" && adminSel && <AdminDetail claim={adminSel} onBack={() => setAdminSel(null)} onStatus={onAdminStatus} onVerify={onAdminVerify} />}

          {/* ── POLICY ── */}
          {pg === "policy" && (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
              <div style={cd}>
                <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>Travel Policy — Levram Lifesciences Pvt. Ltd.</div>
                <div style={{ fontSize: 13, color: P.mu, marginBottom: 20 }}>Effective from 01/05/2024</div>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 14 }}>Daily Allowances (Conveyance + Food per day)</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 18 }}>
                  <thead><tr style={{ background: P.sf }}>{["Grade", "Local Metro", "Local Non-Metro", "Tour Metro", "Tour Non-Metro"].map(h => <th key={h} style={{ padding: "9px 10px", textAlign: "left", fontWeight: 700, fontSize: 10, textTransform: "uppercase", color: P.mu }}>{h}</th>)}</tr></thead>
                  <tbody>{GRADES.map(g => <tr key={g.id} style={{ borderBottom: `1px solid ${P.br}` }}><td style={{ padding: "9px 10px", fontWeight: 700 }}>{g.label} ({g.salary})</td>{["lm", "ln", "tm", "tn"].map(k => <td key={k} style={{ padding: "9px 10px" }}>{fmt(DA[g.id][k])}/day</td>)}</tr>)}</tbody>
                </table>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 14 }}>Lodging & Boarding (per day)</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 18 }}>
                  <thead><tr style={{ background: P.sf }}>{["Grade", "Metro", "Non-Metro"].map(h => <th key={h} style={{ padding: "9px 10px", textAlign: "left", fontWeight: 700, fontSize: 10, textTransform: "uppercase", color: P.mu }}>{h}</th>)}</tr></thead>
                  <tbody>{GRADES.map(g => <tr key={g.id} style={{ borderBottom: `1px solid ${P.br}` }}><td style={{ padding: "9px 10px", fontWeight: 700 }}>{g.label}</td><td style={{ padding: "9px 10px" }}>{fmt(LODGE[g.id].m)}/day</td><td style={{ padding: "9px 10px" }}>{fmt(LODGE[g.id].n)}/day</td></tr>)}</tbody>
                </table>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 14 }}>Travel Class & Vehicle Rates</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 18 }}>
                  <thead><tr style={{ background: P.sf }}>{["Grade", "Travel Class", "4 Wheeler", "2 Wheeler"].map(h => <th key={h} style={{ padding: "9px 10px", textAlign: "left", fontWeight: 700, fontSize: 10, textTransform: "uppercase", color: P.mu }}>{h}</th>)}</tr></thead>
                  <tbody>{GRADES.map(g => <tr key={g.id} style={{ borderBottom: `1px solid ${P.br}` }}><td style={{ padding: "9px 10px", fontWeight: 700 }}>{g.label}</td><td style={{ padding: "9px 10px" }}>{TCLASS[g.id]}</td><td style={{ padding: "9px 10px" }}>{VRATE[g.id].w4 ? `₹${VRATE[g.id].w4}/km` : "N.A."}</td><td style={{ padding: "9px 10px" }}>₹{VRATE[g.id].w2}/km</td></tr>)}</tbody>
                </table>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 14 }}>Policy Notes</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.8, color: "#555" }}>{NOTES.map((n, i) => <div key={i}>{i + 1}. {n}</div>)}</div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
