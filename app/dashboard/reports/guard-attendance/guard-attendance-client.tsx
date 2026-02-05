"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Loader2, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format, subDays } from "date-fns";
import { generateAttendanceReport, AttendanceReportData } from "../actions";
import { AttendanceReportExportButton } from "./attendance-report-export-button";

interface Guard {
  id: string;
  name: string;
  guard_code: string;
}

interface Place {
  id: string;
  name: string;
  city: string;
}

interface GuardAttendanceClientProps {
  guards: Guard[];
  places: Place[];
}

export default function GuardAttendanceClient({
  guards,
  places,
}: GuardAttendanceClientProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [guardId, setGuardId] = useState<string>("");
  const [placeId, setPlaceId] = useState<string>("");
  const [reportData, setReportData] = useState<AttendanceReportData[] | null>(null);

  async function handleGenerate() {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("report_type", "guard_attendance");
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    if (guardId) formData.append("guard_id", guardId);
    if (placeId) formData.append("place_id", placeId);

    const result = await generateAttendanceReport(formData);
    setIsLoading(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    setReportData(result.data || null);
  }

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    present: "default",
    absent: "destructive",
    late: "secondary",
    half_day: "outline",
    leave: "outline",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Guard Attendance Report
          </h1>
          <p className="text-muted-foreground">
            Generate detailed attendance records for guards
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>
            Select date range and optional filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guard">Guard (Optional)</Label>
              <Select value={guardId || "all"} onValueChange={(val) => setGuardId(val === "all" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All guards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All guards</SelectItem>
                  {guards.map((guard) => (
                    <SelectItem key={guard.id} value={guard.id}>
                      {guard.name} ({guard.guard_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="place">Place (Optional)</Label>
              <Select value={placeId || "all"} onValueChange={(val) => setPlaceId(val === "all" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All places" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All places</SelectItem>
                  {places.map((place) => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name} - {place.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Report</CardTitle>
                <CardDescription>
                  {format(new Date(startDate), "PPP")} to{" "}
                  {format(new Date(endDate), "PPP")}
                </CardDescription>
              </div>
              <AttendanceReportExportButton
                reportData={reportData}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </CardHeader>
          <CardContent>
            {reportData.length > 0 ? (
              <div className="space-y-8">
                {reportData.map((guardData) => (
                  <div key={guardData.guard.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {guardData.guard.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {guardData.guard.guard_code} • {guardData.place?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {guardData.summary.attendance_rate}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Attendance Rate
                        </p>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-bold text-green-600">
                          {guardData.summary.present}
                        </div>
                        <div className="text-xs">Present</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="font-bold text-red-600">
                          {guardData.summary.absent}
                        </div>
                        <div className="text-xs">Absent</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-bold text-blue-600">
                          {guardData.summary.leave}
                        </div>
                        <div className="text-xs">Leave</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="font-bold text-orange-600">
                          {guardData.summary.half_day}
                        </div>
                        <div className="text-xs">Half Day</div>
                      </div>
                    </div>

                    {/* Attendance Details */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Shift</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {guardData.attendance.slice(0, 10).map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {format(new Date(record.date), "PP")}
                            </TableCell>
                            <TableCell className="capitalize">
                              {record.shift}
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusColors[record.status]}>
                                {record.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {guardData.attendance.length > 10 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Showing 10 of {guardData.attendance.length} records
                      </p>
                    )}

                    {/* Assigned Inventory */}
                    {guardData.inventory && guardData.inventory.length > 0 && (
                      <div className="mt-6 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium">Assigned Inventory</h4>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Serial No.</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Assigned Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {guardData.inventory.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                  {item.item_name}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {item.serial_number || "—"}
                                </TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                  {format(new Date(item.assigned_at), "PP")}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No data found</h3>
                <p className="text-muted-foreground">
                  No attendance records found for the selected criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
