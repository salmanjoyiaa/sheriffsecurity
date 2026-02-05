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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, ClipboardList, Plus, Users } from "lucide-react";
import { format } from "date-fns";

interface Assignment {
  id: string;
  guard_id: string;
  place_id: string;
  branch_id: string;
  shift_type: string;
  start_date: string;
  end_date: string | null;
  status: string;
  notes: string | null;
  guard?: { name?: string; guard_code?: string } | null;
  place?: { name?: string } | null;
  branch?: { name?: string } | null;
}

export default async function AssignmentsPage() {
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

  // Get assignments with relations
  let query = supabase
    .from("assignments")
    .select(`
      *,
      guard:guards(id, name, guard_code, branch_id),
      place:places(id, name, city, branch_id)
    `)
    .order("created_at", { ascending: false });

  const { data: assignments, error } = await query;

  if (error) {
    console.error("Error fetching assignments:", error);
  }

  // Filter by branch for branch_admin (RLS should handle this but we do client-side too)
  let filteredAssignments: Assignment[] = assignments || [];
  if (profile.role === "branch_admin" && profile.branch_id) {
    filteredAssignments = filteredAssignments.filter(
      (a: Assignment) => 
        (a.guard as { branch_id?: string })?.branch_id === profile.branch_id ||
        (a.place as { branch_id?: string })?.branch_id === profile.branch_id
    );
  }

  // Get stats
  const activeAssignments = filteredAssignments.filter((a: Assignment) => a.status === "active").length;
  const completedAssignments = filteredAssignments.filter((a: Assignment) => a.status === "completed").length;

  const shiftLabels: Record<string, string> = {
    day: "Day (8AM-8PM)",
    night: "Night (8PM-8AM)",
    both: "Both (24 Hours)",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            Manage guard assignments to client locations
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/assignments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAssignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedAssignments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>
            Guard duty assignments across all locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guard</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment: Assignment) => {
                  const guard = assignment.guard as { id?: string; name?: string; guard_code?: string } | null;
                  const place = assignment.place as { id?: string; name?: string; city?: string } | null;
                  
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{guard?.name || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">
                            {guard?.guard_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{place?.name || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">
                            {place?.city}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {shiftLabels[assignment.shift_type] || assignment.shift_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(assignment.start_date), "PP")}</div>
                          <div className="text-muted-foreground">
                            {assignment.end_date
                              ? `to ${format(new Date(assignment.end_date), "PP")}`
                              : "Ongoing"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            assignment.status === "active"
                              ? "default"
                              : assignment.status === "completed"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/assignments/${assignment.id}`}>
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No assignments yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first guard assignment.
              </p>
              <Button asChild>
                <Link href="/dashboard/assignments/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Assignment
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
