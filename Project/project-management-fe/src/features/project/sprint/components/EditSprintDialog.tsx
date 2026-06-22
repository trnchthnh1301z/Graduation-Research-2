import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sprintService } from '@/services/sprintService';
import { workItemService } from '@/services/workItemService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Sprint, WorkItem } from '@/lib/types';

interface EditSprintDialogProps {
  projectId: number;
  sprint?: Sprint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditSprintDialog: React.FC<EditSprintDialogProps> = ({
  projectId,
  sprint,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(sprint?.name || '');
  const [startDate, setStartDate] = useState(sprint?.startDate?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(sprint?.endDate?.split('T')[0] || '');
  const [goal, setGoal] = useState(sprint?.goal || '');
  const [targetSprintId, setTargetSprintId] = useState<number | null>(null);
  const [availableSprints, setAvailableSprints] = useState<Sprint[]>([]);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [hasIncompleteItems, setHasIncompleteItems] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sprints
        const { data: sprintsData } = await sprintService.getByProjectId(projectId);
        // Filter out current sprint and completed sprints
        const availableSprintsData = sprintsData.filter((s: Sprint) => 
          s.id !== sprint?.id && s.status !== 'COMPLETED'
        );
        setAvailableSprints(availableSprintsData);

        // Check for incomplete items if this is an active sprint
        if (sprint?.id && sprint.status === 'ACTIVE') {
          const { data: workItems } = await workItemService.getBySprintId(sprint.id);
          const incompleteItems = workItems.some((item: WorkItem) => item.status !== 'DONE');
          setHasIncompleteItems(incompleteItems);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    if (open && sprint?.status === 'ACTIVE') {
      fetchData();
    }
  }, [open, sprint, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const sprintData = {
        name,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        goal,
        projectId
      };

      if (sprint) {
        await sprintService.update(sprint.id, sprintData);
      } else {
        await sprintService.create(sprintData);
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving sprint:', err);
      setError('Failed to save sprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSprint = async () => {
    if (!sprint?.id) return;
    setLoading(true);
    setError('');

    try {
      await sprintService.start(sprint.id);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Error starting sprint:', err);
      setError('Failed to start sprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSprint = async () => {
    if (!sprint?.id) return;
    setLoading(true);
    setError('');

    try {
      if (hasIncompleteItems && targetSprintId) {
        await sprintService.completeWithTarget(sprint.id, targetSprintId);
      } else {
        await sprintService.complete(sprint.id);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Error completing sprint:', err);
      setError('Failed to complete sprint. Please try again.');
    } finally {
      setLoading(false);
      setShowCompleteDialog(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{sprint ? 'Edit Sprint' : 'Add New Sprint'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sprint Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Sprint Goal</Label>
            <Input
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (sprint ? 'Save Changes' : 'Add Sprint')}
            </Button>
          </div>

          {sprint && sprint.status === 'NOT_STARTED' && (
            <div className="flex justify-center pt-4 border-t">
              <Button
                type="button"
                onClick={handleStartSprint}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Sprint
              </Button>
            </div>
          )}

          {sprint && sprint.status === 'ACTIVE' && (
            <div className="flex flex-col items-center pt-4 border-t space-y-4">
              {!showCompleteDialog ? (
                <Button
                  type="button"
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Complete Sprint
                </Button>
              ) : (
                <div className="w-full space-y-4">
                  {hasIncompleteItems && (
                    <div className="space-y-2">
                      <Label htmlFor="targetSprint">Move incomplete items to</Label>
                      <Select
                        value={targetSprintId?.toString() || 'backlog'}
                        onValueChange={(value) => setTargetSprintId(value === 'backlog' ? null : Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target sprint" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="backlog">Move to Backlog</SelectItem>
                          {availableSprints.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name} ({s.status === 'ACTIVE' ? 'Active' : 'Not Started'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex justify-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCompleteDialog(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCompleteSprint}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? 'Completing...' : 'Confirm Complete'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSprintDialog; 