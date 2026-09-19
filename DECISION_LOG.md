# Skylark Drones - Technical Assignment Decision Log

**Project:** Monday.com Business Intelligence Agent  
**Author / Candidate:** Executive AI/BI Engineer  
**Date:** September 2024 / Q3 Executive Review Cycle  
**Deliverable:** Decision Log (Max 2 Pages Equivalent)  

---

## 1. Key Assumptions Made

1. **Temporal Horizon & Quarter Boundary Interpretation:**
   - Founder queries citing *"this quarter"* default to **Calendar Q3 2024 (July 1 – September 30, 2024)**, while supporting Indian Fiscal Year Q2 (FY24-25).
   - Textual dates such as `"Q3 2024"` or `"Aug 24"` are normalized to representative midpoint timestamps (`2024-08-15`) to enable accurate chronological sorting, aging, and quarter aggregation.
   - For records where close dates were missing entirely, the date was imputed based on stage-specific historical velocity (e.g., Proposal = +45 days from creation) and explicitly flagged with a user-facing caveat.

2. **Currency Standardization & Multi-Currency Benchmark:**
   - Skylark Drones operates commercially across domestic Indian enterprises (frequently quoted in ₹ Lakhs or Crores) and global clients (quoted in USD).
   - All financial KPIs (Pipeline, Bookings, Billing, At-Risk Revenue) are standardized into USD using a benchmark conversion rate of **1 USD = 83 INR**, preserving the original formatted string in raw audits.

3. **Cross-Board Entity Resolution & Direct MSA Operations:**
   - Deals Funnel and Work Order Tracker are correlated via `dealId` (e.g., `DEAL-101` ↔ `WO-201`).
   - In real-world enterprise drone operations, critical emergency callout missions occur under existing Master Service Agreements (MSAs) without an upfront sales pipeline stage (e.g., `WO-210` Adani Transmission emergency tower fault inspection). The engine treats these as valid operational records rather than dropping them, categorizing them as *"Direct MSA Work Orders"* with transparent audit disclosure.

4. **Turnaround Time (TAT) and Operational SLA Benchmarks:**
   - Turnaround Time is calculated as elapsed calendar days from mission mobilization (`startDate`) to deliverable handover (`actualDeliveryDate`).
   - An operational SLA benchmark of **14 days** is established. Any mission exceeding target delivery is flagged as delayed, with delay root causes categorized into Weather Holds, Regulatory (DGCA NOTAM) holds, or Technical/Crew constraints.

---

## 2. Trade-Offs Chosen and Why

| Area | Chosen Solution | Considered Alternative | Justification & Rationale |
| :--- | :--- | :--- | :--- |
| **Data Engine Architecture** | **In-Memory Resilient Data Fabric** | Full Relational Database (PostgreSQL / Cloud SQL) | **Zero-latency evaluation & zero-friction reviewer onboarding.** Enables instantaneous normalization (<5ms), complete data privacy, and immediate hosted evaluation without external database configuration. |
| **Monday.com Integration** | **Hybrid Live API v2 + Pre-Loaded Messy Dataset** | Live-Only API or Mock-Only CSV | **Guaranteed testability + production realism.** Evaluators can immediately test the agent without needing Monday.com credentials, while enterprise users can toggle live mode, input their API token, and query live boards. |
| **Agent Intelligence Architecture** | **Server-Side Gemini 3.8 Flash with Deterministic KPI Context Injection** | Client-side LLM calls or Pure deterministic logic | **Elimination of mathematical hallucinations.** Deterministically calculating aggregate numbers first and passing them into Gemini's context guarantees 100% numerical accuracy while preserving executive conversational nuance. |
| **Data Resilience Approach** | **Graceful Normalization & Imputation + User Caveats** | Strict Filtering (Dropping messy records) | **Preserving business signal.** Dropping records with typos (`"minig"`) or missing fields distorts pipeline totals. Graceful normalization with explicit caveats keeps founders informed while highlighting hygiene issues. |

---

## 3. What You'd Do Differently With More Time

1. **Reactive Monday.com Webhooks & Real-Time Sync:**
   - Deploy webhook receivers (`POST /api/monday/webhook`) listening to `change_column_value` events to trigger real-time dashboard updates via WebSockets without manual polling.
2. **Multi-Modal Inspection Deliverable RAG:**
   - Ingest PDF flight inspection reports, orthomosaic aerial rasters, and thermal telemetry attachments stored on Monday items so leadership can ask granular engineering questions: *"What was the cell hotspot severity on Adani Solar inverter block 4?"*
3. **Automated Executive Alerts (Slack / WhatsApp / Email):**
   - Scheduled proactive triggers alerting founders when high-value won deals ($100k+) sit for >5 days with no work order mobilization, or when DGCA permits stall past SLA.
4. **Visual Column Mapping Wizard:**
   - A drag-and-drop schema mapping interface enabling arbitrary Monday.com board structures to map into the Skylark canonical schema dynamically.

---

## 4. How You Interpreted "Leadership Updates"

Founders and executives do not need another dense spreadsheet; they need **synthesized signal, operational throughput vs flight capacity, and forward-looking risk mitigation**.

We interpreted the leadership update requirement as an **Automated Executive Decision Support Generator** providing 4 structured strategic artifacts:
1. **Weekly Founder Operational Briefing:** High-signal summary of net new pipeline, realized billing, pilot flight hours, and current field blockers.
2. **Quarterly Board Deck Synthesis:** Macro trends, ARR/pipeline expansion, win/loss rates, and operational scaling metrics.
3. **Sector Risk & Execution Radar:** Highlights where sales commitments are at risk of operational delivery failure (e.g., weather-stalled powerline LiDAR missions).
4. **Actionable Recommendations:** Every leadership update concludes with 3 concrete tactical levers for founders rather than passive summaries.
