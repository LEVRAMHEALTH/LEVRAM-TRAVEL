import { useState, useCallback, useRef, useEffect } from "react";

// ── CONFIG ──
const CATEGORIES = [
  { id: "travel", label: "Travel (Flights, Train, Bus)", icon: "✈", color: "#2563EB", subTypes: ["Flight", "Train", "Bus", "Auto/Cab", "Other"], requiresRoute: true, requiresDate: true, requiresReceipt: true },
  { id: "fuel", label: "Fuel / Local Conveyance", icon: "⛽", color: "#D97706", subTypes: ["Petrol", "Diesel", "CNG", "Toll Charges", "Parking"], requiresRoute: true, requiresDate: true, requiresReceipt: true },
  { id: "hotel", label: "Hotel / Accommodation", icon: "🏨", color: "#7C3AED", subTypes: ["Hotel", "Guest House", "Service Apartment"], requiresRoute: false, requiresDate: true, requiresReceipt: true, requiresCheckInOut: true },
  { id: "food", label: "Food & Meals", icon: "🍽", color: "#059669", subTypes: ["Breakfast", "Lunch", "Dinner", "Refreshments/Snacks"], requiresRoute: false, requiresDate: true, requiresReceipt: true, requiresPurpose: true },
  { id: "misc", label: "Miscellaneous / Other", icon: "📦", color: "#6B7280", subTypes: ["Courier", "Printing", "Stationery", "Internet/Telecom", "Other"], requiresRoute: false, requiresDate: true, requiresReceipt: true },
];

const REGIONS = ["Mumbai", "Delhi NCR", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Other"];
const PURPOSES = ["Client Meeting", "Site Visit", "Product Demo", "Conference/Seminar", "Training", "Team Meeting", "Market Survey", "Other"];

const MONTHS = (() => {
  const m = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    m.push(d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }));
  }
  return m;
})();

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// ── MOCK DATA ──
const MOCK_CLAIMS = [
  {
    id: "EXP-2026-0041", salesperson: "Arjun Mehta", empId: "EMP-1021", email: "arjun.mehta@company.com", phone: "9876543210", region: "Mumbai", month: "February 2026", submittedDate: "2026-03-18", status: "pending",
    purpose: "Client Meeting", travelRoute: "Mumbai → Pune → Mumbai",
    expenses: [
      { id: 1, categoryId: "travel", subType: "Train", description: "Mumbai to Pune Shatabdi", amount: 1450, date: "2026-02-05", fromCity: "Mumbai", toCity: "Pune", purpose: "Client Meeting - ABC Corp", files: [{ name: "train_ticket.pdf", size: 240000, type: "application/pdf" }], verified: null },
      { id: 2, categoryId: "travel", subType: "Auto/Cab", description: "Pune station to client office", amount: 380, date: "2026-02-05", fromCity: "Pune Station", toCity: "Hinjewadi", purpose: "Client Meeting - ABC Corp", files: [{ name: "uber_receipt.png", size: 180000, type: "image/png" }], verified: null },
      { id: 3, categoryId: "hotel", subType: "Hotel", description: "Hotel Lemon Tree, Pune - 2 nights", amount: 7600, date: "2026-02-05", checkIn: "2026-02-05", checkOut: "2026-02-07", purpose: "Client Meeting", files: [{ name: "hotel_invoice.pdf", size: 520000, type: "application/pdf" }], verified: null },
      { id: 4, categoryId: "food", subType: "Lunch", description: "Working lunch with client team", amount: 1850, date: "2026-02-06", purpose: "Client Meeting - ABC Corp", persons: 4, files: [{ name: "restaurant_bill.jpg", size: 310000, type: "image/jpeg" }], verified: null },
      { id: 5, categoryId: "fuel", subType: "Petrol", description: "Local travel Feb month", amount: 3200, date: "2026-02-28", fromCity: "Office", toCity: "Multiple client sites", files: [{ name: "fuel_bills.pdf", size: 420000, type: "application/pdf" }], verified: null },
      { id: 6, categoryId: "food", subType: "Dinner", description: "Client dinner - Hotel Marriott", amount: 4200, date: "2026-02-06", purpose: "Client Entertainment - ABC Corp", persons: 3, files: [{ name: "dinner_bill.jpg", size: 290000, type: "image/jpeg" }], verified: null },
    ],
    totalAmount: 18680, notes: "Feb reimbursement. Pune trip was for ABC Corp quarterly review."
  },
  {
    id: "EXP-2026-0040", salesperson: "Priya Sharma", empId: "EMP-1035", email: "priya.sharma@company.com", phone: "9876541234", region: "Delhi NCR", month: "February 2026", submittedDate: "2026-03-17", status: "flagged",
    purpose: "Product Demo", travelRoute: "Delhi → Jaipur → Delhi",
    expenses: [
      { id: 1, categoryId: "travel", subType: "Flight", description: "Delhi to Jaipur flight", amount: 5200, date: "2026-02-10", fromCity: "Delhi", toCity: "Jaipur", purpose: "Product Demo - XYZ Ltd", files: [{ name: "flight_ticket.pdf", size: 350000, type: "application/pdf" }], verified: true },
      { id: 2, categoryId: "food", subType: "Dinner", description: "Client dinner - no bill", amount: 3800, date: "2026-02-10", purpose: "Client dinner", persons: 2, files: [], verified: null },
      { id: 3, categoryId: "fuel", subType: "Petrol", description: "Local travel", amount: 2800, date: "2026-02-28", fromCity: "Office", toCity: "Client sites", files: [{ name: "fuel_receipt.jpg", size: 200000, type: "image/jpeg" }], verified: true },
    ],
    totalAmount: 11800, notes: "Flagged: Missing receipt for dinner expense."
  },
  {
    id: "EXP-2026-0039", salesperson: "Ravi Kumar", empId: "EMP-1048", email: "ravi.kumar@company.com", phone: "9876549876", region: "Chennai", month: "February 2026", submittedDate: "2026-03-15", status: "approved",
    purpose: "Site Visit", travelRoute: "Chennai → Bangalore → Chennai",
    expenses: [
      { id: 1, categoryId: "travel", subType: "Train", description: "Chennai to Bangalore Shatabdi", amount: 1200, date: "2026-02-08", fromCity: "Chennai", toCity: "Bangalore", purpose: "Site Visit", files: [{ name: "ticket.pdf", size: 180000, type: "application/pdf" }], verified: true },
      { id: 2, categoryId: "food", subType: "Lunch", description: "Team working lunch", amount: 1400, date: "2026-02-08", purpose: "Site Visit", persons: 3, files: [{ name: "bill.jpg", size: 150000, type: "image/jpeg" }], verified: true },
      { id: 3, categoryId: "fuel", subType: "Petrol", description: "Monthly fuel", amount: 3800, date: "2026-02-28", fromCity: "Office", toCity: "Various", files: [{ name: "fuel.pdf", size: 300000, type: "application/pdf" }], verified: true },
    ],
    totalAmount: 6400, notes: "All verified and approved."
  },
];

// ── STYLES ──
const font = "'Outfit', 'Segoe UI', system-ui, sans-serif";
const C = { bg: "#F5F3EF", card: "#FFFFFF", dark: "#1B1B1B", accent: "#1D4ED8", accentLight: "#DBEAFE", green: "#059669", greenBg: "#ECFDF5", red: "#DC2626", redBg: "#FEF2F2", amber: "#D97706", amberBg: "#FFFBEB", border: "#E5E2DC", muted: "#8C8680", softBg: "#FAF9F7" };

function StatusBadge({ status }) {
  const m = { pending: { bg: C.amberBg, c: C.amber, l: "Pending Review" }, approved: { bg: C.greenBg, c: C.green, l: "Approved" }, rejected: { bg: C.redBg, c: C.red, l: "Rejected" }, flagged: { bg: C.redBg, c: C.red, l: "Flagged" } };
  const s = m[status] || m.pending;
  return <span style={{ background: s.bg, color: s.c, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: ".3px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{s.l}</span>;
}

function FileChip({ file, onRemove }) {
  const isImage = file.type?.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: isImage ? "#EFF6FF" : isPdf ? "#FEF2F2" : C.softBg, borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1px solid ${isImage ? "#BFDBFE" : isPdf ? "#FECACA" : C.border}` }}>
      <span>{isImage ? "🖼" : isPdf ? "📄" : "📎"}</span>
      <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
      <span style={{ color: C.muted, fontSize: 10 }}>({(file.size / 1024).toFixed(0)}KB)</span>
      {onRemove && <span onClick={onRemove} style={{ cursor: "pointer", color: C.red, fontWeight: 700, marginLeft: 2 }}>×</span>}
    </div>
  );
}

// ── SHARED UI ──
const cardStyle = { background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px 26px", marginBottom: 16 };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13.5, fontFamily: font, outline: "none", boxSizing: "border-box", transition: "border .2s, box-shadow .2s", background: "#fff" };
const labelStyle = { fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 6, display: "block", letterSpacing: ".4px", textTransform: "uppercase" };
const btnStyle = (v) => {
  const base = { padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 7, transition: "all .2s", fontFamily: font, letterSpacing: ".2px" };
  if (v === "primary") return { ...base, background: C.accent, color: "#fff" };
  if (v === "success") return { ...base, background: C.green, color: "#fff" };
  if (v === "danger") return { ...base, background: C.red, color: "#fff" };
  if (v === "warning") return { ...base, background: C.amber, color: "#fff" };
  if (v === "large") return { ...base, background: C.accent, color: "#fff", padding: "14px 32px", fontSize: 15, borderRadius: 12 };
  return { ...base, background: C.softBg, color: C.dark, border: `1.5px solid ${C.border}` };
};

// ═══════════════════════════════════════════
// WIZARD: STEP-BY-STEP EXPENSE ENTRY
// ═══════════════════════════════════════════
function ExpenseWizard({ onSubmitClaim }) {
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({ salesperson: "", empId: "", email: "", phone: "", region: "", month: MONTHS[0], purpose: "", travelRoute: "", notes: "" });
  const [expenses, setExpenses] = useState([]);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  // Step 0: Personal Info, Step 1: Add Expenses, Step 2: Review & Submit
  const STEPS = ["Salesperson Details", "Add Expenses", "Review & Submit"];

  const validateStep0 = () => {
    const e = {};
    if (!info.salesperson.trim()) e.salesperson = "Name is required";
    if (!info.empId.trim()) e.empId = "Employee ID is required";
    if (!info.email.trim() || !/\S+@\S+\.\S+/.test(info.email)) e.email = "Valid email is required";
    if (!info.phone.trim() || info.phone.replace(/\D/g, "").length < 10) e.phone = "Valid 10-digit phone required";
    if (!info.region) e.region = "Select your region";
    if (!info.purpose) e.purpose = "Select trip purpose";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const startNewExpense = (catId) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    setCurrentExpense({
      id: Date.now(), categoryId: catId, subType: cat.subTypes[0], description: "", amount: "", date: "",
      fromCity: "", toCity: "", checkIn: "", checkOut: "", purpose: info.purpose, persons: 1, files: [], verified: null
    });
    setErrors({});
  };

  const validateExpense = () => {
    const e = {};
    const cat = CATEGORIES.find(c => c.id === currentExpense.categoryId);
    if (!currentExpense.subType) e.subType = "Select type";
    if (!currentExpense.description.trim()) e.description = "Description is required";
    if (!currentExpense.amount || parseFloat(currentExpense.amount) <= 0) e.amount = "Enter valid amount";
    if (!currentExpense.date) e.date = "Date is required";
    if (cat.requiresRoute) {
      if (!currentExpense.fromCity.trim()) e.fromCity = "From location required";
      if (!currentExpense.toCity.trim()) e.toCity = "To location required";
    }
    if (cat.requiresCheckInOut) {
      if (!currentExpense.checkIn) e.checkIn = "Check-in date required";
      if (!currentExpense.checkOut) e.checkOut = "Check-out date required";
    }
    if (currentExpense.files.length === 0) e.files = "Receipt/document upload is mandatory";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveExpense = () => {
    if (!validateExpense()) return;
    const exp = { ...currentExpense, amount: parseFloat(currentExpense.amount) };
    setExpenses(prev => {
      const exists = prev.find(e => e.id === exp.id);
      return exists ? prev.map(e => e.id === exp.id ? exp : e) : [...prev, exp];
    });
    setCurrentExpense(null);
    setErrors({});
  };

  const removeExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files).filter(f => {
      const valid = f.type === "application/pdf" || f.type.startsWith("image/");
      const sizeOk = f.size <= 10 * 1024 * 1024;
      return valid && sizeOk;
    }).map(f => ({ name: f.name, size: f.size, type: f.type, preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null }));
    setCurrentExpense(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (idx) => setCurrentExpense(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }));

  const handleFinalSubmit = () => {
    if (expenses.length === 0) { setErrors({ global: "Add at least one expense" }); return; }
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const claim = {
      id: `EXP-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      ...info, expenses, totalAmount: total, submittedDate: new Date().toISOString().split("T")[0], status: "pending"
    };
    onSubmitClaim(claim);
  };

  const total = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  // ── RENDER STEP 0: Personal Info ──
  const renderStep0 = () => (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={cardStyle}>
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>👤 Your Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input value={info.salesperson} onChange={e => setInfo({ ...info, salesperson: e.target.value })} style={{ ...inputStyle, borderColor: errors.salesperson ? C.red : C.border }} placeholder="e.g. Arjun Mehta" />
            {errors.salesperson && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.salesperson}</div>}
          </div>
          <div>
            <label style={labelStyle}>Employee ID *</label>
            <input value={info.empId} onChange={e => setInfo({ ...info, empId: e.target.value.toUpperCase() })} style={{ ...inputStyle, borderColor: errors.empId ? C.red : C.border }} placeholder="e.g. EMP-1021" />
            {errors.empId && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.empId}</div>}
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })} style={{ ...inputStyle, borderColor: errors.email ? C.red : C.border }} placeholder="arjun@company.com" />
            {errors.email && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.email}</div>}
          </div>
          <div>
            <label style={labelStyle}>Phone *</label>
            <input value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value.replace(/[^\d]/g, "").slice(0, 10) })} style={{ ...inputStyle, borderColor: errors.phone ? C.red : C.border }} placeholder="9876543210" maxLength={10} />
            {errors.phone && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.phone}</div>}
          </div>
          <div>
            <label style={labelStyle}>Region / Base City *</label>
            <select value={info.region} onChange={e => setInfo({ ...info, region: e.target.value })} style={{ ...inputStyle, borderColor: errors.region ? C.red : C.border }}>
              <option value="">Select Region</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.region && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.region}</div>}
          </div>
          <div>
            <label style={labelStyle}>Claim Month *</label>
            <select value={info.month} onChange={e => setInfo({ ...info, month: e.target.value })} style={inputStyle}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Trip / Visit Purpose *</label>
            <select value={info.purpose} onChange={e => setInfo({ ...info, purpose: e.target.value })} style={{ ...inputStyle, borderColor: errors.purpose ? C.red : C.border }}>
              <option value="">Select Purpose</option>
              {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.purpose && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.purpose}</div>}
          </div>
          <div>
            <label style={labelStyle}>Travel Route (if applicable)</label>
            <input value={info.travelRoute} onChange={e => setInfo({ ...info, travelRoute: e.target.value })} style={inputStyle} placeholder="e.g. Mumbai → Pune → Mumbai" />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Additional Notes</label>
          <textarea value={info.notes} onChange={e => setInfo({ ...info, notes: e.target.value })} style={{ ...inputStyle, height: 60, resize: "vertical" }} placeholder="Any remarks for the approver..." />
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <button onClick={() => { if (validateStep0()) setStep(1); }} style={btnStyle("large")}>Continue to Add Expenses →</button>
      </div>
    </div>
  );

  // ── RENDER STEP 1: Add Expenses ──
  const renderStep1 = () => (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {!currentExpense ? (
        <>
          <div style={cardStyle}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Select Expense Category</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Tap a category to add an expense. Each expense requires a receipt upload.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} onClick={() => startNewExpense(cat.id)} style={{ padding: "20px 14px", background: C.softBg, borderRadius: 12, textAlign: "center", cursor: "pointer", border: `2px solid transparent`, transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 12px ${cat.color}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ fontSize: 28 }}>{cat.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8, color: C.dark }}>{cat.label.split("(")[0].trim()}</div>
                </div>
              ))}
            </div>
          </div>

          {expenses.length > 0 && (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Added Expenses ({expenses.length})</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: C.accent }}>{fmt(total)}</div>
              </div>
              {expenses.map((exp, i) => {
                const cat = CATEGORIES.find(c => c.id === exp.categoryId);
                return (
                  <div key={exp.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.softBg, borderRadius: 10, marginBottom: 8, borderLeft: `4px solid ${cat.color}` }}>
                    <span style={{ fontSize: 22 }}>{cat.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{exp.subType} — {exp.description}</div>
                      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                        {exp.date} {exp.fromCity && `· ${exp.fromCity} → ${exp.toCity}`}
                        {exp.files.length > 0 && <span style={{ color: C.green, fontWeight: 700, marginLeft: 8 }}>📎 {exp.files.length} file{exp.files.length > 1 ? "s" : ""}</span>}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(exp.amount)}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setCurrentExpense(exp); setErrors({}); }} style={{ ...btnStyle("ghost"), padding: "6px 10px", fontSize: 11 }}>Edit</button>
                      <button onClick={() => removeExpense(exp.id)} style={{ ...btnStyle("ghost"), padding: "6px 10px", fontSize: 11, color: C.red }}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {errors.global && <div style={{ color: C.red, fontWeight: 600, textAlign: "center", marginBottom: 12 }}>{errors.global}</div>}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(0)} style={btnStyle("ghost")}>← Back</button>
            <button onClick={() => { if (expenses.length === 0) { setErrors({ global: "Add at least one expense before proceeding" }); } else { setStep(2); setErrors({}); } }} style={btnStyle("large")}>Review & Submit →</button>
          </div>
        </>
      ) : (
        // ── Expense Entry Form ──
        (() => {
          const cat = CATEGORIES.find(c => c.id === currentExpense.categoryId);
          return (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{cat.label}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Fill all required fields and upload receipt</div>
                  </div>
                </div>
                <button onClick={() => { setCurrentExpense(null); setErrors({}); }} style={btnStyle("ghost")}>Cancel</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Type *</label>
                  <select value={currentExpense.subType} onChange={e => setCurrentExpense(p => ({ ...p, subType: e.target.value }))} style={{ ...inputStyle, borderColor: errors.subType ? C.red : C.border }}>
                    {cat.subTypes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input type="date" value={currentExpense.date} onChange={e => setCurrentExpense(p => ({ ...p, date: e.target.value }))} style={{ ...inputStyle, borderColor: errors.date ? C.red : C.border }} max={new Date().toISOString().split("T")[0]} />
                  {errors.date && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.date}</div>}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Description *</label>
                <input value={currentExpense.description} onChange={e => setCurrentExpense(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, borderColor: errors.description ? C.red : C.border }} placeholder="e.g. Mumbai to Pune Shatabdi Express" />
                {errors.description && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.description}</div>}
              </div>

              {cat.requiresRoute && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>From (City/Location) *</label>
                    <input value={currentExpense.fromCity} onChange={e => setCurrentExpense(p => ({ ...p, fromCity: e.target.value }))} style={{ ...inputStyle, borderColor: errors.fromCity ? C.red : C.border }} placeholder="e.g. Mumbai" />
                    {errors.fromCity && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.fromCity}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>To (City/Location) *</label>
                    <input value={currentExpense.toCity} onChange={e => setCurrentExpense(p => ({ ...p, toCity: e.target.value }))} style={{ ...inputStyle, borderColor: errors.toCity ? C.red : C.border }} placeholder="e.g. Pune" />
                    {errors.toCity && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.toCity}</div>}
                  </div>
                </div>
              )}

              {cat.requiresCheckInOut && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Check-in Date *</label>
                    <input type="date" value={currentExpense.checkIn} onChange={e => setCurrentExpense(p => ({ ...p, checkIn: e.target.value }))} style={{ ...inputStyle, borderColor: errors.checkIn ? C.red : C.border }} />
                    {errors.checkIn && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.checkIn}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Check-out Date *</label>
                    <input type="date" value={currentExpense.checkOut} onChange={e => setCurrentExpense(p => ({ ...p, checkOut: e.target.value }))} style={{ ...inputStyle, borderColor: errors.checkOut ? C.red : C.border }} />
                    {errors.checkOut && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.checkOut}</div>}
                  </div>
                </div>
              )}

              {cat.requiresPurpose && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Meal Purpose</label>
                    <input value={currentExpense.purpose} onChange={e => setCurrentExpense(p => ({ ...p, purpose: e.target.value }))} style={inputStyle} placeholder="e.g. Client meeting lunch" />
                  </div>
                  <div>
                    <label style={labelStyle}>No. of Persons</label>
                    <input type="number" min="1" max="50" value={currentExpense.persons} onChange={e => setCurrentExpense(p => ({ ...p, persons: parseInt(e.target.value) || 1 }))} style={inputStyle} />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Amount (₹) *</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: C.muted }}>₹</span>
                  <input type="number" min="1" value={currentExpense.amount} onChange={e => setCurrentExpense(p => ({ ...p, amount: e.target.value }))} style={{ ...inputStyle, paddingLeft: 34, fontSize: 16, fontWeight: 700, borderColor: errors.amount ? C.red : C.border }} placeholder="0" />
                </div>
                {errors.amount && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{errors.amount}</div>}
              </div>

              {/* FILE UPLOAD */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ ...labelStyle, color: errors.files ? C.red : C.muted }}>Upload Receipt / Ticket * (PDF or Image)</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ padding: 24, border: `2px dashed ${errors.files ? C.red : C.border}`, borderRadius: 12, textAlign: "center", cursor: "pointer", background: C.softBg, transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.accentLight; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = errors.files ? C.red : C.border; e.currentTarget.style.background = C.softBg; }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.accentLight; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = errors.files ? C.red : C.border; e.currentTarget.style.background = C.softBg; }}
                  onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.softBg; const dt = e.dataTransfer; if (dt.files.length) { const fakeEvent = { target: { files: dt.files } }; handleFileUpload(fakeEvent); } }}
                >
                  <div style={{ fontSize: 32, marginBottom: 6 }}>📤</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>Click to upload or drag & drop</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>Accepted: PDF, JPG, JPEG, PNG — Max 10MB per file</div>
                </div>
                <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf" onChange={handleFileUpload} style={{ display: "none" }} />
                {errors.files && <div style={{ color: C.red, fontSize: 11, marginTop: 6, fontWeight: 600 }}>⚠ {errors.files}</div>}

                {currentExpense.files.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                    {currentExpense.files.map((f, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        {f.preview && <img src={f.preview} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: `2px solid ${C.border}`, display: "block", marginBottom: 4 }} />}
                        <FileChip file={f} onRemove={() => removeFile(i)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => { setCurrentExpense(null); setErrors({}); }} style={btnStyle("ghost")}>Cancel</button>
                <button onClick={saveExpense} style={btnStyle("primary")}>✓ Save Expense</button>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );

  // ── RENDER STEP 2: Review ──
  const renderStep2 = () => {
    const missingReceipts = expenses.filter(e => e.files.length === 0);
    return (
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {missingReceipts.length > 0 && (
          <div style={{ ...cardStyle, borderLeft: `4px solid ${C.red}`, background: C.redBg }}>
            <div style={{ fontWeight: 800, color: C.red, marginBottom: 6 }}>⚠ Missing Receipts</div>
            <div style={{ fontSize: 13, color: "#991B1B" }}>The following expenses don't have receipts attached. Go back and upload them to proceed.</div>
            {missingReceipts.map(e => <div key={e.id} style={{ marginTop: 6, fontSize: 12.5 }}>• {e.subType}: {e.description} — {fmt(e.amount)}</div>)}
          </div>
        )}
        <div style={cardStyle}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>📋 Claim Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20, padding: 16, background: C.softBg, borderRadius: 10 }}>
            <div><span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>SALESPERSON</span><div style={{ fontWeight: 700, marginTop: 2 }}>{info.salesperson} ({info.empId})</div></div>
            <div><span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>MONTH</span><div style={{ fontWeight: 700, marginTop: 2 }}>{info.month}</div></div>
            <div><span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>REGION</span><div style={{ fontWeight: 700, marginTop: 2 }}>{info.region}</div></div>
            <div><span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>PURPOSE</span><div style={{ fontWeight: 700, marginTop: 2 }}>{info.purpose}</div></div>
            <div><span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>ROUTE</span><div style={{ fontWeight: 700, marginTop: 2 }}>{info.travelRoute || "—"}</div></div>
            <div><span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>TOTAL</span><div style={{ fontWeight: 800, marginTop: 2, fontSize: 20, color: C.accent }}>{fmt(total)}</div></div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: C.softBg }}>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: C.muted }}>#</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: C.muted }}>Category</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: C.muted }}>Description</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: C.muted }}>Date</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: C.muted }}>Route</th>
              <th style={{ textAlign: "right", padding: "10px 12px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: C.muted }}>Amount</th>
              <th style={{ textAlign: "center", padding: "10px 12px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: C.muted }}>Receipt</th>
            </tr></thead>
            <tbody>
              {expenses.map((exp, i) => {
                const cat = CATEGORIES.find(c => c.id === exp.categoryId);
                return (
                  <tr key={exp.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px" }}>{i + 1}</td>
                    <td style={{ padding: "12px" }}><span style={{ color: cat.color, fontWeight: 700 }}>{cat.icon} {exp.subType}</span></td>
                    <td style={{ padding: "12px", maxWidth: 200 }}>{exp.description}</td>
                    <td style={{ padding: "12px", fontSize: 12 }}>{exp.date}</td>
                    <td style={{ padding: "12px", fontSize: 12 }}>{exp.fromCity ? `${exp.fromCity} → ${exp.toCity}` : "—"}</td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: 700 }}>{fmt(exp.amount)}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {exp.files.length > 0
                        ? <span style={{ color: C.green, fontWeight: 700, fontSize: 12 }}>✓ {exp.files.length} file{exp.files.length > 1 ? "s" : ""}</span>
                        : <span style={{ color: C.red, fontWeight: 700, fontSize: 12 }}>✗ Missing</span>}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: C.softBg }}>
                <td colSpan={5} style={{ padding: "14px 12px", fontWeight: 800, fontSize: 15 }}>TOTAL</td>
                <td style={{ padding: "14px 12px", textAlign: "right", fontWeight: 800, fontSize: 18, color: C.accent }}>{fmt(total)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          {info.notes && <div style={{ marginTop: 16, padding: 14, background: C.softBg, borderRadius: 10, fontSize: 13, color: C.muted }}><strong>Notes:</strong> {info.notes}</div>}
        </div>

        <div style={{ ...cardStyle, background: C.accentLight, border: `1.5px solid ${C.accent}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>🔒</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Declaration</div>
              <div style={{ fontSize: 12.5, color: "#555", lineHeight: 1.5 }}>By submitting, I confirm that all expenses listed above are genuine business expenses incurred by me. All receipts and documents attached are authentic. I understand that any false claim may lead to disciplinary action.</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setStep(1)} style={btnStyle("ghost")}>← Back to Edit</button>
          <button onClick={handleFinalSubmit} disabled={missingReceipts.length > 0} style={{ ...btnStyle("large"), background: missingReceipts.length > 0 ? "#ccc" : C.green, cursor: missingReceipts.length > 0 ? "not-allowed" : "pointer" }}>
            ✓ Submit Claim for Approval
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Progress Steps */}
      <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: i <= step ? C.accent : C.border, color: i <= step ? "#fff" : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, transition: "all .3s" }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: i === step ? 800 : 500, color: i <= step ? C.dark : C.muted }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 50, height: 2, background: i < step ? C.accent : C.border, margin: "0 12px", borderRadius: 2 }} />}
          </div>
        ))}
      </div>

      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </div>
  );
}

// ═══════════════════════════════════════════
// CLAIM DETAIL VIEW (Admin)
// ═══════════════════════════════════════════
function ClaimDetail({ claim, onBack, onUpdateStatus, onVerifyDoc }) {
  const totalFiles = claim.expenses.reduce((s, e) => s + e.files.length, 0);
  const verifiedCount = claim.expenses.filter(e => e.verified === true).length;
  const failedCount = claim.expenses.filter(e => e.verified === false).length;
  const missingCount = claim.expenses.filter(e => e.files.length === 0).length;

  return (
    <div>
      <button onClick={onBack} style={{ ...btnStyle("ghost"), marginBottom: 16 }}>← Back to All Claims</button>
      <div style={{ display: "grid", gridTemplateColumns: "5fr 2fr", gap: 16 }}>
        <div>
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{claim.salesperson}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{claim.empId} · {claim.email} · {claim.phone}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                  <StatusBadge status={claim.status} />
                  <span style={{ fontSize: 12, color: C.muted }}>{claim.region} · {claim.month} · Submitted {claim.submittedDate}</span>
                </div>
                {claim.purpose && <div style={{ marginTop: 8, fontSize: 12.5, color: C.muted }}>Purpose: <strong>{claim.purpose}</strong> {claim.travelRoute && `· Route: ${claim.travelRoute}`}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Total Claim</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: C.accent }}>{fmt(claim.totalAmount)}</div>
              </div>
            </div>

            {claim.expenses.map((exp, i) => {
              const cat = CATEGORIES.find(c => c.id === exp.categoryId);
              return (
                <div key={exp.id} style={{ padding: "16px 18px", background: C.softBg, borderRadius: 12, marginBottom: 10, borderLeft: `4px solid ${cat?.color || C.muted}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 18 }}>{cat?.icon}</span>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>{exp.subType}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>· {exp.date}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#555", marginBottom: 6 }}>{exp.description}</div>
                      <div style={{ display: "flex", gap: 16, fontSize: 11.5, color: C.muted }}>
                        {exp.fromCity && <span>📍 {exp.fromCity} → {exp.toCity}</span>}
                        {exp.checkIn && <span>🗓 {exp.checkIn} → {exp.checkOut}</span>}
                        {exp.persons > 1 && <span>👥 {exp.persons} persons</span>}
                        {exp.purpose && <span>🎯 {exp.purpose}</span>}
                      </div>
                      {exp.files.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                          {exp.files.map((f, fi) => <FileChip key={fi} file={f} />)}
                        </div>
                      )}
                      {exp.files.length === 0 && <div style={{ marginTop: 6, color: C.red, fontSize: 12, fontWeight: 700 }}>⚠ No receipt uploaded</div>}
                    </div>
                    <div style={{ textAlign: "right", minWidth: 120 }}>
                      <div style={{ fontWeight: 800, fontSize: 17 }}>{fmt(exp.amount)}</div>
                      <div style={{ marginTop: 8 }}>
                        {exp.verified === true && <span style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>✓ Verified</span>}
                        {exp.verified === false && <span style={{ color: C.red, fontSize: 12, fontWeight: 700 }}>✗ Rejected</span>}
                        {exp.verified === null && exp.files.length > 0 && (
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                            <button onClick={() => onVerifyDoc(claim.id, exp.id, true)} style={{ ...btnStyle("success"), padding: "5px 12px", fontSize: 11 }}>✓ Verify</button>
                            <button onClick={() => onVerifyDoc(claim.id, exp.id, false)} style={{ ...btnStyle("danger"), padding: "5px 12px", fontSize: 11 }}>✗ Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {claim.notes && <div style={cardStyle}><strong>Salesperson Notes:</strong> <span style={{ color: "#555" }}>{claim.notes}</span></div>}
        </div>

        <div>
          <div style={cardStyle}>
            <div style={{ fontWeight: 800, marginBottom: 14 }}>Document Status</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Total Files</span><span style={{ fontWeight: 700 }}>{totalFiles}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.green }}><span>Verified</span><span style={{ fontWeight: 700 }}>{verifiedCount}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.red }}><span>Rejected</span><span style={{ fontWeight: 700 }}>{failedCount}</span></div>
              {missingCount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.amber }}><span>Missing Receipt</span><span style={{ fontWeight: 700 }}>{missingCount}</span></div>}
              <div style={{ height: 8, background: "#eee", borderRadius: 4, overflow: "hidden", marginTop: 4 }}>
                <div style={{ height: "100%", width: `${totalFiles > 0 ? (verifiedCount / totalFiles) * 100 : 0}%`, background: C.green, borderRadius: 4 }} />
              </div>
            </div>
          </div>

          {(claim.status === "pending" || claim.status === "flagged") && (
            <div style={cardStyle}>
              <div style={{ fontWeight: 800, marginBottom: 14 }}>Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => onUpdateStatus(claim.id, "approved")} style={{ ...btnStyle("success"), width: "100%", justifyContent: "center", padding: 14 }}>✓ Approve Claim</button>
                <button onClick={() => onUpdateStatus(claim.id, "flagged")} style={{ ...btnStyle("warning"), width: "100%", justifyContent: "center", padding: 14 }}>⚠ Flag for Review</button>
                <button onClick={() => onUpdateStatus(claim.id, "rejected")} style={{ ...btnStyle("danger"), width: "100%", justifyContent: "center", padding: 14 }}>✗ Reject Claim</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [claims, setClaims] = useState(MOCK_CLAIMS);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleUpdateStatus = useCallback((id, status) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    showToast(`Claim ${id} ${status}`, status === "approved" ? "success" : status === "rejected" ? "danger" : "warning");
  }, [selected]);

  const handleVerifyDoc = useCallback((claimId, expId, result) => {
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, expenses: c.expenses.map(e => e.id === expId ? { ...e, verified: result } : e) } : c));
    if (selected?.id === claimId) setSelected(prev => ({ ...prev, expenses: prev.expenses.map(e => e.id === expId ? { ...e, verified: result } : e) }));
  }, [selected]);

  const handleNewClaim = useCallback((claim) => {
    setClaims(prev => [claim, ...prev]);
    setPage("claims");
    setSelected(null);
    showToast(`Claim ${claim.id} submitted successfully!`);
  }, []);

  const filtered = filter === "all" ? claims : claims.filter(c => c.status === filter);
  const pending = claims.filter(c => c.status === "pending").length;
  const flagged = claims.filter(c => c.status === "flagged").length;
  const total = claims.reduce((s, c) => s + c.totalAmount, 0);

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "claims", icon: "📋", label: "All Claims" },
    { id: "new", icon: "➕", label: "New Claim" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: font, background: C.bg, color: C.dark, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, padding: "12px 24px", borderRadius: 12, background: toast.type === "success" ? C.green : toast.type === "danger" ? C.red : C.amber, color: "#fff", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 30px rgba(0,0,0,.15)", animation: "slideIn .3s ease" }}>{toast.msg}</div>
      )}

      {/* Sidebar */}
      <div style={{ width: 220, background: C.dark, color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "22px 18px", borderBottom: "1px solid #333" }}>
          <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-.5px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 30, height: 30, background: C.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>₹</span>
            ExpenseHub
          </div>
          <div style={{ fontSize: 10.5, color: "#666", marginTop: 4, letterSpacing: ".5px" }}>SALES REIMBURSEMENT</div>
        </div>
        <nav style={{ padding: "14px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(n => (
            <div key={n.id} onClick={() => { setPage(n.id); setSelected(null); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13.5, fontWeight: page === n.id ? 700 : 400, background: page === n.id ? "#333" : "transparent", color: page === n.id ? "#fff" : "#999", transition: "all .15s" }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
              {n.id === "claims" && pending > 0 && <span style={{ marginLeft: "auto", background: C.amber, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 10 }}>{pending}</span>}
            </div>
          ))}
        </nav>
        <div style={{ padding: "14px 18px", borderTop: "1px solid #333", fontSize: 10, color: "#555" }}>v2.0 · Receipt-verified claims</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 30px", background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-.3px" }}>
            {selected ? `Claim ${selected.id}` : page === "dashboard" ? "Dashboard" : page === "claims" ? "Reimbursement Claims" : "Submit New Claim"}
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "24px 30px" }}>
          {/* DASHBOARD */}
          {page === "dashboard" && (
            <div>
              <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  { label: "Total Claims", value: claims.length, color: C.dark, accent: C.accent },
                  { label: "Pending", value: pending, color: C.amber, accent: C.amber },
                  { label: "Flagged", value: flagged, color: C.red, accent: C.red },
                  { label: "Total Amount", value: fmt(total), color: C.green, accent: C.green },
                ].map((s, i) => (
                  <div key={i} style={{ ...cardStyle, flex: 1, minWidth: 170, marginBottom: 0, borderTop: `3px solid ${s.accent}`, padding: "18px 20px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".5px" }}>{s.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={cardStyle}>
                <div style={{ fontWeight: 800, marginBottom: 14 }}>Recent Claims</div>
                {claims.slice(0, 5).map(c => (
                  <div key={c.id} onClick={() => { setPage("claims"); setSelected(c); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: C.softBg, borderRadius: 10, marginBottom: 8, cursor: "pointer", transition: "all .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.accentLight} onMouseLeave={e => e.currentTarget.style.background = C.softBg}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{c.salesperson} <span style={{ fontWeight: 400, color: C.muted, fontSize: 12 }}>({c.empId})</span></div>
                      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{c.id} · {c.month} · {c.region} · {c.expenses.length} expenses · {c.expenses.reduce((s, e) => s + e.files.length, 0)} files</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{fmt(c.totalAmount)}</div>
                      <div style={{ marginTop: 4 }}><StatusBadge status={c.status} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLAIMS LIST */}
          {page === "claims" && !selected && (
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                {["all", "pending", "flagged", "approved", "rejected"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ ...btnStyle(f === filter ? "primary" : "ghost"), textTransform: "capitalize", fontSize: 12.5 }}>
                    {f === "all" ? "All" : f} ({f === "all" ? claims.length : claims.filter(c => c.status === f).length})
                  </button>
                ))}
              </div>
              <div style={cardStyle}>
                {filtered.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: C.muted }}>No claims found</div> : filtered.map(c => {
                  const missingFiles = c.expenses.filter(e => e.files.length === 0).length;
                  return (
                    <div key={c.id} onClick={() => setSelected(c)} style={{ display: "flex", alignItems: "center", padding: "16px 18px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "all .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.softBg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{c.salesperson} <span style={{ fontWeight: 500, color: C.muted, fontSize: 12 }}>· {c.empId} · {c.region}</span></div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{c.id} · {c.month} · {c.expenses.length} line items · {c.expenses.reduce((s, e) => s + e.files.length, 0)} files attached</div>
                        {missingFiles > 0 && <div style={{ fontSize: 11, color: C.red, fontWeight: 700, marginTop: 3 }}>⚠ {missingFiles} expense{missingFiles > 1 ? "s" : ""} without receipt</div>}
                      </div>
                      <div style={{ textAlign: "right", marginRight: 16 }}>
                        <div style={{ fontWeight: 800, fontSize: 17 }}>{fmt(c.totalAmount)}</div>
                        <div style={{ marginTop: 4 }}><StatusBadge status={c.status} /></div>
                      </div>
                      <div style={{ fontSize: 20, color: C.muted }}>›</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CLAIM DETAIL */}
          {page === "claims" && selected && (
            <ClaimDetail claim={selected} onBack={() => setSelected(null)} onUpdateStatus={handleUpdateStatus} onVerifyDoc={handleVerifyDoc} />
          )}

          {/* NEW CLAIM */}
          {page === "new" && <ExpenseWizard onSubmitClaim={handleNewClaim} />}
        </div>
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}
