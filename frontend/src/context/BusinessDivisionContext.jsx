import React, { createContext, useContext, useState, useEffect } from 'react';

const BusinessDivisionContext = createContext();

export const DIVISIONS = [
  {
    key: 'all',
    name: 'All Businesses',
    shortName: 'All Businesses',
    color: '#3B82F6',
    badgeClass: 'bg-blue-900/40 text-blue-300 border-blue-700/50'
  },
  {
    key: 'construction',
    name: 'Jay Malhar Construction Equipments',
    shortName: 'Construction Equipments',
    color: '#D97706',
    badgeClass: 'bg-amber-900/40 text-amber-300 border-amber-700/50'
  },
  {
    key: 'solar',
    name: 'Sundatta Renewables',
    shortName: 'Sundatta Renewables',
    color: '#059669',
    badgeClass: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50'
  },
  {
    key: 'suppliers',
    name: 'Jay Malhar Suppliers & Traders',
    shortName: 'Suppliers & Traders',
    color: '#4B5563',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700'
  }
];

export function BusinessDivisionProvider({ children }) {
  // Read initial division from localStorage or default to 'all'
  const [currentDivision, setCurrentDivision] = useState(() => {
    return localStorage.getItem('jm_selected_division') || 'all';
  });

  useEffect(() => {
    localStorage.setItem('jm_selected_division', currentDivision);
  }, [currentDivision]);

  const activeDivisionConfig = DIVISIONS.find(d => d.key === currentDivision) || DIVISIONS[0];

  return (
    <BusinessDivisionContext.Provider
      value={{
        currentDivision,
        setCurrentDivision,
        activeDivisionConfig,
        divisions: DIVISIONS
      }}
    >
      {children}
    </BusinessDivisionContext.Provider>
  );
}

export function useBusinessDivision() {
  const context = useContext(BusinessDivisionContext);
  if (!context) {
    throw new Error('useBusinessDivision must be used within a BusinessDivisionProvider');
  }
  return context;
}
