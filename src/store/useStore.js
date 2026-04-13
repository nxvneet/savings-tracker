import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import mockData from '../data.json';

const loadInitialState = () => {
  const saved = localStorage.getItem('savings-tracker-state');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    goals: mockData.goals,
    preferences: mockData.preferences,
    user: null, // full-stack mock
  };
};

export const useStore = create((set, get) => ({
  ...loadInitialState(),

  saveState: () => {
    localStorage.setItem('savings-tracker-state', JSON.stringify({
      goals: get().goals,
      preferences: get().preferences,
      user: get().user
    }));
  },

  // Auth mock
  login: (email, password) => {
    set({ user: { id: uuidv4(), email, name: email.split('@')[0] } });
    get().saveState();
  },
  logout: () => {
    set({ user: null });
    get().saveState();
  },

  // Preferences
  setCurrency: (currency) => {
    set((state) => ({ preferences: { ...state.preferences, currency } }));
    get().saveState();
  },

  // Goals
  addGoal: (goalData) => {
    const newGoal = {
      id: uuidv4(),
      deposits: [],
      status: 'active',
      ...goalData,
    };
    set((state) => ({ goals: [...state.goals, newGoal] }));
    get().saveState();
  },

  updateGoal: (id, updates) => {
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id ? { ...goal, ...updates } : goal
      ),
    }));
    // Check if it should be completed
    get().checkGoalStatus(id);
    get().saveState();
  },

  deleteGoal: (id) => {
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== id),
    }));
    get().saveState();
  },

  reorderGoals: (newGoals) => {
    set({ goals: newGoals });
    get().saveState();
  },

  // Deposits
  addDeposit: (goalId, amount, note, date) => {
    const deposit = {
      id: uuidv4(),
      amount: Number(amount),
      note,
      date: date || new Date().toISOString(),
    };

    set((state) => ({
      goals: state.goals.map((goal) => {
        if (goal.id === goalId) {
          return {
            ...goal,
            deposits: [...goal.deposits, deposit],
          };
        }
        return goal;
      }),
    }));
    get().checkGoalStatus(goalId);
    get().saveState();
  },

  deleteDeposit: (goalId, depositId) => {
    set((state) => ({
      goals: state.goals.map((goal) => {
        if (goal.id === goalId) {
          return {
            ...goal,
            deposits: goal.deposits.filter((d) => d.id !== depositId),
          };
        }
        return goal;
      }),
    }));
    get().checkGoalStatus(goalId);
    get().saveState();
  },

  checkGoalStatus: (goalId) => {
    set((state) => ({
      goals: state.goals.map((goal) => {
        if (goal.id === goalId) {
          const totalSaved = goal.deposits.reduce((sum, d) => sum + d.amount, 0);
          const newStatus = totalSaved >= goal.target ? 'completed' : 'active';
          return { ...goal, status: newStatus };
        }
        return goal;
      }),
    }));
  }
}));
