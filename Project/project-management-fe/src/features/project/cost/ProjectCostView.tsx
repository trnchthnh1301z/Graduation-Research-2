import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';
import { epicService } from '@/services/epicService';
import { workItemService } from '@/services/workItemService';
import { costAssignmentService } from '@/services/costAssignmentService';
import { sprintService } from '@/services/sprintService';
import SprintFilterDialog from '../sprint/components/SprintFilterDialog';
import CreateCostAssignmentDialog from './components/CreateCostAssignmentDialog';
import { costService } from '@/services/costService';
import CostItemDialog from './components/CostItemDialog';
import { Plus } from 'lucide-react';

interface CostViewProps {
  projectId: number;
}

const SPRINT_FILTER_KEY = 'projectCostSprintFilter';

const ProjectCostView: React.FC<CostViewProps> = ({ projectId }) => {
  const [costData, setCostData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSprintFilterDialog, setShowSprintFilterDialog] = useState(false);
  const [selectedSprintIds, setSelectedSprintIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`${SPRINT_FILTER_KEY}_${projectId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const getCategoryColor = (category: string) => {
    // Generate a consistent color based on the category string
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-green-100 text-green-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
      'bg-yellow-100 text-yellow-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
    ];
    const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  useEffect(() => {
    localStorage.setItem(`${SPRINT_FILTER_KEY}_${projectId}`, JSON.stringify(selectedSprintIds));
  }, [selectedSprintIds, projectId]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch all epics and work items for the project
      const [epicsRes, workItemsRes, sprintsRes] = await Promise.all([
        epicService.getByProjectId(projectId),
        workItemService.getByProjectId(projectId),
        sprintService.getByProjectId(projectId),
      ]);
      const epics = epicsRes.data;
      const workItems = workItemsRes.data;
      const sprints = sprintsRes.data;

      // Sort sprints by start date ascending
      const sortedSprints = [...sprints].sort((a, b) => {
        if (!a.startDate) return 1;  // Sprints without start date go to the end
        if (!b.startDate) return -1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });

      // Initialize selected sprints if empty (first load)
      if (selectedSprintIds.length === 0) {
        const activeSprints = sortedSprints.filter((s: any) => s.status === 'ACTIVE');
        setSelectedSprintIds(activeSprints.map((s: any) => s.id));
      }

      // Filter work items by selected sprints and backlog setting
      const filteredWorkItems = workItems.filter((wi: any) => {
        const isSelectedSprint = !wi.sprintId || selectedSprintIds.includes(wi.sprintId);
        const isBacklogAllowed = wi.location !== 'BACKLOG';
        return isSelectedSprint && isBacklogAllowed;
      });

      // 2. For each epic and work item, fetch cost assignments
      const epicData = await Promise.all(
        epics.map(async (epic: any) => {
          const epicCostAssignmentsRes = await costAssignmentService.getByEpicId(epic.id);
          const epicCostAssignments = epicCostAssignmentsRes.data;
          
          // For each cost assignment, fetch the cost object
          const costObjs = await Promise.all(
            epicCostAssignments.map((ca: any) => costService.getById(ca.costId))
          );

          // Get work items for this epic
          const epicWorkItems = filteredWorkItems.filter((wi: any) => wi.epicId === epic.id);
          
          // Get work item costs
          const workItemCosts = await Promise.all(
            epicWorkItems.map(async (wi: any) => {
              const wiCostAssignmentsRes = await costAssignmentService.getByWorkItemId(wi.id);
              const wiCostAssignments = wiCostAssignmentsRes.data;
              return Promise.all(
                wiCostAssignments.map((ca: any) => costService.getById(ca.costId))
              );
            })
          );

          // Epic-level costs
          const epicLevelCosts = costObjs.filter(res => !res.data.sprintId);
          const epicLevelAmount = epicLevelCosts.reduce((sum: number, res: any) => sum + (res.data.amount || 0), 0);
          const epicLevelCategories = Array.from(new Set(epicLevelCosts.map(res => res.data.category)));

          // Backlog costs from work items
          const backlogWorkItems = epicWorkItems.filter(wi => wi.location === 'BACKLOG');
          const backlogCosts = workItemCosts
            .filter((_, idx) => backlogWorkItems.includes(epicWorkItems[idx]))
            .flat();
          const backlogAmount = backlogCosts.reduce((sum: number, res: any) => sum + (res.data.amount || 0), 0);
          const backlogCategories = Array.from(new Set(backlogCosts.map(res => res.data.category)));

          // Sprint-specific costs
          const sprintCosts = sortedSprints
            .filter(sprint => selectedSprintIds.includes(sprint.id))
            .flatMap(sprint => {
              // Combine epic and work item costs for this sprint
              const sprintEpicCosts = costObjs.filter(res => res.data.sprintId === sprint.id);
              const sprintWorkItemCosts = workItemCosts
                .filter((_, idx) => epicWorkItems[idx].sprintId === sprint.id)
                .flat();
              return [...sprintEpicCosts, ...sprintWorkItemCosts];
            });

          const totalSprintAmount = sprintCosts.reduce((sum, cost) => sum + (cost.data.amount || 0), 0);
          const sprintCategories = Array.from(new Set(sprintCosts.map(cost => cost.data.category)));
          const sprintCostItems = sprintCosts.map(cost => ({
            amount: cost.data.amount,
            category: cost.data.category
          }));

          const totalEpicCost = epicLevelAmount + backlogAmount + totalSprintAmount;

          // Prepare cost items for display
          const epicLevelCostItems = epicLevelCosts.map(cost => ({
            amount: cost.data.amount,
            category: cost.data.category
          }));

          const backlogCostItems = backlogCosts.map(cost => ({
            amount: cost.data.amount,
            category: cost.data.category
          }));

          return {
            epicName: epic.title,
            rows: [
              {
                type: 'epic-level',
                name: 'Epic Level',
                amount: epicLevelAmount,
                costItems: epicLevelCostItems
              },
              {
                type: 'backlog',
                name: 'Backlog',
                amount: backlogAmount,
                costItems: backlogCostItems
              },
              {
                type: 'sprint',
                name: 'Sprint',
                amount: totalSprintAmount,
                costItems: sprintCostItems
              }
            ],
            totalCost: totalEpicCost,
          };
        })
      );

      const allData = epicData.filter(epic => epic.rows.length > 0);
      setCostData(allData);

      // Summary calculations
      const total = allData.reduce((sum, e) => sum + e.totalCost, 0);
      setSummary({ total });
    } catch (err) {
      setCostData([]);
      setSummary({ total: 0 });
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedSprintIds]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading costs...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Cost Analysis</h1>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              Add Cost
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSprintFilterDialog(true)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Sprint Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Project Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${summary.total.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Costs by Epic</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Epic</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cost Items</TableHead>
                <TableHead className="text-right">Total Epic Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costData.map((epic, epicIndex) => (
                epic.rows.map((row: any, rowIndex: number) => (
                  <TableRow key={`${epicIndex}-${rowIndex}`}>
                    {rowIndex === 0 && (
                      <TableCell rowSpan={epic.rows.length} className="font-medium border-r">
                        {epic.epicName}
                      </TableCell>
                    )}
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {row.costItems.map((item: any, itemIndex: number) => (
                          <Badge key={itemIndex} className={getCategoryColor(item.category)}>
                            {item.category}: ${item.amount.toLocaleString()}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    {rowIndex === 0 && (
                      <TableCell rowSpan={epic.rows.length} className="text-right font-semibold border-l">
                        <Badge className="bg-blue-100 text-blue-800">
                          ${epic.totalCost.toLocaleString()}
                        </Badge>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showSprintFilterDialog && (
        <SprintFilterDialog
          projectId={projectId}
          open={showSprintFilterDialog}
          onOpenChange={setShowSprintFilterDialog}
          selectedSprintIds={selectedSprintIds}
          onSelectedSprintsChange={setSelectedSprintIds}
        />
      )}

      {showCreateDialog && (
        <CreateCostAssignmentDialog
          projectId={projectId}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default ProjectCostView;