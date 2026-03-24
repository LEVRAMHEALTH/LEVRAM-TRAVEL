# Levram Travel — Reimbursement Management System

Travel expense reimbursement system for Levram Lifesciences Pvt. Ltd.  
Built with React + Vite. Policy parameters from company travel policy w.e.f. 01/05/2024.

## Features

- **Auto Grade Detection** — Employee ID lookup auto-fills name, grade, department (locked)
- **Auto DA Calculation** — Daily Allowance auto-computed per grade, visit type & metro/non-metro
- **Daily Entry Mode** — Salesperson logs expenses day-by-day throughout the month
- **Month-End Verification** — Review all entries + receipts before submitting
- **Mandatory Receipt Upload** — PDF/Image upload required for every expense
- **Policy Enforcement** — Real-time validation against Levram travel policy limits
- **Admin Dashboard** — Review, verify documents, approve/reject claims

## Demo Credentials

| Role | Login ID | Grade |
|------|----------|-------|
| Sales | EMP-1001 | Middle Management |
| Sales | EMP-1002 | Executive |
| Sales | EMP-1003 | Top Management |
| Sales | EMP-1004 to EMP-1010 | Various |
| Admin | ADMIN | Admin Panel |

---

## Deploy to Vercel (Recommended — Free)

### Option A: One-Click Deploy

1. Push this folder to a **GitHub repo**
2. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
3. Click **"Add New Project"** → Import your repo
4. Vercel auto-detects Vite — just click **Deploy**
5. Done! You get a live URL like `https://levram-travel.vercel.app`

### Option B: Vercel CLI

```bash
npm install -g vercel
cd levram-travel
npm install
vercel
```

Follow the prompts. Your app will be live in ~60 seconds.

---

## Deploy to Netlify (Free)

### Option A: Drag & Drop

1. Run locally first:
   ```bash
   npm install
   npm run build
   ```
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder onto the page
4. Done! Instant live URL.

### Option B: Git Deploy

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → New Site from Git
3. Select your repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Click Deploy

---

## Run Locally

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
levram-travel/
├── index.html          # Entry HTML
├── package.json        # Dependencies & scripts
├── vite.config.js      # Vite bundler config
├── vercel.json         # Vercel deployment config
├── netlify.toml        # Netlify deployment config
├── README.md           # This file
└── src/
    ├── main.jsx        # React mount point
    └── App.jsx         # Full application (single file)
```

## Tech Stack

- **React 18** — UI framework
- **Vite 6** — Build tool & dev server
- **Google Fonts (Outfit)** — Typography
- **No external UI library** — Custom-built components

---

## Policy Parameters (Hardcoded from Excel)

### Daily Allowances (per day)
| Grade | Local Metro | Local Non-Metro | Tour Metro | Tour Non-Metro |
|-------|------------|----------------|-----------|---------------|
| Executive (<₹20K) | ₹300 | ₹250 | ₹700 | ₹600 |
| Middle (₹20K-₹50K) | ₹400 | ₹300 | ₹800 | ₹700 |
| Top (>₹50K) | ₹500 | ₹400 | ₹1,000 | ₹800 |

### Lodging (per day)
| Grade | Metro | Non-Metro |
|-------|-------|-----------|
| Executive | ₹1,100 | ₹800 |
| Middle | ₹1,500 | ₹1,100 |
| Top | ₹2,500 | ₹2,000 |

### Vehicle Rates
| Grade | 4 Wheeler | 2 Wheeler |
|-------|-----------|-----------|
| Executive | N.A. | ₹3/km |
| Middle | N.A. | ₹4/km |
| Top | ₹9/km | ₹4/km |

Metro Cities: Mumbai, Delhi, Chennai, Kolkata, Bangalore, Pune, Hyderabad, Lucknow
