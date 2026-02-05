import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditBranchForm } from "./edit-form";

interface BranchPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBranchPage({ params }: BranchPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check if user is super_admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id || "")
    .single();

  if (profile?.role !== "super_admin") {
    redirect("/dashboard");
  }

  const { data: branch } = await supabase
    .from("branches")
    .select("*")
    .eq("id", id)
    .single();

  if (!branch) {
    notFound();
  }

  return <EditBranchForm branch={branch} />;
}
