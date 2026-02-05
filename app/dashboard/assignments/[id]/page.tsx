import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EditAssignmentForm from "./edit-form";

interface EditAssignmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAssignmentPage({ params }: EditAssignmentPageProps) {
  const { id } = await params;
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

  // Get assignment
  const { data: assignment, error } = await supabase
    .from("assignments")
    .select(`
      *,
      guard:guards(name, guard_code),
      place:places(name, city)
    `)
    .eq("id", id)
    .single();

  if (error || !assignment) {
    notFound();
  }

  // Get active guards
  let guardsQuery = supabase
    .from("guards")
    .select("id, name, guard_code, branch_id")
    .eq("status", "active")
    .order("name");

  if (profile.role === "branch_admin" && profile.branch_id) {
    guardsQuery = guardsQuery.eq("branch_id", profile.branch_id);
  }

  const { data: guards } = await guardsQuery;

  // Get active places
  let placesQuery = supabase
    .from("places")
    .select("id, name, city, branch_id")
    .eq("status", "active")
    .order("name");

  if (profile.role === "branch_admin" && profile.branch_id) {
    placesQuery = placesQuery.eq("branch_id", profile.branch_id);
  }

  const { data: places } = await placesQuery;

  // Get branches for super_admin
  let branches: { id: string; name: string; city: string }[] = [];
  if (profile.role === "super_admin") {
    const { data } = await supabase
      .from("branches")
      .select("id, name, city")
      .eq("status", "active")
      .order("name");
    branches = data || [];
  }

  const guard = assignment.guard as { name: string; guard_code: string } | null;
  const place = assignment.place as { name: string; city: string } | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/assignments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Assignment</h1>
          <p className="text-muted-foreground">
            {guard?.name} at {place?.name}
          </p>
        </div>
      </div>

      <EditAssignmentForm
        assignment={assignment}
        guards={guards || []}
        places={places || []}
        branches={branches}
        isSuperAdmin={profile.role === "super_admin"}
      />
    </div>
  );
}
