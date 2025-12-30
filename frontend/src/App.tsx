import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HospitalListPage from './pages/HospitalListPage';
import HospitalLoginPage from './pages/HospitalLoginPage';
import HospitalDashboardPage from './pages/HospitalDashboardPage';
import EmergencySOSPage from './pages/EmergencySOSPage';
import OfflineMeshDemo from './pages/OfflineMeshDemo';

import PublicHospitalPage from './pages/PublicHospitalPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/hospitals" element={<HospitalListPage />} />
        <Route path="/hospital/:hospitalId" element={<PublicHospitalPage />} />
        <Route path="/login" element={<HospitalLoginPage />} />
        <Route path="/dashboard/:hospitalId" element={<HospitalDashboardPage />} />
        <Route path="/sos" element={<EmergencySOSPage />} />
        <Route path="/mesh" element={<OfflineMeshDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;