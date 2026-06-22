import React, { useState } from 'react';
import ProjectList from '@/features/landing/projects/ProjectList.tsx';
import PeopleList from '@/features/landing/people/PeopleList';
import { Button } from '@/components/ui/button';
import { Briefcase, Users } from 'lucide-react';

type ViewType = 'projects' | 'people';

const Landing = () => {
  const [activeView, setActiveView] = useState<ViewType>('projects');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex space-x-2">
              <Button
                variant={activeView === 'projects' ? 'default' : 'outline'}
                onClick={() => setActiveView('projects')}
                className="flex items-center"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Projects
              </Button>
              <Button
                variant={activeView === 'people' ? 'default' : 'outline'}
                onClick={() => setActiveView('people')}
                className="flex items-center"
              >
                <Users className="w-4 h-4 mr-2" />
                People
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 py-4">
        {activeView === 'projects' ? (
          <ProjectList />
        ) : (
          <PeopleList />
        )}
      </div>
    </div>
  );
};

export default Landing; 