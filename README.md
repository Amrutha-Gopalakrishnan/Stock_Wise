# StockWise – Inventory Reorder Assistant

StockWise is an inventory management and stock-monitoring application tailored for SME and retail workflows. It provides dedicated Admin and Staff experiences to manage products, suppliers, alerts, and day-to-day stock movements.

---

## Features
- **Role-specific dashboards** – Admin handles catalog, suppliers, analytics, and alerts; Staff focuses on logging transactions and tracking alerts/activity.
- **Inventory intelligence** – Reorder thresholds, suggested quantities, and overview charts (e.g., stock value by category).
- **Realtime Supabase integration** – Postgres storage plus realtime subscriptions keep dashboards synchronized.
- **Transaction workflow** – Guided form supports stock in/out/adjustment events with immediate feedback and history tables.
- **Demo resilience** – If Supabase credentials are absent, the UI falls back to seeded data so flows can still be recorded.

---

## Setup
1. **Install dependencies**
   ```bash
   cd StockWise/stockwise
   npm install
   ```

2. **Environment variables**
   Create `stockwise/.env`:
   ```
   VITE_SUPABASE_URL=<your-supabase-project-url>
   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open the printed local URL (usually `http://localhost:5173`).

> Without Supabase credentials the app still boots with demo data, letting you capture UI flows.

---

## System Design Summary
- **Frontend**: React 18 (Vite + React Router) with Tailwind CSS and shadcn/ui components. `DashboardLayout` wraps shared navigation for Admin and Staff routes.
- **Data layer**: Supabase Postgres tables for products, suppliers, stock transactions, alerts, and users. A Supabase RPC (`fn_record_stock_transaction`) encapsulates stock mutation logic. Realtime channels refresh dashboards after data changes.
- **Auth**: Supabase Auth is supported (dashboard reads the current user when available); demo environments use a seeded staff user.
- **Offline/demo support**: Mock Supabase client plus local caching keep the UI working during presentations when env keys are missing.

---

## Key Challenges & Solutions
1. **Duplicate stock-level rows** – Early RPC logic inserted blindly and hit unique constraints. The backend function now performs an upsert/update, ensuring only one row per product while updating quantities atomically.
2. **Graceful demos without live Supabase** – Added a mock client with seeded data so every screen remains functional for recordings, while surfacing toasts when remote persistence fails.
3. **Keeping analytics in sync** – Supabase realtime channels and targeted refetch hooks were wired up so Admin dashboards reflect new transactions instantly.

---

## Testing & Demo Checklist
- Add a product and supplier; verify stock levels update on both Admin and Staff views.
- Log stock in/out from the Staff dashboard; confirm toast notifications and refreshed history.
- Observe Admin analytics (stock value, alerts) updating after transactions.
- Optionally authenticate via Supabase Auth to populate `logged_by` metadata.

---

## Future Enhancements
- Background sync queue to replay locally stored transactions once Supabase connectivity returns.
- Expanded analytics (monthly trends, forecasting, configurable alert triggers).
- Role-protected routing backed by Supabase Auth state.
- Automated testing (React Testing Library / Cypress) and exportable reports (CSV/PDF).

---

## License
No explicit license; intended for the Whizlabs assessment submission. Update attribution as needed for further development.
