import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useStore = create((set, get) => ({
  goals: [],
  preferences: { currency: 'USD' },
  user: null, 
  isOnboarded: false,
  financialProfile: null,
  authLoading: true,

  saveState: () => {
    const user = get().user;
    if (user && user.id) {
      localStorage.setItem(`sphere-data-${user.id}`, JSON.stringify({
        goals: get().goals,
        preferences: get().preferences,
        isOnboarded: get().isOnboarded,
        financialProfile: get().financialProfile
      }));
    }
  },

  // Auth mock
  login: (email, password) => {
    // Basic deterministic ID so same email = same storage path
    const deterministicId = `email-${btoa(email).substring(0, 16)}`;
    set({ user: { id: deterministicId, email, name: email.split('@')[0] } });
    
    // Attempt to hydrate storage for this email
    const savedData = localStorage.getItem(`sphere-data-${deterministicId}`);
    if (savedData) {
      set({ ...JSON.parse(savedData) });
    }
    
    get().saveState();
  },
  logout: () => {
    set({ 
      user: null, 
      goals: [], 
      preferences: { currency: 'USD' }, 
      isOnboarded: false, 
      financialProfile: null 
    });
  },

  // Preferences
  setCurrency: (currency) => {
    set((state) => ({ preferences: { ...state.preferences, currency } }));
    get().saveState();
  },

  completeOnboarding: (currency, profile) => {
    set((state) => ({ 
      preferences: { ...state.preferences, currency },
      financialProfile: profile,
      isOnboarded: true 
    }));
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
