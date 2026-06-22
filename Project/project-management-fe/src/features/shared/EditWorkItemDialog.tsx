import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workItemService } from '@/services/workItemService';
import { sprintService } from '@/services/sprintService';
import { epicService } from '@/services/epicService';
import type { WorkItem, Sprint, Epic } from '@/lib/types';

interface EditWorkItemDialogProps {
  workItem: WorkItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditWorkItemDialog: React.FC<EditWorkItemDialogProps> = ({
  workItem,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<WorkItem['type']>('STORY');
  const [priority, setPriority] = useState<WorkItem['priority']>('MEDIUM');
  const [status, setStatus] = useState<WorkItem['status']>('TODO');
  const [sprintId, setSprintId] = useState<WorkItem['sprintId']>(null);
  const [epicId, setEpicId] = useState<WorkItem['epicId']>(null);
  const [location, setLocation] = useState<WorkItem['location']>('BACKLOG');
  const [availableSprints, setAvailableSprints] = useState<Sprint[]>([]);
  const [availableEpics, setAvailableEpics] = useState<Epic[]>([]);
  const [initialStatus, setInitialStatus] = useState<WorkItem['status']>('TODO');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all sprints and epics for the project
        const [sprintsRes, epicsRes] = await Promise.all([
          sprintService.getByProjectId(workItem.projectId),
          epicService.getByProjectId(workItem.projectId)
        ]);

        // Filter to include active and not started sprints
        const availableSprintsData = sprintsRes.data.filter((sprint: Sprint) => 
          sprint.status === 'ACTIVE' || sprint.status === 'NOT_STARTED'
        );
        setAvailableSprints(availableSprintsData);
        setAvailableEpics(epicsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      }
    };

    if (open) {
      fetchData();
      // Initialize form with work item data
      setTitle(workItem.title);
      setDescription(workItem.description || '');
      setType(workItem.type);
      setPriority(workItem.priority);
      setStatus(workItem.status);
      setInitialStatus(workItem.status);
      setLocation(workItem.location);
      setSprintId(workItem.sprintId);
      setEpicId(workItem.epicId);
    }
  }, [open, workItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updatedWorkItem: Partial<WorkItem> = {
        title,
        description: description || null,
        type,
        priority,
        status,
        location,
        sprintId: location === 'BACKLOG' ? null : sprintId,
        projectId: workItem.projectId,
        epicId,
        storyPoints: workItem.storyPoints
      };

      await workItemService.update(workItem.id, updatedWorkItem);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Error updating work item:', err);
      setError('Failed to update work item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: WorkItem['status']) => {
    setStatus(newStatus);
    if (newStatus === 'DONE') {
      setLocation('COMPLETED');
    } else {
      setLocation(sprintId === null ? 'BACKLOG' : 'SPRINT');
    }
  };

  const getLocationDisplayValue = () => {
    if (status === 'DONE') {
      return 'Completed';
    }
    if (sprintId === null) {
      return 'Backlog';
    }
    return availableSprints.find(s => s.id === sprintId)?.name || 'Backlog';
  };

  const getEpicDisplayValue = () => {
    if (epicId === null) {
      return 'No Epic';
    }
    return availableEpics.find(e => e.id === epicId)?.title || 'No Epic';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Work Item</DialogTitle>
          <DialogDescription asChild>
            <div>
              <p>Update the details for {workItem?.title}</p>
              {initialStatus === 'DONE' && (
                <p className="mt-2 text-sm text-yellow-600">
                  Note: Status cannot be changed as this item is already completed
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: WorkItem['type']) => setType(value)}>
                <SelectTrigger disabled={loading}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STORY">Story</SelectItem>
                  <SelectItem value="BUG">Bug</SelectItem>
                  <SelectItem value="TASK">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: WorkItem['priority']) => setPriority(value)}>
                <SelectTrigger disabled={loading}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger disabled={loading || initialStatus === 'DONE'}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="epic">Epic</Label>
              <Select 
                value={epicId === null ? 'no-epic' : availableEpics.find(e => e.id === epicId)?.title || 'no-epic'}
                onValueChange={(value) => {
                  if (value === 'no-epic') {
                    setEpicId(null);
                  } else {
                    const selectedEpic = availableEpics.find(e => e.title === value);
                    if (selectedEpic) {
                      setEpicId(selectedEpic.id);
                    }
                  }
                }}
              >
                <SelectTrigger disabled={loading}>
                  <SelectValue>{getEpicDisplayValue()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-epic">No Epic</SelectItem>
                  {availableEpics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.title}>
                      {epic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprintId">Location</Label>
            <Select 
              value={status === 'DONE' ? 'completed' : (sprintId === null ? 'backlog' : availableSprints.find(s => s.id === sprintId)?.name || 'backlog')}
                onValueChange={(value) => {
                  if (value === 'backlog') {
                    setSprintId(null);
                    setLocation('BACKLOG');
                  } else if (value !== 'completed') {
                    const selectedSprint = availableSprints.find(s => s.name === value);
                    if (selectedSprint) {
                      setSprintId(selectedSprint.id);
                      setLocation('SPRINT');
                    }
                  }
                }}
              >
                <SelectTrigger disabled={status === 'DONE' || loading}>
                  <SelectValue>{getLocationDisplayValue()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {status !== 'DONE' && (
                    <>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      {availableSprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.name}>
                          {sprint.name} ({sprint.status === 'ACTIVE' ? 'Active' : 'Not Started'})
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
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
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkItemDialog; 