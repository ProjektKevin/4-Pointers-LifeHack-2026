import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SamplePage from './pages/SamplePage';
import NotFoundPage from './pages/NotFoundPage';
import AgentReadyOverviewPage from './pages/AgentReadyOverviewPage';
import AgentReadyCatalogPage from './pages/AgentReadyCatalogPage';
import AgentReadyInsightsPage from './pages/AgentReadyInsightsPage';
import AgentReadyPublishPage from './pages/AgentReadyPublishPage';
import AgentReadyLayout from './features/agentready/components/AgentReadyLayout';
import { AgentReadyProvider } from './features/agentready/AgentReadyContext';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={(
            <AgentReadyProvider>
              <AgentReadyLayout />
            </AgentReadyProvider>
          )}
        >
          <Route index element={<AgentReadyOverviewPage />} />
          <Route path="catalog" element={<AgentReadyCatalogPage />} />
          <Route path="insights" element={<AgentReadyInsightsPage />} />
          <Route path="publish" element={<AgentReadyPublishPage />} />
        </Route>
        <Route path="sample" element={<SamplePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App