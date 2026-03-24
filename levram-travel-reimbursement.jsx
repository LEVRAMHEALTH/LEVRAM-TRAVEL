import { useState, useCallback, useRef } from "react";

// ══════════════════════════════════════════════════════════
// LEVRAM LIFESCIENCES TRAVEL POLICY w.e.f. 01/05/2024
// ══════════════════════════════════════════════════════════
const EMPLOYEE_GRADES = [
  { id: "executive", label: "Executive (Salary < ₹20K)", salaryRange: "< 20K" },
  { id: "middle", label: "Middle Management (₹20K – ₹50K)", salaryRange: "20K – 50K" },
  { id: "top", label: "Top Management (Salary > ₹50K)", salaryRange: "> 50K" },
];

const METRO_CITIES = ["Mumbai", "Delhi", "Chennai", "Kolkata", "Bangalore", "Pune", "Hyderabad", "Lucknow"];

// Daily Allowances: Conveyance + Breakfast + Lunch + Dinner (per day)
const DA_LIMITS = {
  executive: { local_metro: 300, local_nonmetro: 250, tour_metro: 700, tour_nonmetro: 600 },
  middle:    { local_metro: 400, local_nonmetro: 300, tour_metro: 800, tour_nonmetro: 700 },
  top:       { local_metro: 500, local_nonmetro: 400, tour_metro: 1000, tour_nonmetro: 800 },
};

// Lodging & Boarding (per day)
const LODGING_LIMITS = {
  executive: { metro: 1100, nonmetro: 800 },
  middle:    { metro: 1500, nonmetro: 1100 },
  top:       { metro: 2500, nonmetro: 2000 },
};

// Travelling Expenses permissible
const TRAVEL_CLASS = {
  executive: "3 Tier AC / Bus",
  middle:    "3 Tier AC / Bus",
  top:       "2 Tier AC / Air Fare",
};

// Mobile & Internet
const MOBILE_POLICY = {
  executive: "Company SIM provided",
  middle:    "Company SIM provided",
  top:       "₹9/km (4W)",
};

// Personal Vehicle Rates
const VEHICLE_RATES = {
  executive: { fourWheeler: null, twoWheeler: 3 },
  middle:    { fourWheeler: null, twoWheeler: 4 },
  top:       { fourWheeler: 9, twoWheeler: 4 },
};

const POLICY_NOTES = [
  "Metro Cities: Mumbai, Delhi, Chennai, Kolkata, Bangalore, Pune, Hyderabad, Lucknow. All other cities are Non-Metro.",
  "All employees travelling for official purpose can avail benefit of this policy.",
  "Advance planning for outstation visit to be submitted to accounts at least one week prior, duly approved by seniors.",
  "All expense claims must be supported by Bills/Tickets & should reach accounts within 1–2 days after returning from tour.",
  "Submission of travelling tickets & Hotel Bills is mandatory.",
  "Miscellaneous expenses (postage, stationery, courier, xerox, printouts) will be paid as actual against bills.",
  "Any other expenses apart from this policy will require Reporting Manager / Management approval.",
  "Vouchers will be settled after scrutiny by accounts team.",
  "Any pending advance not spent for the tour should be deposited into company accounts or handed over to Accounts.",
];

// ── EXPENSE CATEGORIES ──
const CATEGORIES = [
  { id: "daily_allowance", label: "Daily Allowance (Food & Conveyance)", icon: "🍽", color: "#059669", desc: "Conveyance, Breakfast, Lunch & Dinner – per day basis", requiresDays: true },
  { id: "lodging", label: "Lodging & Boarding", icon: "🏨", color: "#7C3AED", desc: "Hotel / Guest House / Service Apartment – per day", requiresDays: true, requiresHotelBill: true },
  { id: "travel_ticket", label: "Travelling Expenses (Tickets)", icon: "✈", color: "#2563EB", desc: "Train / Flight / Bus tickets as per grade eligibility", requiresRoute: true, requiresTicket: true },
  { id: "local_conveyance", label: "Local Conveyance (Auto/Cab)", icon: "🚕", color: "#D97706", desc: "Auto, Cab, Rickshaw for local official travel", requiresRoute: true },
  { id: "personal_vehicle", label: "Personal Vehicle (Official Use)", icon: "🚗", color: "#0891B2", desc: "Per-km rate – Log Book mandatory", requiresKm: true },
  { id: "misc", label: "Miscellaneous", icon: "📦", color: "#6B7280", desc: "Postage, Stationery, Courier, Xerox, Printouts – actual against bills", subTypes: ["Postage", "Stationery", "Courier", "Xerox/Printouts", "Other"] },
];

const TRAVEL_SUB = { executive: ["3 Tier AC", "Bus"], middle: ["3 Tier AC", "Bus"], top: ["2 Tier AC", "Air Fare", "Bus"] };
const VEHICLE_TYPES = [{ id: "2w", label: "2 Wheeler" }, { id: "4w", label: "4 Wheeler" }];
const VISIT_TYPES = ["Local Visit", "On Tour (Outstation)"];
const PURPOSES = ["Client Meeting", "Site Visit", "Product Demo", "Conference/Seminar", "Training", "Market Survey", "Delivery/Dispatch", "Other"];
const REGIONS = [...METRO_CITIES, "Other (Non-Metro)"];
const MONTHS = (() => { const m = []; const now = new Date(); for (let i = 0; i < 6; i++) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); m.push(d.toLocaleDateString("en-IN", { month: "long", year: "numeric" })); } return m; })();

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const isMetro = (city) => METRO_CITIES.some(m => city?.toLowerCase().includes(m.toLowerCase()));
const font = "'Outfit', system-ui, sans-serif";
const C = { bg: "#F4F2ED", card: "#fff", dark: "#191919", accent: "#1746A2", accentL: "#DBEAFE", green: "#059669", greenBg: "#ECFDF5", red: "#DC2626", redBg: "#FEF2F2", amber: "#D97706", amberBg: "#FFFBEB", border: "#E2DFD8", muted: "#8A857E", soft: "#FAF9F6", purple: "#7C3AED" };
const card = { background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px 26px", marginBottom: 16 };
const inp = (err) => ({ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${err ? C.red : C.border}`, fontSize: 13.5, fontFamily: font, outline: "none", boxSizing: "border-box", background: "#fff", transition: "border .2s" });
const lbl = { fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 5, display: "block", letterSpacing: ".5px", textTransform: "uppercase" };
const btn = (v) => { const b = { padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 7, fontFamily: font, transition: "all .15s" }; if (v === "p") return { ...b, background: C.accent, color: "#fff" }; if (v === "s") return { ...b, background: C.green, color: "#fff" }; if (v === "d") return { ...b, background: C.red, color: "#fff" }; if (v === "w") return { ...b, background: C.amber, color: "#fff" }; if (v === "lg") return { ...b, background: C.accent, color: "#fff", padding: "14px 32px", fontSize: 15, borderRadius: 12 }; return { ...b, background: C.soft, color: C.dark, border: `1.5px solid ${C.border}` }; };

function Badge({ status }) {
  const m = { pending: { bg: C.amberBg, c: C.amber, l: "Pending" }, approved: { bg: C.greenBg, c: C.green, l: "Approved" }, rejected: { bg: C.redBg, c: C.red, l: "Rejected" }, flagged: { bg: C.redBg, c: C.red, l: "Flagged" } };
  const s = m[status] || m.pending;
  return <span style={{ background: s.bg, color: s.c, padding: "4px 12px", borderRadius: 20, fontSize: 10.5, fontWeight: 800, letterSpacing: ".4px", textTransform: "uppercase" }}>{s.l}</span>;
}

function FileChip({ file, onRemove }) {
  const isImg = file.type?.startsWith("image/");
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", background: isImg ? "#EFF6FF" : "#FEF2F2", borderRadius: 8, fontSize: 11.5, fontWeight: 600, border: `1px solid ${isImg ? "#BFDBFE" : "#FECACA"}` }}>
      {isImg ? "🖼" : "📄"} <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
      <span style={{ color: C.muted, fontSize: 10 }}>({(file.size / 1024).toFixed(0)}KB)</span>
      {onRemove && <span onClick={onRemove} style={{ cursor: "pointer", color: C.red, fontWeight: 800 }}>×</span>}
    </div>
  );
}

// Policy limit checker
function checkPolicyViolations(expense, grade, visitCity) {
  const issues = [];
  const metro = isMetro(visitCity);
  const cat = expense.categoryId;

  if (cat === "daily_allowance" && expense.days && expense.amount) {
    const isLocal = expense.visitType === "Local Visit";
    const key = isLocal ? (metro ? "local_metro" : "local_nonmetro") : (metro ? "tour_metro" : "tour_nonmetro");
    const limit = DA_LIMITS[grade]?.[key] * expense.days;
    if (expense.amount > limit) issues.push(`DA exceeds policy: ${fmt(expense.amount)} claimed vs ${fmt(limit)} allowed (${expense.days} days × ${fmt(DA_LIMITS[grade]?.[key])}/day)`);
  }
  if (cat === "lodging" && expense.days && expense.amount) {
    const limit = LODGING_LIMITS[grade]?.[metro ? "metro" : "nonmetro"] * expense.days;
    if (expense.amount > limit) issues.push(`Lodging exceeds: ${fmt(expense.amount)} vs ${fmt(limit)} (${expense.days} days × ${fmt(LODGING_LIMITS[grade]?.[metro ? "metro" : "nonmetro"])}/day)`);
  }
  if (cat === "personal_vehicle" && expense.km) {
    const vtype = expense.vehicleType;
    const rate = VEHICLE_RATES[grade]?.[vtype === "4w" ? "fourWheeler" : "twoWheeler"];
    if (rate === null) issues.push(`${vtype === "4w" ? "4 Wheeler" : "2 Wheeler"} not allowed for your grade`);
    else if (expense.amount > rate * expense.km) issues.push(`Vehicle claim exceeds: ${fmt(expense.amount)} vs ${fmt(rate * expense.km)} (${expense.km} km × ₹${rate}/km)`);
  }
  if (expense.files?.length === 0) issues.push("Receipt / Bill / Ticket not uploaded — mandatory per policy");
  return issues;
}

// ── MOCK DATA ──
const MOCK = [
  { id: "LV-2026-041", salesperson: "Arjun Mehta", empId: "EMP-1021", email: "arjun.mehta@levram.com", phone: "9876543210", grade: "middle", region: "Mumbai", visitCity: "Pune", month: "February 2026", submittedDate: "2026-03-18", status: "pending", visitType: "On Tour (Outstation)", purpose: "Client Meeting", travelRoute: "Mumbai → Pune → Mumbai", notes: "Pune trip for ABC Corp quarterly review.",
    expenses: [
      { id: 1, categoryId: "travel_ticket", subType: "3 Tier AC", description: "Mumbai–Pune Shatabdi return", amount: 1450, date: "2026-02-05", fromCity: "Mumbai", toCity: "Pune", files: [{ name: "train_ticket.pdf", size: 240000, type: "application/pdf" }], verified: null },
      { id: 2, categoryId: "lodging", description: "Hotel Lemon Tree, Pune – 2 nights", amount: 2200, date: "2026-02-05", days: 2, files: [{ name: "hotel_invoice.pdf", size: 520000, type: "application/pdf" }], verified: null },
      { id: 3, categoryId: "daily_allowance", description: "DA for Pune tour – 3 days", amount: 2100, date: "2026-02-05", days: 3, visitType: "On Tour (Outstation)", files: [{ name: "food_bills.jpg", size: 310000, type: "image/jpeg" }], verified: null },
      { id: 4, categoryId: "local_conveyance", description: "Auto Pune station to client office", amount: 380, date: "2026-02-05", fromCity: "Pune Station", toCity: "Hinjewadi", files: [{ name: "auto_receipt.jpg", size: 180000, type: "image/jpeg" }], verified: null },
      { id: 5, categoryId: "personal_vehicle", description: "Local client visits – Feb", amount: 1600, date: "2026-02-28", km: 400, vehicleType: "2w", files: [{ name: "log_book.pdf", size: 420000, type: "application/pdf" }], verified: null },
    ], totalAmount: 7730 },
  { id: "LV-2026-040", salesperson: "Priya Sharma", empId: "EMP-1035", email: "priya.sharma@levram.com", phone: "9876541234", grade: "executive", region: "Delhi", visitCity: "Jaipur", month: "February 2026", submittedDate: "2026-03-17", status: "flagged", visitType: "On Tour (Outstation)", purpose: "Product Demo", travelRoute: "Delhi → Jaipur → Delhi", notes: "Flagged: dinner bill missing.",
    expenses: [
      { id: 1, categoryId: "travel_ticket", subType: "Bus", description: "Delhi–Jaipur Volvo bus", amount: 1200, date: "2026-02-10", fromCity: "Delhi", toCity: "Jaipur", files: [{ name: "bus_ticket.pdf", size: 350000, type: "application/pdf" }], verified: true },
      { id: 2, categoryId: "daily_allowance", description: "DA – 2 days Jaipur", amount: 1200, date: "2026-02-10", days: 2, visitType: "On Tour (Outstation)", files: [], verified: null },
      { id: 3, categoryId: "personal_vehicle", description: "Local travel", amount: 900, date: "2026-02-28", km: 300, vehicleType: "2w", files: [{ name: "log.pdf", size: 200000, type: "application/pdf" }], verified: true },
    ], totalAmount: 3300 },
  { id: "LV-2026-039", salesperson: "Ravi Kumar", empId: "EMP-1048", email: "ravi.kumar@levram.com", phone: "9876549876", grade: "top", region: "Chennai", visitCity: "Bangalore", month: "February 2026", submittedDate: "2026-03-15", status: "approved", visitType: "On Tour (Outstation)", purpose: "Site Visit", travelRoute: "Chennai → Bangalore → Chennai", notes: "All verified.",
    expenses: [
      { id: 1, categoryId: "travel_ticket", subType: "Air Fare", description: "Chennai–Bangalore flight", amount: 4800, date: "2026-02-08", fromCity: "Chennai", toCity: "Bangalore", files: [{ name: "flight.pdf", size: 180000, type: "application/pdf" }], verified: true },
      { id: 2, categoryId: "lodging", description: "Hotel, Bangalore 1 night", amount: 2400, date: "2026-02-08", days: 1, files: [{ name: "hotel.pdf", size: 150000, type: "application/pdf" }], verified: true },
      { id: 3, categoryId: "daily_allowance", description: "DA Bangalore 2 days", amount: 1600, date: "2026-02-08", days: 2, visitType: "On Tour (Outstation)", files: [{ name: "bills.jpg", size: 300000, type: "image/jpeg" }], verified: true },
      { id: 4, categoryId: "personal_vehicle", description: "Local 4W", amount: 450, date: "2026-02-28", km: 50, vehicleType: "4w", files: [{ name: "log.pdf", size: 120000, type: "application/pdf" }], verified: true },
    ], totalAmount: 9250 },
];

// ═══════════════════════════════════════════
// WIZARD
// ═══════════════════════════════════════════
function Wizard({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({ salesperson: "", empId: "", email: "", phone: "", grade: "", region: "", visitCity: "", month: MONTHS[0], visitType: "", purpose: "", travelRoute: "", notes: "" });
  const [expenses, setExpenses] = useState([]);
  const [cur, setCur] = useState(null);
  const [err, setErr] = useState({});
  const fileRef = useRef(null);

  const STEPS = ["Employee & Trip Details", "Add Expenses", "Review & Submit"];

  const v0 = () => {
    const e = {};
    if (!info.salesperson.trim()) e.salesperson = "Required";
    if (!info.empId.trim()) e.empId = "Required";
    if (!info.email.trim() || !/\S+@\S+\.\S+/.test(info.email)) e.email = "Valid email required";
    if (!info.phone.trim() || info.phone.replace(/\D/g, "").length < 10) e.phone = "10-digit phone required";
    if (!info.grade) e.grade = "Select your grade";
    if (!info.region) e.region = "Select base city";
    if (!info.visitType) e.visitType = "Select visit type";
    if (!info.purpose) e.purpose = "Select purpose";
    if (info.visitType === "On Tour (Outstation)" && !info.visitCity.trim()) e.visitCity = "Required for outstation";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const startExp = (catId) => {
    setCur({ id: Date.now(), categoryId: catId, subType: "", description: "", amount: "", date: "", fromCity: "", toCity: "", days: 1, km: "", vehicleType: "2w", visitType: info.visitType, files: [], verified: null, miscType: "" });
    setErr({});
  };

  const vExp = () => {
    const e = {};
    const cat = CATEGORIES.find(c => c.id === cur.categoryId);
    if (!cur.description.trim()) e.description = "Required";
    if (!cur.amount || parseFloat(cur.amount) <= 0) e.amount = "Valid amount required";
    if (!cur.date) e.date = "Required";
    if (cat.requiresRoute) { if (!cur.fromCity.trim()) e.fromCity = "Required"; if (!cur.toCity.trim()) e.toCity = "Required"; }
    if (cat.requiresTicket && !cur.subType) e.subType = "Select ticket type";
    if (cat.requiresKm && (!cur.km || parseFloat(cur.km) <= 0)) e.km = "Enter km driven";
    if (cur.files.length === 0) e.files = "Receipt / Bill upload is MANDATORY per company policy";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const saveExp = () => { if (!vExp()) return; const exp = { ...cur, amount: parseFloat(cur.amount), km: cur.km ? parseFloat(cur.km) : undefined, days: cur.days ? parseInt(cur.days) : undefined }; setExpenses(p => { const ex = p.find(x => x.id === exp.id); return ex ? p.map(x => x.id === exp.id ? exp : x) : [...p, exp]; }); setCur(null); setErr({}); };

  const handleFiles = (e) => {
    const nf = Array.from(e.target.files || []).filter(f => (f.type === "application/pdf" || f.type.startsWith("image/")) && f.size <= 10 * 1024 * 1024).map(f => ({ name: f.name, size: f.size, type: f.type, preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null }));
    setCur(p => ({ ...p, files: [...p.files, ...nf] }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const total = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const allIssues = expenses.flatMap(e => checkPolicyViolations(e, info.grade, info.visitCity || info.region));

  // ── Step 0 ──
  const renderS0 = () => (
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      <div style={card}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>👤 Employee Information</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>All fields marked * are mandatory</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div><label style={lbl}>Full Name *</label><input value={info.salesperson} onChange={e => setInfo({ ...info, salesperson: e.target.value })} style={inp(err.salesperson)} placeholder="As per company records" />{err.salesperson && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.salesperson}</div>}</div>
          <div><label style={lbl}>Employee ID *</label><input value={info.empId} onChange={e => setInfo({ ...info, empId: e.target.value.toUpperCase() })} style={inp(err.empId)} placeholder="e.g. EMP-1021" />{err.empId && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.empId}</div>}</div>
          <div><label style={lbl}>Email *</label><input type="email" value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })} style={inp(err.email)} placeholder="name@levram.com" />{err.email && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.email}</div>}</div>
          <div><label style={lbl}>Phone *</label><input value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} style={inp(err.phone)} placeholder="10-digit mobile" maxLength={10} />{err.phone && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.phone}</div>}</div>
          <div><label style={lbl}>Employee Grade *</label><select value={info.grade} onChange={e => setInfo({ ...info, grade: e.target.value })} style={inp(err.grade)}><option value="">Select Grade</option>{EMPLOYEE_GRADES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}</select>{err.grade && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.grade}</div>}</div>
          <div><label style={lbl}>Base City / Region *</label><select value={info.region} onChange={e => setInfo({ ...info, region: e.target.value })} style={inp(err.region)}><option value="">Select</option>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select>{err.region && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.region}</div>}</div>
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>🗓 Trip / Visit Details</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>Per policy, outstation visits must be planned 1 week in advance</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div><label style={lbl}>Claim Month *</label><select value={info.month} onChange={e => setInfo({ ...info, month: e.target.value })} style={inp()}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
          <div><label style={lbl}>Visit Type *</label><select value={info.visitType} onChange={e => setInfo({ ...info, visitType: e.target.value })} style={inp(err.visitType)}><option value="">Select</option>{VISIT_TYPES.map(v => <option key={v} value={v}>{v}</option>)}</select>{err.visitType && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.visitType}</div>}</div>
          <div><label style={lbl}>Purpose *</label><select value={info.purpose} onChange={e => setInfo({ ...info, purpose: e.target.value })} style={inp(err.purpose)}><option value="">Select</option>{PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}</select>{err.purpose && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.purpose}</div>}</div>
          {info.visitType === "On Tour (Outstation)" && <div><label style={lbl}>Visit City *</label><input value={info.visitCity} onChange={e => setInfo({ ...info, visitCity: e.target.value })} style={inp(err.visitCity)} placeholder="e.g. Pune, Jaipur" />{err.visitCity && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.visitCity}</div>}</div>}
          <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Travel Route</label><input value={info.travelRoute} onChange={e => setInfo({ ...info, travelRoute: e.target.value })} style={inp()} placeholder="e.g. Mumbai → Pune → Mumbai" /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Remarks / Notes</label><textarea value={info.notes} onChange={e => setInfo({ ...info, notes: e.target.value })} style={{ ...inp(), height: 50, resize: "vertical" }} placeholder="Any additional info for accounts team..." /></div>
        </div>
      </div>

      {/* Policy Limits Preview */}
      {info.grade && (
        <div style={{ ...card, background: C.accentL, borderColor: `${C.accent}33` }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: C.accent }}>📋 Your Policy Limits ({EMPLOYEE_GRADES.find(g => g.id === info.grade)?.label})</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 12.5 }}>
            <div style={{ padding: 12, background: "#fff", borderRadius: 10 }}>
              <div style={{ fontWeight: 700, color: C.muted, fontSize: 10, textTransform: "uppercase", marginBottom: 6 }}>Daily Allowance (Food+Conv.)</div>
              <div>Local Metro: <strong>{fmt(DA_LIMITS[info.grade].local_metro)}/day</strong></div>
              <div>Local Non-Metro: <strong>{fmt(DA_LIMITS[info.grade].local_nonmetro)}/day</strong></div>
              <div>Tour Metro: <strong>{fmt(DA_LIMITS[info.grade].tour_metro)}/day</strong></div>
              <div>Tour Non-Metro: <strong>{fmt(DA_LIMITS[info.grade].tour_nonmetro)}/day</strong></div>
            </div>
            <div style={{ padding: 12, background: "#fff", borderRadius: 10 }}>
              <div style={{ fontWeight: 700, color: C.muted, fontSize: 10, textTransform: "uppercase", marginBottom: 6 }}>Lodging & Boarding</div>
              <div>Metro: <strong>{fmt(LODGING_LIMITS[info.grade].metro)}/day</strong></div>
              <div>Non-Metro: <strong>{fmt(LODGING_LIMITS[info.grade].nonmetro)}/day</strong></div>
              <div style={{ marginTop: 6, fontWeight: 700, color: C.muted, fontSize: 10, textTransform: "uppercase" }}>Travel Class</div>
              <div><strong>{TRAVEL_CLASS[info.grade]}</strong></div>
            </div>
            <div style={{ padding: 12, background: "#fff", borderRadius: 10 }}>
              <div style={{ fontWeight: 700, color: C.muted, fontSize: 10, textTransform: "uppercase", marginBottom: 6 }}>Personal Vehicle</div>
              <div>2 Wheeler: <strong>{VEHICLE_RATES[info.grade].twoWheeler ? `₹${VEHICLE_RATES[info.grade].twoWheeler}/km` : "N.A."}</strong></div>
              <div>4 Wheeler: <strong>{VEHICLE_RATES[info.grade].fourWheeler ? `₹${VEHICLE_RATES[info.grade].fourWheeler}/km` : "N.A."}</strong></div>
              <div style={{ marginTop: 6, fontWeight: 700, color: C.muted, fontSize: 10, textTransform: "uppercase" }}>Mobile</div>
              <div><strong>Company SIM provided</strong></div>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: "right", marginTop: 8 }}><button onClick={() => { if (v0()) setStep(1); }} style={btn("lg")}>Continue to Expenses →</button></div>
    </div>
  );

  // ── Step 1 ──
  const renderS1 = () => (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      {!cur ? (
        <>
          <div style={card}>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>Select Expense Category</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Each item requires a bill/receipt upload. Limits are validated automatically per policy.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} onClick={() => startExp(cat.id)} style={{ padding: "16px", background: C.soft, borderRadius: 12, cursor: "pointer", border: "2px solid transparent", transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{cat.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{cat.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{cat.desc}</div>
                </div>
              ))}
            </div>
          </div>
          {expenses.length > 0 && (
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 800 }}>Added ({expenses.length})</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: C.accent }}>{fmt(total)}</span>
              </div>
              {expenses.map(exp => {
                const cat = CATEGORIES.find(c => c.id === exp.categoryId);
                const issues = checkPolicyViolations(exp, info.grade, info.visitCity || info.region);
                return (
                  <div key={exp.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: issues.length > 0 ? C.redBg : C.soft, borderRadius: 10, marginBottom: 8, borderLeft: `4px solid ${issues.length > 0 ? C.red : cat.color}` }}>
                    <span style={{ fontSize: 20 }}>{cat.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{exp.description}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{exp.date} {exp.fromCity ? `· ${exp.fromCity} → ${exp.toCity}` : ""} {exp.days ? `· ${exp.days} days` : ""} {exp.km ? `· ${exp.km} km` : ""}</div>
                      {issues.map((iss, i) => <div key={i} style={{ fontSize: 11, color: C.red, fontWeight: 600, marginTop: 2 }}>⚠ {iss}</div>)}
                      {exp.files.length > 0 && <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>📎 {exp.files.length} file{exp.files.length > 1 ? "s" : ""}</span>}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(exp.amount)}</div>
                    <button onClick={() => { setCur(exp); setErr({}); }} style={{ ...btn("g"), padding: "5px 10px", fontSize: 11 }}>Edit</button>
                    <button onClick={() => setExpenses(p => p.filter(x => x.id !== exp.id))} style={{ ...btn("g"), padding: "5px 10px", fontSize: 11, color: C.red }}>×</button>
                  </div>
                );
              })}
            </div>
          )}
          {err.global && <div style={{ color: C.red, fontWeight: 700, textAlign: "center", marginBottom: 10 }}>{err.global}</div>}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(0)} style={btn("g")}>← Back</button>
            <button onClick={() => { if (expenses.length === 0) setErr({ global: "Add at least one expense" }); else { setStep(2); setErr({}); } }} style={btn("lg")}>Review & Submit →</button>
          </div>
        </>
      ) : (() => {
        const cat = CATEGORIES.find(c => c.id === cur.categoryId);
        return (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 26 }}>{cat.icon}</span>
                <div><div style={{ fontWeight: 800, fontSize: 16 }}>{cat.label}</div><div style={{ fontSize: 12, color: C.muted }}>{cat.desc}</div></div>
              </div>
              <button onClick={() => { setCur(null); setErr({}); }} style={btn("g")}>Cancel</button>
            </div>

            {/* Contextual limit hint */}
            {info.grade && (
              <div style={{ padding: "10px 14px", background: C.amberBg, borderRadius: 8, fontSize: 12, color: C.amber, fontWeight: 600, marginBottom: 16 }}>
                💡 {cat.id === "daily_allowance" && `Your DA limit: ${info.visitType === "Local Visit" ? `${fmt(DA_LIMITS[info.grade][isMetro(info.visitCity || info.region) ? "local_metro" : "local_nonmetro"])}/day (${info.visitType})` : `${fmt(DA_LIMITS[info.grade][isMetro(info.visitCity || info.region) ? "tour_metro" : "tour_nonmetro"])}/day (Tour)`}`}
                {cat.id === "lodging" && `Lodging limit: ${fmt(LODGING_LIMITS[info.grade][isMetro(info.visitCity || info.region) ? "metro" : "nonmetro"])}/day (${isMetro(info.visitCity || info.region) ? "Metro" : "Non-Metro"})`}
                {cat.id === "travel_ticket" && `Travel class: ${TRAVEL_CLASS[info.grade]}`}
                {cat.id === "personal_vehicle" && `Rate: 2W ₹${VEHICLE_RATES[info.grade].twoWheeler || "N.A."}/km · 4W ${VEHICLE_RATES[info.grade].fourWheeler ? `₹${VEHICLE_RATES[info.grade].fourWheeler}/km` : "N.A. for your grade"}`}
                {cat.id === "local_conveyance" && "Claim actual amount with receipt"}
                {cat.id === "misc" && "Paid as actual against bills/supporting documents"}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {cat.requiresTicket && <div><label style={lbl}>Ticket Type *</label><select value={cur.subType} onChange={e => setCur(p => ({ ...p, subType: e.target.value }))} style={inp(err.subType)}><option value="">Select</option>{(TRAVEL_SUB[info.grade] || []).map(s => <option key={s} value={s}>{s}</option>)}</select>{err.subType && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.subType}</div>}</div>}
              {cat.id === "misc" && <div><label style={lbl}>Type</label><select value={cur.miscType} onChange={e => setCur(p => ({ ...p, miscType: e.target.value }))} style={inp()}><option value="">Select</option>{cat.subTypes.map(s => <option key={s} value={s}>{s}</option>)}</select></div>}
              {cat.requiresKm && <div><label style={lbl}>Vehicle Type *</label><select value={cur.vehicleType} onChange={e => setCur(p => ({ ...p, vehicleType: e.target.value }))} style={inp()}>{VEHICLE_TYPES.filter(v => v.id === "2w" || VEHICLE_RATES[info.grade]?.fourWheeler !== null).map(v => <option key={v.id} value={v.id}>{v.label}</option>)}</select></div>}
              <div><label style={lbl}>Date *</label><input type="date" value={cur.date} onChange={e => setCur(p => ({ ...p, date: e.target.value }))} style={inp(err.date)} max={new Date().toISOString().split("T")[0]} />{err.date && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.date}</div>}</div>
            </div>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Description *</label><input value={cur.description} onChange={e => setCur(p => ({ ...p, description: e.target.value }))} style={inp(err.description)} placeholder="Detailed description of expense" />{err.description && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.description}</div>}</div>

            {cat.requiresRoute && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}><div><label style={lbl}>From *</label><input value={cur.fromCity} onChange={e => setCur(p => ({ ...p, fromCity: e.target.value }))} style={inp(err.fromCity)} />{err.fromCity && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.fromCity}</div>}</div><div><label style={lbl}>To *</label><input value={cur.toCity} onChange={e => setCur(p => ({ ...p, toCity: e.target.value }))} style={inp(err.toCity)} />{err.toCity && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.toCity}</div>}</div></div>}
            {cat.requiresDays && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}><div><label style={lbl}>No. of Days *</label><input type="number" min="1" max="31" value={cur.days} onChange={e => setCur(p => ({ ...p, days: e.target.value }))} style={inp()} /></div>{cat.id === "daily_allowance" && <div><label style={lbl}>Visit Type</label><select value={cur.visitType} onChange={e => setCur(p => ({ ...p, visitType: e.target.value }))} style={inp()}>{VISIT_TYPES.map(v => <option key={v} value={v}>{v}</option>)}</select></div>}</div>}
            {cat.requiresKm && <div style={{ marginBottom: 14 }}><label style={lbl}>Kilometres Driven *</label><input type="number" min="1" value={cur.km} onChange={e => setCur(p => ({ ...p, km: e.target.value }))} style={inp(err.km)} placeholder="e.g. 120" />{err.km && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.km}</div>}{cur.km && info.grade && <div style={{ fontSize: 12, color: C.green, marginTop: 4, fontWeight: 600 }}>Max claimable: {fmt((VEHICLE_RATES[info.grade]?.[cur.vehicleType === "4w" ? "fourWheeler" : "twoWheeler"] || 0) * (parseFloat(cur.km) || 0))}</div>}</div>}

            <div style={{ marginBottom: 16 }}><label style={lbl}>Amount (₹) *</label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: C.muted }}>₹</span><input type="number" min="1" value={cur.amount} onChange={e => setCur(p => ({ ...p, amount: e.target.value }))} style={{ ...inp(err.amount), paddingLeft: 34, fontSize: 16, fontWeight: 700 }} placeholder="0" /></div>{err.amount && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>{err.amount}</div>}</div>

            {/* FILE UPLOAD */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ ...lbl, color: err.files ? C.red : C.muted }}>Upload Bill / Receipt / Ticket * (PDF or Image)</label>
              <div onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.accent; }} onDragLeave={e => { e.currentTarget.style.borderColor = err.files ? C.red : C.border; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.border; if (e.dataTransfer.files.length) handleFiles({ target: { files: e.dataTransfer.files } }); }}
                style={{ padding: 22, border: `2px dashed ${err.files ? C.red : C.border}`, borderRadius: 12, textAlign: "center", cursor: "pointer", background: C.soft, transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.accentL; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = err.files ? C.red : C.border; e.currentTarget.style.background = C.soft; }}>
                <div style={{ fontSize: 28 }}>📤</div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Click to upload or drag & drop</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>PDF, JPG, JPEG, PNG — Max 10MB</div>
              </div>
              <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf" onChange={handleFiles} style={{ display: "none" }} />
              {err.files && <div style={{ color: C.red, fontSize: 11.5, marginTop: 5, fontWeight: 700 }}>⚠ {err.files}</div>}
              {cur.files.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{cur.files.map((f, i) => <div key={i}>{f.preview && <img src={f.preview} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: `2px solid ${C.border}`, marginBottom: 4, display: "block" }} />}<FileChip file={f} onRemove={() => setCur(p => ({ ...p, files: p.files.filter((_, j) => j !== i) }))} /></div>)}</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => { setCur(null); setErr({}); }} style={btn("g")}>Cancel</button>
              <button onClick={saveExp} style={btn("p")}>✓ Save Expense</button>
            </div>
          </div>
        );
      })()}
    </div>
  );

  // ── Step 2 ──
  const renderS2 = () => {
    const missing = expenses.filter(e => e.files.length === 0);
    return (
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {missing.length > 0 && <div style={{ ...card, background: C.redBg, borderLeft: `4px solid ${C.red}` }}><div style={{ fontWeight: 800, color: C.red }}>⚠ Cannot Submit — Missing Receipts</div>{missing.map(e => <div key={e.id} style={{ fontSize: 12, marginTop: 4 }}>• {e.description} — {fmt(e.amount)}</div>)}</div>}
        {allIssues.length > 0 && <div style={{ ...card, background: C.amberBg, borderLeft: `4px solid ${C.amber}` }}><div style={{ fontWeight: 800, color: C.amber, marginBottom: 6 }}>⚠ Policy Violations Detected ({allIssues.length})</div>{allIssues.map((iss, i) => <div key={i} style={{ fontSize: 12, marginTop: 3, color: "#92400E" }}>• {iss}</div>)}<div style={{ fontSize: 11.5, color: C.muted, marginTop: 8 }}>Claims with violations will be flagged for manager approval.</div></div>}

        <div style={card}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>📋 Final Claim Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: 14, background: C.soft, borderRadius: 10, marginBottom: 16, fontSize: 12.5 }}>
            <div><span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>EMPLOYEE</span><div style={{ fontWeight: 700, marginTop: 2 }}>{info.salesperson} ({info.empId})</div></div>
            <div><span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>GRADE</span><div style={{ fontWeight: 700, marginTop: 2 }}>{EMPLOYEE_GRADES.find(g => g.id === info.grade)?.label}</div></div>
            <div><span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>MONTH</span><div style={{ fontWeight: 700, marginTop: 2 }}>{info.month}</div></div>
            <div><span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>VISIT TYPE</span><div style={{ fontWeight: 700, marginTop: 2 }}>{info.visitType}</div></div>
            <div><span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>PURPOSE</span><div style={{ fontWeight: 700, marginTop: 2 }}>{info.purpose}</div></div>
            <div><span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>TOTAL</span><div style={{ fontWeight: 900, marginTop: 2, fontSize: 20, color: C.accent }}>{fmt(total)}</div></div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead><tr style={{ background: C.soft }}>{["#", "Category", "Description", "Date", "Details", "Amount", "Receipt"].map(h => <th key={h} style={{ textAlign: h === "Amount" ? "right" : "left", padding: "9px 10px", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", color: C.muted }}>{h}</th>)}</tr></thead>
            <tbody>{expenses.map((exp, i) => { const cat = CATEGORIES.find(c => c.id === exp.categoryId); return (<tr key={exp.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: "10px" }}>{i + 1}</td><td style={{ padding: "10px", color: cat.color, fontWeight: 700 }}>{cat.icon} {exp.subType || exp.miscType || cat.label.split("(")[0]}</td><td style={{ padding: "10px", maxWidth: 180 }}>{exp.description}</td><td style={{ padding: "10px", fontSize: 11.5 }}>{exp.date}</td><td style={{ padding: "10px", fontSize: 11.5 }}>{exp.fromCity ? `${exp.fromCity}→${exp.toCity}` : ""}{exp.days ? `${exp.days}d` : ""}{exp.km ? `${exp.km}km` : ""}</td><td style={{ padding: "10px", textAlign: "right", fontWeight: 700 }}>{fmt(exp.amount)}</td><td style={{ padding: "10px" }}>{exp.files.length > 0 ? <span style={{ color: C.green, fontWeight: 700 }}>✓ {exp.files.length}</span> : <span style={{ color: C.red, fontWeight: 700 }}>✗</span>}</td></tr>); })}<tr style={{ background: C.soft }}><td colSpan={5} style={{ padding: "12px 10px", fontWeight: 800, fontSize: 14 }}>TOTAL CLAIM</td><td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 900, fontSize: 17, color: C.accent }}>{fmt(total)}</td><td></td></tr></tbody>
          </table>
        </div>

        <div style={{ ...card, background: C.accentL, borderColor: `${C.accent}33` }}>
          <div style={{ display: "flex", gap: 10 }}><span style={{ fontSize: 22 }}>🔒</span><div><div style={{ fontWeight: 800, fontSize: 13 }}>Declaration</div><div style={{ fontSize: 12, color: "#444", lineHeight: 1.6 }}>I hereby declare that all expenses claimed above are genuine business expenses incurred by me in the course of official duties. All attached receipts, bills, and tickets are authentic. I understand that any false or inflated claim is a violation of company policy and may lead to disciplinary action. Any unspent advance will be returned to Accounts.</div></div></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setStep(1)} style={btn("g")}>← Edit Expenses</button>
          <button onClick={() => { if (missing.length > 0) return; const claim = { id: `LV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`, ...info, expenses, totalAmount: total, submittedDate: new Date().toISOString().split("T")[0], status: allIssues.length > 0 ? "flagged" : "pending" }; onSubmit(claim); }} disabled={missing.length > 0} style={{ ...btn("lg"), background: missing.length > 0 ? "#ccc" : C.green, cursor: missing.length > 0 ? "not-allowed" : "pointer" }}>✓ Submit Claim</button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 24 }}>
        {STEPS.map((s, i) => (<div key={i} style={{ display: "flex", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 7 }}><div style={{ width: 30, height: 30, borderRadius: "50%", background: i <= step ? C.accent : C.border, color: i <= step ? "#fff" : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12.5 }}>{i < step ? "✓" : i + 1}</div><span style={{ fontSize: 12.5, fontWeight: i === step ? 800 : 500, color: i <= step ? C.dark : C.muted }}>{s}</span></div>{i < STEPS.length - 1 && <div style={{ width: 40, height: 2, background: i < step ? C.accent : C.border, margin: "0 10px" }} />}</div>))}
      </div>
      {step === 0 && renderS0()}
      {step === 1 && renderS1()}
      {step === 2 && renderS2()}
    </div>
  );
}

// ═══════════════════════════════════════════
// CLAIM DETAIL
// ═══════════════════════════════════════════
function Detail({ claim, onBack, onStatus, onVerify }) {
  const tf = claim.expenses.reduce((s, e) => s + e.files.length, 0);
  const vc = claim.expenses.filter(e => e.verified === true).length;
  return (
    <div>
      <button onClick={onBack} style={{ ...btn("g"), marginBottom: 14 }}>← Back</button>
      <div style={{ display: "grid", gridTemplateColumns: "5fr 2fr", gap: 16 }}>
        <div>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <div><div style={{ fontSize: 21, fontWeight: 900 }}>{claim.salesperson}</div><div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{claim.empId} · {claim.email} · {claim.phone}</div><div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}><Badge status={claim.status} /><span style={{ fontSize: 11.5, color: C.muted }}>{EMPLOYEE_GRADES.find(g => g.id === claim.grade)?.label} · {claim.region} · {claim.visitType}</span></div>{claim.purpose && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Purpose: <strong>{claim.purpose}</strong> {claim.travelRoute && `· ${claim.travelRoute}`}</div>}</div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Total Claim</div><div style={{ fontSize: 28, fontWeight: 900, color: C.accent }}>{fmt(claim.totalAmount)}</div></div>
            </div>
            {claim.expenses.map(exp => {
              const cat = CATEGORIES.find(c => c.id === exp.categoryId);
              const issues = checkPolicyViolations(exp, claim.grade, claim.visitCity || claim.region);
              return (
                <div key={exp.id} style={{ padding: "14px 16px", background: issues.length > 0 ? C.redBg : C.soft, borderRadius: 12, marginBottom: 8, borderLeft: `4px solid ${issues.length > 0 ? C.red : cat?.color || C.muted}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}><span style={{ fontSize: 16 }}>{cat?.icon}</span><span style={{ fontWeight: 800, fontSize: 13.5 }}>{exp.subType || exp.miscType || cat?.label.split("(")[0]}</span><span style={{ fontSize: 11, color: C.muted }}>{exp.date}</span></div>
                      <div style={{ fontSize: 12.5, color: "#555" }}>{exp.description}</div>
                      <div style={{ display: "flex", gap: 14, fontSize: 11, color: C.muted, marginTop: 3 }}>
                        {exp.fromCity && <span>📍 {exp.fromCity} → {exp.toCity}</span>}
                        {exp.days && <span>🗓 {exp.days} days</span>}
                        {exp.km && <span>🛣 {exp.km} km ({exp.vehicleType === "4w" ? "4W" : "2W"})</span>}
                      </div>
                      {issues.map((iss, i) => <div key={i} style={{ fontSize: 11, color: C.red, fontWeight: 700, marginTop: 3 }}>⚠ {iss}</div>)}
                      {exp.files.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>{exp.files.map((f, i) => <FileChip key={i} file={f} />)}</div>}
                      {exp.files.length === 0 && <div style={{ color: C.red, fontSize: 11.5, fontWeight: 700, marginTop: 4 }}>⚠ No receipt/bill uploaded</div>}
                    </div>
                    <div style={{ textAlign: "right", minWidth: 110, marginLeft: 12 }}>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{fmt(exp.amount)}</div>
                      <div style={{ marginTop: 8 }}>
                        {exp.verified === true && <span style={{ color: C.green, fontSize: 11.5, fontWeight: 700 }}>✓ Verified</span>}
                        {exp.verified === false && <span style={{ color: C.red, fontSize: 11.5, fontWeight: 700 }}>✗ Rejected</span>}
                        {exp.verified === null && exp.files.length > 0 && <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}><button onClick={() => onVerify(claim.id, exp.id, true)} style={{ ...btn("s"), padding: "4px 10px", fontSize: 10.5 }}>✓</button><button onClick={() => onVerify(claim.id, exp.id, false)} style={{ ...btn("d"), padding: "4px 10px", fontSize: 10.5 }}>✗</button></div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {claim.notes && <div style={card}><strong>Notes:</strong> <span style={{ color: "#555" }}>{claim.notes}</span></div>}
        </div>
        <div>
          <div style={card}><div style={{ fontWeight: 800, marginBottom: 12 }}>Documents</div><div style={{ fontSize: 13 }}>Files: <strong>{tf}</strong> · Verified: <strong style={{ color: C.green }}>{vc}</strong></div><div style={{ height: 6, background: "#eee", borderRadius: 3, marginTop: 8 }}><div style={{ height: "100%", width: `${tf > 0 ? (vc / tf) * 100 : 0}%`, background: C.green, borderRadius: 3 }} /></div></div>
          {(claim.status === "pending" || claim.status === "flagged") && <div style={card}><div style={{ fontWeight: 800, marginBottom: 10 }}>Actions</div><div style={{ display: "flex", flexDirection: "column", gap: 8 }}><button onClick={() => onStatus(claim.id, "approved")} style={{ ...btn("s"), width: "100%", justifyContent: "center", padding: 13 }}>✓ Approve</button><button onClick={() => onStatus(claim.id, "flagged")} style={{ ...btn("w"), width: "100%", justifyContent: "center", padding: 13 }}>⚠ Flag</button><button onClick={() => onStatus(claim.id, "rejected")} style={{ ...btn("d"), width: "100%", justifyContent: "center", padding: 13 }}>✗ Reject</button></div></div>}

          <div style={{ ...card, fontSize: 11.5, lineHeight: 1.7, color: C.muted }}>
            <div style={{ fontWeight: 800, marginBottom: 8, color: C.dark, fontSize: 13 }}>📜 Policy Notes</div>
            {POLICY_NOTES.map((n, i) => <div key={i} style={{ marginBottom: 4 }}>{i + 1}. {n}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
export default function App() {
  const [pg, setPg] = useState("dash");
  const [claims, setClaims] = useState(MOCK);
  const [sel, setSel] = useState(null);
  const [flt, setFlt] = useState("all");
  const [toast, setToast] = useState(null);

  const show = (m, t = "s") => { setToast({ m, t }); setTimeout(() => setToast(null), 3000); };
  const onStatus = useCallback((id, s) => { setClaims(p => p.map(c => c.id === id ? { ...c, status: s } : c)); if (sel?.id === id) setSel(p => ({ ...p, status: s })); show(`Claim ${id} ${s}`); }, [sel]);
  const onVerify = useCallback((cid, eid, r) => { setClaims(p => p.map(c => c.id === cid ? { ...c, expenses: c.expenses.map(e => e.id === eid ? { ...e, verified: r } : e) } : c)); if (sel?.id === cid) setSel(p => ({ ...p, expenses: p.expenses.map(e => e.id === eid ? { ...e, verified: r } : e) })); }, [sel]);
  const onNew = useCallback((c) => { setClaims(p => [c, ...p]); setPg("list"); setSel(null); show(`Claim ${c.id} submitted!`); }, []);

  const filtered = flt === "all" ? claims : claims.filter(c => c.status === flt);
  const pending = claims.filter(c => c.status === "pending").length;
  const flagged = claims.filter(c => c.status === "flagged").length;
  const total = claims.reduce((s, c) => s + c.totalAmount, 0);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: font, background: C.bg, color: C.dark, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, padding: "12px 24px", borderRadius: 12, background: toast.t === "s" ? C.green : C.red, color: "#fff", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 30px rgba(0,0,0,.15)" }}>{toast.m}</div>}

      <div style={{ width: 215, background: C.dark, color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #333" }}>
          <div style={{ fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 28, height: 28, background: C.accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>₹</span>Levram Travel</div>
          <div style={{ fontSize: 9.5, color: "#555", marginTop: 3, letterSpacing: ".5px" }}>REIMBURSEMENT SYSTEM</div>
        </div>
        <nav style={{ padding: "12px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {[["dash", "📊", "Dashboard"], ["list", "📋", "All Claims"], ["new", "➕", "New Claim"], ["policy", "📜", "Policy"]].map(([id, ic, lb]) => (
            <div key={id} onClick={() => { setPg(id); setSel(null); }} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: pg === id ? 700 : 400, background: pg === id ? "#333" : "transparent", color: pg === id ? "#fff" : "#999" }}>
              <span style={{ fontSize: 15 }}>{ic}</span>{lb}
              {id === "list" && pending > 0 && <span style={{ marginLeft: "auto", background: C.amber, fontSize: 9.5, fontWeight: 800, padding: "2px 6px", borderRadius: 10, color: "#fff" }}>{pending}</span>}
            </div>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #333", fontSize: 9.5, color: "#555" }}>Policy w.e.f. 01/05/2024</div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 28px", background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{sel ? `Claim ${sel.id}` : pg === "dash" ? "Dashboard" : pg === "list" ? "Reimbursement Claims" : pg === "new" ? "Submit New Claim" : "Travel Policy"}</div>
          <div style={{ fontSize: 12.5, color: C.muted }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "22px 28px" }}>

          {/* DASHBOARD */}
          {pg === "dash" && <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
              {[{ l: "Total Claims", v: claims.length, c: C.dark, a: C.accent }, { l: "Pending", v: pending, c: C.amber, a: C.amber }, { l: "Flagged", v: flagged, c: C.red, a: C.red }, { l: "Total Amount", v: fmt(total), c: C.green, a: C.green }].map((s, i) => (
                <div key={i} style={{ ...card, flex: 1, minWidth: 160, marginBottom: 0, borderTop: `3px solid ${s.a}`, padding: "16px 18px" }}><div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{s.l}</div><div style={{ fontSize: 26, fontWeight: 900, marginTop: 4, color: s.c }}>{s.v}</div></div>
              ))}
            </div>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 12 }}>Recent Claims</div>
              {claims.slice(0, 6).map(c => (<div key={c.id} onClick={() => { setPg("list"); setSel(c); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: C.soft, borderRadius: 10, marginBottom: 6, cursor: "pointer", transition: "all .15s" }} onMouseEnter={e => e.currentTarget.style.background = C.accentL} onMouseLeave={e => e.currentTarget.style.background = C.soft}><div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.salesperson} <span style={{ fontWeight: 400, color: C.muted, fontSize: 11.5 }}>· {c.empId} · {EMPLOYEE_GRADES.find(g => g.id === c.grade)?.salaryRange}</span></div><div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.id} · {c.month} · {c.visitType} · {c.expenses.length} items</div></div><div style={{ textAlign: "right" }}><div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(c.totalAmount)}</div><div style={{ marginTop: 3 }}><Badge status={c.status} /></div></div></div>))}
            </div>
          </div>}

          {/* CLAIMS LIST */}
          {pg === "list" && !sel && <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>{["all", "pending", "flagged", "approved", "rejected"].map(f => (<button key={f} onClick={() => setFlt(f)} style={{ ...btn(f === flt ? "p" : "g"), textTransform: "capitalize", fontSize: 12 }}>{f} ({f === "all" ? claims.length : claims.filter(c => c.status === f).length})</button>))}</div>
            <div style={card}>{filtered.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: C.muted }}>No claims</div> : filtered.map(c => { const miss = c.expenses.filter(e => e.files.length === 0).length; const issues = c.expenses.flatMap(e => checkPolicyViolations(e, c.grade, c.visitCity || c.region)); return (<div key={c.id} onClick={() => setSel(c)} style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "all .15s" }} onMouseEnter={e => e.currentTarget.style.background = C.soft} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.salesperson} <span style={{ fontWeight: 500, color: C.muted, fontSize: 11.5 }}>· {c.empId} · {c.region}</span></div><div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{c.id} · {c.month} · {c.visitType} · {c.expenses.length} items · {c.expenses.reduce((s, e) => s + e.files.length, 0)} files</div>{miss > 0 && <div style={{ fontSize: 11, color: C.red, fontWeight: 700, marginTop: 2 }}>⚠ {miss} missing receipt{miss > 1 ? "s" : ""}</div>}{issues.length > 0 && <div style={{ fontSize: 11, color: C.amber, fontWeight: 700, marginTop: 1 }}>⚠ {issues.length} policy violation{issues.length > 1 ? "s" : ""}</div>}</div><div style={{ textAlign: "right", marginRight: 14 }}><div style={{ fontWeight: 800, fontSize: 16 }}>{fmt(c.totalAmount)}</div><div style={{ marginTop: 3 }}><Badge status={c.status} /></div></div><span style={{ color: C.muted, fontSize: 18 }}>›</span></div>); })}</div>
          </div>}

          {pg === "list" && sel && <Detail claim={sel} onBack={() => setSel(null)} onStatus={onStatus} onVerify={onVerify} />}
          {pg === "new" && <Wizard onSubmit={onNew} />}

          {/* POLICY PAGE */}
          {pg === "policy" && <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={card}>
              <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>Travel Policy — Levram Lifesciences Pvt. Ltd.</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Effective from 01/05/2024</div>
              <div style={{ fontWeight: 800, marginBottom: 10, fontSize: 14 }}>Daily Allowances (Conveyance + Breakfast + Lunch + Dinner)</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 20 }}>
                <thead><tr style={{ background: C.soft }}>{["Grade", "Local Metro", "Local Non-Metro", "Tour Metro", "Tour Non-Metro"].map(h => <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", color: C.muted }}>{h}</th>)}</tr></thead>
                <tbody>{EMPLOYEE_GRADES.map(g => <tr key={g.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: "10px 12px", fontWeight: 700 }}>{g.label}</td>{["local_metro", "local_nonmetro", "tour_metro", "tour_nonmetro"].map(k => <td key={k} style={{ padding: "10px 12px" }}>{fmt(DA_LIMITS[g.id][k])}/day</td>)}</tr>)}</tbody>
              </table>
              <div style={{ fontWeight: 800, marginBottom: 10, fontSize: 14 }}>Lodging & Boarding (per day)</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 20 }}>
                <thead><tr style={{ background: C.soft }}>{["Grade", "Metro", "Non-Metro"].map(h => <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", color: C.muted }}>{h}</th>)}</tr></thead>
                <tbody>{EMPLOYEE_GRADES.map(g => <tr key={g.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: "10px 12px", fontWeight: 700 }}>{g.label}</td><td style={{ padding: "10px 12px" }}>{fmt(LODGING_LIMITS[g.id].metro)}/day</td><td style={{ padding: "10px 12px" }}>{fmt(LODGING_LIMITS[g.id].nonmetro)}/day</td></tr>)}</tbody>
              </table>
              <div style={{ fontWeight: 800, marginBottom: 10, fontSize: 14 }}>Travel Class & Vehicle Rates</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 20 }}>
                <thead><tr style={{ background: C.soft }}>{["Grade", "Travel Class", "4 Wheeler", "2 Wheeler"].map(h => <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", color: C.muted }}>{h}</th>)}</tr></thead>
                <tbody>{EMPLOYEE_GRADES.map(g => <tr key={g.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: "10px 12px", fontWeight: 700 }}>{g.label}</td><td style={{ padding: "10px 12px" }}>{TRAVEL_CLASS[g.id]}</td><td style={{ padding: "10px 12px" }}>{VEHICLE_RATES[g.id].fourWheeler ? `₹${VEHICLE_RATES[g.id].fourWheeler}/km` : "N.A."}</td><td style={{ padding: "10px 12px" }}>₹{VEHICLE_RATES[g.id].twoWheeler}/km</td></tr>)}</tbody>
              </table>
              <div style={{ fontWeight: 800, marginBottom: 10, fontSize: 14 }}>Policy Notes</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.8, color: "#555" }}>{POLICY_NOTES.map((n, i) => <div key={i}>{i + 1}. {n}</div>)}</div>
            </div>
          </div>}

        </div>
      </div>
    </div>
  );
}
