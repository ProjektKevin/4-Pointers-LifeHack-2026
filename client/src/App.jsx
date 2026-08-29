import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SamplePage from './pages/SamplePage';
import NotFoundPage from './pages/NotFoundPage';
import AgentReadyOverviewPage from './pages/AgentReadyOverviewPage';
import AgentReadyCatalogPage from './pages/AgentReadyCatalogPage';
import AgentReadyInsightsPage from './pages/AgentReadyInsightsPage';
import AgentReadyLayout from './features/agentready/components/AgentReadyLayout';
import { AgentReadyProvider } from './features/agentready/AgentReadyContext';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="sample" element={<SamplePage />} />
        <Route
          path="agentready"
          element={(
            <AgentReadyProvider>
              <AgentReadyLayout />
            </AgentReadyProvider>
          )}
        >
          <Route index element={<AgentReadyOverviewPage />} />
          <Route path="catalog" element={<AgentReadyCatalogPage />} />
          <Route path="insights" element={<AgentReadyInsightsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App