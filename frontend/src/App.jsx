import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Capture from './pages/Capture';
import Sessions from './pages/Sessions';
import SessionDetail from './components/SessionDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="capture" element={<Capture />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="sessions/:id" element={<SessionDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;