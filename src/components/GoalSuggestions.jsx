import { useMemo, useState } from 'react';
import { Sparkles, Plus, ChevronRight, Shield, Plane, Car, Laptop, Home, GraduationCap, Heart, Dumbbell } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import './GoalSuggestions.css';

const GOAL_TEMPLATES = [
  {
    id: 'emergency',
    icon: Shield,
    iconColor: '#10b981',
    category: 'Essential',
    getTitle: () => 'Emergency Fund',
    getDescription: (profile) => `3–6 months of your fixed costs as a safety net.`,
    getTarget: (profile) => Math.round(profile.fixedCosts * 4),
    getMonths: () => 6,
    priorityScore: (profile) => 100, // always top priority
    badgeLabel: '🔥 Priority',
    badgeColor: '#ef4444',
  },
  {
    id: 'vacation',
    icon: Plane,
    iconColor: '#3b82f6',
    category: 'Lifestyle',
    getTitle: () => 'Dream Vacation',
    getDescription: (profile) => `Save for a well-earned break. Based on your disposable income you can do this comfortably.`,
    getTarget: (profile) => Math.round(Math.max(profile.income * 0.8, 500)),
    getMonths: (profile) => Math.ceil((profile.income * 0.8) / ((profile.income - profile.fixedCosts) * 0.2)),
    priorityScore: (profile) => 60,
    badgeLabel: null,
    badgeColor: null,
  },
  {
    id: 'car',
    icon: Car,
    iconColor: '#f59e0b',
    category: 'Big Purchase',
    getTitle: () => 'Car Down Payment',
    getDescription: (profile) => `A 20% down payment keeps your monthly car loan manageable.`,
    getTarget: (profile) => Math.round(profile.income * 3),
    getMonths: (profile) => Math.ceil((profile.income * 3) / ((profile.income - profile.fixedCosts) * 0.3)),
    priorityScore: (profile) => profile.income > 3000 ? 70 : 40,
    badgeLabel: null,
    badgeColor: null,
  },
  {
    id: 'tech',
    icon: Laptop,
    iconColor: '#8b5cf6',
    category: 'Smart Spend',
    getTitle: () => 'Tech Upgrade',
    getDescription: (profile) => `Save for a new laptop or device instead of going into debt for it.`,
    getTarget: (profile) => Math.round(Math.min(profile.income * 0.6, 2000)),
    getMonths: (profile) => Math.ceil((profile.income * 0.6) / ((profile.income - profile.fixedCosts) * 0.15)),
    priorityScore: (profile) => 50,
    badgeLabel: null,
    badgeColor: null,
  },
  {
    id: 'housing',
    icon: Home,
    iconColor: '#ec4899',
    category: 'Long Term',
    getTitle: () => 'Home Down Payment',
    getDescription: (profile) => `Long-term wealth building. Start small, stay consistent.`,
    getTarget: (profile) => Math.round(profile.income * 24),
    getMonths: (profile) => 36,
    priorityScore: (profile) => profile.income > 5000 ? 80 : 30,
    badgeLabel: '📈 Wealth',
    badgeColor: '#10b981',
  },
  {
    id: 'education',
    icon: GraduationCap,
    iconColor: '#06b6d4',
    category: 'Growth',
    getTitle: () => 'Learning Fund',
    getDescription: (profile) => `Invest in a course, certification, or skill. Best ROI of any goal.`,
    getTarget: (profile) => Math.round(Math.min(profile.disposable * 3, 800)),
    getMonths: (profile) => 3,
    priorityScore: (profile) => 65,
    badgeLabel: '⚡ Fast Win',
    badgeColor: '#06b6d4',
  },
  {
    id: 'health',
    icon: Heart,
    iconColor: '#f43f5e',
    category: 'Wellbeing',
    getTitle: () => 'Health & Wellness',
    getDescription: (profile) => `Gym membership, health check-ups, or mental health support.`,
    getTarget: (profile) => Math.round(profile.disposable * 2),
    getMonths: (profile) => 2,
    priorityScore: (profile) => 55,
    badgeLabel: null,
    badgeColor: null,
  },
  {
    id: 'fitness',
    icon: Dumbbell,
    iconColor: '#f97316',
    category: 'Lifestyle',
    getTitle: () => 'Fitness Setup',
    getDescription: (profile) => `Home gym or premium gym membership. A one-time investment in your health.`,
    getTarget: (profile) => Math.round(Math.min(profile.disposable * 1.5, 600)),
    getMonths: (profile) => 2,
    priorityScore: (profile) => 40,
    badgeLabel: null,
    badgeColor: null,
  },
];

function getMonthsLabel(months) {
  if (!months || isNaN(months) || !isFinite(months)) return null;
  months = Math.max(1, Math.min(months, 120));
  if (months === 1) return '~1 month away';
  if (months < 12) return `~${months} months away`;
  const yrs = Math.ceil(months / 12);
  return `~${yrs} year${yrs > 1 ? 's' : ''} away`;
}

export default function GoalSuggestions({ profile, currency, existingGoalIds = [], onAddGoal }) {
  const [dismissed, setDismissed] = useState([]);

  const suggestions = useMemo(() => {
    if (!profile || !profile.income || !profile.fixedCosts) return [];
    
    const disposable = profile.income - profile.fixedCosts;
    const profileWithDisposable = { ...profile, disposable };

    return GOAL_TEMPLATES
      .filter(t => !dismissed.includes(t.id) && !existingGoalIds.includes(t.id))
      .map(t => ({
        ...t,
        title: t.getTitle(profileWithDisposable),
        description: t.getDescription(profileWithDisposable),
        target: Math.max(100, t.getTarget(profileWithDisposable)),
        months: t.getMonths ? t.getMonths(profileWithDisposable) : null,
        score: t.priorityScore(profileWithDisposable),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [profile, dismissed, existingGoalIds]);

  if (!profile || suggestions.length === 0) return null;

  return (
    <div className="suggestions-section">
      <div className="suggestions-header">
        <div className="suggestions-title-group">
          <Sparkles size={18} className="suggestions-sparkle" />
          <h2 className="suggestions-title">Personalised For You</h2>
        </div>
        <p className="suggestions-subtitle">
          Based on your {formatCurrency(profile.income - profile.fixedCosts, currency)} monthly disposable income
        </p>
      </div>

      <div className="suggestions-grid">
        {suggestions.map(s => {
          const Icon = s.icon;
          const timeLabel = getMonthsLabel(s.months);

          return (
            <div key={s.id} className="suggestion-card glass-panel">
              {s.badgeLabel && (
                <span className="suggestion-badge" style={{ background: s.badgeColor + '22', color: s.badgeColor, border: `1px solid ${s.badgeColor}44` }}>
                  {s.badgeLabel}
                </span>
              )}
              
              <div className="suggestion-icon-wrap" style={{ background: s.iconColor + '22' }}>
                <Icon size={22} color={s.iconColor} />
              </div>

              <div className="suggestion-cat">{s.category}</div>
              <h3 className="suggestion-name">{s.title}</h3>
              <p className="suggestion-desc">{s.description}</p>

              <div className="suggestion-meta">
                <span className="suggestion-amount" style={{ color: s.iconColor }}>
                  {formatCurrency(s.target, currency)}
                </span>
                {timeLabel && (
                  <span className="suggestion-time">{timeLabel}</span>
                )}
              </div>

              <div className="suggestion-actions">
                <button
                  className="btn btn-primary suggestion-add-btn"
                  onClick={() => onAddGoal({ name: s.title, target: s.target })}
                >
                  <Plus size={16} /> Add Goal
                </button>
                <button
                  className="suggestion-dismiss"
                  onClick={() => setDismissed(prev => [...prev, s.id])}
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
