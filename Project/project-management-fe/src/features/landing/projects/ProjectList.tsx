import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateProjectDialog from './CreateProjectDialog.tsx';
import ProjectCard from './ProjectCard.tsx';
import { projectService } from '@/services/projectService.ts';
import { epicService } from '@/services/epicService.ts';
import { workItemService } from '@/services/workItemService.ts';
import { costAssignmentService } from '@/services/costAssignmentService.ts';
import { costService } from '@/services/costService.ts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

const ProjectList = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // 1. Fetch all projects
      const { data: projectList } = await projectService.getAll();
      
      // 2. For each project, fetch epics and work items
      const projectsWithStats = await Promise.all(
        projectList.map(async (project: any) => {
          // Fetch epics and work items for this project
          const [epicsRes, workItemsRes] = await Promise.all([
            epicService.getByProjectId(project.id),
            workItemService.getByProjectId(project.id),
          ]);
          const epics = epicsRes.data;
          const workItems = workItemsRes.data;
          const epicIds = epics.map((epic: any) => epic.id);
          const workItemIds = workItems.map((wi: any) => wi.id);

          // 3. For each epic and work item, fetch cost assignments
          const [epicCostAssignments, workItemCostAssignments] = await Promise.all([
            Promise.all(epicIds.map((epicId: number) => costAssignmentService.getByEpicId(epicId))),
            Promise.all(workItemIds.map((wiId: number) => costAssignmentService.getByWorkItemId(wiId))),
          ]);

          // Flatten arrays and get unique cost IDs
          const allCostAssignments = [
            ...epicCostAssignments.flatMap(res => res.data),
            ...workItemCostAssignments.flatMap(res => res.data),
          ];
          const costIds = Array.from(new Set(allCostAssignments.map((ca: any) => ca.costId)));

          // 4. Fetch all costs and sum their amounts
          let estimatedCost = 0;
          if (costIds.length > 0) {
            const costResArr = await Promise.all(
              costIds.map((costId: number) => costService.getById(costId))
            );
            estimatedCost = costResArr.reduce((sum: number, res: any) => sum + (res.data.amount || 0), 0);
          }

          // 5. Calculate team size (unique persons)
          const teamPersonIds = new Set(allCostAssignments.map((ca: any) => ca.personId));
          const teamSize = teamPersonIds.size;

          // 6. Return project with calculated stats
          return {
            ...project,
            epicCount: epics.length,
            teamSize,
            estimatedCost,
          };
        })
      );

      setProjects(projectsWithStats);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectClick = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };

  const handleCreateSuccess = async (newProject: any) => {
    setShowCreateDialog(false);
    await fetchProjects();
  };

  const handleStatusChange = (updatedProject: any) => {
    setProjects(prev => prev.map(p => 
      p.id === updatedProject.id ? { ...p, status: updatedProject.status } : p
    ));
  };

  const filteredProjects = projects.filter(project => 
    statusFilter === 'all' || project.status.toLowerCase() === statusFilter.toLowerCase()
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track your organization's projects</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleProjectClick}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
      <CreateProjectDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default ProjectList;