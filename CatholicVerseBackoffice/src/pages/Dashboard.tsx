import { useState, useEffect } from 'react';
import { Users, CreditCard, Activity, ArrowUpRight, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [premiumCount, setPremiumCount] = useState<number | null>(null);
  const [activeNow, setActiveNow] = useState<number>(0);
  const [aiQueriesCount, setAiQueriesCount] = useState<number>(0);
  const [userDistribution, setUserDistribution] = useState<any[]>([]);
  const [trendingPrompts, setTrendingPrompts] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);

  const backendUrl = localStorage.getItem('springBootUrl') || 'https://api.getcatholicverse.com/api/v1';

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch(`${backendUrl}/admin/dashboard-stats`);
        if (!res.ok) throw new Error('API offline');
        const stats = await res.json();
        
        setUsersCount(stats.totalUsers);
        setPremiumCount(stats.premiumUsers);
        setActiveNow(stats.activeNow);
        setAiQueriesCount(stats.aiQueriesCount);
        setUserDistribution(stats.userDistribution);
        setTrendingPrompts(stats.trendingPrompts);
        setIsLive(true);
      } catch (err) {
        console.warn('Backend connection offline, rendering local sandbox indicators.', err);
        setIsLive(false);
        // Sandbox fallback mock indicators
        setUsersCount(12450);
        setPremiumCount(3240);
        setActiveNow(1842);
        setAiQueriesCount(9120);
        setUserDistribution([
          { country: 'United States (Primary Market)', count: 6890, percentage: 55 },
          { country: 'United Kingdom', count: 1840, percentage: 15 },
          { country: 'Canada', count: 1245, percentage: 10 },
          { country: 'Philippines', count: 980, percentage: 8 }
        ]);
        setTrendingPrompts([
          { prompt: 'Explain Catholic context of Romans 8:28', queries: 1240 },
          { prompt: 'Difference between CPDV and Vulgate', queries: 940 },
          { prompt: 'Catholic perspective on predestination', queries: 812 }
        ]);
      }
    };
    fetchDashboardStats();
  }, [backendUrl]);

  const displayUsers = usersCount !== null ? usersCount : 0;
  const displayPremium = premiumCount !== null ? premiumCount : 0;
  const conversionRate = displayUsers > 0 ? Math.round((displayPremium / displayUsers) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Real-time analytics and management operations for CatholicVerse.{' '}
            <span style={{ 
              fontSize: '12px', 
              background: isLive ? 'rgba(107, 144, 128, 0.15)' : 'rgba(212, 175, 55, 0.15)', 
              color: isLive ? 'var(--sage)' : 'var(--gold)', 
              padding: '4px 10px', 
              borderRadius: '20px',
              marginLeft: '8px',
              fontWeight: 600
            }}>
              {isLive ? '● Live PostgreSQL Connected' : '● Standalone Sandbox Mode'}
            </span>
          </p>
        </div>
        <button className="btn" onClick={() => window.location.reload()}>
          <Sparkles size={16} /> Sync RevenueCat & DB
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>TOTAL USERS</span>
            <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px', color: 'var(--gold)' }}>
              <Users size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '38px', margin: '0', fontFamily: "'EB Garamond', serif" }}>
            {displayUsers.toLocaleString()}
          </h2>
          <p style={{ color: 'var(--sage)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontWeight: 500 }}>
            <ArrowUpRight size={16} /> {isLive ? 'Real-time database sync' : '+12.4% this month'}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>PREMIUM MEMBERS</span>
            <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px', color: 'var(--gold)' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '38px', margin: '0', fontFamily: "'EB Garamond', serif" }}>
            {displayPremium.toLocaleString()}
          </h2>
          <p style={{ color: 'var(--sage)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontWeight: 500 }}>
            <ArrowUpRight size={16} /> {isLive ? 'RevenueCat active subscriptions' : '+8.5% this month'}
          </p>
          <div className="visual-chart-bar">
            <div className="visual-chart-fill" style={{ width: `${conversionRate}%` }}></div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
            {conversionRate}% conversion rate (Freemium)
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>ACTIVE NOW</span>
            <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px', color: 'var(--gold)' }}>
              <Activity size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '38px', margin: '0', fontFamily: "'EB Garamond', serif" }}>
            {activeNow.toLocaleString()}
          </h2>
          <p style={{ color: 'var(--sage)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontWeight: 500 }}>
            <ArrowUpRight size={16} /> {isLive ? 'Real-time session estimation' : '+4.2% active sessions'}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>AI QUERIES (OLLAMA)</span>
            <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px', color: 'var(--gold)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '38px', margin: '0', fontFamily: "'EB Garamond', serif" }}>
            {aiQueriesCount.toLocaleString()}
          </h2>
          <p style={{ color: 'var(--sage)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontWeight: 500 }}>
            <ArrowUpRight size={16} /> {isLive ? 'Total prompt requests processed' : '+20% prompt engagement'}
          </p>
        </div>

      </div>

      {/* Two Column Layout for Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        
        {/* CRM quick check */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '22px' }}>Active User Distribution</h3>
            <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }}>Global Growth</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {userDistribution.map((dist, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                  <span>{dist.country}</span>
                  <strong>{dist.count} users ({dist.percentage}%)</strong>
                </div>
                <div className="visual-chart-bar">
                  <div className="visual-chart-fill" style={{ width: `${dist.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most asked AI theology prompts */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '22px' }}>Trending AI Prompts (Llama 3.2)</h3>
            <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }}>Popular Queries</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {trendingPrompts.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: idx < trendingPrompts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontStyle: 'italic', color: 'var(--gold)', fontSize: '18px', fontWeight: 'bold', width: '24px' }}>#{idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{p.prompt}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Queried {p.queries.toLocaleString()} times</div>
                </div>
                <BookOpen size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
