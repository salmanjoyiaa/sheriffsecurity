import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";
import { getCompanySettings, getUserProfile } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const isSuperAdmin = profile.role === "super_admin";

  // Fetch data in parallel
  const [companySettingsResult, userProfileResult] = await Promise.all([
    isSuperAdmin ? getCompanySettings() : Promise.resolve({ data: null }),
    getUserProfile(),
  ]);

  if (userProfileResult.error || !userProfileResult.data) {
    redirect("/login");
  }

  return (
    <SettingsClient
      companySettings={companySettingsResult.data || null}
      userProfile={userProfileResult.data}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
