import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateInventoryUnit, deleteInventoryUnit, assignInventoryUnit, returnInventoryUnit } from "../../actions";
import { ArrowLeft, Trash2, UserPlus, Undo2 } from "lucide-react";

interface Props {
  params: { id: string };
}

export default async function EditInventoryUnitPage({ params }: Props) {
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

  // Fetch the unit with relations
  const { data: unit, error } = await supabase
    .from("inventory_units")
    .select(`
      *,
      item:inventory_items(id, name, category),
      branch:branches(id, name, city)
    `)
    .eq("id", params.id)
    .single();

  if (error || !unit) {
    notFound();
  }

  // Fetch inventory items for dropdown
  const { data: items } = await supabase
    .from("inventory_items")
    .select("id, name, category")
    .order("category")
    .order("name");

  type InventoryItem = { id: string; name: string; category: string };
  type Guard = { id: string; name: string; guard_code: string };

  // Fetch branches for super_admin
  let branches: { id: string; name: string; city: string }[] = [];
  if (profile.role === "super_admin") {
    const { data } = await supabase
      .from("branches")
      .select("id, name, city")
      .eq("status", "active")
      .order("name");
    branches = data || [];
  }

  // Fetch guards for assignment
  let guardsQuery = supabase
    .from("guards")
    .select("id, name, guard_code")
    .eq("status", "active")
    .order("name");

  if (profile.role === "branch_admin" && profile.branch_id) {
    guardsQuery = guardsQuery.eq("branch_id", profile.branch_id);
  }

  const { data: guards } = await guardsQuery;

  // Fetch current assignment if unit is assigned
  const { data: currentAssignment } = await supabase
    .from("inventory_assignments")
    .select(`
      *,
      guard:guards(id, name, guard_code)
    `)
    .eq("unit_id", params.id)
    .is("returned_at", null)
    .single();

  async function handleUpdate(formData: FormData): Promise<void> {
    "use server";
    const result = await updateInventoryUnit(params.id, formData);
    if (result.success) {
      redirect("/dashboard/inventory");
    }
  }

  async function handleDelete(): Promise<void> {
    "use server";
    const result = await deleteInventoryUnit(params.id);
    if (result.success) {
      redirect("/dashboard/inventory");
    }
  }

  async function handleAssign(formData: FormData): Promise<void> {
    "use server";
    formData.append("unit_id", params.id);
    const result = await assignInventoryUnit(formData);
    if (result.success) {
      redirect(`/dashboard/inventory/units/${params.id}`);
    }
  }

  async function handleReturn(): Promise<void> {
    "use server";
    if (currentAssignment) {
      const result = await returnInventoryUnit(currentAssignment.id);
      if (result.success) {
        redirect(`/dashboard/inventory/units/${params.id}`);
      }
    }
  }

  const item = unit.item as { id: string; name: string; category: string } | null;
  const branch = unit.branch as { id: string; name: string; city: string } | null;
  const assignedGuard = currentAssignment?.guard as { id: string; name: string; guard_code: string } | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Unit</h1>
          <p className="text-muted-foreground">
            {item?.name} - {unit.serial_number}
          </p>
        </div>
        {!currentAssignment && (
          <form action={handleDelete}>
            <Button type="submit" variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </form>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Unit Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Unit Details</CardTitle>
            <CardDescription>
              Update the inventory unit information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="item_id">Item Type *</Label>
                <Select name="item_id" defaultValue={unit.item_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(items as InventoryItem[] | null)?.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name} ({i.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number *</Label>
                <Input
                  id="serial_number"
                  name="serial_number"
                  defaultValue={unit.serial_number}
                  required
                />
              </div>

              {profile.role === "super_admin" ? (
                <div className="space-y-2">
                  <Label htmlFor="branch_id">Branch *</Label>
                  <Select name="branch_id" defaultValue={unit.branch_id} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} ({b.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <input type="hidden" name="branch_id" value={unit.branch_id} />
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={unit.status} disabled={!!currentAssignment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
                {currentAssignment && (
                  <p className="text-xs text-muted-foreground">
                    Status cannot be changed while unit is assigned
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <SubmitButton>Update Unit</SubmitButton>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/inventory">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Assignment Card */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
            <CardDescription>
              {currentAssignment ? "Currently assigned to a guard" : "Assign this unit to a guard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentAssignment ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{assignedGuard?.name}</p>
                      <p className="text-sm text-muted-foreground">{assignedGuard?.guard_code}</p>
                    </div>
                    <Badge>Assigned</Badge>
                  </div>
                  <Separator className="my-3" />
                  <p className="text-sm text-muted-foreground">
                    Assigned on: {new Date(currentAssignment.assigned_at).toLocaleDateString()}
                  </p>
                </div>
                <form action={handleReturn}>
                  <Button type="submit" variant="outline" className="w-full">
                    <Undo2 className="mr-2 h-4 w-4" />
                    Return Unit
                  </Button>
                </form>
              </div>
            ) : unit.status === "available" ? (
              <form action={handleAssign} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guard_id">Assign to Guard *</Label>
                  <Select name="guard_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select guard" />
                    </SelectTrigger>
                    <SelectContent>
                      {(guards as Guard[] | null)?.map((guard) => (
                        <SelectItem key={guard.id} value={guard.id}>
                          {guard.name} ({guard.guard_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <input type="hidden" name="assigned_to_type" value="guard" />
                <SubmitButton className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Unit
                </SubmitButton>
              </form>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Unit is not available for assignment.</p>
                <p className="text-sm">Current status: <Badge variant="outline">{unit.status}</Badge></p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
