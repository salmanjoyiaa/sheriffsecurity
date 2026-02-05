import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, FileText, MapPin, Users } from "lucide-react";

export default async function ReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, branch_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const reports = [
    {
      id: "guard-attendance",
      title: "Guard Attendance Report",
      description: "Detailed attendance records for individual guards including check-in/out times, absences, and attendance rate.",
      icon: Users,
      href: "/dashboard/reports/guard-attendance",
      color: "text-blue-600",
    },
    {
      id: "place-report",
      title: "Place Report",
      description: "Comprehensive report for a specific location including assigned guards, attendance summary, and service details.",
      icon: MapPin,
      href: "/dashboard/reports/place",
      color: "text-green-600",
    },
    {
      id: "monthly-summary",
      title: "Monthly Summary",
      description: "Overall monthly statistics including total attendance, guard utilization, and branch performance.",
      icon: Calendar,
      href: "/dashboard/reports/monthly",
      color: "text-purple-600",
    },
    {
      id: "invoice-report",
      title: "Invoice Report",
      description: "Summary of invoices by status, client, and payment history for the selected period.",
      icon: FileText,
      href: "/dashboard/reports/invoices",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download various reports with PDF export
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-muted ${report.color}`}>
                  <report.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{report.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {report.description}
              </CardDescription>
              <Button asChild>
                <Link href={report.href}>Generate Report</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
