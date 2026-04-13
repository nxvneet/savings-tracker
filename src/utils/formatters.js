export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const calculateProgress = (deposits, target) => {
  const total = deposits.reduce((sum, d) => sum + d.amount, 0);
  const percentage = target > 0 ? Math.min((total / target) * 100, 100) : 0;
  return {
    total,
    percentage: parseFloat(percentage.toFixed(1)),
    remaining: Math.max(target - total, 0)
  };
};

export const getProjectedCompletion = (deposits, target, startDate) => {
  if (deposits.length < 2) return null;
  // Sort deposits by date
  const sorted = [...deposits].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstDate = new Date(sorted[0].date);
  const lastDate = new Date(sorted[sorted.length - 1].date);
  
  const daysPassed = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
  const totalSaved = deposits.reduce((sum, d) => sum + d.amount, 0);
  
  if (daysPassed <= 0 || totalSaved <= 0 || totalSaved >= target) return null;
  
  const avgPerDay = totalSaved / daysPassed;
  const remaining = target - totalSaved;
  const daysToGoal = remaining / avgPerDay;
  
  const projectedDate = new Date(lastDate);
  projectedDate.setDate(projectedDate.getDate() + daysToGoal);
  return projectedDate;
};
