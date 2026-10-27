import { Product, AppSettings, UserProfile, Wallet, NotificationItem, DepositRequest, WithdrawalRequest, ReferralRecord, CountryCode } from '../types';

export const allowedCountries: CountryCode[] = ['BJ', 'CM', 'CI', 'BF', 'NE'];

export const appSettings: AppSettings = {
  appName: 'NOVA ÉNERGIE',
  logo: 'NOVA ÉNERGIE',
  telegramLink: 'https://t.me/+74TGsMBlIwwyYTI0',
  supportLink: 'https://t.me/+74TGsMBlIwwyYTI0',
  supportContact: 'support@novaenergie.example',
  allowedCountries: allowedCountries,
  minDeposit: 2000,
  minWithdrawal: 800,
  withdrawalFeePercent: 15,
  welcomeBonus: 500,
  bonusEnabled: true,
  maintenanceMode: false,
};

export const products: Product[] = [
  { id: 'P-2000', name: 'NOVA Start', amount: 2000, dailyYield: 300, totalReturn: 54000, duration: '12 mois', image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=900&q=80', description: 'Pack d’entrée pour un démarrage progressif et maîtrisé.', conditions: 'Montant minimum 2000 FCFA. Validation par l’administration.', active: true },
  { id: 'P-5000', name: 'NOVA Énergie', amount: 5000, dailyYield: 800, totalReturn: 144000, duration: '12 mois', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80', description: 'Produit de croissance régulière orienté performance et stabilité.', conditions: 'Souscription selon les conditions validées du contrat.', active: true },
  { id: 'P-15000', name: 'NOVA Pulse', amount: 15000, dailyYield: 2400, totalReturn: 432000, duration: '12 mois', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80', description: 'Pack moyen avec un rendement annoncé clair et configurable.', conditions: 'Validation admin pour l’activation du contrat.', active: true },
  { id: 'P-35000', name: 'NOVA Prime', amount: 35000, dailyYield: 5600, totalReturn: 1008000, duration: '12 mois', image: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=900&q=80', description: 'Produit segmenté pour investissement plus important.', conditions: 'Admission par validation manuelle selon le modèle commercial.', active: true },
  { id: 'P-50000', name: 'NOVA Max', amount: 50000, dailyYield: 8500, totalReturn: 1530000, duration: '12 mois', image: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=900&q=80', description: 'Produit premium pour investisseurs au niveau intermédiaire.', conditions: 'Rendement annoncé visible dans le profil produit.', active: true },
  { id: 'P-100000', name: 'NOVA Horizon', amount: 100000, dailyYield: 17000, totalReturn: 3060000, duration: '12 mois', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80', description: 'Produit à forte capacité de capitalisation et de sécurisation.', conditions: 'Vérification de la source des fonds et conformité interne.', active: true },
  { id: 'P-250000', name: 'NOVA Vision', amount: 250000, dailyYield: 45000, totalReturn: 8100000, duration: '12 mois', image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80', description: 'Produit d’exception pour un engagement de taille importante.', conditions: 'Validation stricte, signature du contrat et preuve de solvabilité.', active: true },
];

export const profile: UserProfile = {
  id: 'USR-1001',
  fullName: 'Aissatou Soro',
  country: 'BJ',
  phone: '+22997000000',
  referralCode: 'NOVA-12A',
  sponsorCode: 'NOVA-ADMIN',
  role: 'user',
};

export const wallet: Wallet = {
  availableBalance: 185000,
  reservedBalance: 24000,
  totalDeposits: 450000,
  totalWithdrawals: 270000,
  contractDue: 45000,
};

export const notifications: NotificationItem[] = [
  { id: 'n1', title: 'Inscription réussie', message: 'Votre compte a été créé avec succès.', type: 'success', seen: false, createdAt: '2026-10-25T08:30:00Z' },
  { id: 'n2', title: 'Bonus attribué', message: 'Un bonus de 500 FCFA a été ajouté à votre portefeuille.', type: 'info', seen: false, createdAt: '2026-10-25T09:00:00Z' },
  { id: 'n3', title: 'Dépôt en attente', message: 'Votre demande de dépôt n’a pas encore été validée par l’admin.', type: 'warning', seen: true, createdAt: '2026-10-26T12:00:00Z' },
];

export const depositRequests: DepositRequest[] = [
  { id: 'DEP-001', userId: 'USR-1001', userName: 'Aissatou Soro', phone: '+22997000000', amount: 25000, network: 'Moov Money', paymentNumber: '97000000', country: 'BJ', reference: 'REF-2500', status: 'En attente', createdAt: '2026-10-25T10:00:00Z' },
  { id: 'DEP-002', userId: 'USR-1002', userName: 'Sonia Koffi', phone: '+22505000000', amount: 50000, network: 'Orange Money', paymentNumber: '05000000', country: 'CI', reference: 'REF-5000', status: 'Approuvé', createdAt: '2026-10-24T11:00:00Z' },
];

export const withdrawalRequests: WithdrawalRequest[] = [
  { id: 'WDR-001', userId: 'USR-1001', userName: 'Aissatou Soro', phone: '+22997000000', amount: 15000, fee: 2250, net: 12750, network: 'Wave', beneficiaryNumber: '97000000', country: 'BJ', status: 'En attente', createdAt: '2026-10-26T14:00:00Z' },
  { id: 'WDR-002', userId: 'USR-1003', userName: 'Jean Dosso', phone: '+22798000000', amount: 20000, fee: 3000, net: 17000, network: 'Moov Money', beneficiaryNumber: '98000000', country: 'NE', status: 'Payé', createdAt: '2026-10-20T09:00:00Z', paymentReference: 'PAY-2000' },
];

export const referrals: ReferralRecord[] = [
  { id: 'REF-01', referredName: 'Mariam Yao', status: 'validé', date: '2026-10-18', level: 1, commission: 2500 },
  { id: 'REF-02', referredName: 'Kouassi Toure', status: 'actif', date: '2026-10-20', level: 2, commission: 0 },
  { id: 'REF-03', referredName: 'Nourat Bello', status: 'validé', date: '2026-10-22', level: 3, commission: 1200 },
];

export const formatCurrency = (value: number) => `${value.toLocaleString('fr-FR')} FCFA`;

export const formatDate = (value: string) => new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
