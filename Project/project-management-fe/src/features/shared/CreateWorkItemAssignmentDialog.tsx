import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { personService } from '@/services/personService';
import { personAssignmentService } from '@/services/personAssignmentService';
import type { Person } from '@/lib/types';

interface CreatePersonAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  assignmentType: 'WORK_ITEM' | 'EPIC';
  targetId: number;
}

const CreateWorkItemAssignmentDialog: React.FC<CreatePersonAssignmentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  assignmentType,
  targetId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [hours, setHours] = useState<number>(0);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await personService.getAll();
        setPeople(response.data);
      } catch (err) {
        console.error('Error fetching people:', err);
        setError('Failed to load people. Please try again.');
      }
    };

    if (open) {
      fetchPeople();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId) {
      setError('Please select a person to assign');
      return;
    }

    if (hours <= 0) {
      setError('Please enter a valid number of hours');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await personAssignmentService.create({
        personId: Number(selectedPersonId),
        [assignmentType === 'WORK_ITEM' ? 'workItemId' : 'epicId']: targetId,
        hours: hours,
        description: description || null,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Error creating person assignment:', err);
      setError('Failed to assign person. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Person</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="person">Select Person</Label>
            <Select
              value={selectedPersonId}
              onValueChange={setSelectedPersonId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a person" />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id.toString()}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">Hours Assigned</Label>
            <Input
              id="hours"
              type="number"
              min="0"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              placeholder="Enter hours"
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
              {loading ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkItemAssignmentDialog;