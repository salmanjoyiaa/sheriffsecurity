"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Loader2, MapPin, Package, User } from "lucide-react";
import { assignInventoryUnit } from "../actions";
import { useToast } from "@/components/ui/use-toast";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  tracking_type: string;
  total_quantity: number | null;
};

type InventoryUnit = {
  id: string;
  serial_number: string;
  status: string;
  item_id: string;
};

type Guard = {
  id: string;
  name: string;
  guard_code: string;
};

type Place = {
  id: string;
  name: string;
  city: string;
};

export default function AssignInventoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);

  // Form state
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [assignToType, setAssignToType] = useState<"guard" | "place">("guard");
  const [selectedGuard, setSelectedGuard] = useState<string>("");
  const [selectedPlace, setSelectedPlace] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");

  // Get selected item details
  const selectedItemData = items.find((i) => i.id === selectedItem);
  const isSerialisedItem = selectedItemData?.tracking_type === "serialised";
  const maxQuantity = selectedItemData?.total_quantity || 0;

  // Filter available units for the selected item
  const availableUnits = units.filter(
    (u) => u.item_id === selectedItem && u.status === "available"
  );

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Get user profile
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, branch_id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        setError("Profile not found");
        setLoading(false);
        return;
      }

      const branchFilter =
        profile.role === "branch_admin" && profile.branch_id
          ? { branch_id: profile.branch_id }
          : {};

      // Fetch all data in parallel
      const [itemsRes, unitsRes, guardsRes, placesRes] = await Promise.all([
        supabase
          .from("inventory_items")
          .select("id, name, category, tracking_type, total_quantity")
          .match(branchFilter)
          .order("name"),
        supabase
          .from("inventory_units")
          .select("id, serial_number, status, item_id")
          .eq("status", "available")
          .match(branchFilter)
          .order("serial_number"),
        supabase
          .from("guards")
          .select("id, name, guard_code")
          .eq("status", "active")
          .match(branchFilter)
          .order("name"),
        supabase
          .from("places")
          .select("id, name, city")
          .eq("status", "active")
          .match(branchFilter)
          .order("name"),
      ]);

      setItems((itemsRes.data as InventoryItem[]) || []);
      setUnits((unitsRes.data as InventoryUnit[]) || []);
      setGuards((guardsRes.data as Guard[]) || []);
      setPlaces((placesRes.data as Place[]) || []);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  // Reset unit selection when item changes
  useEffect(() => {
    setSelectedUnit("");
    setQuantity(1);
  }, [selectedItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedItem) {
      setError("Please select an item");
      return;
    }

    if (isSerialisedItem && !selectedUnit) {
      setError("Please select a unit");
      return;
    }

    if (!isSerialisedItem && quantity < 1) {
      setError("Please enter a valid quantity");
      return;
    }

    if (!isSerialisedItem && quantity > maxQuantity) {
      setError(`Only ${maxQuantity} units available`);
      return;
    }

    if (assignToType === "guard" && !selectedGuard) {
      setError("Please select a guard");
      return;
    }

    if (assignToType === "place" && !selectedPlace) {
      setError("Please select a place");
      return;
    }

    const formData = new FormData();
    if (isSerialisedItem) {
      formData.set("unit_id", selectedUnit);
    } else {
      formData.set("item_id", selectedItem);
      formData.set("quantity", quantity.toString());
    }
    formData.set("assigned_to_type", assignToType);
    if (assignToType === "guard") {
      formData.set("guard_id", selectedGuard);
    } else {
      formData.set("place_id", selectedPlace);
    }
    if (notes) {
      formData.set("notes", notes);
    }

    startTransition(async () => {
      const result = await assignInventoryUnit(formData);
      if (result?.error) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Success",
          description: "Item assigned successfully",
        });
        router.push("/dashboard/inventory");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assign Inventory</h1>
          <p className="text-muted-foreground">
            Assign items to guards or places
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>
            Select an item and assign it to a guard or place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            {/* Item Selection */}
            <div className="space-y-2">
              <Label htmlFor="item">Item Type *</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger id="item">
                  <SelectValue placeholder="Select an item type" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>{item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({item.tracking_type === "serialised" 
                            ? `${availableUnits.filter(u => u.item_id === item.id).length} units` 
                            : `${item.total_quantity || 0} available`})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* For Serialised Items: Unit Selection */}
            {selectedItem && isSerialisedItem && (
              <div className="space-y-2">
                <Label htmlFor="unit">Select Unit (Serial Number) *</Label>
                {availableUnits.length > 0 ? (
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          <code className="font-mono">{unit.serial_number}</code>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No available units for this item. All units are assigned.
                  </p>
                )}
              </div>
            )}

            {/* For Quantity Items: Quantity Input */}
            {selectedItem && !isSerialisedItem && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">
                  {maxQuantity} available
                </p>
              </div>
            )}

            {/* Assign To Type */}
            <div className="space-y-3">
              <Label>Assign To *</Label>
              <RadioGroup
                value={assignToType}
                onValueChange={(v) => setAssignToType(v as "guard" | "place")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="guard" id="guard" />
                  <Label htmlFor="guard" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4 text-blue-500" />
                    Guard
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="place" id="place" />
                  <Label htmlFor="place" className="flex items-center gap-2 cursor-pointer">
                    <MapPin className="h-4 w-4 text-green-500" />
                    Place
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Guard Selection */}
            {assignToType === "guard" && (
              <div className="space-y-2">
                <Label htmlFor="guard_select">Select Guard *</Label>
                <Select value={selectedGuard} onValueChange={setSelectedGuard}>
                  <SelectTrigger id="guard_select">
                    <SelectValue placeholder="Select a guard" />
                  </SelectTrigger>
                  <SelectContent>
                    {guards.map((guard) => (
                      <SelectItem key={guard.id} value={guard.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{guard.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({guard.guard_code})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Place Selection */}
            {assignToType === "place" && (
              <div className="space-y-2">
                <Label htmlFor="place_select">Select Place *</Label>
                <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                  <SelectTrigger id="place_select">
                    <SelectValue placeholder="Select a place" />
                  </SelectTrigger>
                  <SelectContent>
                    {places.map((place) => (
                      <SelectItem key={place.id} value={place.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{place.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({place.city})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this assignment..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Item
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/inventory">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
