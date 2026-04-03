import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeStorage } from './utils/storage';
import Dashboard from './pages/Dashboard';
import NewQuote from './pages/NewQuote';
import QuoteDetail from './pages/QuoteDetail';
import Clients from './pages/Clients';
import ClientForm from './pages/ClientForm';
import Settings from './pages/Settings';
import Footer from './components/Footer';
function App() {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-quote" element={<NewQuote />} />
        <Route path="/quote/:id" element={<QuoteDetail />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/new" element={<ClientForm />} />
        <Route path="/clients/:id" element={<ClientForm />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
       <Footer />
    </BrowserRouter>
  );
}

export default App;
