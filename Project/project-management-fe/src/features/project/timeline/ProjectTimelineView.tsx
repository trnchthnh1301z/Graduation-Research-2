import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { epicService } from '@/services/epicService';
import { workItemService } from '@/services/workItemService';
import { sprintService } from '@/services/sprintService';
import SprintFilterDialog from '../sprint/components/SprintFilterDialog';

// Constants for local storage
const SPRINT_FILTER_KEY = 'timeline_sprint_filter';

interface TimelineViewProps {
  projectId: number;
}

interface TimelineEpic {
  id: number;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  workItems: TimelineWorkItem[];
}

interface TimelineWorkItem {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  location: string;
  sprintName?: string;
}

interface ProgressStats {
  done: number;
  inProgress: number;
  todo: number;
}

// Mock timeline data (kept as fallback)


const ProjectTimelineView: React.FC<TimelineViewProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineEpic[]>([]);
  const [showSprintFilterDialog, setShowSprintFilterDialog] = useState(false);
  const [availableSprints, setAvailableSprints] = useState<any[]>([]);
  const [selectedSprintIds, setSelectedSprintIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`${SPRINT_FILTER_KEY}_${projectId}`);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  // Save selected sprints to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`${SPRINT_FILTER_KEY}_${projectId}`, JSON.stringify(selectedSprintIds));
  }, [selectedSprintIds, projectId]);

  // Initialize available sprints
  useEffect(() => {
    const initializeAvailableSprints = async () => {
      try {
        const sprintsResponse = await sprintService.getByProjectId(projectId);
        const sprints = sprintsResponse.data;
        setAvailableSprints(sprints);

        // Only set default selection if no selection exists
        if (selectedSprintIds.length === 0) {
          const activeSprints = sprints.filter((s: any) => s.status === 'ACTIVE');
          if (activeSprints.length > 0) {
            setSelectedSprintIds(activeSprints.map((s: any) => s.id));
          }
        } else {
          // Validate existing selection against available sprints
          const validIds = selectedSprintIds.filter(id => 
            sprints.some(sprint => sprint.id === id)
          );
          if (validIds.length !== selectedSprintIds.length) {
            setSelectedSprintIds(validIds);
          }
        }
      } catch (err) {
        console.error('Error fetching sprints:', err);
        setAvailableSprints([]);
      }
    };

    initializeAvailableSprints();
  }, [projectId]);

  useEffect(() => {
    const fetchTimelineData = async () => {
      setLoading(true);
      setError(null);
      try {
        // If no sprints are selected, show no data
        if (selectedSprintIds.length === 0) {
          setTimelineData([]);
          return;
        }

        // Fetch epics
        const epicsResponse = await epicService.getByProjectId(projectId);
        const epics = epicsResponse.data;

        // For each epic, fetch its work items
        const epicsWithWorkItems = await Promise.all(
          epics.map(async (epic: any) => {
            const workItemsResponse = await workItemService.getByEpicId(epic.id);
            const workItems = workItemsResponse.data;

            // Filter work items by selected sprints
            const filteredWorkItems = workItems.filter((item: any) => 
              item.location === 'SPRINT' && selectedSprintIds.includes(item.sprintId)
            );

            // Map work items to timeline format
            const timelineWorkItems = filteredWorkItems.map((item: any) => {
              const sprint = availableSprints.find((s: any) => s.id === item.sprintId);
              
              return {
                id: item.id,
                title: item.title,
                startDate: sprint?.startDate || epic.startDate,
                endDate: sprint?.endDate || epic.endDate,
                status: item.status,
                location: item.location,
                sprintName: sprint?.name
              };
            });

            return {
              id: epic.id,
              title: epic.title,
              type: 'epic',
              startDate: epic.startDate,
              endDate: epic.endDate,
              status: epic.status,
              workItems: timelineWorkItems,
              hasWorkItemsInSelectedSprints: timelineWorkItems.length > 0
            };
          })
        );

        // Filter out epics with no work items in selected sprints
        const filteredEpics = epicsWithWorkItems.filter(epic => epic.hasWorkItemsInSelectedSprints);
        setTimelineData(filteredEpics);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Failed to load timeline data.');
        setTimelineData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [projectId, selectedSprintIds, availableSprints]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'TODO': return 'bg-gray-300';
      case 'ACTIVE': return 'bg-blue-500';
      case 'NOT_STARTED': return 'bg-gray-300';
      case 'COMPLETED': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const calculateProgress = (workItems: any[]): ProgressStats => {
    // Only consider items in sprints
    const sprintItems = workItems.filter(item => item.location === 'SPRINT');
    if (sprintItems.length === 0) return { done: 0, inProgress: 0, todo: 100 };
    
    const done = sprintItems.filter(item => item.status === 'DONE').length;
    const inProgress = sprintItems.filter(item => item.status === 'IN_PROGRESS').length;
    const todo = sprintItems.filter(item => item.status === 'TODO').length;
    const total = sprintItems.length;

    return {
      done: Math.round((done / total) * 100),
      inProgress: Math.round((inProgress / total) * 100),
      todo: Math.round((todo / total) * 100)
    };
  };

  const getDatePosition = (startDate: string, endDate: string) => {
    const allDates = [
      ...timelineData.flatMap(epic => [
        new Date(epic.startDate),
        new Date(epic.endDate)
      ]),
      ...availableSprints
        .filter(sprint => selectedSprintIds.includes(sprint.id))
        .flatMap(sprint => [
          new Date(sprint.startDate),
          new Date(sprint.endDate)
        ])
    ];

    const projectStart = new Date(Math.min(...allDates.map(d => d.getTime())));
    const projectEnd = new Date(Math.max(...allDates.map(d => d.getTime())));
    const projectDuration = projectEnd.getTime() - projectStart.getTime();
    
    const itemStart = new Date(startDate);
    const itemEnd = new Date(endDate);
    
    const startPosition = ((itemStart.getTime() - projectStart.getTime()) / projectDuration) * 100;
    const width = ((itemEnd.getTime() - itemStart.getTime()) / projectDuration) * 100;
    
    return { left: `${Math.max(0, startPosition)}%`, width: `${Math.max(1, width)}%` };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading timeline data...</div>
      </div>
    );
  }

  const displayData = timelineData.length > 0 ? timelineData : [];

  const handleSprintSelectionChange = (newSelectedIds: number[]) => {
    setSelectedSprintIds(newSelectedIds);
    setShowSprintFilterDialog(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Timeline</h1>
          <p className="text-gray-600">
            Visualize project progress with Gantt chart view
            {selectedSprintIds.length > 0 && (
              <span className="text-sm ml-2">
                ({selectedSprintIds.length} sprint{selectedSprintIds.length !== 1 ? 's' : ''} selected)
              </span>
            )}
          </p>
          {error && (
            <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setShowSprintFilterDialog(true)}
        >
          <Filter className="h-4 w-4" />
          Filter Sprints
        </Button>
      </div>

      {displayData.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              {selectedSprintIds.length === 0 ? (
                <div>
                  <div className="mb-2">No sprints selected</div>
                  <div className="text-sm">
                    Please select one or more sprints to view the timeline.
                  </div>
                </div>
              ) : (
                <div>No epics found with work items in selected sprints.</div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Gantt Chart - Epics and Work Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 overflow-x-auto" style={{ minWidth: '800px' }}>
              {/* Timeline Header */}
              <div className="flex justify-between text-sm text-gray-500 border-b pb-2 sticky left-0">
                {/* Dynamic month headers based on project timeline */}
                {(() => {
                  const months = new Set(
                    [
                      ...displayData.flatMap(epic => [
                        new Date(epic.startDate),
                        new Date(epic.endDate)
                      ]),
                      ...availableSprints
                        .filter(sprint => selectedSprintIds.includes(sprint.id))
                        .flatMap(sprint => [
                          new Date(sprint.startDate),
                          new Date(sprint.endDate)
                        ])
                    ].map(date => 
                      date.toLocaleString('default', { month: 'short', year: 'numeric' })
                    )
                  );
                  return Array.from(months).sort().map(month => (
                    <span key={month}>{month}</span>
                  ));
                })()}
              </div>

              {/* Timeline Content */}
              <div className="relative">
                {displayData.map((epic) => (
                  <div key={epic.id} className="space-y-2">
                    {/* Epic Row */}
                    <div className="flex items-center space-x-4">
                      <div className="w-64 flex-shrink-0">
                        <div className="font-semibold text-gray-900">{epic.title}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(epic.startDate)} - {formatDate(epic.endDate)}
                        </div>
                      </div>
                      <div className="flex-1 relative h-8 bg-gray-100 rounded">
                        <div 
                          className="absolute h-full rounded opacity-80"
                          style={getDatePosition(epic.startDate, epic.endDate)}
                        >
                          {/* Progress bars */}
                          <div className="h-full w-full flex">
                            {(() => {
                              const progress = calculateProgress(epic.workItems);
                              return (
                                <>
                                  <div 
                                    className="h-full bg-green-500 rounded-l"
                                    style={{ width: `${progress.done}%` }}
                                    title={`${progress.done}% Done`}
                                  />
                                  <div 
                                    className="h-full bg-blue-500"
                                    style={{ width: `${progress.inProgress}%` }}
                                    title={`${progress.inProgress}% In Progress`}
                                  />
                                  <div 
                                    className="h-full bg-gray-300 rounded-r"
                                    style={{ width: `${progress.todo}%` }}
                                    title={`${progress.todo}% To Do`}
                                  />
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                          {(() => {
                            const progress = calculateProgress(epic.workItems);
                            return `${progress.done}% Done, ${progress.inProgress}% In Progress`;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Work Items */}
                    <div className="ml-8 space-y-1">
                      {epic.workItems
                        .filter(item => item.location === 'SPRINT')
                        .map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="w-56 flex-shrink-0">
                            <div className="text-sm text-gray-700">{item.title}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs ${
                                item.status === 'DONE' ? 'bg-green-100 text-green-800' :
                                item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.status === 'TODO' ? 'To Do' :
                                 item.status === 'IN_PROGRESS' ? 'In Progress' :
                                 item.status === 'DONE' ? 'Done' :
                                 item.status}
                              </Badge>
                              {item.sprintName && (
                                <span className="text-xs text-gray-500">
                                  {item.sprintName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 relative h-4 bg-gray-50 rounded">
                            <div 
                              className={`absolute h-full rounded ${
                                item.status === 'DONE' ? 'bg-green-500' :
                                item.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                'bg-gray-300'
                              }`}
                              style={getDatePosition(item.startDate, item.endDate)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sprint Filter Dialog */}
      <SprintFilterDialog
        projectId={projectId}
        open={showSprintFilterDialog}
        onOpenChange={setShowSprintFilterDialog}
        selectedSprintIds={selectedSprintIds}
        onSelectedSprintsChange={handleSprintSelectionChange}
      />
    </div>
  );
};

export default ProjectTimelineView;

