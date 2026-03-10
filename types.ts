
export interface Student {
  id: string;
  name: string;
  avatar: string;
  points: number;
  campusCoins: number;
  class: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  type: 'standard' | 'special'; // standard: 商品奖励, special: 特殊奖励
}

export interface BankAccount {
  currentBalance: number;
  deposits: Deposit[];
}

export interface Deposit {
  id: string;
  type: 'fixed' | 'current';
  amount: number;
  startDate: number;
  termDays: number;
  interestRate: number;
  status: 'active' | 'matured' | 'withdrawn';
  label: string;
}

export interface BehaviorRecord {
  id: string;
  description: string;
  teacher: string;
  time: string;
  type: 'positive' | 'negative';
  score: number;
}

export type TierLevel = 'star' | 'active' | 'stable' | 'improve';

export interface GrowthStatus {
  currentTier: TierLevel;
  currentScore: number;
  nextTierScoreNeeded: number;
  records: BehaviorRecord[];
}

export type ViewState = 'welcome' | 'scanning' | 'dashboard' | 'exchange' | 'shop' | 'bank' | 'growth' | 'success' | 'vending-admin';

export enum TermType {
  CURRENT = 0,
  ONE_WEEK = 7,
  ONE_MONTH = 30,
  HALF_YEAR = 180,
  ONE_YEAR = 365
}
