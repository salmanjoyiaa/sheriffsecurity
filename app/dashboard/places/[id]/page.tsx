import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EditPlaceForm from "./edit-form";

interface EditPlacePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPlacePage({ params }: EditPlacePageProps) {
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

  // Get place
  const { data: place, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !place) {
    notFound();
  }

  // Branch admin can only edit their own branch's places
  if (
    profile.role === "branch_admin" &&
    place.branch_id !== profile.branch_id
  ) {
    redirect("/dashboard/places");
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
          <Link href="/dashboard/places">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Place</h1>
          <p className="text-muted-foreground">
            Update place details for {place.name}
          </p>
        </div>
      </div>

      <EditPlaceForm
        place={place}
        branches={branches}
        isSuperAdmin={profile.role === "super_admin"}
      />
    </div>
  );
}
