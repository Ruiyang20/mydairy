import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Nav       from './components/Nav';
import InfoBar   from './components/InfoBar';
import HomePage  from './pages/HomePage';
import EntryPage from './pages/EntryPage';
import WritePage from './pages/WritePage';
import LoginPage from './pages/LoginPage';

// Guard: redirect to /login if not authenticated
function Protected({ children }) {
  const { authed, checking } = useAuth();
  const location = useLocation();
  if (checking) return <div style={{ padding: '80px 24px', textAlign: 'center', opacity: .4, fontFamily: 'Courier Prime, monospace' }}>Loading…</div>;
  if (!authed)  return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  const { authed, logout } = useAuth();

  return (
    <>
      {authed && <Nav onLogout={logout} />}
      {authed && <InfoBar />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Protected><HomePage /></Protected>} />
        <Route path="/entry/:id" element={<Protected><EntryPage /></Protected>} />
        <Route path="/write" element={<Protected><WritePage /></Protected>} />
        <Route path="/edit/:id" element={<Protected><WritePage /></Protected>} />
      </Routes>

      {/* FAB — only when logged in */}
      {authed && (
        <a href="/write" style={fabStyle}>+ 记事本</a>
      )}
    </>
  );
}

const fabStyle = {
  position: 'fixed',
  bottom: 28, right: 28,
  zIndex: 200,
  background: 'var(--ink)',
  color: 'var(--bg)',
  fontFamily: "'Special Elite', serif",
  fontSize: 13,
  padding: '12px 22px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
  textDecoration: 'none',
};
