import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import MarkAttendanceClient from "./mark-attendance-client";

export default async function MarkAttendancePage() {
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

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <MarkAttendanceClient
      places={places || []}
      initialDate={today}
    />
  );
}
