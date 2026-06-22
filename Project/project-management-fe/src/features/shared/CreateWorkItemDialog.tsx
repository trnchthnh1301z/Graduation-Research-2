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

interface CreateWorkItemDialogProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultEpicId?: number | null;
}

const CreateWorkItemDialog: React.FC<CreateWorkItemDialogProps> = ({
  projectId,
  open,
  onOpenChange,
  onSuccess,
  defaultEpicId = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<WorkItem['type']>('STORY');
  const [priority, setPriority] = useState<WorkItem['priority']>('MEDIUM');
  const [status, setStatus] = useState<WorkItem['status']>('TODO');
  const [sprintId, setSprintId] = useState<WorkItem['sprintId']>(null);
  const [epicId, setEpicId] = useState<WorkItem['epicId']>(defaultEpicId);
  const [location, setLocation] = useState<WorkItem['location']>('BACKLOG');
  const [availableSprints, setAvailableSprints] = useState<Sprint[]>([]);
  const [availableEpics, setAvailableEpics] = useState<Epic[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all sprints and epics for the project
        const [sprintsRes, epicsRes] = await Promise.all([
          sprintService.getByProjectId(projectId),
          epicService.getByProjectId(projectId)
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
      // Reset form
      setTitle('');
      setDescription('');
      setType('STORY');
      setPriority('MEDIUM');
      setStatus('TODO');
      setLocation('BACKLOG');
      setSprintId(null);
      setEpicId(defaultEpicId);
    }
  }, [open, projectId, defaultEpicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newWorkItem: Partial<WorkItem> = {
        title,
        description: description || null,
        type,
        priority,
        status,
        location,
        sprintId: location === 'BACKLOG' ? null : sprintId,
        projectId,
        epicId,
        storyPoints: 0
      };

      await workItemService.create(newWorkItem);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Error creating work item:', err);
      setError('Failed to create work item. Please try again.');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Work Item</DialogTitle>
          <DialogDescription>
            Create a new work item for your project
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

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
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger disabled={loading}>
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
              <Select value={epicId?.toString() || 'none'} onValueChange={(value) => setEpicId(value === 'none' ? null : Number(value))}>
                <SelectTrigger disabled={loading}>
                  <SelectValue placeholder="Select epic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Epic</SelectItem>
                  {availableEpics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id.toString()}>
                      {epic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {status !== 'DONE' && (
            <div className="space-y-2">
              <Label htmlFor="sprint">Sprint</Label>
              <Select value={sprintId?.toString() || 'none'} onValueChange={(value) => {
                const newSprintId = value === 'none' ? null : Number(value);
                setSprintId(newSprintId);
                setLocation(newSprintId ? 'SPRINT' : 'BACKLOG');
              }}>
                <SelectTrigger disabled={loading}>
                  <SelectValue placeholder="Select sprint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Backlog</SelectItem>
                  {availableSprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id.toString()}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              {loading ? 'Creating...' : 'Create Work Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkItemDialog; 