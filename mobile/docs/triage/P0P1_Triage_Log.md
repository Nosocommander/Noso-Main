# Tech Spec — P0/P1 Triage File Templates

## Purpose
Provide **ready-to-use Markdown templates** for structured P0/P1 triage logging.  
Files can be dropped directly into `/mobile/docs/triage/`.

---

## 1. File: `P0P1_Triage_Log.md`

### Structure
- Quick table for **all open/closed P0/P1 issues**.  
- One-line summaries with links to narratives when applicable.  

### Template
```markdown
# P0/P1 Triage Log

| ID     | Severity | Feature Area | Env (Device/OS/Build) | Description (1-line)         | Status  | Link to Narrative |
|--------|----------|--------------|-----------------------|------------------------------|---------|-------------------|
| P0-001 | P0       | Catalog      | TBD                   | Example: Crash on batch save | Open    | [P0-001](./P0P1_Triage_Narratives.md#p0-001) |
| P1-001 | P1       | Settings     | TBD                   | Example: UI copy incomplete  | Deferred| -                 |
