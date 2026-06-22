import React, { useEffect, useState } from 'react';
import { sprintService } from '@/services/sprintService';
import { workItemService } from '@/services/workItemService';
import EditSprintDialog from './components/EditSprintDialog';
import WorkItemCard from '../backlog/components/WorkItemCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditWorkItemDialog from '@/features/shared/EditWorkItemDialog';

interface ProjectActiveSprintViewProps {
  projectId: number;
}

const ProjectSprintView: React.FC<ProjectActiveSprintViewProps> = ({ projectId }) => {
  const [workItems, setWorkItems] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkItem, setEditingWorkItem] = useState<any | null>(null);
  const [editingSprint, setEditingSprint] = useState<any | null>(null);
  const [sprintFilter, setSprintFilter] = useState<'NOT_STARTED' | 'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all sprints for the project
      const { data: sprintsData } = await sprintService.getByProjectId(projectId);
      setSprints(sprintsData);
      
      // Fetch work items for filtered sprints
      const filteredSprints = filterSprints(sprintsData);
      const workItemsPromises = filteredSprints.map(sprint => 
        workItemService.getBySprintId(sprint.id)
      );
      const workItemsResponses = await Promise.all(workItemsPromises);
      const allWorkItems = workItemsResponses.flatMap(response => response.data);
      setWorkItems(allWorkItems);
    } catch (err) {
      console.error('Error fetching data:', err);
      setSprints([]);
      setWorkItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, sprintFilter]);

  const filterSprints = (sprintsToFilter: any[]) => {
    if (sprintFilter === 'ALL') return sprintsToFilter;
    
    return sprintsToFilter.filter(sprint => {
      if (sprintFilter === 'ACTIVE') {
        return sprint.status === 'ACTIVE';
      } else if (sprintFilter === 'NOT_STARTED') {
        return sprint.status === 'NOT_STARTED';
      } else {
        return sprint.status === 'COMPLETED';
      }
    });
  };

  const handleEdit = (workItem: any) => {
    setEditingWorkItem(workItem);
  };

  const handleEditSuccess = async () => {
    setEditingWorkItem(null);
    await fetchData();
  };

  const handleSprintStatusChange = (sprint: any) => {
    setEditingSprint(sprint);
  };

  const handleSprintEditSuccess = async () => {
    setEditingSprint(null);
    await fetchData();
  };

  const handleDelete = async (workItemId: number) => {
    if (window.confirm('Are you sure you want to delete this work item?')) {
      try {
        await workItemService.delete(workItemId);
        setWorkItems(workItems.filter(item => item.id !== workItemId));
      } catch (err) {
        console.error('Error deleting work item:', err);
      }
    }
  };

  const getWorkItemsBySprintAndStatus = (sprintId: number, status: string) => {
    return workItems.filter(item => 
      item.sprintId === sprintId && item.status === status
    );
  };

  const getSprintStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return {
          className: "bg-gray-50 text-gray-700 border-gray-200 cursor-pointer hover:bg-gray-100",
          children: "Not Started"
        };
      case 'ACTIVE':
        return {
          className: "bg-green-50 text-green-700 border-green-200 cursor-pointer hover:bg-green-100",
          children: "Active"
        };
      case 'COMPLETED':
        return {
          className: "bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100",
          children: "Completed"
        };
      default:
        return {
          className: "bg-gray-50 text-gray-700 border-gray-200",
          children: status
        };
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading sprint data...</div>;
  }

  const filteredSprints = filterSprints(sprints);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sprints</h1>
          <p className="text-gray-600">Manage and track sprints</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={sprintFilter} onValueChange={(value: any) => setSprintFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter sprints" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sprints</SelectItem>
              <SelectItem value="NOT_STARTED">Not Started</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setEditingSprint({})}>
            <Plus className="w-4 h-4 mr-2" />
            New Sprint
          </Button>
        </div>
      </div>

      {filteredSprints.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No sprints found
        </div>
      ) : (
        <div className="space-y-8">
          {filteredSprints.map((sprint) => (
            <div key={sprint.id} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{sprint.name}</h2>
                    <p className="text-sm text-gray-500">
                      {new Date(sprint.startDate).toDateString()} - {new Date(sprint.endDate).toDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    {...getSprintStatusBadgeProps(sprint.status)}
                    onClick={() => handleSprintStatusChange(sprint)}
                  />
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* To Do Column */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">TO DO</h3>
                      <Badge variant="outline" className="bg-gray-800 text-white border-gray-800">
                        {getWorkItemsBySprintAndStatus(sprint.id, 'TODO').length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {getWorkItemsBySprintAndStatus(sprint.id, 'TODO').map((workItem) => (
                        <WorkItemCard 
                          key={workItem.id} 
                          workItem={workItem}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">IN PROGRESS</h3>
                      <Badge variant="outline" className="bg-blue-600 text-white border-blue-600">
                        {getWorkItemsBySprintAndStatus(sprint.id, 'IN_PROGRESS').length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {getWorkItemsBySprintAndStatus(sprint.id, 'IN_PROGRESS').map((workItem) => (
                        <WorkItemCard 
                          key={workItem.id} 
                          workItem={workItem}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Done Column */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">DONE</h3>
                      <Badge variant="outline" className="bg-green-800 text-white border-green-800">
                        {getWorkItemsBySprintAndStatus(sprint.id, 'DONE').length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {getWorkItemsBySprintAndStatus(sprint.id, 'DONE').map((workItem) => (
                        <WorkItemCard 
                          key={workItem.id} 
                          workItem={workItem}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingWorkItem && (
        <EditWorkItemDialog
          workItem={editingWorkItem}
          open={!!editingWorkItem}
          onOpenChange={(open) => !open && setEditingWorkItem(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {editingSprint && (
        <EditSprintDialog
          projectId={projectId}
          sprint={editingSprint.id ? editingSprint : undefined}
          open={!!editingSprint}
          onOpenChange={(open) => !open && setEditingSprint(null)}
          onSuccess={handleSprintEditSuccess}
        />
      )}
    </div>
  );
};

export default ProjectSprintView;