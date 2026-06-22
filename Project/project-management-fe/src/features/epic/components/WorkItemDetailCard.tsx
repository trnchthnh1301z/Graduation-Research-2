import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, DollarSign } from 'lucide-react';
import type { WorkItem } from '@/lib/types';
import CreateWorkItemAssignmentDialog from '@/features/shared/CreateWorkItemAssignmentDialog.tsx';
import CreateWorkItemCostDialog from '@/features/shared/CreateWorkItemCostDialog.tsx';
import { personService } from '@/services/personService';
import { costService } from '@/services/costService';

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

interface WorkItemDetailCardProps {
  workItem: WorkItem;
  personAssignments: PersonAssignment[];
  costAssignments: CostAssignment[];
  onAssignmentChange: () => void;
  onClick: () => void;
}

const WorkItemDetailCard: React.FC<WorkItemDetailCardProps> = ({
  workItem,
  personAssignments: initialPersonAssignments,
  costAssignments: initialCostAssignments,
  onAssignmentChange,
  onClick,
}) => {
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false);
  const [personAssignments, setPersonAssignments] = useState<PersonAssignment[]>(initialPersonAssignments);
  const [costAssignments, setCostAssignments] = useState<CostAssignment[]>(initialCostAssignments);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      setLoading(true);
      try {
        // Fetch person details for each assignment
        const personAssignmentsWithDetails = await Promise.all(
          initialPersonAssignments.map(async (assignment) => {
            if (assignment.person) return assignment;
            const personRes = await personService.getById(assignment.personId);
            return {
              ...assignment,
              person: personRes.data,
            };
          })
        );

        // Fetch cost details for each assignment
        const costAssignmentsWithDetails = await Promise.all(
          initialCostAssignments.map(async (assignment) => {
            if (assignment.cost) return assignment;
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
        console.error('Error fetching assignment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [initialPersonAssignments, initialCostAssignments]);

  const totalCost = costAssignments.reduce((sum, ca) => {
    const costAmount = ca.cost?.amount || 0;
    return sum + costAmount;
  }, 0);

  const totalHours = personAssignments.reduce((sum, pa) => sum + pa.hours, 0);

  return (
    <div
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{workItem.title}</h3>
          <p className="text-sm text-gray-600">{workItem.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs ${
            workItem.status === 'DONE' ? 'bg-green-100 text-green-800' :
            workItem.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {workItem.status}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            workItem.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
            workItem.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {workItem.priority}
          </span>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        <div className="flex-1">
          {loading ? (
            <p>Loading assignments...</p>
          ) : (
            <>
              <div>
                Assignees: {
                  personAssignments.length 
                    ? personAssignments
                        .map(a => `${a.person?.name || 'Unknown'} (${a.hours.toFixed(2)}h)`)
                        .join(', ')
                    : 'No assignees'
                }
              </div>
              <div className="mt-1">
                Total Cost: ${totalCost.toFixed(2)}
              </div>
            </>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default WorkItemDetailCard; 