import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Coins, Briefcase, Wallet, Target, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import './Onboarding.css';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState('USD');
  const [income, setIncome] = useState('');
  const [costs, setCosts] = useState('');
  const [goal, setGoal] = useState('');

  const completeOnboarding = useStore(state => state.completeOnboarding);
  const addGoal = useStore(state => state.addGoal);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    // Save onboarding preferences
    completeOnboarding(currency, {
      income: Number(income),
      fixedCosts: Number(costs)
    });

    // Generate a default goal with their input
    if (goal && Number(goal) > 0) {
      addGoal({
        name: 'My First Savings Goal',
        target: Number(goal),
        deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() // 1 year from now
      });
    }

    navigate('/');
  };

  const getCurrencySymbol = () => {
    switch(currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        {step === 1 && (
          <div className="step-content animate-in">
            <div className="step-icon">
              <Coins size={24} />
            </div>
            <h1 className="step-title">Welcome to Sphere</h1>
            <p className="step-subtitle">Let's set up your profile. What currency do you primarily use?</p>
            
            <div className="currency-grid">
              {['USD', 'EUR', 'GBP', 'INR'].map(c => (
                <div 
                  key={c}
                  className={`currency-option ${currency === c ? 'selected' : ''}`}
                  onClick={() => setCurrency(c)}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content animate-in">
            <div className="step-icon">
              <Briefcase size={24} />
            </div>
            <h1 className="step-title">Your Income</h1>
            <p className="step-subtitle">Roughly how much do you earn every month after taxes?</p>
            
            <div className="money-input-wrapper">
              <span className="currency-symbol">{getCurrencySymbol()}</span>
              <input 
                type="number" 
                className="money-input" 
                placeholder="0.00"
                value={income}
                onChange={e => setIncome(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content animate-in">
            <div className="step-icon">
              <Wallet size={24} />
            </div>
            <h1 className="step-title">Fixed Costs</h1>
            <p className="step-subtitle">How much are your essential monthly expenses? (Rent, food, bills)</p>
            
            <div className="money-input-wrapper">
              <span className="currency-symbol">{getCurrencySymbol()}</span>
              <input 
                type="number" 
                className="money-input" 
                placeholder="0.00"
                value={costs}
                onChange={e => setCosts(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content animate-in">
            <div className="step-icon">
              <Target size={24} />
            </div>
            <h1 className="step-title">Set a Goal</h1>
            <p className="step-subtitle">What is your immediate target savings goal amount?</p>
            
            <div className="money-input-wrapper">
              <span className="currency-symbol">{getCurrencySymbol()}</span>
              <input 
                type="number" 
                className="money-input" 
                placeholder="0.00"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        <div className="navigation-buttons">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={(step === 2 && !income) || (step === 3 && !costs) || (step === 4 && !goal)}
            style={{ opacity: ((step === 2 && !income) || (step === 3 && !costs) || (step === 4 && !goal)) ? 0.5 : 1 }}
          >
            {step === 4 ? (<>Complete <Sparkles size={18} /></>) : (<>Next <ArrowRight size={18}/></>)}
          </button>
        </div>
      </div>
    </div>
  );
}
