import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface PersonSprintTableProps {
  personBySprintData: any[];
  formatHours: (hours: number) => number;
}

const PersonSprintTable: React.FC<PersonSprintTableProps> = ({
  personBySprintData,
  formatHours,
}) => {
  if (personBySprintData.length === 0) return null;

  const data = personBySprintData[0];
  
  // Calculate sprint totals
  const sprintTotals = data.sprints.map((_: any, sprintIndex: number) => {
    return data.personRows.reduce((total: number, person: any) => {
      return total + person.sprintHours[sprintIndex].totalHours;
    }, 0);
  });

  // Calculate epic-only total
  const epicOnlyTotal = data.personRows.reduce((total: number, person: any) => {
    return total + person.epicOnlyHours;
  }, 0);

  // Calculate grand total
  const grandTotal = data.personRows.reduce((total: number, person: any) => {
    return total + person.total;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Person by Sprint</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background">Person</TableHead>
                {data.sprints.map((sprint: any) => (
                  <TableHead key={sprint.id}>{sprint.label}</TableHead>
                ))}
                <TableHead>Epic-specific (h)</TableHead>
                <TableHead>Total (h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.personRows.map((person: any) => (
                <TableRow key={person.personId}>
                  <TableCell className="sticky left-0 bg-background">{person.personName}</TableCell>
                  {person.sprintHours.map((s: any) => (
                    <TableCell key={s.sprintId}>
                      {formatHours(s.totalHours)}h ({formatHours(s.fte)} FTE)
                    </TableCell>
                  ))}
                  <TableCell>
                    {formatHours(person.epicOnlyHours)}h ({formatHours(person.epicOnlyFte)} FTE)
                  </TableCell>
                  <TableCell>
                    {formatHours(person.total)}h ({formatHours(person.totalFte)} FTE)
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/50">
                <TableCell className="sticky left-0 bg-muted/50">Total</TableCell>
                {sprintTotals.map((total: number, idx: number) => (
                  <TableCell key={data.sprints[idx].id}>{formatHours(total)}h</TableCell>
                ))}
                <TableCell>{formatHours(epicOnlyTotal)}h</TableCell>
                <TableCell>{formatHours(grandTotal)}h</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PersonSprintTable; 