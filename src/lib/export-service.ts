import * as XLSX from 'xlsx';

/**
 * Exports JSON data to an Excel file.
 */
export const exportToExcel = (data: any[], fileName: string) => {
    // 1. Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // 2. Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    
    // 3. Write and trigger download
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exports financial report data to Excel with formatting.
 */
export const exportFinancialReport = (reportData: any) => {
    const formattedData = [
        { Category: 'Revenue', Amount: reportData.totalRevenue },
        { Category: 'Expenses', Amount: reportData.totalExpenses },
        { Category: 'Net Profit', Amount: reportData.netProfit },
        { Category: 'Outstanding', Amount: reportData.outstandingPayments },
    ];
    
    exportToExcel(formattedData, 'Financial_Report');
};
