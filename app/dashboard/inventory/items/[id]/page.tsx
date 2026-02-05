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
import { updateInventoryItem, deleteInventoryItem } from "../../actions";
import { ArrowLeft, Trash2 } from "lucide-react";

interface Props {
  params: { id: string };
}

export default async function EditInventoryItemPage({ params }: Props) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Allow super_admin and branch_admin to edit item types
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, branch_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "super_admin" && profile.role !== "branch_admin")) {
    redirect("/dashboard/inventory");
  }

  // Fetch the item
  const { data: item, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !item) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateInventoryItem(params.id, formData);
  }

  async function handleDelete() {
    "use server";
    await deleteInventoryItem(params.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Item Type</h1>
          <p className="text-muted-foreground">
            Update inventory item category details
          </p>
        </div>
        <form action={handleDelete}>
          <Button type="submit" variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </form>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            Update the inventory item type information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Security Uniform, Walkie-Talkie"
                defaultValue={item.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select name="category" defaultValue={item.category} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Safety Gear">Safety Gear</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                  <SelectItem value="Weapon">Weapon</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tracking_type">Tracking Type *</Label>
              <Select name="tracking_type" defaultValue={item.tracking_type || "quantity"} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select tracking type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantity">Quantity Based</SelectItem>
                  <SelectItem value="serialised">Serialised (Individual Units)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose &quot;Serialised&quot; for items that need individual tracking (weapons, radios)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_quantity">Total Quantity</Label>
              <Input
                id="total_quantity"
                name="total_quantity"
                type="number"
                min="0"
                defaultValue={item.total_quantity || 0}
                placeholder="0"
              />
            </div>

            <div className="flex gap-4">
              <SubmitButton>Update Item Type</SubmitButton>
              <Button variant="outline" asChild>
                <Link href="/dashboard/inventory">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
