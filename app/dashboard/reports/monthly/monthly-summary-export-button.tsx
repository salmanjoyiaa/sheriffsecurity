"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { MonthlySummaryPDF } from "@/components/pdf/report-pdf";

interface MonthlySummaryExportButtonProps {
  month: string;
  year: number;
  stats: {
    totalGuards: number;
    activeAssignments: number;
    totalAttendance: number;
    presentDays: number;
    absentDays: number;
    attendanceRate: number;
    totalRevenue: number;
    pendingInvoices: number;
  };
  branchName?: string;
}

export function MonthlySummaryExportButton({
  month,
  year,
  stats,
  branchName,
}: MonthlySummaryExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleExport() {
    setIsGenerating(true);

    try {
      // Generate PDF blob
      const blob = await pdf(
        <MonthlySummaryPDF
          data={{ month, year, stats }}
          branchName={branchName}
        />
      ).toBlob();

      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `monthly-summary-${month.toLowerCase()}-${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isGenerating}>
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}
