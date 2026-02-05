"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, subDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ArrowLeft, FileText, Loader2, MapPin, Users, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generatePlaceReport, PlaceReportData } from "../actions";
import { PlaceReportExportButton } from "./place-report-export-button";

interface Place {
  id: string;
  name: string;
  city: string;
  address: string;
}

interface PlaceReportClientProps {
  places: Place[];
}

export default function PlaceReportClient({ places }: PlaceReportClientProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [placeId, setPlaceId] = useState<string>("");
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reportData, setReportData] = useState<PlaceReportData | null>(null);

  async function handleGenerate() {
    if (!placeId) {
      toast({
        title: "Error",
        description: "Please select a place",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("place_id", placeId);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);

    const result = await generatePlaceReport(formData);
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

  const shiftColors: Record<string, "default" | "secondary" | "outline"> = {
    day: "default",
    night: "secondary",
    both: "outline",
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
          <h1 className="text-3xl font-bold tracking-tight">Place Report</h1>
          <p className="text-muted-foreground">
            Generate detailed report for a specific place
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>
            Choose a place and date range to generate report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="place">Place</Label>
              <Select value={placeId} onValueChange={setPlaceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a place" />
                </SelectTrigger>
                <SelectContent>
                  {places.map((place) => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name} - {place.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label>&nbsp;</Label>
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !placeId}
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
        <div className="space-y-6">
          {/* Place Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{reportData.place.name}</CardTitle>
                    <CardDescription>{reportData.place.address}</CardDescription>
                  </div>
                </div>
                <PlaceReportExportButton 
                  reportData={reportData}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{reportData.place.city}</div>
                  <div className="text-xs text-muted-foreground">City</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {reportData.guards.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Assigned Guards
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.attendance_summary.attendance_rate}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg Attendance
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {reportData.attendance_summary.total_days}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Days (Last 30)
                  </div>
                </div>
              </div>

              {reportData.place.contact_person && (
                <div className="mt-4 p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Person:</span>{" "}
                      {reportData.place.contact_person}
                    </div>
                    {reportData.place.contact_phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        {reportData.place.contact_phone}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.attendance_summary.present}
                  </div>
                  <div className="text-sm">Present</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {reportData.attendance_summary.absent}
                  </div>
                  <div className="text-sm">Absent</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {reportData.attendance_summary.late}
                  </div>
                  <div className="text-sm">Late</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {reportData.attendance_summary.half_day}
                  </div>
                  <div className="text-sm">Half Day</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.attendance_summary.leave}
                  </div>
                  <div className="text-sm">Leave</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Guards */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Assigned Guards</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {reportData.guards.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guard Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.guards.map((guard) => (
                      <TableRow key={guard.id}>
                        <TableCell className="font-mono">
                          {guard.guard_code}
                        </TableCell>
                        <TableCell className="font-medium">
                          {guard.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={shiftColors[guard.shift] || "default"}>
                            {guard.shift}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {guard.start_date ? format(new Date(guard.start_date), "PP") : "—"}
                        </TableCell>
                        <TableCell>
                          {guard.end_date ? format(new Date(guard.end_date), "PP") : "Ongoing"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No guards currently assigned to this place
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Inventory */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <CardTitle>Assigned Inventory</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {reportData.inventory && reportData.inventory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Serial No.</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Assigned Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.item_name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.serial_number || "—"}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {item.assigned_to_guard || "Place"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(item.assigned_at), "PP")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No inventory assigned to this place
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
