import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { costService } from '@/services/costService';
import { costAssignmentService } from '@/services/costAssignmentService';
import type { Cost } from '@/lib/types';

interface CreateCostAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  assignmentType: 'WORK_ITEM' | 'EPIC';
  targetId: number;
}

const CreateWorkItemCostDialog: React.FC<CreateCostAssignmentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  assignmentType,
  targetId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid amount');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (!category.trim()) {
      setError('Please enter a category');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First create the cost
      const costResponse = await costService.create({
        amount: Number(amount),
        name: name.trim(),
        category: category.trim(),
        description: description || null,
      });

      // Then create the cost assignment
      await costAssignmentService.create({
        costId: costResponse.data.id,
        [assignmentType === 'WORK_ITEM' ? 'workItemId' : 'epicId']: targetId,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Error creating cost assignment:', err);
      setError('Failed to assign cost. Please try again.');
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
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter cost name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Cost'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkItemCostDialog;