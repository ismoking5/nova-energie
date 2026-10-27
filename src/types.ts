export type CountryCode = 'BJ' | 'CM' | 'CI' | 'BF' | 'NE';

export interface Product {
  id: string;
  name: string;
  amount: number;
  dailyYield: number;
  totalReturn: number;
  duration: string;
  image: string;
  description: string;
  conditions: string;
  active: boolean;
}

export interface AppSettings {
  appName: string;
  logo: string;
  telegramLink: string;
  supportLink: string;
  supportContact: string;
  allowedCountries: CountryCode[];
  minDeposit: number;
  minWithdrawal: number;
  withdrawalFeePercent: number;
  welcomeBonus: number;
  bonusEnabled: boolean;
  maintenanceMode: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  country: CountryCode;
  phone: string;
  referralCode: string;
  sponsorCode?: string;
  role: 'user' | 'admin';
}

export interface Wallet {
  availableBalance: number;
  reservedBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  contractDue: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  seen: boolean;
  createdAt: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  amount: number;
  network: string;
  paymentNumber: string;
  country: CountryCode;
  reference: string;
  status: 'En attente' | 'Approuvé' | 'Rejeté';
  createdAt: string;
  rejectionReason?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  amount: number;
  fee: number;
  net: number;
  network: string;
  beneficiaryNumber: string;
  country: CountryCode;
  status: 'En attente' | 'Payé' | 'Rejeté' | 'Échoué';
  createdAt: string;
  paymentReference?: string;
  rejectionReason?: string;
}

export interface ReferralRecord {
  id: string;
  referredName: string;
  status: 'actif' | 'validé' | 'bloqué';
  date: string;
  level: 1 | 2 | 3;
  commission: number;
}
