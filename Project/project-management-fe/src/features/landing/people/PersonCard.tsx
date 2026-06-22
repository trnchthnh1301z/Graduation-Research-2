import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {Mail, Briefcase, MoreVertical, Edit, Trash2} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {personService} from "@/services/personService.ts";

interface PersonCardProps {
  person: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  onEdit: (person: any) => void;
  onDelete: (personId: number) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      setIsDeleting(true);
      try {
        await personService.delete(person.id);
        onDelete(person.id);
      } catch (error) {
        console.error('Error deleting person:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md cursor-pointer"
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {person.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(person)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                    disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600">{person.email}</span>
            </div>
            <div className="flex items-center text-sm">
              <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600">{person.role}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PersonCard; 