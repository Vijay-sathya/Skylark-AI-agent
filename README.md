# Skylark Drones - Monday.com Business Intelligence Agent

An AI-powered executive business intelligence agent for **Skylark Drones** that integrates with **Monday.com** boards (Deals Funnel & Work Order Tracker) to synthesize messy enterprise sales and operational flight data into founder-level insights.

Built for the **Skylark Drones Technical Assignment (AI/BI Agent)**.

---

## 🌟 Key Highlights & Capabilities

### 1. Conversational Executive Interface
- **Founder-Level Natural Language Understanding:** Ask questions in plain English (e.g. *"How's our pipeline looking for the energy sector this quarter?"*, *"Compare booked deals vs completed work orders & turnaround times"*, *"Which clients have won deals but currently delayed work orders?"*).
- **Ambiguity Clarification:** When user requests are open-ended or ambiguous, the agent actively poses targeted clarifying chips to refine analysis.
- **Embedded Visual Intelligence:** Responses include live formatted charts (`recharts`), executive bottom-line callout banners, key metric tiles, and operational friction alerts.

### 2. Industry-Grade Data Resilience & Hygiene
- **Sector Taxonomy Normalization:** Unifies colloquial variations (e.g., `"energy"`, `"Renewable & Energy"`, `"Power & Utilities"`) into canonical sectors and corrects typos (e.g., `"minig"` → `"Mining & Resources"`).
- **Multi-Format Date Alignment:** Seamlessly parses DD/MM/YYYY, MM/DD/YYYY, text dates (`"Aug 24"`), and relative quarters (`"Q3 2024"`).
- **Multi-Currency Standardization:** Converts Indian domestic enterprise contracts in ₹ Lakhs and Crores into standard USD (`1 USD = 83 INR`).
- **Missing Value Handling & Imputation:** Handles `"TBD"` deal values, unassigned pilots, and missing close dates with stage-velocity imputation.
- **Transparent Caveats:** Every data anomaly or imputation is communicated directly to the user via Data Resilience notices and audit logs.

### 3. Cross-Board Deal-to-Delivery Synthesis
- **Sales ↔ Ops Correlation:** Maps closed-won deals against field work order milestones.
- **At-Risk Revenue Quantification:** Quantifies the exact dollar value of won revenue stalled in the field by monsoon weather holds or DGCA airspace permits.
- **Turnaround Time (TAT) & Pilot Metrics:** Computes real delivery days against 14-day SLA targets, tracking drone flight hours and remote pilot utilization.

### 4. Leadership Updates Studio (Additional Requirement)
- **1-Click Executive Briefings:** Instant generation of Weekly Digests, Board Deck Summaries, Risk Radars, and Sector Deep-Dives.
- **Multi-Format Export:** Copy to clipboard or download formatted Markdown (`.md`) reports ready for executive distribution.

### 5. Interactive Decision Log (Required Deliverable)
- Embedded 2-page decision log detailing key assumptions, trade-offs, roadmap with more time, and leadership update interpretation.

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Skylark Drones BI Agent Architecture                 │
└────────────────────────────────────────────────────────────────────────┘
                 ┌────────────────────────────────┐
                 │    Monday.com GraphQL API v2   │
                 │   (Deals & Work Orders Boards) │
                 └──────────────┬─────────────────┘
                                │ (Live API or Preloaded Dataset)
                                ▼
                 ┌────────────────────────────────┐
                 │   Data Resilience Engine       │
                 │ - Normalizes Sectors & Stages  │
                 │ - Unifies Currency (INR -> USD)│
                 │ - Aligns Multi-Format Dates    │
                 │ - Generates Data Health Audit  │
                 └──────────────┬─────────────────┘
                                │
                                ▼
                 ┌────────────────────────────────┐
                 │     Deterministic Metrics      │
                 │ - Sector Win Rates & Pipeline  │
                 │ - TAT & Delay Calculations     │
                 │ - Cross-Board Deal Fulfillment │
                 └──────────────┬─────────────────┘
                                │
                                ▼
                 ┌────────────────────────────────┐
                 │  Gemini 3.8 Flash Agent Server │
                 │  - System Context + KPI Fabric │
                 │  - Natural Language Reasoning  │
                 │  - Caveats & Follow-Up Gen     │
                 └──────────────┬─────────────────┘
                                │
                                ▼
                 ┌────────────────────────────────┐
                 │   Executive React Dashboard    │
                 │ - Conversational Chat & Pills  │
                 │ - Interactive Recharts Visuals │
                 │ - 1-Click Leadership Studio    │
                 │ - 2-Page Decision Log Modal    │
                 └────────────────────────────────┘
```

---

## 🚀 Setup & Monday.com Configuration Instructions

### 1. Prerequisites
- Node.js 18+ installed
- Monday.com account (optional: preloaded high-fidelity dataset works out-of-the-box)

### 2. Local Installation
```bash
# Clone the repository
git clone <repo-url>
cd skylark-bi-agent

# Install dependencies
npm install

# Run the development server
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Monday.com Board Configuration (Live Mode)

To connect live Monday.com boards:

1. **Obtain Monday.com Personal API Token:**
   - Log in to Monday.com.
   - Click your Profile Avatar (bottom-left) → **Developers** → **My Access Tokens**.
   - Copy the Personal API Token.

2. **Create or Import Boards in Monday.com:**
   - Click **+ Add** → **Import data** → **Excel / CSV**.
   - Import `Deal funnel Data.xlsx` as **Board 1: Deals Funnel**.
   - Import `Work Order Tracker Data.xlsx` as **Board 2: Work Orders**.

3. **Configure Board Columns:**
   - **Deals Board:** Item Name (Deal Name), Client, Sector, Stage (New Lead, Qualified, Proposal, Negotiation, Won, Lost), Value (Currency or Number), Expected Close Date, Actual Close Date.
   - **Work Orders Board:** Item Name (WO Number), Linked Deal ID (Text or Connect Boards), Client, Sector, Status (Scheduled, In Progress, Completed, Delayed), Start Date, Target Delivery, Actual Delivery, Flight Hours Logged, Pilots Assigned, Drones Deployed, Billing Amount, Delay Reason.

4. **Connect in App:**
   - Click the **Monday.com (API v2)** button in the header.
   - Switch to **Live Monday.com API v2**.
   - Enter your API Token, Deals Board ID, and Work Order Board ID.
   - Click **Test Monday API Connection** and **Save Configuration**.

---

## 🧪 Testing Prompts for Reviewers

Try asking the agent any of the following founder questions:

1. *"How's our pipeline looking for the energy sector this quarter?"*
2. *"Compare booked deals vs completed work orders & turnaround times."*
3. *"Which clients have won deals but currently delayed work orders?"*
4. *"What is our average turnaround time (TAT) and flight hours by sector?"*
5. *"Summarize our top revenue risks and operational blockers for founders."*

---

