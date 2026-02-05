"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateGuard, deleteGuard, uploadGuardPhoto } from "../actions";
import { Camera, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Branch {
  id: string;
  name: string;
  city: string;
}

interface Guard {
  id: string;
  guard_code: string;
  name: string;
  cnic: string;
  phone: string | null;
  address: string | null;
  photo_url: string | null;
  branch_id: string;
  status: string;
  notes: string | null;
}

interface EditGuardFormProps {
  guard: Guard;
  branches: Branch[];
  isSuperAdmin: boolean;
}

export default function EditGuardForm({
  guard,
  branches,
  isSuperAdmin,
}: EditGuardFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(guard.photo_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpdate(formData: FormData) {
    const result = await updateGuard(guard.id, formData);
    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteGuard(guard.id);
    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("photo", file);

    const result = await uploadGuardPhoto(guard.id, formData);
    setIsUploading(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.url) {
      setPhotoUrl(result.url);
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Photo Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Guard Photo</CardTitle>
          <CardDescription>Upload a photo for identification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoUrl || undefined} alt={guard.name} />
              <AvatarFallback className="text-2xl">
                {guard.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Photo"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPEG, PNG, or WebP. Max 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Guard Details</CardTitle>
              <CardDescription>Update guard information</CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Guard</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{guard.name}&quot;? This
                    action cannot be undone. Guards with active assignments
                    cannot be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guard_code">Guard Code *</Label>
                <Input
                  id="guard_code"
                  name="guard_code"
                  defaultValue={guard.guard_code}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={guard.name}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC *</Label>
                <Input
                  id="cnic"
                  name="cnic"
                  defaultValue={guard.cnic}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={guard.phone || ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                defaultValue={guard.address || ""}
                rows={2}
              />
            </div>

            {isSuperAdmin ? (
              <div className="space-y-2">
                <Label htmlFor="branch_id">Branch *</Label>
                <Select name="branch_id" defaultValue={guard.branch_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <input type="hidden" name="branch_id" value={guard.branch_id} />
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={guard.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={guard.notes || ""}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <SubmitButton>Update Guard</SubmitButton>
              <Button variant="outline" asChild>
                <Link href="/dashboard/guards">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
