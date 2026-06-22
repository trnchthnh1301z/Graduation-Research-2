import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { epicService } from '@/services/epicService';

interface WorkItem {
  id: number;
  title: string;
  type: string;
  priority: string;
  status: string;
  epicId: number | null;
}

interface WorkItemTableProps {
  workItems: WorkItem[];
  onEdit: (workItem: WorkItem) => void;
  onDelete: (workItemId: number) => void;
}

interface EpicCache {
  [key: number]: string;
}

const WorkItemTable: React.FC<WorkItemTableProps> = ({
  workItems,
  onEdit,
  onDelete,
}) => {
  const [epicNames, setEpicNames] = useState<EpicCache>({});

  useEffect(() => {
    const fetchEpicNames = async () => {
      const epicIds = [...new Set(workItems
        .map(item => item.epicId)
        .filter((id): id is number => id !== null)
      )];

      const newEpicNames: EpicCache = {};
      await Promise.all(
        epicIds.map(async (epicId) => {
          try {
            const { data: epic } = await epicService.getById(epicId);
            newEpicNames[epicId] = epic.title;
          } catch (err) {
            console.error(`Error fetching epic ${epicId}:`, err);
          }
        })
      );
      setEpicNames(newEpicNames);
    };

    fetchEpicNames();
  }, [workItems]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Epic</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workItems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-gray-500">
              No work items found
            </TableCell>
          </TableRow>
        ) : (
          workItems.map((workItem) => (
            <TableRow key={workItem.id}>
              <TableCell className="font-medium">{workItem.title}</TableCell>
              <TableCell className="text-sm text-gray-600">
                {workItem.epicId ? epicNames[workItem.epicId] || '...' : '-'}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  workItem.type === 'STORY' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  workItem.type === 'BUG' ? 'bg-red-50 text-red-700 border-red-200' :
                  workItem.type === 'TASK' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'text-gray-600'
                }>
                  {workItem.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  workItem.priority === 'CRITICAL' ? 'bg-red-900 text-white border-red-900' :
                  workItem.priority === 'HIGH' ? 'bg-red-500 text-white border-red-500' :
                  workItem.priority === 'MEDIUM' ? 'bg-orange-500 text-white border-orange-500' :
                  workItem.priority === 'LOW' ? 'bg-yellow-500 text-white border-yellow-500' :
                  'text-gray-600'
                }>
                  {workItem.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  workItem.status === 'TODO' ? 'bg-gray-800 text-white border-gray-800' :
                  workItem.status === 'IN_PROGRESS' ? 'bg-blue-600 text-white border-blue-600' :
                  workItem.status === 'DONE' ? 'bg-green-800 text-white border-green-800' :
                  'text-gray-600'
                }>
                  {workItem.status === 'TODO' ? 'TO DO' :
                   workItem.status === 'IN_PROGRESS' ? 'IN PROGRESS' :
                   workItem.status === 'DONE' ? 'DONE' :
                   workItem.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(workItem)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(workItem.id)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default WorkItemTable; 