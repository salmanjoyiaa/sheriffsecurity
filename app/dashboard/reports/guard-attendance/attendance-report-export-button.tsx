"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { AttendanceReportPDF } from "@/components/pdf/report-pdf";
import { AttendanceReportData } from "../actions";

interface AttendanceReportExportButtonProps {
  reportData: AttendanceReportData[];
  startDate: string;
  endDate: string;
}

export function AttendanceReportExportButton({
  reportData,
  startDate,
  endDate,
}: AttendanceReportExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleExport() {
    setIsGenerating(true);

    try {
      // Generate PDF blob
      const blob = await pdf(
        <AttendanceReportPDF
          data={reportData}
          period={{ start: startDate, end: endDate }}
        />
      ).toBlob();

      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `guard-attendance-report-${startDate}-to-${endDate}.pdf`;
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
