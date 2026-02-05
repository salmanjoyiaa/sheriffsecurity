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
import { ArrowLeft } from "lucide-react";
import { AssignmentForm } from "./assignment-form";

export default async function NewAssignmentPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/assignments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Assignment</h1>
          <p className="text-muted-foreground">
            Assign a guard to a client location
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>
            Select the guard, location, and shift details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentForm 
            guards={guards || []} 
            places={places || []} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
