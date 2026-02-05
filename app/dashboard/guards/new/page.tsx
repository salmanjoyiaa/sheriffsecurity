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
import { GuardForm } from "./guard-form";

export default async function NewGuardPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Add New Guard</h1>
          <p className="text-muted-foreground">
            Register a new security guard
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Guard Details</CardTitle>
          <CardDescription>
            Enter the details for the new guard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuardForm profile={profile} branches={branches} />
        </CardContent>
      </Card>
    </div>
  );
}
