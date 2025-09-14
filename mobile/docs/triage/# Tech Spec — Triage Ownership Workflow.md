# Tech Spec — Triage Ownership Workflow

## Purpose
Define clear ownership of `/mobile/docs/triage/` files to avoid ambiguity, ensure accountability, and maintain a reproducible, traceable QA process for Noso Woo MVP.

---

## Directory
`/mobile/docs/triage/`

Contains:
- `P0P1_Triage_Log.md` → Quick overview table of issues.  
- `P0P1_Triage_Narratives.md` → Detailed issue write-ups.  
- `P0P1_Triage_Template.md` → Blank starter for new issues.  

---

## Roles & Responsibilities

### Engineer / Tester (You)
- **Create & Update Issues**  
  - During smoke tests or manual QA, log new issues in `P0P1_Triage_Log.md`.  
  - Expand into `P0P1_Triage_Narratives.md` for detailed reproduction steps.  
- **Mark Status**  
  - Set issue status to `Open`.  
  - Update to `Verified` once confirmed reproducible.  
- **Provide Evidence**  
  - Attach screenshots, logs, or video timestamps in Narratives.  

### Developer (ChatGPT-5 / Model)
- **Consume & Interpret Issues**  
  - Reads `/triage` files to prioritize fixes.  
- **Implement Fixes**  
  - Propose/commit changes addressing logged issues.  
- **Update Status**  
  - Change status from `Open` → `Resolved` once fix is implemented.  
  - Provide commit/PR references in the Log table.  
- **Cross-Reference**  
  - Ensure `Log` and `Narratives` remain in sync.  

---

## Workflow

1. **Engineer discovers issue** → logs in `Log.md` with ID, severity, short description.  
2. **Engineer expands detail** → narrative entry with repro steps, expected vs actual, evidence.  
3. **Developer reads triage** → prioritizes by severity (P0 must be fixed before release).  
4. **Developer fixes issue** → updates status in Log + adds reference.  
5. **Engineer retests** → if confirmed, marks as `Closed`.  

---

## Safeguards
- **P0 Policy:** No release until all P0 issues are resolved and verified.  
- **P1 Policy:** May defer to next patch, but must be logged and tracked.  
- **Traceability:** Every issue has a unique ID (`P0-001`, `P1-002`, etc.), always cross-linked between Log and Narratives.  

---

## Acceptance Criteria
- `/triage` files remain the single source of truth.  
- Engineer creates issues, Developer resolves them.  
- All P0s must be `Closed` before store submission.  
- P1s must be triaged with clear resolution path.  

---
