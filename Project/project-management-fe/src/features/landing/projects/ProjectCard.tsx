import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Calendar, Users, DollarSign } from 'lucide-react';
import UpdateProjectStatusDialog from './UpdateProjectStatusDialog.tsx';

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    status: string;
    epicCount: number;
    teamSize: number;
    estimatedCost: number;
  };
  onClick: (projectId: number) => void;
  onStatusChange?: (updatedProject: any) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onStatusChange }) => {
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowStatusDialog(true);
  };

  const handleStatusChange = (updatedProject: any) => {
    if (onStatusChange) {
      onStatusChange(updatedProject);
    }
  };

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-0 shadow-md"
        onClick={() => onClick(project.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
              {project.title}
            </CardTitle>
            <Badge 
              className={`ml-2 ${getStatusColor(project.status)} cursor-pointer hover:opacity-80`}
              onClick={handleStatusClick}
            >
              {project.status}
            </Badge>
          </div>
          <CardDescription className="text-sm text-gray-600 line-clamp-3">
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-gray-600">{project.epicCount} Epic(s)</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-gray-600">{project.teamSize} Member(s)</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-gray-600">${project.estimatedCost?.toLocaleString?.() ?? 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <UpdateProjectStatusDialog
        project={project}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onSuccess={handleStatusChange}
      />
    </>
  );
};

export default ProjectCard; 