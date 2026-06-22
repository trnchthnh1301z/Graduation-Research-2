import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { sprintService } from '@/services/sprintService';
import type { Sprint } from '@/lib/types';

interface SprintFilterDialogProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSprintIds: number[];
  onSelectedSprintsChange: (sprintIds: number[]) => void;
}

interface SprintsByStatus {
  NOT_STARTED: Sprint[];
  ACTIVE: Sprint[];
  COMPLETED: Sprint[];
}

const SprintFilterDialog: React.FC<SprintFilterDialogProps> = ({
  projectId,
  open,
  onOpenChange,
  selectedSprintIds,
  onSelectedSprintsChange,
}) => {
  const [loading, setLoading] = useState(true);
  const [sprintsByStatus, setSprintsByStatus] = useState<SprintsByStatus>({
    NOT_STARTED: [],
    ACTIVE: [],
    COMPLETED: [],
  });
  const [selectedSprints, setSelectedSprints] = useState<Set<number>>(new Set(selectedSprintIds));

  useEffect(() => {
    if (open) {
      fetchSprints();
    }
  }, [open, projectId]);

  const fetchSprints = async () => {
    setLoading(true);
    try {
      const response = await sprintService.getByProjectId(projectId);
      const sprints = response.data;

      // Sort sprints by start date in descending order
      const sortedSprints = sprints.sort((a: Sprint, b: Sprint) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      // Group sprints by status
      const grouped = sortedSprints.reduce((acc: SprintsByStatus, sprint: Sprint) => {
        acc[sprint.status].push(sprint);
        return acc;
      }, { NOT_STARTED: [], ACTIVE: [], COMPLETED: [] });

      setSprintsByStatus(grouped);
    } catch (error) {
      console.error('Error fetching sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSprintToggle = (sprintId: number) => {
    const newSelected = new Set(selectedSprints);
    if (newSelected.has(sprintId)) {
      newSelected.delete(sprintId);
    } else {
      newSelected.add(sprintId);
    }
    setSelectedSprints(newSelected);
  };

  const handleSelectAllInTab = (status: keyof SprintsByStatus, checked: boolean) => {
    const newSelected = new Set(selectedSprints);
    sprintsByStatus[status].forEach((sprint) => {
      if (checked) {
        newSelected.add(sprint.id);
      } else {
        newSelected.delete(sprint.id);
      }
    });
    setSelectedSprints(newSelected);
  };

  const handleSave = () => {
    onSelectedSprintsChange(Array.from(selectedSprints));
    onOpenChange(false);
  };

  const renderSprintList = (sprints: Sprint[], status: keyof SprintsByStatus) => {
    const allSelected = sprints.every(sprint => selectedSprints.has(sprint.id));
    const someSelected = sprints.some(sprint => selectedSprints.has(sprint.id));

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`select-all-${status}`}
            checked={allSelected}
            onCheckedChange={(checked) => handleSelectAllInTab(status, checked === true)}
          />
          <Label htmlFor={`select-all-${status}`}>Select All {someSelected && !allSelected ? '(Some Selected)' : ''}</Label>
        </div>
        <div className="space-y-2">
          {sprints.map((sprint) => (
            <div key={sprint.id} className="flex items-center space-x-2">
              <Checkbox
                id={`sprint-${sprint.id}`}
                checked={selectedSprints.has(sprint.id)}
                onCheckedChange={() => handleSprintToggle(sprint.id)}
              />
              <Label htmlFor={`sprint-${sprint.id}`}>
                {sprint.name} ({new Date(sprint.startDate).toDateString()} - {new Date(sprint.endDate).toDateString()})
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sprint Filter</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="ACTIVE" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="NOT_STARTED">Not Started</TabsTrigger>
            <TabsTrigger value="ACTIVE">Active</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="NOT_STARTED" className="mt-4">
            {renderSprintList(sprintsByStatus.NOT_STARTED, 'NOT_STARTED')}
          </TabsContent>
          <TabsContent value="ACTIVE" className="mt-4">
            {renderSprintList(sprintsByStatus.ACTIVE, 'ACTIVE')}
          </TabsContent>
          <TabsContent value="COMPLETED" className="mt-4">
            {renderSprintList(sprintsByStatus.COMPLETED, 'COMPLETED')}
          </TabsContent>
        </Tabs>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SprintFilterDialog; 