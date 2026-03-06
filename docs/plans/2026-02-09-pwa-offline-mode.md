# PWA & Offline Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the application into a Progressive Web App (PWA) with offline capabilities.

**Architecture:** Use `next-pwa` (or `serwist` for Next 15) to manage service workers and caching strategies.

**Tech Stack:** 
- `@serwist/next`: Modern PWA support for Next.js 15+

---

### Task 1: Install PWA Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install serwist**

Run: `npm install @serwist/next serwist`
Expected: PWA libraries installed.

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add serwist for PWA support"
```

### Task 2: Configure PWA and Manifest

**Files:**
- Create: `public/manifest.json`
- Modify: `next.config.ts`

**Step 1: Create Web App Manifest**

Define app icons, colors, and startup behavior.

**Step 2: Configure Next.js for PWA**

Wrap the next config with Serwist to enable service worker generation.

**Step 3: Commit**

```bash
git add public/manifest.json next.config.ts
git commit -m "feat: configure PWA manifest and service worker"
```

### Task 3: Add Offline Notification UI

**Files:**
- Create: `src/components/offline-banner.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Implement Offline Banner**

Show a subtle banner when the user loses internet connectivity.

**Step 2: Commit**

```bash
git add src/components/offline-banner.tsx src/app/layout.tsx
git commit -m "feat: add offline detection banner"
```
