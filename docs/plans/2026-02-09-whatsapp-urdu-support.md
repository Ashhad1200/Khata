# WhatsApp & Urdu Localization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable WhatsApp payment reminders and add Urdu (RTL) language support for localized user experience.

**Architecture:** 
- **WhatsApp:** Client-side URL generation using `https://wa.me/` for instant messaging.
- **Urdu:** `next-intl` for App Router internationalization with RTL directionality logic.

**Tech Stack:** 
- `next-intl`: i18n for Next.js
- Standard Browser APIs for WhatsApp linking

---

### Task 1: Install Localization Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install next-intl**

Run: `npm install next-intl`
Expected: `next-intl` added to dependencies.

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add next-intl for localization"
```

### Task 2: Create WhatsApp Utility

**Files:**
- Create: `src/lib/whatsapp-service.ts`

**Step 1: Implement WhatsApp URL generator**

```typescript
export const sendWhatsAppReminder = (phone: string, customerName: string, amount: number) => {
    const message = `Assalam-o-Alaikum ${customerName}, this is a reminder regarding your outstanding balance of PKR ${amount.toLocaleString()} at our shop. Please settle at your earliest convenience. Shukriya!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
};
```

**Step 2: Commit**

```bash
git add src/lib/whatsapp-service.ts
git commit -m "feat: add WhatsApp reminder utility"
```

### Task 3: Setup RTL Logic and Locale Switcher

**Files:**
- Create: `src/components/language-switcher.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create Language Switcher component**

Create a dropdown to toggle between English and Urdu.

**Step 2: Implement RTL directionality**

In `layout.tsx`, detect locale and set `<html dir="rtl" lang="ur">` for Urdu.

**Step 3: Commit**

```bash
git add src/components/language-switcher.tsx src/app/layout.tsx
git commit -m "feat: add language switcher and RTL support"
```

### Task 4: Localize Dashboard (Example)

**Files:**
- Create: `messages/en.json`, `messages/ur.json`

**Step 1: Add translation strings**

Define common UI text in both languages (e.g., "Dashboard", "Total Customers").

**Step 2: Commit**

```bash
git add messages/en.json messages/ur.json
git commit -m "feat: add initial translations for English and Urdu"
```
