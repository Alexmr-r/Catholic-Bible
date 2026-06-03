import { useState } from 'react';
import { Lock, User, Sparkles, ShieldCheck } from 'lucide-react';

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'admin' && password === 'catholicadmin') {
      localStorage.setItem('isAuthenticated', 'true');
      onLoginSuccess();
    } else {
      setError('Invalid administrative credentials. Please verify keys.');
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #2a2415 0%, #1a160d 100%)',
      fontFamily: "'Inter', sans-serif",
      color: '#F1F5F9'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        background: '#221c10',
        border: '1px solid #3a3220',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#D4AF37'
        }}>
          <ShieldCheck size={32} />
        </div>

        <h1 style={{
          fontFamily: "'EB Garamond', serif",
          fontSize: '32px',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '8px'
        }}>
          CatholicVerse
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#94A3B8',
          marginBottom: '32px'
        }}>
          Ecosystem Administrative Portal
        </p>

        {error && (
          <div style={{
            background: 'rgba(144, 48, 64, 0.15)',
            border: '1px solid rgba(144, 48, 64, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            color: '#B23B50',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Admin Username</label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: '#1a160d',
              border: '1px solid #3a3220',
              borderRadius: '12px',
              padding: '0 16px'
            }}>
              <User size={18} color="#94A3B8" />
              <input 
                type="text" 
                placeholder="e.g. admin" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#F1F5F9',
                  padding: '14px 12px',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Secret PasswordKey</label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: '#1a160d',
              border: '1px solid #3a3220',
              borderRadius: '12px',
              padding: '0 16px'
            }}>
              <Lock size={18} color="#94A3B8" />
              <input 
                type="password" 
                placeholder="••••••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#F1F5F9',
                  padding: '14px 12px',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{
              background: '#D4AF37',
              color: '#1a160d',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#EBD698'}
            onMouseOut={(e) => e.currentTarget.style.background = '#D4AF37'}
          >
            <Sparkles size={18} /> Authenticate Admin Session
          </button>

        </form>

        <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginTop: '24px' }}>
          Restricted access. All connection handshakes are cryptographically logged.
        </span>
      </div>
    </div>
  );
}
