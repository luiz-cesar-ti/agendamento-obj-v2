import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Consult } from './pages/Consult';
import { Admin } from './pages/Admin';
import { Help } from './pages/Help';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* All routes now use the main Layout for a consistent Navbar */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/historico" element={<History />} />
            <Route path="/consultar" element={<Consult />} />
            <Route path="/ajuda" element={<Help />} />
            <Route path="/oculto" element={<Admin />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
