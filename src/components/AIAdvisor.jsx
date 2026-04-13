import { useMemo } from 'react';
import { Bot, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function AIAdvisor({ amount, deadline, profile, currency }) {
  if (!profile || !amount) return null;

  const targetAmount = Number(amount);
  if (targetAmount <= 0) return null;

  const analysis = useMemo(() => {
    const disposableIncome = profile.income - profile.fixedCosts;
    const monthsToDeadline = deadline 
      ? Math.max(1, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
      : 1; 

    // Assuming we don't want savings to exceed 50% of disposable income
    const safeMonthlySavings = disposableIncome * 0.5;
    const requiredMonthly = targetAmount / monthsToDeadline;

    if (disposableIncome <= 0) {
      return {
        level: 'danger',
        title: 'Critical Warning',
        message: 'Your fixed costs equal or exceed your income. You need to reduce expenses before attempting to save this amount.',
        icon: <AlertTriangle size={18} className="text-red-400" />
      };
    }

    if (requiredMonthly > disposableIncome) {
      return {
        level: 'danger',
        title: 'Unrealistic Goal',
        message: `This requires saving ${formatCurrency(requiredMonthly, currency)}/month, but you only have ${formatCurrency(disposableIncome, currency)} disposable income. Extend your deadline or reduce the target.`,
        icon: <AlertTriangle size={18} className="text-red-400" />
      };
    }

    if (requiredMonthly > safeMonthlySavings && requiredMonthly <= disposableIncome) {
      return {
        level: 'warning',
        title: 'Aggressive Goal',
        message: `You'll need to save ${formatCurrency(requiredMonthly, currency)}/month. This is over 50% of your disposable income. It's technically possible but will require strict budgeting.`,
        icon: <Info size={18} className="text-yellow-400" />
      };
    }

    if (targetAmount <= disposableIncome * 0.2) {
      return {
        level: 'success',
        title: 'Easily Achievable',
        message: `You can comfortably achieve this goal in the same month! It requires less than 20% of your disposable income.`,
        icon: <CheckCircle size={18} className="text-green-400" />
      };
    }

    return {
      level: 'success',
      title: 'Solid Financial Plan',
      message: `Great goal! Reserving ${formatCurrency(requiredMonthly, currency)}/month leaves you with a healthy buffer of ${formatCurrency(disposableIncome - requiredMonthly, currency)} for flexible spending.`,
      icon: <CheckCircle size={18} className="text-green-400" />
    };

  }, [amount, deadline, profile, currency]);

  const bgColor = {
    danger: 'rgba(239, 68, 68, 0.1)',
    warning: 'rgba(245, 158, 11, 0.1)',
    success: 'rgba(16, 185, 129, 0.1)'
  }[analysis.level];

  const borderColor = {
    danger: 'rgba(239, 68, 68, 0.3)',
    warning: 'rgba(245, 158, 11, 0.3)',
    success: 'rgba(16, 185, 129, 0.3)'
  }[analysis.level];

  return (
    <div 
      className="animate-fade-in"
      style={{
        marginTop: '1.5rem',
        padding: '1rem',
        borderRadius: '8px',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      }}
    >
      <div style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
        <Bot size={20} color="var(--primary)" />
      </div>
      <div>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '4px' }}>
          {analysis.icon}
          AI Advisor: {analysis.title}
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
          {analysis.message}
        </p>
      </div>
    </div>
  );
}
