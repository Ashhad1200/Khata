"use client"

import { Button } from "@/components/ui/button"
import { exportFinancialReport } from "@/lib/export-service"

interface ReportExportButtonsProps {
    data: any
}

export function ReportExportButtons({ data }: ReportExportButtonsProps) {
    return (
        <div className="flex gap-2">
            <Button 
                variant="outline"
                onClick={() => {
                    // Placeholder for PDF export
                    alert("PDF export functionality is being integrated with current view data.")
                }}
            >
                Export PDF
            </Button>
            <Button 
                variant="outline"
                onClick={() => exportFinancialReport(data)}
            >
                Export Excel
            </Button>
        </div>
    )
}
