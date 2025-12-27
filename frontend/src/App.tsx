import { useState } from 'react';
import Layout from './components/Layout';
import HospitalsList from './components/HospitalsList';
import ApiTestPage from './components/ApiTestPage';

function App() {
  const [activePage, setActivePage] = useState('hospitals');

  const renderPage = () => {
    try {
      switch (activePage) {
        case 'hospitals':
          return <HospitalsList onAddHospital={() => alert('Add Hospital functionality coming soon!')} />;
      case 'dashboard':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
            <div className="bg-gray-900 rounded-lg p-6 text-white">
              <p className="text-gray-400">Dashboard content coming soon...</p>
            </div>
          </div>
        );
      case 'api-test':
        return <ApiTestPage />;
        default:
          return (
            <div className="p-6">
              <h1 className="text-3xl font-bold text-white mb-6">{activePage}</h1>
              <div className="bg-gray-900 rounded-lg p-6 text-white">
                <p className="text-gray-400">Page content coming soon...</p>
              </div>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return (
        <div className="p-6">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-400">
            <p className="font-semibold">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  );
}

export default App;