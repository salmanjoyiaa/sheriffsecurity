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
import { createAssignment } from "../actions";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AssignmentFormProps {
  guards: { id: string; name: string; guard_code: string; branch_id: string }[];
  places: { id: string; name: string; city: string; branch_id: string }[];
}

async function createAssignmentAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const result = await createAssignment(formData);
  return result || null;
}

export function AssignmentForm({ guards, places }: AssignmentFormProps) {
  const [state, formAction] = useFormState(createAssignmentAction, null);

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
          <Label htmlFor="guard_id">Guard *</Label>
          <Select name="guard_id" required>
            <SelectTrigger>
              <SelectValue placeholder="Select guard" />
            </SelectTrigger>
            <SelectContent>
              {guards.map((guard) => (
                <SelectItem key={guard.id} value={guard.id}>
                  {guard.name} ({guard.guard_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="place_id">Place *</Label>
          <Select name="place_id" required>
            <SelectTrigger>
              <SelectValue placeholder="Select place" />
            </SelectTrigger>
            <SelectContent>
              {places.map((place) => (
                <SelectItem key={place.id} value={place.id}>
                  {place.name} ({place.city})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="shift_type">Shift Type *</Label>
          <Select name="shift_type" defaultValue="day" required>
            <SelectTrigger>
              <SelectValue placeholder="Select shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day (8AM - 8PM)</SelectItem>
              <SelectItem value="night">Night (8PM - 8AM)</SelectItem>
              <SelectItem value="both">Both (24 Hours)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date (Optional)</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for ongoing assignment
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional notes about this assignment"
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <SubmitButton>Create Assignment</SubmitButton>
        <Button variant="outline" asChild>
          <Link href="/dashboard/assignments">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
