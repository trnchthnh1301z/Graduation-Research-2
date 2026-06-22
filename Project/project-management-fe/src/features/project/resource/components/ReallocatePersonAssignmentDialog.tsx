import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workItemService } from '@/services/workItemService';
import { personAssignmentService } from '@/services/personAssignmentService';
import type { WorkItem, PersonAssignment } from '@/lib/types';

interface ReallocatePersonAssignmentDialogProps {
  epicId: number;
  personId: number;
  personName: string;
  epicAssignment: PersonAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ReallocatePersonAssignmentDialog: React.FC<ReallocatePersonAssignmentDialogProps> = ({
  epicId,
  personId,
  personName,
  epicAssignment,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<number | null>(null);
  const [hours, setHours] = useState<string>('');
  const [remainingHours, setRemainingHours] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<{
    hoursToAllocate: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: workItemsData } = await workItemService.getByEpicId(epicId);
        setWorkItems(workItemsData);
      } catch (err) {
        console.error('Error fetching work items:', err);
        setError('Failed to load work items. Please try again.');
      }
    };

    if (open && epicAssignment) {
      fetchData();
      // Reset form
      setSelectedWorkItemId(null);
      setHours('');
      setRemainingHours(epicAssignment.hours);
      setError(null);
      setShowWarning(false);
      setPendingSubmit(null);
    }
  }, [open, epicId, epicAssignment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epicAssignment) {
      setError('Invalid assignment data');
      return;
    }

    const hoursToAllocate = Number(hours);
    
    if (hoursToAllocate > remainingHours) {
      const confirmed = window.confirm(
        `You are about to allocate ${hoursToAllocate}h, which is more than the remaining ${remainingHours}h. This will remove the epic-level assignment completely. Are you sure you want to continue?`
      );
      if (!confirmed) {
        return;
      }
    }

    await processReallocation(hoursToAllocate);
  };

  const processReallocation = async (hoursToAllocate: number) => {
    setLoading(true);
    setError(null);

    try {
      // Check for existing work item assignment
      const { data: existingAssignments } = await personAssignmentService.getByWorkItemId(selectedWorkItemId!);
      const existingWorkItemAssignment = existingAssignments.find(
        (pa: PersonAssignment) => pa.personId === personId && pa.workItemId === selectedWorkItemId
      );

      // Update or create work item assignment
      if (existingWorkItemAssignment) {
        await personAssignmentService.update(existingWorkItemAssignment.id, {
          ...existingWorkItemAssignment,
          hours: existingWorkItemAssignment.hours + hoursToAllocate,
          description: `${existingWorkItemAssignment.description || ''}\nAdded ${hoursToAllocate}h from epic assignment`,
        });
      } else {
      await personAssignmentService.create({
        personId,
        workItemId: selectedWorkItemId,
        epicId: null,
        hours: hoursToAllocate,
        description: `Reallocated ${hoursToAllocate}h from epic assignment`,
      });
      }

      // Update epic assignment with remaining hours
      const newRemainingHours = Math.max(remainingHours - hoursToAllocate, 0);
      if (newRemainingHours > 0) {
        await personAssignmentService.update(epicAssignment!.id, {
          ...epicAssignment,
          hours: newRemainingHours,
        });
      } else if (newRemainingHours === 0) {
        // Only delete if exactly 0 hours remain
        await personAssignmentService.delete(epicAssignment!.id);
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error reallocating hours:', err);
      setError(err.message || 'Failed to reallocate hours. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!epicAssignment) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reallocate Hours</DialogTitle>
          <DialogDescription>
            Reallocate hours from epic assignment to a specific work item for {personName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Available Hours</Label>
            <div className="text-sm text-gray-600">{remainingHours}h remaining from epic assignment</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workItem">Work Item</Label>
            <Select
              value={selectedWorkItemId?.toString() || ''}
              onValueChange={(value) => setSelectedWorkItemId(Number(value))}
            >
              <SelectTrigger disabled={loading}>
                <SelectValue placeholder="Select work item" />
              </SelectTrigger>
              <SelectContent>
                {workItems.map((workItem) => (
                  <SelectItem key={workItem.id} value={workItem.id.toString()}>
                    {workItem.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Hours to Allocate</Label>
            <Input
              id="hours"
              type="number"
              step="0.1"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || !selectedWorkItemId || !hours}
            >
              {loading ? 'Reallocating...' : 'Reallocate Hours'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReallocatePersonAssignmentDialog; 