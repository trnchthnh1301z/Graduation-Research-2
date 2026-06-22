import React from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, DollarSign, Columns3, ListTodo, GitBranch } from 'lucide-react';

interface ProjectSidebarProps {
  project: {
    id: number;
    title: string;
    description: string;
    status: string;
  };
  currentView: string;
  onViewChange: (view: 'backlog' | 'epics' | 'resources' | 'costs' | 'timeline' | 'sprint') => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ project, currentView, onViewChange }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'epics',
      label: 'Epics',
      icon: GitBranch,
    },
    {
      id: 'sprint',
      label: 'Sprints',
      icon: Columns3,
    },
    {
      id: 'backlog',
      label: 'Backlog',
      icon: ListTodo,
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: Users,
    },
    {
      id: 'costs',
      label: 'Costs',
      icon: DollarSign,
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Calendar,
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="w-full justify-start mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h2>
          <p className="text-sm text-gray-600 line-clamp-3">{project.description}</p>
        </div>
      </div>
      
      <Separator />
      
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                onClick={() => onViewChange(item.id as any)}
                className={`w-full justify-start ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ProjectSidebar;
