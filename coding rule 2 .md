Rule 2.0 — Component Size & Composition (Dynamic)

Default
- One component/hook per file.
- Target ≤ 300 LOC per file.

When you MAY exceed 300 LOC (table-specific)
- Complex, performance-critical composites (e.g., ProductTable) that coordinate
  virtualization, column sizing, keyboard UX, bulk edit, and pinned rows.
- Condition: you must isolate heavy logic into hooks/services and keep the file
  primarily as orchestration/render glue.

Hard Requirements (even when >300)
1) Decompose concerns:
   - Hooks: data, keyboard, selection, editing, columns, virtualization
   - Cells: each cell/editor is its own component
   - Panels: filters, bulk actions, status bar separate files
2) Add a header note in large files:
   /**
    * ProductTable.tsx — orchestration only
    * Responsibilities: layout, providers, render composition
    * Offloaded: data(fetch/useQuery), editing(useProductEdits), columns(getColumns),
    * keyboard(useGridKeyboard), virtualization(useVirtualRows)
    */
3) Provide a public API via a barrel export (index.ts):
   export { ProductTable } from "./ProductTable";
   export * from "./cells";
   export * from "./hooks";

What NEVER lives in the big file
- Data fetching logic (→ useProductData.ts)
- Mutation logic (→ useProductEdits.ts)
- Keyboard handlers (→ useGridKeyboard.ts)
- Column definitions/builders (→ table.columns.ts)
- Virtualization config (→ useVirtualRows.ts)
- Reusable cells/editors (→ /cells/*.tsx)
- Styling tokens/vars (→ table.tokens.ts)

File Size Tiers (guidance, not handcuffs)
- Simple component: ≤ 200 LOC
- Standard screen: ≤ 300 LOC
- Orchestrator (rare): ≤ 600 LOC with the header note + decomposition above

Folder Shape (example)
product-table/
  index.ts                # barrel re-exports
  ProductTable.tsx        # orchestrator (may exceed 300 with constraints)
  table.columns.ts        # column defs/builders
  table.tokens.ts         # sizes, paddings, z-index, colors
  useProductData.ts       # data/query hooks
  useProductEdits.ts      # mutations, optimistic updates
  useGridKeyboard.ts      # keyboard nav, focus ring, shortcuts
  useVirtualRows.ts       # virtualization config (react-virtual/flash-list web)
  cells/
    NameCell.tsx
    SkuCell.tsx
    PriceCell.tsx
    StockCell.tsx
    StatusCell.tsx
    CellEditors/...

Export Pattern
- Consumers import only from the barrel:
  import { ProductTable } from "@/features/product-table";

Performance Guardrails
- Orchestrator memoizes heavy lists; row/cell components are memoized.
- No inline object/array literals in hot paths; move to useMemo/useCallback.
- Avoid prop drilling; use context slices (selection/editing state) with selector hooks.

Linting (optional but helpful)
- Enforce max-lines globally (e.g., 300), with per-file override for ProductTable.tsx:
  /* eslint max-lines: ["error", 300, { "skipComments": true }] */
  // .eslintrc overrides:
  "overrides": [{ "files": ["**/ProductTable.tsx"], "rules": { "max-lines": ["error", 600] } }]

FAQ
- “Do we just export everything?” No—export a curated API via the barrel (`index.ts`).
  Internal files stay private by convention; only export what downstream screens need.
- “Can other screens exceed 300?” Only if they’re orchestrators of multiple subsystems
  and follow the same decomposition + header note pattern.
