import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';

interface EpicSprintHoursTableProps {
  epicResourceData: any[];
  onReallocate: (data: any) => void;
  getPersonName: (personId: number) => string;
  formatHours: (hours: number) => number;
}

const EpicSprintHoursTable: React.FC<EpicSprintHoursTableProps> = ({
  epicResourceData,
  onReallocate,
  getPersonName,
  formatHours,
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Hours by Epic</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Epic</TableHead>
              <TableHead>Sprint</TableHead>
              <TableHead>Hours (FTE)</TableHead>
              <TableHead>People</TableHead>
              <TableHead className="text-right">Total Epic Hours (FTE)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {epicResourceData.map((epic, epicIndex) => {
              const hasSprintAssignments = epic.sprints.length > 0;
              const hasEpicOnlyAssignments = epic.epicOnly.totalHours > 0;
              
              // If no assignments at all, don't render the epic
              if (!hasSprintAssignments && !hasEpicOnlyAssignments) {
                return null;
              }

              const rows = [];

              // Add sprint rows if they exist
              if (hasSprintAssignments) {
                epic.sprints.forEach((sprint: any, sprintIndex: number) => {
                  rows.push(
                    <TableRow key={`${epicIndex}-sprint-${sprintIndex}`}>
                      {sprintIndex === 0 && (
                        <TableCell rowSpan={epic.sprints.length + (hasEpicOnlyAssignments ? 1 : 0)} className="font-medium border-r">
                          {epic.epicName}
                        </TableCell>
                      )}
                      <TableCell>{sprint.sprintName}</TableCell>
                      <TableCell>
                        {formatHours(sprint.totalHours)}h ({formatHours(sprint.fte)} FTE)
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {sprint.assignments?.map((assignment: any, personIndex: number) => (
                            <Badge key={personIndex} variant="secondary" className="text-xs">
                              {getPersonName(assignment.personId)} ({formatHours(assignment.hours)}h)
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      {sprintIndex === 0 && (
                        <TableCell rowSpan={epic.sprints.length + (hasEpicOnlyAssignments ? 1 : 0)} className="text-right font-semibold border-l">
                          {formatHours(epic.totalEpicHours)}h ({formatHours(epic.totalEpicFte)} FTE)
                        </TableCell>
                      )}
                    </TableRow>
                  );
                });
              }

              // Add epic-only row if it exists
              if (hasEpicOnlyAssignments) {
                rows.push(
                  <TableRow key={`${epicIndex}-epiconly`}>
                    {!hasSprintAssignments && (
                      <>
                        <TableCell className="font-medium border-r">{epic.epicName}</TableCell>
                      </>
                    )}
                    <TableCell>Epic Level</TableCell>
                    <TableCell>
                      {formatHours(epic.epicOnly.totalHours)}h ({formatHours(epic.epicOnly.fte)} FTE)
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {epic.epicOnly.assignments.map((assignment: any, personIndex: number) => (
                          <div key={personIndex} className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {getPersonName(assignment.personId)} ({formatHours(assignment.hours)}h)
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-blue-600 hover:text-blue-800"
                              onClick={() => onReallocate({
                                epicId: epic.id,
                                personId: assignment.personId,
                                personName: getPersonName(assignment.personId),
                                epicAssignment: assignment,
                              })}
                            >
                              Reallocate
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    {!hasSprintAssignments && (
                      <TableCell className="text-right font-semibold border-l">
                        {formatHours(epic.totalEpicHours)}h ({formatHours(epic.totalEpicFte)} FTE)
                      </TableCell>
                    )}
                  </TableRow>
                );
              }

              return rows;
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EpicSprintHoursTable; 