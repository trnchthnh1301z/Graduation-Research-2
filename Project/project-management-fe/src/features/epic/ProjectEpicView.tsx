import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { epicService } from '@/services/epicService.ts';
import { workItemService } from '@/services/workItemService.ts';
import { personAssignmentService } from '@/services/personAssignmentService.ts';
import { costAssignmentService } from '@/services/costAssignmentService.ts';
import EditEpicDialog from './components/EditEpicDialog.tsx';
import EpicCard from './components/EpicCard.tsx';
import CreateWorkItemDialog from '@/features/shared/CreateWorkItemDialog';

import type { WorkItem } from '@/lib/types';
import EditWorkItemDialog from '@/features/shared/EditWorkItemDialog.tsx';

interface EpicViewProps {
  projectId: number;
}

const calculateProgress = (workItems: any[]) => {
  if (workItems.length === 0) return 0;
  const completedItems = workItems.filter(item => item.status === 'DONE').length;
  return Math.round((completedItems / workItems.length) * 100);
};

const EpicView: React.FC<EpicViewProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const { projectId: paramProjectId } = useParams();
  const [epics, setEpics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEpic, setEditingEpic] = useState<any | null>(null);
  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);
  const [selectedEpicId, setSelectedEpicId] = useState<number | null>(null);
  const [isCreateWorkItemDialogOpen, setIsCreateWorkItemDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: epicsData } = await epicService.getByProjectId(projectId);
        const epicStats = await Promise.all(
          epicsData.map(async (epic: any) => {
            const [workItemsRes, epicPersonAssignmentsRes, epicCostAssignmentsRes] = await Promise.all([
              workItemService.getByEpicId(epic.id),
              personAssignmentService.getByEpicId(epic.id),
              costAssignmentService.getByEpicId(epic.id)
            ]);

            const workItems = workItemsRes.data;
            const personAssignments = epicPersonAssignmentsRes.data;
            const costAssignments = epicCostAssignmentsRes.data;

            // Get work item person assignments
            const workItemPersonAssignments = await Promise.all(
              workItems.map(workItem => personAssignmentService.getByWorkItemId(workItem.id))
            );

            // Get all unique person IDs from both epic and work item assignments
            const uniquePersonIds = new Set<number>();
            
            // Add epic-level person IDs
            personAssignments.forEach(pa => uniquePersonIds.add(pa.personId));
            
            // Add work item-level person IDs
            workItemPersonAssignments.forEach(res => {
              res.data.forEach(pa => uniquePersonIds.add(pa.personId));
            });

            const assignedPeople = uniquePersonIds.size;
            
            // Calculate progress based on work items
            const progress = calculateProgress(workItems);
            
            // Get epic-level cost assignments
            const epicCostIds = costAssignments.map((ca: any) => ca.costId);
            
            // Get work item level cost assignments
            const workItemCostAssignments = await Promise.all(
              workItems.map((workItem: any) => costAssignmentService.getByWorkItemId(workItem.id))
            );
            const workItemCostIds = workItemCostAssignments.flatMap((res: any) => 
              res.data.map((ca: any) => ca.costId)
            );

            // Combine all cost IDs and remove duplicates
            const allCostIds = [...new Set([...epicCostIds, ...workItemCostIds])];

            let totalCost = 0;
            if (allCostIds.length > 0) {
              const costResArr = await Promise.all(
                allCostIds.map((costId: number) => 
                  import('@/services/costService.ts').then(m => m.costService.getById(costId))
                )
              );
              totalCost = costResArr.reduce((sum: number, res: any) => sum + (res.data.amount || 0), 0);
            }

            return {
              ...epic,
              workItemCount: workItems.length,
              assignedPeople,
              totalCost,
              progress
            };
          })
        );
        setEpics(epicStats);
      } catch (err) {
        setEpics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const handleEpicClick = (epicId: number) => {
    navigate(`/projects/${paramProjectId}/epics/${epicId}`);
  };

  const handleEdit = (epic: any) => {
    setEditingEpic(epic);
  };

  const handleCreate = () => {
    setEditingEpic({});
  };

  const handleEditSuccess = async (updatedEpic: any) => {
    setEditingEpic(null);
    // Refresh the epics list with all calculated statistics
    const { data: epicsData } = await epicService.getByProjectId(projectId);
    const epicStats = await Promise.all(
      epicsData.map(async (epic: any) => {
        const [workItemsRes, epicPersonAssignmentsRes, epicCostAssignmentsRes] = await Promise.all([
          workItemService.getByEpicId(epic.id),
          personAssignmentService.getByEpicId(epic.id),
          costAssignmentService.getByEpicId(epic.id)
        ]);

        const workItems = workItemsRes.data;
        const personAssignments = epicPersonAssignmentsRes.data;
        const costAssignments = epicCostAssignmentsRes.data;

        // Get work item person assignments
        const workItemPersonAssignments = await Promise.all(
          workItems.map(workItem => personAssignmentService.getByWorkItemId(workItem.id))
        );

        // Get all unique person IDs from both epic and work item assignments
        const uniquePersonIds = new Set<number>();
        
        // Add epic-level person IDs
        personAssignments.forEach(pa => uniquePersonIds.add(pa.personId));
        
        // Add work item-level person IDs
        workItemPersonAssignments.forEach(res => {
          res.data.forEach(pa => uniquePersonIds.add(pa.personId));
        });

        const assignedPeople = uniquePersonIds.size;
        
        // Calculate progress based on work items
        const progress = calculateProgress(workItems);
        
        // Get epic-level cost assignments
        const epicCostIds = costAssignments.map((ca: any) => ca.costId);
        
        // Get work item level cost assignments
        const workItemCostAssignments = await Promise.all(
          workItems.map((workItem: any) => costAssignmentService.getByWorkItemId(workItem.id))
        );
        const workItemCostIds = workItemCostAssignments.flatMap((res: any) => 
          res.data.map((ca: any) => ca.costId)
        );

        // Combine all cost IDs and remove duplicates
        const allCostIds = [...new Set([...epicCostIds, ...workItemCostIds])];

        let totalCost = 0;
        if (allCostIds.length > 0) {
          const costResArr = await Promise.all(
            allCostIds.map((costId: number) => 
              import('@/services/costService').then(m => m.costService.getById(costId))
            )
          );
          totalCost = costResArr.reduce((sum: number, res: any) => sum + (res.data.amount || 0), 0);
        }

        return {
          ...epic,
          workItemCount: workItems.length,
          assignedPeople,
          totalCost,
          progress
        };
      })
    );
    setEpics(epicStats);
  };

  const handleDelete = async (epicId: number) => {
    try {
      await epicService.delete(epicId);
      setEpics(prev => prev.filter(epic => epic.id !== epicId));
    } catch (error) {
      console.error('Error deleting epic:', error);
    }
  };

  const handleCreateWorkItem = (epicId: number) => {
    setSelectedEpicId(epicId);
    setIsCreateWorkItemDialogOpen(true);
  };

  const handleWorkItemEditSuccess = async () => {
    setEditingWorkItem(null);
    // Refresh the epics list
    const { data: epicsData } = await epicService.getByProjectId(projectId);
    const epicStats = await Promise.all(
      epicsData.map(async (epic: any) => {
        const [workItemsRes, epicPersonAssignmentsRes, epicCostAssignmentsRes] = await Promise.all([
          workItemService.getByEpicId(epic.id),
          personAssignmentService.getByEpicId(epic.id),
          costAssignmentService.getByEpicId(epic.id)
        ]);

        const workItems = workItemsRes.data;
        const personAssignments = epicPersonAssignmentsRes.data;
        const costAssignments = epicCostAssignmentsRes.data;

        // Get work item person assignments
        const workItemPersonAssignments = await Promise.all(
          workItems.map(workItem => personAssignmentService.getByWorkItemId(workItem.id))
        );

        // Get all unique person IDs from both epic and work item assignments
        const uniquePersonIds = new Set<number>();
        
        // Add epic-level person IDs
        personAssignments.forEach(pa => uniquePersonIds.add(pa.personId));
        
        // Add work item-level person IDs
        workItemPersonAssignments.forEach(res => {
          res.data.forEach(pa => uniquePersonIds.add(pa.personId));
        });

        const assignedPeople = uniquePersonIds.size;
        const progress = calculateProgress(workItems);
        
        const epicCostIds = costAssignments.map((ca: any) => ca.costId);
        const workItemCostAssignments = await Promise.all(
          workItems.map((workItem: any) => costAssignmentService.getByWorkItemId(workItem.id))
        );
        const workItemCostIds = workItemCostAssignments.flatMap((res: any) => 
          res.data.map((ca: any) => ca.costId)
        );

        const allCostIds = [...new Set([...epicCostIds, ...workItemCostIds])];

        let totalCost = 0;
        if (allCostIds.length > 0) {
          const costResArr = await Promise.all(
            allCostIds.map((costId: number) => 
              import('@/services/costService').then(m => m.costService.getById(costId))
            )
          );
          totalCost = costResArr.reduce((sum: number, res: any) => sum + (res.data.amount || 0), 0);
        }

        return {
          ...epic,
          workItemCount: workItems.length,
          assignedPeople,
          totalCost,
          progress
        };
      })
    );
    setEpics(epicStats);
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading epics...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Epics</h1>
          <p className="text-gray-600">Manage project epics and track progress</p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Epic
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {epics.map((epic) => (
          <div key={epic.id} className="space-y-4">
            <EpicCard
              epic={epic}
              onClick={handleEpicClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <Button
              onClick={() => handleCreateWorkItem(epic.id)}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Work Item
            </Button>
          </div>
        ))}
      </div>

      <EditEpicDialog
        projectId={projectId}
        epic={editingEpic}
        open={!!editingEpic}
        onOpenChange={(open) => !open && setEditingEpic(null)}
        onSuccess={handleEditSuccess}
      />

      {editingWorkItem && (
        <EditWorkItemDialog
          workItem={editingWorkItem}
          open={!!editingWorkItem}
          onOpenChange={(open) => !open && setEditingWorkItem(null)}
          onSuccess={handleWorkItemEditSuccess}
        />
      )}

      <CreateWorkItemDialog
        projectId={projectId}
        open={isCreateWorkItemDialogOpen}
        onOpenChange={setIsCreateWorkItemDialogOpen}
        onSuccess={handleWorkItemEditSuccess}
        defaultEpicId={selectedEpicId}
      />
    </div>
  );
};

export default EpicView;