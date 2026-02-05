"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { branchSchema, type BranchFormData } from "@/lib/validations";

export async function createBranch(data: BranchFormData) {
  try {
    const validated = branchSchema.parse(data);
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
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase.from("branches").insert({
      name: validated.name,
      city: validated.city,
      address: validated.address,
      phone: validated.phone,
    });

    if (error) {
      console.error("Error creating branch:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/branches");
    return { success: true };
  } catch (error) {
    console.error("Create branch error:", error);
    return { success: false, error: "Invalid form data" };
  }
}

export async function updateBranch(id: string, data: BranchFormData) {
  try {
    const validated = branchSchema.parse(data);
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
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("branches")
      .update({
        name: validated.name,
        city: validated.city,
        address: validated.address,
        phone: validated.phone,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating branch:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/branches");
    revalidatePath(`/dashboard/branches/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Update branch error:", error);
    return { success: false, error: "Invalid form data" };
  }
}

export async function deleteBranch(id: string) {
  try {
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
      return { success: false, error: "Unauthorized" };
    }

    // Check if branch has places or guards
    const [{ count: placeCount }, { count: guardCount }] = await Promise.all([
      supabase
        .from("places")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", id),
      supabase
        .from("guards")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", id),
    ]);

    if ((placeCount || 0) > 0 || (guardCount || 0) > 0) {
      return {
        success: false,
        error: "Cannot delete branch with existing places or guards",
      };
    }

    const { error } = await supabase.from("branches").delete().eq("id", id);

    if (error) {
      console.error("Error deleting branch:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/branches");
    return { success: true };
  } catch (error) {
    console.error("Delete branch error:", error);
    return { success: false, error: "Failed to delete branch" };
  }
}
