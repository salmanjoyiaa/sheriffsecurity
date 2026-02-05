import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EditGuardForm from "./edit-form";

interface EditGuardPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGuardPage({ params }: EditGuardPageProps) {
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

  // Get guard
  const { data: guard, error } = await supabase
    .from("guards")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !guard) {
    notFound();
  }

  // Branch admin can only edit their own branch's guards
  if (
    profile.role === "branch_admin" &&
    guard.branch_id !== profile.branch_id
  ) {
    redirect("/dashboard/guards");
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/guards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Guard</h1>
          <p className="text-muted-foreground">
            Update details for {guard.name} ({guard.guard_code})
          </p>
        </div>
      </div>

      <EditGuardForm
        guard={guard}
        branches={branches}
        isSuperAdmin={profile.role === "super_admin"}
      />
    </div>
  );
}
