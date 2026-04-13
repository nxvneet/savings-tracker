import { useState, useEffect } from 'react';
import { Lightbulb, X } from 'lucide-react';
import './TipPopup.css';

const tips = [
  "Pay yourself first: Automate a monthly transfer to your savings immediately after payday.",
  "Use the 50/30/20 rule: 50% needs, 30% wants, and 20% savings/investing.",
  "Check for subscriptions you no longer use and cancel them today.",
  "Delay purchases by 48 hours. If you still want it, then consider buying it.",
  "Invest in an index fund for long-term compounding rather than picking individual stocks.",
  "Cook meals at home! The average restaurant meal costs 300% more than cooking.",
  "Keep your emergency fund in a High-Yield Savings Account to combat inflation."
];

export default function TipPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [tip, setTip] = useState('');

  useEffect(() => {
    // Show a tip after 5 seconds
    const timer = setTimeout(() => {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setTip(randomTip);
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="tip-popup glass-panel animate-fade-in-up">
      <button className="close-tip" onClick={() => setIsVisible(false)}>
        <X size={14} />
      </button>
      <div className="tip-icon">
        <Lightbulb size={20} />
      </div>
      <div className="tip-content">
        <span className="tip-label">Daily Finance Hack</span>
        <p className="tip-text">{tip}</p>
      </div>
    </div>
  );
}
