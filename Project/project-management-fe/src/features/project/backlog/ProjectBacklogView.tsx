import React, { useEffect, useState } from 'react';
import { workItemService } from '@/services/workItemService';
import { sprintService } from '@/services/sprintService';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import WorkItemTable from './components/WorkItemTable';
import EditWorkItemDialog from '@/features/shared/EditWorkItemDialog';
import CreateWorkItemDialog from '@/features/shared/CreateWorkItemDialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ProjectBacklogViewProps {
  projectId: number;
}

const ProjectBacklogView: React.FC<ProjectBacklogViewProps> = ({ projectId }) => {
  const [workItems, setWorkItems] = useState<any[]>([]);
  const [activeSprints, setActiveSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkItem, setEditingWorkItem] = useState<any | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch work items
      const { data: workItemsData } = await workItemService.getByProjectId(projectId);
      setWorkItems(workItemsData);

      // Fetch active sprints
      const { data: sprintsData } = await sprintService.getByProjectId(projectId);
      const activeSprints = sprintsData.filter((sprint: any) => sprint.status === 'ACTIVE');
      setActiveSprints(activeSprints);
    } catch (err) {
      console.error('Error fetching data:', err);
      setWorkItems([]);
      setActiveSprints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleEdit = (workItem: any) => {
    setEditingWorkItem(workItem);
  };

  const handleEditSuccess = async () => {
    setEditingWorkItem(null);
    await fetchData();
  };

  const handleDialogClose = () => {
    setEditingWorkItem(null);
  };

  const handleDelete = async (workItemId: number) => {
    if (window.confirm('Are you sure you want to delete this work item?')) {
      try {
        await workItemService.delete(workItemId);
        fetchData(); // Refresh the data
      } catch (err) {
        console.error('Error deleting work item:', err);
      }
    }
  };

  const getFilteredWorkItems = (sprintId: number | null) => {
    return workItems.filter(item => {
      const matchesSprint = sprintId === null ? !item.sprintId : item.sprintId === sprintId;
      const statusMatches = showCompleted ? true : item.status !== 'DONE';
      return matchesSprint && statusMatches;
    });
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading backlog data...</div>;
  }

  const completedCount = workItems.filter(item => !item.sprintId && item.status === 'DONE').length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backlog</h1>
          <p className="text-gray-600">Manage work items not assigned to any epic</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Work Item
        </Button>
      </div>

      {/* Active Sprints Section */}
      {activeSprints.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Sprints</h2>
          {activeSprints.map((sprint) => (
            <div key={sprint.id} className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-semibold text-gray-900">{sprint.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(sprint.startDate).toDateString()} - {new Date(sprint.endDate).toDateString()}
                  </p>
                </div>
              </div>
              <WorkItemTable
                workItems={getFilteredWorkItems(sprint.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Unassigned Work Items Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Unassigned Work Items</h2>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-completed"
              checked={showCompleted}
              onCheckedChange={setShowCompleted}
            />
            <Label htmlFor="show-completed" className="cursor-pointer">
              Show Completed ({completedCount})
            </Label>
          </div>
        </div>
        <WorkItemTable
          workItems={getFilteredWorkItems(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {editingWorkItem && (
        <EditWorkItemDialog
          workItem={editingWorkItem}
          open={!!editingWorkItem}
          onOpenChange={(open) => !open && handleDialogClose()}
          onSuccess={handleEditSuccess}
        />
      )}

      <CreateWorkItemDialog
        projectId={projectId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default ProjectBacklogView; 