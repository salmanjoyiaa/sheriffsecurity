"use client";

import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
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
import { SubmitButton } from "@/components/ui/submit-button";
import { createGuard } from "../actions";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface GuardFormProps {
  profile: {
    role: string;
    branch_id: string | null;
  };
  branches: { id: string; name: string; city: string }[];
}

async function createGuardAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const result = await createGuard(formData);
  return result || null;
}

export function GuardForm({ profile, branches }: GuardFormProps) {
  const [state, formAction] = useFormState(createGuardAction, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="guard_code">Guard Code *</Label>
          <Input
            id="guard_code"
            name="guard_code"
            placeholder="e.g., LDN-001"
            required
          />
          <p className="text-xs text-muted-foreground">
            Unique identifier within the branch
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Muhammad Ahmad"
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
            placeholder="XXXXX-XXXXXXX-X"
            required
          />
          <p className="text-xs text-muted-foreground">
            13-digit national ID number
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="03XX-XXXXXXX"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          placeholder="Full residential address"
          rows={2}
        />
      </div>

      {profile.role === "super_admin" ? (
        <div className="space-y-2">
          <Label htmlFor="branch_id">Branch *</Label>
          <Select name="branch_id" required>
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
        <input type="hidden" name="branch_id" value={profile.branch_id || ""} />
      )}

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue="active">
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
          placeholder="Additional notes about this guard"
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <SubmitButton>Create Guard</SubmitButton>
        <Button variant="outline" asChild>
          <Link href="/dashboard/guards">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
