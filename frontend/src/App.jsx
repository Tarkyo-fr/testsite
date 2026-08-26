import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import Home from './pages/Home.jsx';
import Planning from './pages/Planning.jsx';
import Site from './pages/Site.jsx';
import Profil from './pages/Profil.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/site" element={<Site />} />
        <Route path="/profil" element={<Profil />} />
      </Routes>
    </AuthProvider>
  );
}
