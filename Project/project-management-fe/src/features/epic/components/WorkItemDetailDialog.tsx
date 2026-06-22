import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, UserPlus, DollarSign } from 'lucide-react';
import type { WorkItem } from '@/lib/types';
import CreateWorkItemAssignmentDialog from '@/features/shared/CreateWorkItemAssignmentDialog.tsx';
import CreateWorkItemCostDialog from '@/features/shared/CreateWorkItemCostDialog.tsx';
import { personAssignmentService } from '@/services/personAssignmentService';
import { costAssignmentService } from '@/services/costAssignmentService';
import { personService } from '@/services/personService';
import { costService } from '@/services/costService';
import { Badge } from '@/components/ui/badge';

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Cost {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  category: string;
}

interface PersonAssignment {
  id: number;
  personId: number;
  workItemId: number;
  hours: number;
  description: string | null;
  person?: Person;
}

interface CostAssignment {
  id: number;
  costId: number;
  workItemId: number;
  cost?: Cost;
}

interface WorkItemDetailDialogProps {
  workItem: WorkItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (workItem: WorkItem) => void;
  onDelete: (workItemId: number) => void;
  onAssignmentChange: () => void;
}

const WorkItemDetailDialog: React.FC<WorkItemDetailDialogProps> = ({
  workItem,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onAssignmentChange,
}) => {
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false);
  const [personAssignments, setPersonAssignments] = useState<PersonAssignment[]>([]);
  const [costAssignments, setCostAssignments] = useState<CostAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!workItem) return;
      
      setLoading(true);
      try {
        // Fetch assignments
        const [personRes, costRes] = await Promise.all([
          personAssignmentService.getByWorkItemId(workItem.id),
          costAssignmentService.getByWorkItemId(workItem.id),
        ]);

        const personAssignmentsData = personRes.data;
        const costAssignmentsData = costRes.data;

        // Fetch person details for each assignment
        const personAssignmentsWithDetails = await Promise.all(
          personAssignmentsData.map(async (assignment) => {
            const personRes = await personService.getById(assignment.personId);
            return {
              ...assignment,
              person: personRes.data,
            };
          })
        );

        // Fetch cost details for each assignment
        const costAssignmentsWithDetails = await Promise.all(
          costAssignmentsData.map(async (assignment) => {
            const costRes = await costService.getById(assignment.costId);
            return {
              ...assignment,
              cost: costRes.data,
            };
          })
        );

        setPersonAssignments(personAssignmentsWithDetails);
        setCostAssignments(costAssignmentsWithDetails);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && workItem) {
      fetchAssignments();
    }
  }, [open, workItem]);

  if (!workItem) return null;

  const totalCost = costAssignments.reduce((sum, ca) => {
    const costAmount = ca.cost?.amount || 0;
    return sum + costAmount;
  }, 0);

  const totalHours = personAssignments.reduce((sum, pa) => sum + pa.hours, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <DialogTitle>{workItem.title}</DialogTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(workItem)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setIsPersonDialogOpen(true);
                    onOpenChange(false);
                  }}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Person
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setIsCostDialogOpen(true);
                    onOpenChange(false);
                  }}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Cost
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(workItem.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Description</h4>
              <p className="text-gray-600">{workItem.description}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Status</h4>
              <span className={`inline-block px-2 py-1 rounded text-xs ${
                workItem.status === 'DONE' ? 'bg-green-100 text-green-800' :
                workItem.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {workItem.status}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Priority</h4>
              <span className={`inline-block px-2 py-1 rounded text-xs ${
                workItem.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                workItem.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {workItem.priority}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Story Points</h4>
              <p className="text-gray-600">{workItem.storyPoints}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Person Assignments</h4>
              <div className="mt-2">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading assignments...</p>
                ) : personAssignments.length > 0 ? (
                  <div className="space-y-2">
                    {personAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between">
                        <div>
                          <Badge variant="secondary">
                            {assignment.person?.name || 'Unknown'} ({assignment.hours}h)
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 mt-2">Total Hours: {totalHours.toFixed(2)}h</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No person assignments</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">Cost Assignments</h4>
              <div className="mt-2">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading costs...</p>
                ) : costAssignments.length > 0 ? (
                  <div className="space-y-2">
                    {costAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between">
                        <div>
                          <Badge variant="secondary">
                            {assignment.cost?.name || 'Unknown'} (${assignment.cost?.amount.toFixed(2)})
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 mt-2">Total Cost: ${totalCost.toFixed(2)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No cost assignments</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateWorkItemAssignmentDialog
        open={isPersonDialogOpen}
        onOpenChange={setIsPersonDialogOpen}
        onSuccess={() => {
          setIsPersonDialogOpen(false);
          onAssignmentChange();
        }}
        assignmentType="WORK_ITEM"
        targetId={workItem.id}
      />

      <CreateWorkItemCostDialog
        open={isCostDialogOpen}
        onOpenChange={setIsCostDialogOpen}
        onSuccess={() => {
          setIsCostDialogOpen(false);
          onAssignmentChange();
        }}
        assignmentType="WORK_ITEM"
        targetId={workItem.id}
      />
    </>
  );
};

export default WorkItemDetailDialog; 