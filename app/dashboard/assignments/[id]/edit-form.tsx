"use client";

import { useState } from "react";
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
import { SubmitButton } from "@/components/ui/submit-button";
import { updateAssignment, deleteAssignment, endAssignment } from "../actions";
import { CalendarOff, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Guard {
  id: string;
  name: string;
  guard_code: string;
  branch_id: string;
}

interface Place {
  id: string;
  name: string;
  city: string;
  branch_id: string;
}

interface Branch {
  id: string;
  name: string;
  city: string;
}

interface Assignment {
  id: string;
  guard_id: string;
  place_id: string;
  shift_type: string;
  start_date: string;
  end_date: string | null;
  status: string;
  notes: string | null;
}

interface EditAssignmentFormProps {
  assignment: Assignment;
  guards: Guard[];
  places: Place[];
  branches: Branch[];
  isSuperAdmin: boolean;
}

export default function EditAssignmentForm({
  assignment,
  guards,
  places,
  branches,
  isSuperAdmin,
}: EditAssignmentFormProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  async function handleUpdate(formData: FormData) {
    const result = await updateAssignment(assignment.id, formData);
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
    const result = await deleteAssignment(assignment.id);
    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  }

  async function handleEnd() {
    setIsEnding(true);
    const today = format(new Date(), "yyyy-MM-dd");
    const result = await endAssignment(assignment.id, today);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Assignment ended successfully",
      });
    }
    setIsEnding(false);
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>Update assignment information</CardDescription>
          </div>
          <div className="flex gap-2">
            {assignment.status === "active" && !assignment.end_date && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isEnding}>
                    <CalendarOff className="mr-2 h-4 w-4" />
                    End Assignment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>End Assignment</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will set the end date to today and mark the assignment
                      as completed. The guard will no longer appear in attendance
                      for this place.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEnd}>
                      End Assignment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this assignment? This action
                    cannot be undone. Assignments with attendance records cannot
                    be deleted.
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
        </div>
      </CardHeader>
      <CardContent>
        <form action={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guard_id">Guard *</Label>
            <Select name="guard_id" defaultValue={assignment.guard_id} required>
              <SelectTrigger>
                <SelectValue placeholder="Select guard" />
              </SelectTrigger>
              <SelectContent>
                {isSuperAdmin ? (
                  branches.map((branch) => {
                    const branchGuards = guards.filter(
                      (g) => g.branch_id === branch.id
                    );
                    if (!branchGuards.length) return null;
                    return (
                      <div key={branch.id}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {branch.name}
                        </div>
                        {branchGuards.map((guard) => (
                          <SelectItem key={guard.id} value={guard.id}>
                            {guard.name} ({guard.guard_code})
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })
                ) : (
                  guards.map((guard) => (
                    <SelectItem key={guard.id} value={guard.id}>
                      {guard.name} ({guard.guard_code})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="place_id">Place *</Label>
            <Select name="place_id" defaultValue={assignment.place_id} required>
              <SelectTrigger>
                <SelectValue placeholder="Select place" />
              </SelectTrigger>
              <SelectContent>
                {isSuperAdmin ? (
                  branches.map((branch) => {
                    const branchPlaces = places.filter(
                      (p) => p.branch_id === branch.id
                    );
                    if (!branchPlaces.length) return null;
                    return (
                      <div key={branch.id}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {branch.name}
                        </div>
                        {branchPlaces.map((place) => (
                          <SelectItem key={place.id} value={place.id}>
                            {place.name} - {place.city}
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })
                ) : (
                  places.map((place) => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name} - {place.city}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift_type">Shift *</Label>
            <Select name="shift_type" defaultValue={assignment.shift_type} required>
              <SelectTrigger>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day Shift (8AM - 8PM)</SelectItem>
                <SelectItem value="night">Night Shift (8PM - 8AM)</SelectItem>
                <SelectItem value="both">Both (24 Hours)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={assignment.start_date}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={assignment.end_date || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={assignment.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={assignment.notes || ""}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <SubmitButton>Update Assignment</SubmitButton>
            <Button variant="outline" asChild>
              <Link href="/dashboard/assignments">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
