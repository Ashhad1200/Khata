# Invoice PDF & Data Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to generate professional PDF invoices and export financial reports to Excel and PDF formats.

**Architecture:** Client-side generation using `jspdf` for PDFs and `xlsx` for Excel files to minimize server load and provide instant downloads.

**Tech Stack:** 
- `jspdf`: PDF generation
- `jspdf-autotable`: Table support in PDFs
- `xlsx`: Excel file generation

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install jspdf and xlsx**

Run: `npm install jspdf jspdf-autotable xlsx`
Expected: Dependencies added to `package.json`.

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add jspdf and xlsx dependencies"
```

### Task 2: Create PDF Utility Service

**Files:**
- Create: `src/lib/pdf-service.ts`

**Step 1: Write implementation for PDF generation**

```typescript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = (invoiceData: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, 20, 40);
    doc.text(`Date: ${new Date(invoiceData.createdAt).toLocaleDateString()}`, 20, 45);
    
    // Customer Info
    doc.text('Bill To:', 20, 60);
    doc.text(invoiceData.customer.name, 20, 65);
    doc.text(invoiceData.customer.phone, 20, 70);
    
    // Items Table
    const tableData = invoiceData.transaction.items.map((item: any) => [
        item.description,
        item.quantity.toString(),
        `PKR ${Number(item.unitPrice).toLocaleString()}`,
        `PKR ${Number(item.totalPrice).toLocaleString()}`
    ]);
    
    (doc as any).autoTable({
        startY: 80,
        head: [['Description', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
    });
    
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total Amount: PKR ${Number(invoiceData.totalAmount).toLocaleString()}`, 140, finalY);
    
    doc.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
};
```

**Step 2: Commit**

```bash
git add src/lib/pdf-service.ts
git commit -m "feat: add PDF generation service"
```

### Task 3: Integrate PDF Download in Invoices Page

**Files:**
- Modify: `src/app/dashboard/invoices/page.tsx`

**Step 1: Add download button and logic**

Modify the invoice list (when implemented) or the generation success dialog to include a "Download PDF" button.

**Step 2: Commit**

```bash
git add src/app/dashboard/invoices/page.tsx
git commit -m "feat: integrate PDF download in invoices page"
```

### Task 4: Implement Excel Export for Reports

**Files:**
- Create: `src/lib/export-service.ts`

**Step 1: Write implementation for Excel export**

```typescript
import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
```

**Step 2: Commit**

```bash
git add src/lib/export-service.ts
git commit -m "feat: add Excel export service"
```

### Task 5: Integrate Export Buttons in Reports Page

**Files:**
- Modify: `src/app/dashboard/reports/page.tsx`

**Step 1: Connect buttons to services**

Update the "Export PDF" and "Export Excel" buttons in the Reports page to fetch current view data and trigger downloads.

**Step 2: Commit**

```bash
git add src/app/dashboard/reports/page.tsx
git commit -m "feat: integrate export buttons in reports page"
```
