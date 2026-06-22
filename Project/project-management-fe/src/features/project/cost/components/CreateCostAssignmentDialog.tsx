import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { epicService } from '@/services/epicService';
import { workItemService } from '@/services/workItemService';
import { costService } from '@/services/costService';
import { costAssignmentService } from '@/services/costAssignmentService';

interface CreateCostAssignmentDialogProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateCostAssignmentDialog: React.FC<CreateCostAssignmentDialogProps> = ({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    assignmentType: 'epic', // 'epic' or 'workItem'
    epicId: '',
    workItemId: '',
  });
  const [epics, setEpics] = useState<any[]>([]);
  const [workItems, setWorkItems] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [epicsRes, workItemsRes] = await Promise.all([
          epicService.getByProjectId(projectId),
          workItemService.getByProjectId(projectId),
        ]);
        setEpics(epicsRes.data);
        setWorkItems(workItemsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load epics and work items',
          variant: 'destructive',
        });
      }
    };
    if (open) {
      fetchData();
    }
  }, [open, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create the cost entry
      const costRes = await costService.create({
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description,
      });

      // 2. Create the cost assignment
      if (formData.assignmentType === 'epic' && formData.epicId) {
        await costAssignmentService.create({
          costId: costRes.data.id,
          epicId: Number(formData.epicId),
        });
      } else if (formData.assignmentType === 'workItem' && formData.workItemId) {
        await costAssignmentService.create({
          costId: costRes.data.id,
          workItemId: Number(formData.workItemId),
        });
      }

      toast({
        title: 'Success',
        description: 'Cost assignment created successfully',
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating cost assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create cost assignment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Cost</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Enter cost category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignmentType">Assign To</Label>
            <Select
              value={formData.assignmentType}
              onValueChange={(value) => setFormData({ ...formData, assignmentType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="workItem">Work Item</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.assignmentType === 'epic' && (
            <div className="space-y-2">
              <Label htmlFor="epicId">Epic</Label>
              <Select
                value={formData.epicId}
                onValueChange={(value) => setFormData({ ...formData, epicId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select epic" />
                </SelectTrigger>
                <SelectContent>
                  {epics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id.toString()}>
                      {epic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.assignmentType === 'workItem' && (
            <div className="space-y-2">
              <Label htmlFor="workItemId">Work Item</Label>
              <Select
                value={formData.workItemId}
                onValueChange={(value) => setFormData({ ...formData, workItemId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work item" />
                </SelectTrigger>
                <SelectContent>
                  {workItems.map((wi) => (
                    <SelectItem key={wi.id} value={wi.id.toString()}>
                      {wi.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Cost Assignment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCostAssignmentDialog; 