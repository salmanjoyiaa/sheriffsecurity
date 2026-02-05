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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Box, MapPin, Package, Plus, Radio, Shield, Shirt, User } from "lucide-react";

export default async function InventoryPage() {
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

  // Build branch filter
  const branchFilter = profile.role === "branch_admin" && profile.branch_id
    ? { branch_id: profile.branch_id }
    : {};

  // Get inventory items with branch filter
  let itemsQuery = supabase
    .from("inventory_items")
    .select("*")
    .order("category")
    .order("name");

  if (branchFilter.branch_id) {
    itemsQuery = itemsQuery.eq("branch_id", branchFilter.branch_id);
  }

  const { data: items } = await itemsQuery;

  // Get inventory units with relations
  let unitsQuery = supabase
    .from("inventory_units")
    .select(`
      *,
      item:inventory_items(id, name, category, tracking_type),
      branch:branches(id, name, city)
    `)
    .order("created_at", { ascending: false });

  if (branchFilter.branch_id) {
    unitsQuery = unitsQuery.eq("branch_id", branchFilter.branch_id);
  }

  const { data: units } = await unitsQuery;

  // Get active assignments with both guard and place info
  let assignmentsQuery = supabase
    .from("inventory_assignments")
    .select(`
      *,
      item:inventory_items(id, name, category, tracking_type),
      unit:inventory_units(id, serial_number),
      guard:guards(id, name, guard_code),
      place:places(id, name, city)
    `)
    .is("returned_at", null)
    .order("assigned_at", { ascending: false });

  if (branchFilter.branch_id) {
    assignmentsQuery = assignmentsQuery.eq("branch_id", branchFilter.branch_id);
  }

  const { data: assignments } = await assignmentsQuery;

  // Type definitions for data
  type InventoryUnit = {
    id: string;
    status: string;
    serial_number: string;
    item: { id: string; name: string; category: string; tracking_type: string } | null;
    branch: { id: string; name: string; city: string } | null;
  };

  type InventoryItem = {
    id: string;
    name: string;
    category: string;
    tracking_type: string;
    total_quantity: number | null;
  };

  type InventoryAssignment = {
    id: string;
    assigned_at: string;
    assigned_to_type: string;
    quantity: number | null;
    unit: { id: string; serial_number: string; item: { name: string; category: string } | null } | null;
    item: { id: string; name: string; category: string } | null;
    guard: { id: string; name: string; guard_code: string } | null;
    place: { id: string; name: string; city: string } | null;
  };

  // Calculate stats
  const totalItemTypes = items?.length || 0;
  const totalUnits = units?.length || 0;
  const availableUnits = (units as InventoryUnit[] | null)?.filter((u) => u.status === "available").length || 0;
  
  // Count quantity items (non-serialised)
  const quantityItems = (items as InventoryItem[] | null)?.filter((i) => i.tracking_type === "quantity") || [];
  const totalQuantityItems = quantityItems.reduce((sum: number, i) => sum + (i.total_quantity || 0), 0);

  // Count assignments by type
  const guardAssignments = (assignments as InventoryAssignment[] | null)?.filter((a) => a.assigned_to_type === "guard").length || 0;
  const placeAssignments = (assignments as InventoryAssignment[] | null)?.filter((a) => a.assigned_to_type === "place").length || 0;

  const categoryIcons: Record<string, React.ReactNode> = {
    Uniform: <Shirt className="h-4 w-4" />,
    uniform: <Shirt className="h-4 w-4" />,
    Equipment: <Package className="h-4 w-4" />,
    equipment: <Package className="h-4 w-4" />,
    Communication: <Radio className="h-4 w-4" />,
    communication: <Radio className="h-4 w-4" />,
    Weapon: <Shield className="h-4 w-4" />,
    weapon: <Shield className="h-4 w-4" />,
    "Safety Gear": <Shield className="h-4 w-4" />,
    Other: <Box className="h-4 w-4" />,
    other: <Box className="h-4 w-4" />,
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    available: "default",
    assigned: "secondary",
    maintenance: "outline",
    retired: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage equipment, uniforms, weapons, and communication devices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/inventory/items/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Item Type
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/inventory/units/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Serialised Unit
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/inventory/assign">
              <Plus className="mr-2 h-4 w-4" />
              Assign Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item Types</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItemTypes}</div>
            <p className="text-xs text-muted-foreground">Categories defined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serialised Units</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">{availableUnits} available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantity Items</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantityItems}</div>
            <p className="text-xs text-muted-foreground">Total units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guard Assigned</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{guardAssignments}</div>
            <p className="text-xs text-muted-foreground">Items to guards</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Place Assigned</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{placeAssignments}</div>
            <p className="text-xs text-muted-foreground">Items to places</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Item Types</TabsTrigger>
          <TabsTrigger value="units">Serialised Units</TabsTrigger>
          <TabsTrigger value="assignments">Active Assignments</TabsTrigger>
        </TabsList>

        {/* Item Types Tab */}
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Item Types</CardTitle>
              <CardDescription>
                Master list of all inventory items. Items can be tracked by quantity or serial number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items && items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Quantity/Units</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(items as InventoryItem[]).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {categoryIcons[item.category] || <Box className="h-4 w-4" />}
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.tracking_type === "serialised" ? "secondary" : "default"}>
                            {item.tracking_type === "serialised" ? "Serial Number" : "Quantity"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.tracking_type === "quantity" ? (
                            <span className="font-medium">{item.total_quantity || 0} units</span>
                          ) : (
                            <span className="text-muted-foreground">
                              {(units as InventoryUnit[] | null)?.filter(u => u.item?.id === item.id).length || 0} units
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/inventory/items/${item.id}`}>
                              Edit
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No item types</h3>
                  <p className="text-muted-foreground mb-4">
                    Create item types to start tracking inventory.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/inventory/items/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item Type
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Serialised Units Tab */}
        <TabsContent value="units">
          <Card>
            <CardHeader>
              <CardTitle>Serialised Units</CardTitle>
              <CardDescription>
                Individual units tracked by serial number (walkie-talkies, weapons, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {units && units.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Serial Number</TableHead>
                      {profile.role === "super_admin" && <TableHead>Branch</TableHead>}
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(units as InventoryUnit[]).map((unit) => {
                      const item = unit.item;
                      const branch = unit.branch;
                      
                      return (
                        <TableRow key={unit.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {categoryIcons[item?.category || "other"] || <Box className="h-4 w-4" />}
                              <div>
                                <div className="font-medium">{item?.name}</div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {item?.category}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono">
                              {unit.serial_number}
                            </code>
                          </TableCell>
                          {profile.role === "super_admin" && (
                            <TableCell>
                              <Badge variant="outline">{branch?.name}</Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge variant={statusColors[unit.status]}>
                              {unit.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/inventory/units/${unit.id}`}>
                                Edit
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Box className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No inventory units</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first inventory unit to get started.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/inventory/units/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Unit
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Active Assignments</CardTitle>
              <CardDescription>
                Items currently assigned to guards or places
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignments && assignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type/Serial</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(assignments as InventoryAssignment[]).map((assignment) => {
                      const unit = assignment.unit;
                      const item = assignment.item;
                      const guard = assignment.guard;
                      const place = assignment.place;

                      const itemName = unit?.item?.name || item?.name || "Unknown";
                      const itemCategory = unit?.item?.category || item?.category || "other";
                      const isGuardAssignment = assignment.assigned_to_type === "guard";

                      return (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {categoryIcons[itemCategory] || <Box className="h-4 w-4" />}
                              <div className="font-medium">{itemName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {unit?.serial_number ? (
                              <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono">
                                {unit.serial_number}
                              </code>
                            ) : (
                              <Badge variant="outline">Quantity</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isGuardAssignment ? (
                                <User className="h-4 w-4 text-blue-500" />
                              ) : (
                                <MapPin className="h-4 w-4 text-green-500" />
                              )}
                              <div>
                                <div className="font-medium">
                                  {isGuardAssignment ? guard?.name : place?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {isGuardAssignment ? guard?.guard_code : place?.city}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {assignment.quantity || 1}
                          </TableCell>
                          <TableCell>
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/dashboard/inventory/assignments/${assignment.id}/return`}
                              >
                                Return
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No active assignments</h3>
                  <p className="text-muted-foreground mb-4">
                    All inventory items are currently available.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/inventory/assign">
                      <Plus className="mr-2 h-4 w-4" />
                      Assign Item
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
