import { useState, useEffect } from 'react';
import { Terminal, Database, Server, Cpu, RefreshCw } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  source: 'AUTH' | 'DATABASE' | 'AI_ENGINE' | 'BILLING';
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  executionTime?: string;
}

export default function Logs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl = localStorage.getItem('springBootUrl') || 'https://api.getcatholicverse.com/api/v1';

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/admin/audit-logs`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      setLogs(data);
      setIsLive(true);
    } catch (err) {
      console.warn('Backend connection offline, using sandbox mock logs.', err);
      setIsLive(false);
      // Fallback sandbox logs
      setLogs([
        { id: '1', timestamp: '2026-05-22 00:10:14', source: 'AI_ENGINE', level: 'INFO', message: 'RAG prompt processed for user john@example.com (context: Romans 8:28)', executionTime: '420ms' },
        { id: '2', timestamp: '2026-05-22 00:09:12', source: 'BILLING', level: 'INFO', message: 'RevenueCat webhook processed: User sarah.c@example.com upgraded to premium', executionTime: '15ms' },
        { id: '3', timestamp: '2026-05-22 00:05:43', source: 'DATABASE', level: 'INFO', message: 'Flyway migration baseline verified: 11 active scripts applied.', executionTime: '8ms' },
        { id: '4', timestamp: '2026-05-22 00:02:11', source: 'AUTH', level: 'INFO', message: 'Google Sign-In OAuth mapping verified for user maria.g@example.com', executionTime: '45ms' },
        { id: '5', timestamp: '2026-05-21 23:58:30', source: 'AI_ENGINE', level: 'WARN', message: 'Ollama endpoint requested while under high queue volume, execution throttled.', executionTime: '1520ms' },
        { id: '6', timestamp: '2026-05-21 23:45:12', source: 'DATABASE', level: 'ERROR', message: 'Production pool connection timed out (automatically recovered via hikari pool).', executionTime: '5000ms' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [backendUrl]);

  const filteredLogs = logs.filter(log => filterSource === 'ALL' || log.source === filterSource);

  const getLevelColor = (level: 'INFO' | 'WARN' | 'ERROR') => {
    switch (level) {
      case 'ERROR': return 'var(--burgundy-light)';
      case 'WARN': return 'var(--gold)';
      default: return 'var(--sage)';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Audit & System Logs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor Spring Boot backend execution, Ollama RAG timings, and security log details.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLogs} disabled={isLoading}>
          <RefreshCw size={16} style={{ animation: isLoading ? 'spin 1.5s linear infinite' : 'none' }} /> {isLoading ? 'Loading...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* System Status Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: isLive ? 'rgba(107, 144, 128, 0.15)' : 'rgba(144, 48, 64, 0.15)', padding: '12px', borderRadius: '12px', color: isLive ? 'var(--sage)' : 'var(--burgundy-light)' }}>
            <Server size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>SPRING BACKEND</span>
            <strong style={{ fontSize: '18px', color: isLive ? 'var(--sage)' : 'var(--burgundy-light)' }}>{isLive ? 'ONLINE (100%)' : 'OFFLINE'}</strong>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: isLive ? 'rgba(107, 144, 128, 0.15)' : 'rgba(144, 48, 64, 0.15)', padding: '12px', borderRadius: '12px', color: isLive ? 'var(--sage)' : 'var(--burgundy-light)' }}>
            <Database size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>POSTGRES DATABASE</span>
            <strong style={{ fontSize: '18px', color: isLive ? 'var(--sage)' : 'var(--burgundy-light)' }}>{isLive ? 'CONNECTED' : 'DISCONNECTED'}</strong>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: isLive ? 'rgba(107, 144, 128, 0.15)' : 'rgba(212, 175, 55, 0.15)', padding: '12px', borderRadius: '12px', color: isLive ? 'var(--sage)' : 'var(--gold)' }}>
            <Cpu size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>OLLAMA (llama 3.2)</span>
            <strong style={{ fontSize: '18px', color: isLive ? 'var(--sage)' : 'var(--gold)' }}>{isLive ? 'READY' : 'STANDBY'}</strong>
          </div>
        </div>

      </div>

      {/* Audit Log Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={20} color="var(--gold)" /> Live Transaction Logs
          </h3>
          <select 
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="form-select"
            style={{ width: '180px', padding: '8px 12px' }}
          >
            <option value="ALL">All Sources</option>
            <option value="AUTH">Authentication</option>
            <option value="DATABASE">Database</option>
            <option value="AI_ENGINE">AI Engine</option>
            <option value="BILLING">Billing</option>
          </select>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source</th>
                <th>Level</th>
                <th>Message Log details</th>
                <th style={{ textAlign: 'right' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '12px', letterSpacing: '0.5px' }}>{log.source}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 'bold', fontSize: '12px', color: getLevelColor(log.level) }}>
                        ● {log.level}
                      </span>
                    </td>
                    <td style={{ maxWidth: '450px', whiteSpace: 'normal', color: 'var(--text)' }}>
                      {log.message}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {log.executionTime || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
