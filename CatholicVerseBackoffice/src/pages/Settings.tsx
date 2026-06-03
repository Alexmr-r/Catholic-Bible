import { useState } from 'react';
import { Save, Database, Shield, Globe, Cpu, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [backendUrl, setBackendUrl] = useState(localStorage.getItem('springBootUrl') || 'https://api.getcatholicverse.com/api/v1');
  const [ollamaUrl, setOllamaUrl] = useState(localStorage.getItem('ollamaUrl') || 'http://137.184.139.1:11434');
  const [revenueCatKey, setRevenueCatKey] = useState(localStorage.getItem('revenueCatKey') || 'str_rc_xxxxxxxxxxxxxxxxxxxxxx');
  const [resendKey, setResendKey] = useState(localStorage.getItem('resendKey') || 're_xxxxxxxxxxxxxxxxxxx');
  const [systemPrompt, setSystemPrompt] = useState(
    localStorage.getItem('systemPrompt') || 'You are a Roman Catholic theological assistant. Provide answers in full compliance with the Catechism of the Catholic Church. Always site the Bible and the Catechism chapters when possible.'
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('springBootUrl', backendUrl);
    localStorage.setItem('ollamaUrl', ollamaUrl);
    localStorage.setItem('revenueCatKey', revenueCatKey);
    localStorage.setItem('resendKey', resendKey);
    localStorage.setItem('systemPrompt', systemPrompt);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Settings & Integrations</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure system variables, API connection keys, and core AI behaviors.</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Core Endpoints */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold)' }}>
            <Globe size={20} /> Production Endpoints
          </h3>
          
          <div className="form-group">
            <label className="form-label">Spring Boot API Base URL</label>
            <input type="url" className="form-input" value={backendUrl} onChange={e => setBackendUrl(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Ollama LLM Server Endpoint</label>
            <input type="url" className="form-input" value={ollamaUrl} onChange={e => setOllamaUrl(e.target.value)} required />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DigitalOcean droplet IP processing Llama 3.2 queries.</span>
          </div>
        </div>

        {/* Third Party Keys */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold)' }}>
            <Shield size={20} /> API Credentials
          </h3>
          
          <div className="form-group">
            <label className="form-label">RevenueCat API Key</label>
            <input type="password" className="form-input" value={revenueCatKey} onChange={e => setRevenueCatKey(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Resend E-Mail Key</label>
            <input type="password" className="form-input" value={resendKey} onChange={e => setResendKey(e.target.value)} required />
          </div>
        </div>

        {/* AI Prompting */}
        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold)' }}>
            <Cpu size={20} /> AI Assistant Configuration (System Prompt)
          </h3>
          
          <div className="form-group">
            <label className="form-label">Theological System Guidelines</label>
            <textarea 
              rows={4} 
              className="form-textarea" 
              value={systemPrompt} 
              onChange={e => setSystemPrompt(e.target.value)} 
              required 
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Controls the theological bounds and personality structure of the Llama 3.2 engine in the mobile app.
            </span>
          </div>
        </div>

        {/* Database Operations */}
        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
          <h3 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold)' }}>
            <Database size={20} /> System Maintenance Tools
          </h3>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={() => alert('Triggering full PostgreSQL dump baseline...')}>
              Trigger DB Backup (.sql)
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => alert('Executing flyway repair baseline validation...')}>
              Run Flyway Baseline Repair
            </button>
            <button type="button" className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => alert('Wiping local development cache details...')}>
              <AlertTriangle size={16} /> Clear Cache
            </button>
          </div>
        </div>

        {/* Floating Save Actions */}
        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
          {isSaved && <span style={{ color: 'var(--sage)', fontWeight: 600, fontSize: '14px' }}>✓ Settings successfully updated!</span>}
          <button type="submit" className="btn">
            <Save size={18} /> Save Configurations
          </button>
        </div>

      </form>
    </div>
  );
}
