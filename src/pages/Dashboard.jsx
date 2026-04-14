import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatCurrency, calculateProgress } from '../utils/formatters';
import { 
  TrendingUp, CircleDollarSign, Target, Plus, 
  Calendar, CheckCircle, X, Search 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import AIAdvisor from '../components/AIAdvisor';
import './Dashboard.css';

// Chart tooltip customization
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</p>
        <p style={{ fontWeight: 600, color: 'var(--primary)' }}>
          {formatCurrency(payload[0].value, currency)}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const goals = useStore((state) => state.goals);
  const currency = useStore((state) => state.preferences.currency);
  const financialProfile = useStore((state) => state.financialProfile);
  const addGoal = useStore((state) => state.addGoal);

  const [filter, setFilter] = useState('all'); // all, active, completed
  const [sortBy, setSortBy] = useState('deadline'); // deadline, progress, amount, alphabetical
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [newGoal, setNewGoal] = useState({ name: '', target: '', deadline: '' });
  const [formError, setFormError] = useState('');

  // Stats calculation
  const stats = useMemo(() => {
    let totalSaved = 0;
    let activeGoalsCount = 0;
    let completedGoalsCount = 0;

    goals.forEach(goal => {
      if (goal.status === 'completed') completedGoalsCount++;
      else activeGoalsCount++;
      
      totalSaved += goal.deposits.reduce((sum, d) => sum + d.amount, 0);
    });

    return { totalSaved, activeGoalsCount, completedGoalsCount };
  }, [goals]);

  // Chart data calculation
  const chartData = useMemo(() => {
    const monthlyData = {};
    goals.forEach(goal => {
      goal.deposits.forEach(deposit => {
        const date = new Date(deposit.date);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear] += deposit.amount;
      });
    });

    return Object.entries(monthlyData)
      .map(([name, amount]) => ({ name, amount }))
      // In a real app, you might want to sort these chronologically
      .reverse()
      .slice(0, 6); // Just show last 6 entries roughly
  }, [goals]);

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    let filtered = goals;
    if (filter !== 'all') {
      filtered = goals.filter(g => g.status === filter);
    }

    return filtered.sort((a, b) => {
      const progA = calculateProgress(a.deposits, a.target);
      const progB = calculateProgress(b.deposits, b.target);

      switch (sortBy) {
        case 'deadline':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        case 'progress':
          return progB.percentage - progA.percentage;
        case 'amount':
          return progB.total - progA.total;
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [goals, filter, sortBy]);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target) {
      setFormError('Name and target amount are required.');
      return;
    }
    
    addGoal({
      name: newGoal.name,
      target: Number(newGoal.target),
      deadline: newGoal.deadline || null
    });
    
    setNewGoal({ name: '', target: '', deadline: '' });
    setIsModalOpen(false);
    setFormError('');
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title text-gradient">Hello, {useStore(state => state.user?.name) || 'User'}!</h1>
          <p className="dashboard-subtitle">Here is your dynamic financial overview based on your profile.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          New Goal
        </button>
      </div>

      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon primary">
            <CircleDollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value text-gradient">{formatCurrency(stats.totalSaved, currency)}</span>
            <span className="stat-label">Total Saved</span>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon secondary">
            <Target size={24} />
          </div>
          <div className="stat-info">
             <span className="stat-value">{stats.activeGoalsCount}</span>
             <span className="stat-label">Active Goals</span>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon success">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
             <span className="stat-value">{stats.completedGoalsCount}</span>
             <span className="stat-label">Goals Completed</span>
          </div>
        </div>
      </div>

      {financialProfile && (
        <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', borderLeft: '4px solid var(--primary)', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
           <div>
             <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Monthly Income</span>
             <h3 style={{ fontSize: '1.25rem' }}>{formatCurrency(financialProfile.income, currency)}</h3>
           </div>
           <div>
             <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Fixed Expenses</span>
             <h3 style={{ fontSize: '1.25rem' }}>{formatCurrency(financialProfile.fixedCosts, currency)}</h3>
           </div>
           <div>
             <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Disposable Income</span>
             <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{formatCurrency(financialProfile.income - financialProfile.fixedCosts, currency)}</h3>
           </div>
        </div>
      )}

      <div className="glass-panel chart-section">
        <h2 className="chart-title">Saving Activity</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(val) => `$${val}`} stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="amount" fill="url(#colorUv)" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={1}/>
                  <stop offset="100%" stopColor="var(--secondary)" stopOpacity={1}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="controls-section">
        <div className="filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Goals</button>
          <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active</button>
          <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
        </div>
        
        <select 
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="deadline">Sort by Deadline</option>
          <option value="progress">Sort by Progress</option>
          <option value="amount">Sort by Amount Saved</option>
          <option value="alphabetical">Sort Alphabetically</option>
        </select>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
           <Target size={64} color="var(--primary)" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
           <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>Start Your Financial Journey</h3>
           <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '2rem' }}>
             Having clear, personalized financial goals is the best way to maintain clean data and organize your budget. Add a realistic goal now, and our AI Advisor will help you determine the best path forward.
           </p>
           <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ margin: '0 auto' }}>
            <Plus size={20} /> Let's Go
           </button>
        </div>
      ) : (
        <div className="goals-grid">
          {filteredGoals.map(goal => {
            const { percentage, total } = calculateProgress(goal.deposits, goal.target);
            const isCompleted = goal.status === 'completed';

            return (
              <Link 
                to={`/goal/${goal.id}`} 
                key={goal.id} 
                className={`glass-panel goal-card ${isCompleted ? 'completed' : ''}`}
              >
                <div className="goal-header">
                  <div>
                    <h3 className="goal-title">{goal.name}</h3>
                    {goal.deadline && (
                      <span className="goal-deadline">
                        <Calendar size={14} />
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <span className={`goal-status-badge ${isCompleted ? 'completed' : 'active'}`}>
                    {goal.status}
                  </span>
                </div>

                <div className="progress-info">
                  <div className="progress-amounts">
                    <span className="amount-saved">{formatCurrency(total, currency)}</span>
                    <span className="amount-target">of {formatCurrency(goal.target, currency)}</span>
                  </div>
                  <span className="progress-percent">{percentage}%</span>
                </div>

                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Goal</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddGoal}>
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label className="input-label">Goal Name <span style={{color: 'var(--danger)'}}>*</span></label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Vacation to Japan"
                  value={newGoal.name}
                  onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                />
              </div>
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label className="input-label">Target Amount <span style={{color: 'var(--danger)'}}>*</span></label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="e.g. 5000"
                  min="1"
                  value={newGoal.target}
                  onChange={e => setNewGoal({...newGoal, target: e.target.value})}
                />
              </div>
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">Deadline (Optional)</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={newGoal.deadline}
                  onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                />
              </div>
              
              {formError && <p className="error-text" style={{ marginBottom: '1rem' }}>{formError}</p>}
              
              <AIAdvisor 
                amount={newGoal.target} 
                deadline={newGoal.deadline} 
                profile={financialProfile} 
                currency={currency} 
              />
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
