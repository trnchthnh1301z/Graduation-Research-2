import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Calendar, Users, DollarSign, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

interface EpicCardProps {
  epic: {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    workItemCount: number;
    assignedPeople: number;
    totalCost: number;
    progress: {
      done: number;
      inProgress: number;
      todo: number;
    };
  };
  onClick: (epicId: number) => void;
  onEdit: (epic: any) => void;
  onDelete: (epicId: number) => void;
}

const EpicCard: React.FC<EpicCardProps> = ({
  epic,
  onClick,
  onEdit,
  onDelete,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click if clicking on dropdown menu
    if ((e.target as HTMLElement).closest('.dropdown-menu')) {
      return;
    }
    onClick(epic.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(epic);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this epic?')) {
      onDelete(epic.id);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
            {epic.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 dropdown-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dropdown-menu">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-sm text-gray-600 line-clamp-3">
          {epic.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Progress:</span>
              <span className="text-gray-900">
                {epic.progress.done}% Complete
              </span>
            </div>
            <div className="h-2 flex rounded-full overflow-hidden">
              <div 
                className="bg-green-500" 
                style={{ width: `${epic.progress.done}%` }}
              />
              <div 
                className="bg-blue-500" 
                style={{ width: `${epic.progress.inProgress}%` }}
              />
              <div 
                className="bg-gray-200" 
                style={{ width: `${epic.progress.todo}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{epic.progress.inProgress}% In Progress</span>
              <span>{epic.progress.todo}% Todo</span>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Duration:</span>
            <span className="text-gray-900">
              {new Date(epic.startDate).toDateString()} - {new Date(epic.endDate).toDateString()}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-gray-600">{epic.workItemCount}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-gray-600">{epic.assignedPeople}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-gray-600">${epic.totalCost}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EpicCard; 