import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { workItemService } from '@/services/workItemService';
import { epicService } from '@/services/epicService';
import { personAssignmentService } from '@/services/personAssignmentService';
import { costAssignmentService } from '@/services/costAssignmentService';
import EditWorkItemDialog from '@/features/shared/EditWorkItemDialog';
import WorkItemDetailCard from '@/features/epic/components/WorkItemDetailCard';
import WorkItemDetailDialog from '@/features/epic/components/WorkItemDetailDialog';
import type { WorkItem, Epic, PersonAssignment, CostAssignment } from '@/lib/types';

const EpicSummaryView = () => {
  const { projectId, epicId } = useParams();
  const navigate = useNavigate();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [epic, setEpic] = useState<Epic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorkItem, setSelectedWorkItem] = useState<number | null>(null);
  const [workItemAssignees, setWorkItemAssignees] = useState<Record<number, PersonAssignment[]>>({});
  const [workItemCosts, setWorkItemCosts] = useState<Record<number, CostAssignment[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);

  const fetchWorkItemDetails = async (workItemId: number) => {
    try {
      const [personAssignments, costAssignments] = await Promise.all([
        personAssignmentService.getByWorkItemId(workItemId),
        costAssignmentService.getByWorkItemId(workItemId)
      ]);

      setWorkItemAssignees(prev => ({
        ...prev,
        [workItemId]: personAssignments.data
      }));

      setWorkItemCosts(prev => ({
        ...prev,
        [workItemId]: costAssignments.data
      }));
    } catch (error) {
      console.error('Error fetching work item details:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!epicId) return;
      
      setLoading(true);
      try {
        const [epicResponse, workItemsResponse] = await Promise.all([
          epicService.getById(Number(epicId)),
          workItemService.getByEpicId(Number(epicId))
        ]);

        setEpic(epicResponse.data);
        setWorkItems(workItemsResponse.data);

        // Fetch assignments for all work items
        await Promise.all(
          workItemsResponse.data.map(item => fetchWorkItemDetails(item.id))
        );
      } catch (error) {
        console.error('Error fetching epic data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [epicId]);

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleWorkItemClick = (workItemId: number) => {
    setSelectedWorkItem(workItemId);
    setDialogOpen(true);
  };

  const handleDeleteWorkItem = async (workItemId: number) => {
    if (!window.confirm('Are you sure you want to delete this work item?')) {
      return;
    }

    try {
      // Delete all person assignments
      const personAssignments = workItemAssignees[workItemId] || [];
      await Promise.all(
        personAssignments.map(assignment => 
          personAssignmentService.delete(assignment.id)
        )
      );

      // Delete all cost assignments
      const costAssignments = workItemCosts[workItemId] || [];
      await Promise.all(
        costAssignments.map(assignment => 
          costAssignmentService.delete(assignment.id)
        )
      );

      // Delete the work item
      await workItemService.delete(workItemId);

      // Update state
      setWorkItems(prev => prev.filter(item => item.id !== workItemId));
      setDialogOpen(false);
      setSelectedWorkItem(null);
    } catch (error) {
      console.error('Error deleting work item:', error);
    }
  };

  const handleEditClick = (workItem: WorkItem) => {
    setEditingWorkItem(workItem);
  };

  const handleEditSuccess = async () => {
    // Refresh the work items and their details
    if (!epicId) return;

    try {
      const workItemsResponse = await workItemService.getByEpicId(Number(epicId));
      setWorkItems(workItemsResponse.data);
      await Promise.all(
        workItemsResponse.data.map(item => fetchWorkItemDetails(item.id))
      );
      setEditingWorkItem(null);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error refreshing work items:', error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading epic details...</div>;
  }

  if (!epic) {
    return <div className="text-center text-red-500">Epic not found</div>;
  }

  const selectedItem = workItems.find(item => item.id === selectedWorkItem);

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Project
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{epic.title}</h1>
          <p className="text-gray-600">{epic.description}</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Work Items</h2>
          {workItems.length === 0 ? (
            <p className="text-gray-500">No work items found for this epic.</p>
          ) : (
            <div className="space-y-4">
              {workItems.map((item) => (
                <WorkItemDetailCard
                  key={item.id}
                  workItem={item}
                  personAssignments={workItemAssignees[item.id] || []}
                  costAssignments={workItemCosts[item.id] || []}
                  onAssignmentChange={() => fetchWorkItemDetails(item.id)}
                  onClick={() => handleWorkItemClick(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <WorkItemDetailDialog
        workItem={selectedItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onEdit={handleEditClick}
        onDelete={handleDeleteWorkItem}
        onAssignmentChange={() => selectedItem && fetchWorkItemDetails(selectedItem.id)}
      />

      {editingWorkItem && (
        <EditWorkItemDialog
          workItem={editingWorkItem}
          open={!!editingWorkItem}
          onOpenChange={(open) => !open && setEditingWorkItem(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default EpicSummaryView; 