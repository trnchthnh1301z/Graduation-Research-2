import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResourceSummaryProps {
  totalHours: number;
  teamMembers: number;
  avgHoursPerSprint: number;
  formatHours: (hours: number) => number;
}

const ResourceSummary: React.FC<ResourceSummaryProps> = ({
  totalHours,
  teamMembers,
  avgHoursPerSprint,
  formatHours,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Project Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{formatHours(totalHours)}h</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Active Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{teamMembers}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Average Hours per Sprint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{formatHours(avgHoursPerSprint)}h</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceSummary; 