import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { personService } from '@/services/personService';

interface CreatePersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (person: any) => void;
}

const CreatePersonDialog: React.FC<CreatePersonDialogProps> = ({ open, onOpenChange, onCreate }) => {
  const [form, setForm] = useState({ name: '', email: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await personService.create(form);
      onCreate(data);
      setForm({ name: '', email: '', role: '' });
      onOpenChange(false);
    } catch (err: any) {
      setError('Failed to create person.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Person</DialogTitle>
          <DialogDescription>Fill in the details to add a new person to your organization.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input name="name" value={form.name} onChange={handleChange} required disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} required disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Input name="role" value={form.role} onChange={handleChange} required disabled={loading} />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Adding...' : 'Add Person'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePersonDialog; 