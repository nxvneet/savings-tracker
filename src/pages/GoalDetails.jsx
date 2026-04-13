import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatCurrency, calculateProgress, getProjectedCompletion } from '../utils/formatters';
import { 
  ArrowLeft, Trash2, Edit3, Plus, 
  Calendar, Award, TrendingUp, AlertCircle, ArrowDownCircle, Trash
} from 'lucide-react';
import './GoalDetails.css';

export default function GoalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const goal = useStore((state) => state.goals.find(g => g.id === id));
  const currency = useStore((state) => state.preferences.currency);
  const addDeposit = useStore((state) => state.addDeposit);
  const deleteGoal = useStore((state) => state.deleteGoal);
  const updateGoal = useStore((state) => state.updateGoal);
  const deleteDeposit = useStore((state) => state.deleteDeposit);

  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [formError, setFormError] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', target: '', deadline: '' });

  if (!goal) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Goal not found</h2>
        <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const { percentage, total, remaining } = calculateProgress(goal.deposits, goal.target);
  const projectedDate = getProjectedCompletion(goal.deposits, goal.target, goal.createdAt);
  const isCompleted = goal.status === 'completed';

  const handleAddDeposit = (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }
    
    addDeposit(id, depositAmount, depositNote);
    setDepositAmount('');
    setDepositNote('');
    setFormError('');
  };

  const handleDeleteGoal = () => {
    if (window.confirm('Are you sure you want to delete this goal? All deposit history will be lost.')) {
      deleteGoal(id);
      navigate('/');
    }
  };

  const handleEditInit = () => {
    setEditData({
      name: goal.name,
      target: goal.target,
      deadline: goal.deadline || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateGoal(id, {
      name: editData.name,
      target: Number(editData.target),
      deadline: editData.deadline || null
    });
    setIsEditing(false);
  };

  return (
    <div className="animate-fade-in">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} />
        Back to Dashboard
      </Link>

      <div className="goal-details-header">
        <div>
          {isEditing ? (
            <input 
              type="text" 
              className="input-field" 
              style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', width: '100%', maxWidth: '400px' }}
              value={editData.name}
              onChange={e => setEditData({...editData, name: e.target.value})}
            />
          ) : (
            <h1 className={`goal-details-title ${isCompleted ? 'completed' : ''}`}>
              {goal.name}
            </h1>
          )}
          <span className={`goal-status-badge ${isCompleted ? 'completed' : 'active'}`}>
            {isCompleted ? 'Goal Reached!' : 'In Progress'}
          </span>
        </div>

        <div className="actions-group">
          {isEditing ? (
            <>
               <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
               <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={handleEditInit} title="Edit Goal">
                <Edit3 size={18} />
              </button>
              <button className="btn btn-danger" onClick={handleDeleteGoal} title="Delete Goal">
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`glass-panel hero-stats-card ${isCompleted ? 'completed' : ''}`}>
        {isCompleted && (
          <div className="completed-banner">
            <Award size={24} />
            Congratulations! You've successfully reached your target for this goal.
          </div>
        )}

        <div className="hero-stats-grid">
          <div className="main-progress">
             {isEditing ? (
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <label className="meta-label">Target:</label>
                 <input 
                   type="number" 
                   className="input-field" 
                   value={editData.target}
                   onChange={e => setEditData({...editData, target: e.target.value})}
                   style={{ width: '150px' }}
                 />
               </div>
             ) : (
               <div className="amounts-display">
                 <span className="current-amount">{formatCurrency(total, currency)}</span>
                 <span className="target-amount">/ {formatCurrency(goal.target, currency)} target</span>
               </div>
             )}

             <div className="large-progress-wrapper" style={{ marginTop: '1rem' }}>
               <span className="percentage-label">{percentage}%</span>
               <div className="large-progress-bg">
                 <div className="large-progress-fill" style={{ width: `${percentage}%` }}></div>
               </div>
             </div>
          </div>

          <div className="meta-stats">
            <div className="meta-item">
              <span className="meta-label">Remaining to save</span>
              <span className="meta-value">{formatCurrency(remaining, currency)}</span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label">Deadline</span>
              {isEditing ? (
                <input 
                  type="date"
                  className="input-field"
                  value={editData.deadline}
                  onChange={e => setEditData({...editData, deadline: e.target.value})}
                />
              ) : (
                <span className="meta-value text-muted">
                  <Calendar size={18} />
                  {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline set'}
                </span>
              )}
            </div>

            {!isCompleted && projectedDate && (
              <div className="meta-item">
                <span className="meta-label">Projected Completion</span>
                <span className="meta-value" style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                  <TrendingUp size={16} />
                  {projectedDate.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="history-section">
          <div className="history-header">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Deposit History</h2>
            <span style={{ color: 'var(--text-muted)' }}>{goal.deposits.length} deposits</span>
          </div>

          {goal.deposits.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', opacity: 0.7 }}>
              <AlertCircle size={32} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
              <p>No deposits yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="history-list">
              {[...goal.deposits].sort((a, b) => new Date(b.date) - new Date(a.date)).map(deposit => (
                <div key={deposit.id} className="history-item">
                  <div className="history-details">
                    <div className="history-icon">
                      <ArrowDownCircle size={20} />
                    </div>
                    <div className="history-text">
                      <span className="history-note">{deposit.note || 'Deposit'}</span>
                      <span className="history-date">
                        {new Date(deposit.date).toLocaleDateString()} at {new Date(deposit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="history-amount">+{formatCurrency(deposit.amount, currency)}</span>
                    <button 
                      className="delete-deposit-btn" 
                      onClick={() => deleteDeposit(id, deposit.id)}
                      title="Delete entry"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
           {!isCompleted && (
             <div className="glass-panel add-deposit-card sticky top-6">
               <h3 className="add-deposit-title">
                 <Plus size={20} className="text-primary"/> Add Funds
               </h3>
               
               <form onSubmit={handleAddDeposit}>
                 <div className="form-group">
                   <label className="input-label">Amount <span style={{color: 'var(--danger)'}}>*</span></label>
                   <div style={{ position: 'relative' }}>
                     <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                     <input 
                       type="number" 
                       className="input-field" 
                       style={{ paddingLeft: '2rem', width: '100%' }}
                       placeholder="0.00"
                       min="1"
                       value={depositAmount}
                       onChange={e => setDepositAmount(e.target.value)}
                     />
                   </div>
                 </div>

                 <div className="form-group">
                   <label className="input-label">Note (Optional)</label>
                   <input 
                     type="text" 
                     className="input-field" 
                     placeholder="e.g. Bonus, Salary"
                     style={{ width: '100%' }}
                     value={depositNote}
                     onChange={e => setDepositNote(e.target.value)}
                   />
                 </div>

                 {formError && <p className="error-text" style={{ marginBottom: '1rem' }}>{formError}</p>}

                 <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                   Confirm Deposit
                 </button>
               </form>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
