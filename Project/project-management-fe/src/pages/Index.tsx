import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '@/pages/Landing';
import ProjectDetail from '@/pages/ProjectDetail';
import EpicSummaryView from '@/features/epic/EpicSummaryView';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/projects/:projectId/epics/:epicId" element={<EpicSummaryView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default Index;
