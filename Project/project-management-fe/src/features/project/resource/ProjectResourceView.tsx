import React, { useEffect, useState } from 'react';
import { epicService } from '@/services/epicService';
import { workItemService } from '@/services/workItemService';
import { personAssignmentService } from '@/services/personAssignmentService';
import { sprintService } from '@/services/sprintService';
import { personService } from '@/services/personService';
import CreatePersonAssignmentDialog from './components/CreatePersonAssignmentDialog';
import ReallocatePersonAssignmentDialog from './components/ReallocatePersonAssignmentDialog';
import SprintFilterDialog from '../sprint/components/SprintFilterDialog';
import ResourceSummary from './components/ResourceSummary';
import EpicSprintHoursTable from '@/features/epic/components/EpicSprintHoursTable';
import PersonSprintTable from './components/PersonSprintTable';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ResourceViewProps {
  projectId: number;
}

const DEFAULT_BASE_FTE = 5.7;
const SPRINT_FILTER_KEY = 'projectResourceSprintFilter';
const DEFAULT_BACKLOG_DAYS = 14;

const calculateDaysFromDates = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const ProjectResourceView: React.FC<ResourceViewProps> = ({ projectId }) => {
  const [epicResourceData, setEpicResourceData] = useState<any[]>([]);
  const [personBySprintData, setPersonBySprintData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalHours: 0, teamMembers: 0, avgHoursPerSprint: 0 });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSprintFilterDialog, setShowSprintFilterDialog] = useState(false);
  const [baseFte, setBaseFte] = useState(DEFAULT_BASE_FTE);
  const [reallocationData, setReallocationData] = useState<{
    epicId: number;
    personId: number;
    personName: string;
    epicAssignment: any;
  } | null>(null);
  const [personNames, setPersonNames] = useState<Record<number, string>>({});
  const [selectedSprintIds, setSelectedSprintIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`${SPRINT_FILTER_KEY}_${projectId}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`${SPRINT_FILTER_KEY}_${projectId}`, JSON.stringify(selectedSprintIds));
  }, [selectedSprintIds, projectId]);

  // Initialize selected sprints with active sprints if none selected
  useEffect(() => {
    const initializeSelectedSprints = async () => {
      if (selectedSprintIds.length === 0) {
        try {
          const sprintsRes = await sprintService.getByProjectId(projectId);
          const activeSprints = sprintsRes.data.filter((s: any) => s.status === 'ACTIVE');
          setSelectedSprintIds(activeSprints.map((s: any) => s.id));
        } catch (err) {
          console.error('Error initializing sprints:', err);
        }
      }
    };

    initializeSelectedSprints();
  }, [projectId]);

  const fetchPersonNames = async (personIds: number[]) => {
    try {
      const uniqueIds = Array.from(new Set(personIds));
      const personData = await Promise.all(
        uniqueIds.map(async (id) => {
          const response = await personService.getById(id);
          return response.data;
        })
      );
      const nameMap = Object.fromEntries(
        personData.map(person => [person.id, person.name])
      );
      setPersonNames(nameMap);
    } catch (err) {
      console.error('Error fetching person names:', err);
    }
  };

  const fetchData = async () => {
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

      // Filter work items by selected sprints
      const filteredWorkItems = workItems.filter((wi: any) => 
        !wi.sprintId || selectedSprintIds.includes(wi.sprintId)
      );

      // Get all work item and epic IDs
      const allProjectWorkItemIds = filteredWorkItems.map((wi: any) => wi.id);
      const allProjectEpicIds = epics.map((epic: any) => epic.id);

      // Get all assignments
      const [workItemAssignmentsRes, epicAssignmentsRes] = await Promise.all([
        Promise.all(allProjectWorkItemIds.map((id: number) => personAssignmentService.getByWorkItemId(id))),
        Promise.all(allProjectEpicIds.map((id: number) => personAssignmentService.getByEpicId(id))),
      ]);

      const allProjectWorkItemAssignments = workItemAssignmentsRes.flatMap(res => res.data);
      const allProjectEpicAssignments = epicAssignmentsRes.flatMap(res => res.data);

      // Collect all unique person IDs
      const allPersonIds = new Set<number>();
      allProjectWorkItemAssignments.forEach((pa: any) => allPersonIds.add(pa.personId));
      allProjectEpicAssignments.forEach((pa: any) => allPersonIds.add(pa.personId));

      // Fetch person names
      await fetchPersonNames(Array.from(allPersonIds));

      // 2. For each epic, fetch person assignments for epic and its work items
      const epicData = await Promise.all(
        epics.map(async (epic: any) => {
          // Work items for this epic
          const epicWorkItems = filteredWorkItems.filter((wi: any) => wi.epicId === epic.id);
          const backlogWorkItems = workItems.filter((wi: any) => wi.epicId === epic.id && wi.location === 'BACKLOG');
          
          // Person assignments for epic
          const epicPersonAssignments = allProjectEpicAssignments.filter(pa => pa.epicId === epic.id);
          
          // Person assignments for each work item
          const workItemPersonAssignmentsArr = epicWorkItems.map(wi => 
            allProjectWorkItemAssignments.filter(pa => pa.workItemId === wi.id)
          );
          
          const backlogPersonAssignmentsArr = backlogWorkItems.map(wi =>
            allProjectWorkItemAssignments.filter(pa => pa.workItemId === wi.id)
          );

          // Map sprints
          const sprints = Array.from(new Set(epicWorkItems.map((wi: any) => wi.sprintName || 'Sprint')));
          
          // Fetch sprint start/end dates for each unique sprint name (if possible)
          const sprintIdMap: Record<string, number> = {};
          epicWorkItems.forEach((wi: any) => {
            if (wi.sprintName && wi.sprintId) sprintIdMap[wi.sprintName] = wi.sprintId;
          });
          const sprintDates: Record<string, { startDate?: string; endDate?: string; days?: number }> = {};
          await Promise.all(Object.entries(sprintIdMap).map(async ([sprintName, sprintId]) => {
            try {
              const sprintRes = await sprintService.getById(sprintId);
              const sprint = sprintRes.data;
              const days = calculateDaysFromDates(sprint.startDate, sprint.endDate);
              sprintDates[sprintName] = {
                startDate: sprint.startDate,
                endDate: sprint.endDate,
                days,
              };
            } catch {}
          }));

          // Table 1: Hours by Epic and Person (by sprint)
          const sprintRows = sprints.map((sprintName: string) => {
            const sprintWorkItems = epicWorkItems.filter((wi: any) => (wi.sprintName || 'Sprint') === sprintName);
            const assignments = sprintWorkItems.flatMap((wi: any, idx: number) => workItemPersonAssignmentsArr[epicWorkItems.indexOf(wi)]);
            const totalHours = assignments.reduce((sum: number, pa: any) => sum + (pa.hours || 0), 0);
            const dates = sprintDates[sprintName];
            const sprintDays = dates?.days || DEFAULT_BACKLOG_DAYS;
            const fte = (baseFte > 0 && sprintDays > 0) ? totalHours / (baseFte * sprintDays) : 0;
            let sprintLabel = sprintName;
            if (dates && dates.startDate && dates.endDate) {
              sprintLabel = `${sprintName} (${new Date(dates.startDate).toDateString()} - ${new Date(dates.endDate).toDateString()})`;
            }
            return {
              sprintName: sprintLabel,
              totalHours: Number(totalHours.toFixed(1)),
              fte: Number(fte.toFixed(2)),
              assignments,
            };
          });

          // Add backlog row
          const backlogAssignments = backlogPersonAssignmentsArr.flat();
          const backlogTotalHours = backlogAssignments.reduce((sum: number, pa: any) => sum + (pa.hours || 0), 0);
          const backlogFte = (baseFte > 0) ? backlogTotalHours / (baseFte * DEFAULT_BACKLOG_DAYS) : 0;
          
          const backlogRow = {
            sprintName: 'Backlog',
            totalHours: Number(backlogTotalHours.toFixed(1)),
            fte: Number(backlogFte.toFixed(2)),
            assignments: backlogAssignments,
          };

          const workItemPersonIds = new Set([
            ...workItemPersonAssignmentsArr.flatMap(assignments => assignments.map((pa: any) => pa.personId)),
            ...backlogPersonAssignmentsArr.flatMap(assignments => assignments.map((pa: any) => pa.personId))
          ]);
          
          const epicPersonHours = epicPersonAssignments.reduce((sum: number, pa: any) => sum + (pa.hours || 0), 0);
          const epicPersonFte = (baseFte > 0) ? epicPersonHours / (baseFte * DEFAULT_BACKLOG_DAYS) : 0;
          
          const allSprintRows = [...sprintRows, backlogRow];
          const totalEpicHours = allSprintRows.reduce((sum, s) => sum + s.totalHours, 0) + Number(epicPersonHours.toFixed(1));
          const totalEpicFte = (baseFte > 0) ? totalEpicHours / (baseFte * DEFAULT_BACKLOG_DAYS) : 0;

          return {
            epicName: epic.title,
            id: epic.id,
            sprints: allSprintRows,
            epicOnly: {
              totalHours: Number(epicPersonHours.toFixed(1)),
              fte: Number(epicPersonFte.toFixed(2)),
              assignments: epicPersonAssignments,
            },
            totalEpicHours: Number(totalEpicHours.toFixed(1)),
            totalEpicFte: Number(totalEpicFte.toFixed(2)),
          };
        })
      );

      setEpicResourceData(epicData);

      // Table 2: Person by Sprint
      // Get selected sprints sorted by start date
      const selectedSprints = sortedSprints
        .filter(s => selectedSprintIds.includes(s.id));

      // For each person, sum across all epics
      const personRows = await Promise.all(Array.from(allPersonIds).map(async (personId: number) => {
        // For each selected sprint, calculate hours
        const sprintHours = selectedSprints.map((sprint) => {
          // All assignments for this person in this sprint (across all work items in this project)
          const assignments = filteredWorkItems
            .filter((wi: any) => wi.sprintId === sprint.id)
            .flatMap((wi: any) => allProjectWorkItemAssignments.filter((pa: any) => pa.workItemId === wi.id && pa.personId === personId));
          
          const totalHours = assignments.reduce((sum: number, pa: any) => sum + (pa.hours || 0), 0);
          const days = calculateDaysFromDates(sprint.startDate, sprint.endDate);
          const fte = (baseFte > 0 && days > 0) ? totalHours / (baseFte * days) : 0;
          
          return {
            sprintId: sprint.id,
            sprintName: `${sprint.name} (${new Date(sprint.startDate).toDateString()} - ${new Date(sprint.endDate).toDateString()})`,
            totalHours: Number(totalHours.toFixed(1)),
            fte: Number(fte.toFixed(2)),
          };
        });

        // Epic-specific allocation for this person
        const epicOnlyAssignments = allProjectEpicAssignments.filter((pa: any) => pa.personId === personId);
        const epicOnlyHours = epicOnlyAssignments.reduce((sum: number, pa: any) => sum + (pa.hours || 0), 0);
        const epicOnlyFte = (baseFte > 0) ? epicOnlyHours / (baseFte * DEFAULT_BACKLOG_DAYS) : 0;
        const total = sprintHours.reduce((sum: number, s: any) => sum + s.totalHours, 0) + Number(epicOnlyHours.toFixed(1));
        const totalFte = (baseFte > 0) ? total / (baseFte * DEFAULT_BACKLOG_DAYS) : 0;

        return {
          personId,
          personName: getPersonName(personId),
          sprintHours,
          epicOnlyHours: Number(epicOnlyHours.toFixed(1)),
          epicOnlyFte: Number(epicOnlyFte.toFixed(2)),
          total: Number(total.toFixed(1)),
          totalFte: Number(totalFte.toFixed(2)),
        };
      }));

      // Sort person rows by name
      personRows.sort((a, b) => a.personName.localeCompare(b.personName));

      // Get selected sprints for the table header
      const selectedSprintsForHeader = selectedSprints
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .map(sprint => ({
          id: sprint.id,
          name: sprint.name,
          label: `${sprint.name} (${new Date(sprint.startDate).toDateString()} - ${new Date(sprint.endDate).toDateString()})`,
        }));

      const personBySprintDataToSet = [{
        sprints: selectedSprintsForHeader,
        personRows: personRows.map(row => ({
          ...row,
          personName: personNames[row.personId] || `Person ${row.personId}`, // Ensure person name is set
        }))
      }];


      setPersonBySprintData(personBySprintDataToSet);

      // Summary calculations
      const totalHours = epicData.reduce((sum, e) => sum + e.totalEpicHours, 0);
      const allPeople = new Set(epicData.flatMap(e => e.sprints.flatMap((s: any) => s.people)));
      const allSprints = epicData.reduce((sum, e) => sum + e.sprints.length, 0);
      setSummary({
        totalHours,
        teamMembers: allPeople.size,
        avgHoursPerSprint: allSprints ? Math.round(totalHours / allSprints) : 0,
      });
    } catch (err) {
      setEpicResourceData([]);
      setPersonBySprintData([]);
      setSummary({ totalHours: 0, teamMembers: 0, avgHoursPerSprint: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getPersonName = (personId: number) => {
    return personNames[personId] || `Person ${personId}`;
  };

  const formatHours = (hours: number) => {
    return Number(hours.toFixed(1));
  };

  useEffect(() => {
    fetchData();
  }, [projectId, selectedSprintIds]);

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Resource Management</h1>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Hours per day (FTE basis):</label>
            <input
              type="number"
              value={baseFte}
              onChange={(e) => setBaseFte(Number(e.target.value))}
              className="w-20 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              step="0.1"
              min="0"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              Assign Person
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

      <ResourceSummary 
        totalHours={summary.totalHours}
        teamMembers={summary.teamMembers}
        avgHoursPerSprint={summary.avgHoursPerSprint}
        formatHours={formatHours}
      />

      <EpicSprintHoursTable
        epicResourceData={epicResourceData}
        onReallocate={setReallocationData}
        getPersonName={getPersonName}
        formatHours={formatHours}
      />

      <PersonSprintTable
        personBySprintData={personBySprintData}
        formatHours={formatHours}
      />

      {showCreateDialog && (
        <CreatePersonAssignmentDialog
          projectId={projectId}
          fteBasis={baseFte}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={fetchData}
        />
      )}

      {reallocationData && (
        <ReallocatePersonAssignmentDialog
          epicId={reallocationData.epicId}
          personId={reallocationData.personId}
          personName={reallocationData.personName}
          epicAssignment={reallocationData.epicAssignment}
          open={!!reallocationData}
          onOpenChange={(open) => !open && setReallocationData(null)}
          onSuccess={fetchData}
        />
      )}

      <SprintFilterDialog
        projectId={projectId}
        open={showSprintFilterDialog}
        onOpenChange={setShowSprintFilterDialog}
        selectedSprintIds={selectedSprintIds}
        onSelectedSprintsChange={setSelectedSprintIds}
      />
    </div>
  );
};

export default ProjectResourceView;