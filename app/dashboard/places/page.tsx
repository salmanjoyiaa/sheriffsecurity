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
import { Building2, MapPin, Plus } from "lucide-react";

interface Place {
  id: string;
  name: string;
  address: string;
  city: string;
  contact_person: string | null;
  contact_phone: string | null;
  status: string;
  guards_required: number;
  branch_id: string;
  branch?: { name: string } | null;
}

export default async function PlacesPage() {
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

  // Get places with branch info
  let query = supabase
    .from("places")
    .select(`
      *,
      branch:branches(name, city)
    `)
    .order("created_at", { ascending: false });

  // Branch admin can only see their branch's places
  if (profile.role === "branch_admin" && profile.branch_id) {
    query = query.eq("branch_id", profile.branch_id);
  }

  const { data: places, error } = await query;

  if (error) {
    console.error("Error fetching places:", error);
  }

  // Get stats
  const activePlaces = places?.filter((p: { status: string }) => p.status === "active").length || 0;
  const inactivePlaces = places?.filter((p: { status: string }) => p.status === "inactive").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Places</h1>
          <p className="text-muted-foreground">
            Manage client locations and service sites
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/places/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Place
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Places</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{places?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePlaces}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Building2 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inactivePlaces}</div>
          </CardContent>
        </Card>
      </div>

      {/* Places Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Places</CardTitle>
          <CardDescription>
            A list of all client locations and service sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {places && places.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Contact</TableHead>
                  {profile.role === "super_admin" && <TableHead>Branch</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {places.map((place: Place) => (
                  <TableRow key={place.id}>
                    <TableCell>
                      <div className="font-medium">{place.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                        {place.address}
                      </div>
                    </TableCell>
                    <TableCell>{place.city}</TableCell>
                    <TableCell>
                      {place.contact_person ? (
                        <div>
                          <div className="text-sm">{place.contact_person}</div>
                          <div className="text-sm text-muted-foreground">
                            {place.contact_phone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {profile.role === "super_admin" && (
                      <TableCell>
                        <Badge variant="outline">
                          {(place.branch as { name: string; code: string })?.name || "N/A"}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={place.status === "active" ? "default" : "secondary"}
                      >
                        {place.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/places/${place.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No places yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first client location.
              </p>
              <Button asChild>
                <Link href="/dashboard/places/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Place
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
