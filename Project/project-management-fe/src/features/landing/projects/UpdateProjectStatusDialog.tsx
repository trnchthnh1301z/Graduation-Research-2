import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { projectService } from '@/services/projectService.ts';

interface UpdateProjectStatusDialogProps {
  project: {
    id: number;
    title: string;
    status: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedProject: any) => void;
}

const UpdateProjectStatusDialog: React.FC<UpdateProjectStatusDialogProps> = ({
  project,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [status, setStatus] = useState(project.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await projectService.update(project.id, { status: status.toUpperCase() });
      onSuccess(data);
      onOpenChange(false);
    } catch (err) {
      setError('Failed to update project status. Please try again.');
      console.error('Error updating project status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Project Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Project: {project.title}</p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select 
                value={status} 
                onValueChange={setStatus}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProjectStatusDialog; 