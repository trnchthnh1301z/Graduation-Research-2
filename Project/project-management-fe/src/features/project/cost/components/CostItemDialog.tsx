import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { costService } from '@/services/costService';
import { epicService } from '@/services/epicService';
import { workItemService } from '@/services/workItemService';
import { sprintService } from '@/services/sprintService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface CostItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  costItem: {
    id: number;
    amount: number;
    category: string;
    description?: string;
    epicId?: number;
    workItemId?: number;
    sprintId?: number;
  };
  onSuccess: () => void;
}

const CostItemDialog: React.FC<CostItemDialogProps> = ({
  open,
  onOpenChange,
  costItem,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedCost, setEditedCost] = useState({
    amount: costItem.amount,
    category: costItem.category,
    description: costItem.description || '',
  });
  const [relatedData, setRelatedData] = useState<{
    epicTitle?: string;
    workItemTitle?: string;
    workItemLocation?: string;
    sprintName?: string;
    sprintDates?: { startDate: string; endDate: string };
  }>({});

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const data: typeof relatedData = {};
        
        if (costItem.epicId) {
          const epicRes = await epicService.getById(costItem.epicId);
          data.epicTitle = epicRes.data.title;
        }

        if (costItem.workItemId) {
          const workItemRes = await workItemService.getById(costItem.workItemId);
          data.workItemTitle = workItemRes.data.title;
          data.workItemLocation = workItemRes.data.location;
        }

        if (costItem.sprintId) {
          const sprintRes = await sprintService.getById(costItem.sprintId);
          data.sprintName = sprintRes.data.name;
          data.sprintDates = {
            startDate: sprintRes.data.startDate,
            endDate: sprintRes.data.endDate
          };
        }

        setRelatedData(data);
      } catch (error) {
        console.error('Error fetching related data:', error);
      }
    };

    if (open) {
      fetchRelatedData();
    }
  }, [open, costItem.epicId, costItem.workItemId, costItem.sprintId]);

  const handleEdit = async () => {
    try {
      await costService.update(costItem.id, {
        ...costItem,
        ...editedCost,
      });
      toast({
        title: 'Success',
        description: 'Cost item updated successfully',
      });
      setIsEditing(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update cost item',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await costService.delete(costItem.id);
      toast({
        title: 'Success',
        description: 'Cost item deleted successfully',
      });
      setShowDeleteConfirm(false);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete cost item',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cost Item Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              {isEditing ? (
                <Input
                  id="amount"
                  type="number"
                  value={editedCost.amount}
                  onChange={(e) => setEditedCost({ ...editedCost, amount: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              ) : (
                <div className="col-span-3">${costItem.amount.toLocaleString()}</div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              {isEditing ? (
                <Input
                  id="category"
                  value={editedCost.category}
                  onChange={(e) => setEditedCost({ ...editedCost, category: e.target.value })}
                  className="col-span-3"
                />
              ) : (
                <div className="col-span-3">{costItem.category}</div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={editedCost.description}
                  onChange={(e) => setEditedCost({ ...editedCost, description: e.target.value })}
                  className="col-span-3"
                />
              ) : (
                <div className="col-span-3">{costItem.description || 'No description'}</div>
              )}
            </div>
            {costItem.epicId && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Epic</Label>
                <div className="col-span-3">
                  {relatedData.epicTitle || 'Loading...'}
                </div>
              </div>
            )}
            {costItem.workItemId && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Work Item</Label>
                  <div className="col-span-3">
                    {relatedData.workItemTitle || 'Loading...'}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Location</Label>
                  <div className="col-span-3">
                    {relatedData.workItemLocation === 'BACKLOG' ? (
                      <span className="text-yellow-600 font-medium">Backlog</span>
                    ) : costItem.sprintId ? (
                      <span className="text-green-600 font-medium">
                        Sprint: {relatedData.sprintName || 'Loading...'}
                        {relatedData.sprintDates && (
                          <div className="text-sm text-gray-500 font-normal">
                            {formatDate(relatedData.sprintDates.startDate)} - {formatDate(relatedData.sprintDates.endDate)}
                          </div>
                        )}
                      </span>
                    ) : (
                      <span className="text-blue-600 font-medium">Epic Level</span>
                    )}
                  </div>
                </div>
              </>
            )}
            {!costItem.workItemId && costItem.sprintId && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Sprint</Label>
                <div className="col-span-3">
                  {relatedData.sprintName ? (
                    <>
                      {relatedData.sprintName}
                      {relatedData.sprintDates && (
                        <div className="text-sm text-gray-500">
                          {formatDate(relatedData.sprintDates.startDate)} - {formatDate(relatedData.sprintDates.endDate)}
                        </div>
                      )}
                    </>
                  ) : (
                    'Loading...'
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="mr-2"
              >
                Delete
              </Button>
            </div>
            <div>
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedCost({
                        amount: costItem.amount,
                        category: costItem.category,
                        description: costItem.description || '',
                      });
                    }}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEdit}>Save</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this cost item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CostItemDialog; 