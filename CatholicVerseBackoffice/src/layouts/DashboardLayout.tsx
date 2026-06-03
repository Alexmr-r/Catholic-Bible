import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Users, BookOpen, Settings, LogOut, Sun, Moon, ShieldAlert, ChevronDown } from 'lucide-react';

export default function DashboardLayout() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check initial system/localStorage theme
    const savedTheme = localStorage.getItem('cv-backoffice-theme');
    
    if (savedTheme === 'light') {
      setTheme('light');
      document.body.classList.remove('dark-theme');
    } else {
      setTheme('dark');
      document.body.classList.add('dark-theme');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.body.classList.remove('dark-theme');
      localStorage.setItem('cv-backoffice-theme', 'light');
    } else {
      setTheme('dark');
      document.body.classList.add('dark-theme');
      localStorage.setItem('cv-backoffice-theme', 'dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.reload();
  };

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>CatholicVerse</span>
        </div>
        
        <nav style={{ flex: 1, marginTop: '24px' }}>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Home size={20} /> Dashboard
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} /> Users & CRM
          </NavLink>
          <NavLink to="/content" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={20} /> Daily Readings
          </NavLink>
          <NavLink to="/logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ShieldAlert size={20} /> Audit Logs
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Settings size={20} /> Settings
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h2 style={{ fontSize: '22px' }}>Admin Portal</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Theme Toggle */}
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Admin User Dropdown */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '12px', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a160d', fontWeight: 'bold', fontSize: '15px' }}>
                  A
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Admin</span>
                <ChevronDown size={14} color="var(--text-muted)" style={{ transition: 'transform 0.2s', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px',
                  background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.25)', padding: '8px', zIndex: 999,
                  animation: 'fadeSlideIn 0.15s ease'
                }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Administrator</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>admin@catholicverse.com</div>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); window.location.href = '/settings'; }}
                    style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text)', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--burgundy-light)', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(144,48,64,0.08)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
