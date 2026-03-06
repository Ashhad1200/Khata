# UI Enhancement & Data Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Transactions, Inventory, and Expenses pages from placeholders to fully functional data-driven interfaces with Urdu support.

**Architecture:** 
- Fetch real data from existing API endpoints.
- Display data in responsive tables using Shadcn UI patterns.
- Implement total calculation for summary cards.
- Add Urdu translations to `messages/*.json` and `DashboardNav`.

---

### Task 1: Enhance Transactions Page

**Files:**
- Modify: `src/app/dashboard/transactions/page.tsx`
- Modify: `messages/en.json`, `messages/ur.json`

**Step 1: Implement Transactions Table & Summary**
Fetch transactions from `/api/businesses/[id]/transactions` and display them in a table. Calculate totals for the summary cards.

**Step 2: Add Translations**
Add "Amount", "Description", "Date", "Method" to translation files.

### Task 2: Enhance Inventory Page

**Files:**
- Modify: `src/app/dashboard/inventory/page.tsx`
- Modify: `messages/en.json`, `messages/ur.json`

**Step 1: Implement Inventory Table & Summary**
Fetch inventory from `/api/branches/[id]/inventory` and display in a table. Show low stock alerts.

### Task 3: Enhance Expenses Page

**Files:**
- Modify: `src/app/dashboard/expenses/page.tsx`
- Modify: `messages/en.json`, `messages/ur.json`

**Step 1: Implement Expenses Table & Summary**
Fetch expenses from `/api/businesses/[id]/expenses` and display in a table. Calculate monthly and daily totals.

### Task 4: Complete Dashboard Nav Translations

**Files:**
- Modify: `src/components/dashboard-nav.tsx`

**Step 1: Add missing translations**
Ensure all nav items are fully translated and reactive to the locale switcher.
