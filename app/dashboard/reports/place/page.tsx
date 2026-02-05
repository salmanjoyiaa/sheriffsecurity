import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PlaceReportClient from "./place-report-client";

export default async function PlaceReportPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, branch_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Fetch places based on user role
  let placesQuery = supabase
    .from("places")
    .select("id, name, city, address")
    .eq("status", "active")
    .order("name");

  if (profile.role === "branch_admin" && profile.branch_id) {
    placesQuery = placesQuery.eq("branch_id", profile.branch_id);
  }

  const { data: places } = await placesQuery;

  return <PlaceReportClient places={places || []} />;
}
