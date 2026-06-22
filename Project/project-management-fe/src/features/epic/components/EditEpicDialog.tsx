import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Label } from '@/components/ui/label.tsx';
import { epicService } from '@/services/epicService.ts';

interface EditEpicDialogProps {
  projectId: number;
  epic?: any;  
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (epic: any) => void;
}

const EditEpicDialog: React.FC<EditEpicDialogProps> = ({
  projectId,
  epic,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (epic?.id) {
      setForm({
        title: epic.title,
        description: epic.description,
        startDate: epic.startDate?.split('T')[0] || '',
        endDate: epic.endDate?.split('T')[0] || '',
      });
    } else {
      setForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
      });
    }
  }, [epic]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let data;
      if (epic?.id) {
        const response = await epicService.update(epic.id, form);
        data = response.data;
      } else {
        const response = await epicService.create({
          ...form,
          projectId,
        });
        data = response.data;
      }
      onSuccess(data);
      onOpenChange(false);
    } catch (err) {
      setError(`Failed to ${epic?.id ? 'update' : 'create'} epic. Please try again.`);
      console.error(`Error ${epic?.id ? 'updating' : 'creating'} epic:`, err);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!epic?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Epic' : 'Create New Epic'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Update the details for ${epic?.title}` : 'Add a new epic to your project'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              disabled={loading}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                required
                disabled={loading}
              />
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
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Epic')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEpicDialog; 