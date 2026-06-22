import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import ProjectSidebar from '@/features/project/common/components/ProjectSidebar.tsx';
import ProjectEpicView from '@/features/epic/ProjectEpicView.tsx';
import ProjectResourceView from '@/features/project/resource/ProjectResourceView';
import ProjectCostView from '@/features/project/cost/ProjectCostView';
import ProjectTimelineView from '@/features/project/timeline/ProjectTimelineView';
import ProjectSprintView from '@/features/project/sprint/ProjectSprintView';
import ProjectBacklogView from '@/features/project/backlog/ProjectBacklogView';
import {projectService} from '@/services/projectService';
import {epicService} from '@/services/epicService';
import {workItemService} from '@/services/workItemService';
import {personAssignmentService} from '@/services/personAssignmentService';
import {costAssignmentService} from '@/services/costAssignmentService';


type ViewType = 'epics' | 'resources' | 'costs' | 'timeline' | 'backlog' | 'sprint';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [currentView, setCurrentView] = useState<ViewType>('epics');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch project
        const { data: projectData } = await projectService.getById(Number(projectId));
        // 2. Fetch epics and work items for this project
        const [epicsRes, workItemsRes] = await Promise.all([
          epicService.getByProjectId(Number(projectId)),
          workItemService.getByProjectId(Number(projectId)),
        ]);
        const epics = epicsRes.data;
        const workItems = workItemsRes.data;
        const epicIds = epics.map((epic: any) => epic.id);
        const workItemIds = workItems.map((wi: any) => wi.id);
        // 3. For each epic and work item, fetch person assignments and cost assignments
        const [epicPersonAssignments, epicCostAssignments] = await Promise.all([
          Promise.all(epicIds.map((epicId: number) => personAssignmentService.getByEpicId(epicId))),
          Promise.all(epicIds.map((epicId: number) => costAssignmentService.getByEpicId(epicId))),
        ]);
        const [workItemPersonAssignments, workItemCostAssignments] = await Promise.all([
          Promise.all(workItemIds.map((wiId: number) => personAssignmentService.getByWorkItemId(wiId))),
          Promise.all(workItemIds.map((wiId: number) => costAssignmentService.getByWorkItemId(wiId))),
        ]);
        // Flatten arrays
        const allPersonAssignments = [
          ...epicPersonAssignments.flatMap(res => res.data),
          ...workItemPersonAssignments.flatMap(res => res.data),
        ];
        const allCostAssignments = [
          ...epicCostAssignments.flatMap(res => res.data),
          ...workItemCostAssignments.flatMap(res => res.data),
        ];
        // Sum unique persons
        const teamPersonIds = new Set(allPersonAssignments.map((pa: any) => pa.personId));
        const teamSize = teamPersonIds.size;
        // Retrieve costs for all costAssignments and sum their amount
        const costIds = Array.from(new Set(allCostAssignments.map((ca: any) => ca.costId)));
        let estimatedCost = 0;
        if (costIds.length > 0) {
          const costResArr = await Promise.all(costIds.map((costId: number) => import('@/services/costService').then(m => m.costService.getById(costId))));
          estimatedCost = costResArr.reduce((sum: number, res: any) => sum + (res.data.amount || 0), 0);
        }
        // Epic count
        const epicCount = epics.length;
        setProject({
          ...projectData,
          epicCount,
          teamSize,
          estimatedCost,
        });
      } catch (err) {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const renderCurrentView = () => {
    if (!project) return null;
    switch (currentView) {
      case 'epics':
        return <ProjectEpicView projectId={project.id} />;
      case 'resources':
        return <ProjectResourceView projectId={project.id} />;
      case 'costs':
        return <ProjectCostView projectId={project.id} />;
      case 'timeline':
        return <ProjectTimelineView projectId={project.id} />;
      case 'backlog':
        return <ProjectBacklogView projectId={project.id} />;
      case 'sprint':
        return <ProjectSprintView projectId={project.id} />;
      default:
        return <ProjectEpicView projectId={project.id} />;
    }
  };

  if (loading || !project) {
    return <div className="flex min-h-screen bg-gray-50 items-center justify-center text-gray-500">Loading project...</div>;
  }

  return (
      <div className="flex min-h-screen bg-gray-50">
        <ProjectSidebar
            project={project}
            currentView={currentView}
            onViewChange={setCurrentView}
        />
        <main className="flex-1 overflow-hidden">
          {renderCurrentView()}
        </main>
      </div>
  );
};

export default ProjectDetail;