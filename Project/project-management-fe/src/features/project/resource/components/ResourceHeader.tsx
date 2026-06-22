import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface ResourceHeaderProps {
  baseFte: number;
  onBaseFteChange: (value: number) => void;
  onAssignPerson: () => void;
}

const ResourceHeader: React.FC<ResourceHeaderProps> = ({
  baseFte,
  onBaseFteChange,
  onAssignPerson,
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Allocation</h1>
          <p className="text-gray-600">Track resource allocation and hours across epics and sprints</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="baseFte" className="whitespace-nowrap">Hours per day (FTE basis):</Label>
            <Input
              id="baseFte"
              type="number"
              min="0.1"
              step="0.1"
              value={baseFte}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                if (!isNaN(newValue) && newValue > 0) {
                  onBaseFteChange(newValue);
                }
              }}
              className="w-24"
            />
          </div>
          <Button
            onClick={onAssignPerson}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Assign Person
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourceHeader; 