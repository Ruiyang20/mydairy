import { Navigate, Routes, Route, useParams } from 'react-router-dom';
import FloorPlanDiary from './pages/FloorPlanDiary';
import WritePage from './pages/WritePage';

function FloorPlanRoute({ initialScreen = 'lobby' }) {
  const { id } = useParams();
  return <FloorPlanDiary initialScreen={initialScreen} initialEntryId={id || null} />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<FloorPlanDiary />} />
        <Route path="/entry/:id" element={<FloorPlanRoute initialScreen="entry" />} />
        <Route path="/write" element={<FloorPlanRoute initialScreen="write" />} />
        <Route path="/edit/:id" element={<WritePage />} />
      </Routes>
    </>
  );
}
