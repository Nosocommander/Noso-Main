# Tech Spec — P0/P1 Triage Logging Template

## Purpose
Provide a standardized format for logging **critical (P0)** and **high-priority (P1)** issues during device smoke tests.  
Ensures traceability, reproducibility, and efficient triage between Engineer (you) and Developer (ChatGPT-5).

---

## 1. Severity Definitions
- **P0 (Critical Blocker)**  
  - App crash, freeze, or data loss.  
  - Broken save/rollback flows.  
  - Navigation dead-ends (user cannot continue).  
  - API request failures with no user recovery.  
  - Security risk (credentials exposed, no HTTPS).  

- **P1 (High Priority)**  
  - Action-blocking UX issues (e.g., Action Bar hidden, keyboard overlap).  
  - Inconsistent conflict/rollback resolution.  
  - CSV flow stalls or blocks further work.  
  - Major performance regressions (scroll FPS < 30, repaint > 500ms).  
  - Accessibility failures on core flows.  

---

## 2. Logging Template

### Issue Entry
- **ID:** `P0-###` or `P1-###`  
- **Severity:** P0 | P1  
- **Feature Area:** Catalog | Settings | CSV | History | Analytics | Navigation | API | Other  
- **Environment:** Device (model/OS version), Build (APK/AAB or TestFlight version)  
- **Description:** Short summary of the issue.  
- **Steps to Reproduce:** Clear numbered steps.  
- **Expected Behavior:** What should happen.  
- **Actual Behavior:** What happened instead.  
- **Logs/Evidence:** Screenshots, video timestamp, console log snippet (if DEV build).  
- **Workaround:** If any exists (optional).  
- **Status:** Open | In Progress | Fixed | Deferred  

---

## 3. Example Entries

### Example P0
- **ID:** P0-001  
- **Severity:** P0  
- **Feature Area:** Catalog  
- **Environment:** Pixel 6 / Android 14 / Build 1.0.0-rc.1 (APK)  
- **Description:** Batch save crashes app when >20 edits pending.  
- **Steps to Reproduce:**  
  1. Open Catalog.  
  2. Edit 20+ items.  
  3. Tap Save.  
- **Expected Behavior:** Single request succeeds, summary sheet displays.  
- **Actual Behavior:** App crashes to home screen.  
- **Logs/Evidence:** Crash log (attached), video timestamp 1:45.  
- **Workaround:** None.  
- **Status:** Open.  

### Example P1
- **ID:** P1-002  
- **Severity:** P1  
- **Feature Area:** CSV  
- **Environment:** iPhone 13 / iOS 17.4 / Build 1.0.0-rc.1 (TestFlight)  
- **Description:** Error CSV download link not working.  
- **Steps to Reproduce:**  
  1. Upload invalid CSV.  
  2. Tap “Download Errors CSV.”  
- **Expected Behavior:** CSV downloads to device.  
- **Actual Behavior:** No file downloaded, silent failure.  
- **Logs/Evidence:** Console error in DEV build: “download aborted.”  
- **Workaround:** None.  
- **Status:** Open.  

---

## 4. Usage
- Engineer executes smoke test → logs issues in this template.  
- Developer reviews entries → implements fixes or deferrals.  
- Each issue must have **clear repro steps + evidence** to avoid ambiguity.  
- Only **P0/P1 issues** logged here; lower severities deferred until post-MVP.  

---

## 5. Exit Criteria for Release
- **P0 issues:** All must be fixed and verified before Play Store/TestFlight submission.  
- **P1 issues:** Must be fixed or explicitly deferred with Engineer sign-off.  
- No release if unresolved P0 or unapproved P1 issues remain.  

---
