import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Bell, CheckCircle2, ChevronRight, CircleAlert, CreditCard, Eye, Home, MessageSquareText, Package2, Search, ShieldCheck, Send, UserCircle2, Wallet, ArrowDownToLine, ArrowUpFromLine, LogOut, Menu, X } from 'lucide-react';
import { appSettings, products, profile, wallet, notifications, depositRequests, withdrawalRequests, referrals, formatCurrency, formatDate } from './data/mockData';
import { Product } from './types';

type Role = 'user' | 'admin';

type Activity = {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'info' | 'success' | 'warning';
};

const countryLabels: Record<string, string> = {
  BJ: 'Bénin',
  CM: 'Cameroun',
  CI: 'Côte d’Ivoire',
  BF: 'Burkina Faso',
  NE: 'Niger',
};

const productFormDefaults = {
  name: 'NOVA New',
  amount: 10000,
  dailyYield: 1500,
  totalReturn: 270000,
  duration: '12 mois',
  description: 'Produit modifiable depuis le back-office.',
  conditions: 'Validation administrative avant activation.',
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function App() {
  const [role, setRole] = useState<Role>('user');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [authForm, setAuthForm] = useState({ fullName: 'Aissatou Soro', country: 'BJ', phone: '97000000', password: 'Azerty123!', sponsor: '' });
  const [loginForm, setLoginForm] = useState({ country: 'BJ', phone: '97000000', password: 'Azerty123!' });
  const [showInfo, setShowInfo] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [productsState, setProductsState] = useState<Product[]>(products);
  const [deposits, setDeposits] = useState(depositRequests);
  const [withdrawals, setWithdrawals] = useState(withdrawalRequests);
  const [notificationsState, setNotificationsState] = useState(notifications);
  const [walletState, setWalletState] = useState(wallet);
  const [search, setSearch] = useState('');
  const [depositForm, setDepositForm] = useState({ amount: '25000', network: 'Moov Money', paymentNumber: '97000000', reference: '', proof: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '10000', network: 'Wave', beneficiary: '97000000' });
  const [productEdit, setProductEdit] = useState(productFormDefaults);

  const filteredProducts = useMemo(() => productsState.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()) || String(product.amount).includes(search)), [productsState, search]);

  useEffect(() => {
    const onStorage = () => {
      const raw = localStorage.getItem('nova_energie_store');
      if (!raw) return;
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const submitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const country = authForm.country;
    const normalizedPhone = normalizePhone(authForm.phone);
    if (!authForm.fullName || !country || !normalizedPhone || !authForm.password) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }
    if (!appSettings.allowedCountries.includes(country as any)) {
      alert('Pays non autorisé.');
      return;
    }
    if (authForm.password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setIsLoggedIn(true);
    setShowInfo(true);
    setRole('user');
    setAuthForm({ ...authForm, password: '', sponsor: '' });
  };

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = normalizePhone(loginForm.phone);
    if (!loginForm.country || !normalizedPhone || !loginForm.password) {
      alert('Pays, téléphone et mot de passe sont requis.');
      return;
    }
    setIsLoggedIn(true);
    setShowInfo(true);
    setRole('user');
  };

  const submitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(depositForm.amount);
    if (!amount || amount < appSettings.minDeposit) {
      alert('Le montant minimum pour un dépôt est de 2000 FCFA.');
      return;
    }
    const newRequest = {
      id: `DEP-${Date.now()}`,
      userId: profile.id,
      userName: profile.fullName,
      phone: profile.phone,
      amount,
      network: depositForm.network,
      paymentNumber: depositForm.paymentNumber,
      country: profile.country,
      reference: depositForm.reference || `REF-${Date.now()}`,
      status: 'En attente' as const,
      createdAt: new Date().toISOString(),
    };
    setDeposits((prev) => [newRequest, ...prev]);
    setDepositForm({ amount: '', network: 'Moov Money', paymentNumber: '', reference: '', proof: '' });
    alert('Demande de dépôt envoyée. En attente de validation Admin');
  };

  const submitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawForm.amount);
    const fee = Math.round(amount * appSettings.withdrawalFeePercent / 100);
    const net = amount - fee;
    if (amount < appSettings.minWithdrawal) {
      alert('Le montant minimum pour un retrait est de 800 FCFA.');
      return;
    }
    if (amount > walletState.availableBalance) {
      alert('Le solde disponible est insuffisant pour traiter ce retrait.');
      return;
    }
    const newRequest = {
      id: `WDR-${Date.now()}`,
      userId: profile.id,
      userName: profile.fullName,
      phone: profile.phone,
      amount,
      fee,
      net,
      network: withdrawForm.network,
      beneficiaryNumber: withdrawForm.beneficiary,
      country: profile.country,
      status: 'En attente' as const,
      createdAt: new Date().toISOString(),
    };
    setWithdrawals((prev) => [newRequest, ...prev]);
    setWalletState((current) => ({ ...current, availableBalance: current.availableBalance - amount, reservedBalance: current.reservedBalance + amount }));
    alert('Demande de retrait enregistrée.');
  };

  const adminMetrics = [
    { label: 'Utilisateurs', value: '1 284' },
    { label: 'Dépôts en attente', value: String(deposits.filter((d) => d.status === 'En attente').length) },
    { label: 'Retraits en attente', value: String(withdrawals.filter((w) => w.status === 'En attente').length) },
    { label: 'Volume transactions', value: '12 340 000 FCFA' },
  ];

  const recentActivities: Activity[] = [
    { id: 'a1', title: 'Dépot approuvé', description: 'Aissatou Soro — 25 000 FCFA', date: '2026-10-27 08:10', type: 'success' },
    { id: 'a2', title: 'Retrait en attente', description: 'Jean Dosso — 15 000 FCFA', date: '2026-10-27 07:50', type: 'warning' },
    { id: 'a3', title: 'Nouvelle inscription', description: 'Nina Kone — Cameroun', date: '2026-10-27 07:40', type: 'info' },
  ];

  const currentNotificationCount = notificationsState.filter((n) => !n.seen).length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-night via-slate-900 to-energy text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-night font-black">N</div>
                <div>
                  <div className="text-2xl font-black">NOVA ÉNERGIE</div>
                  <div className="text-sm text-white/70">Investissement fiable et sécurisé</div>
                </div>
              </div>

              <h1 className="text-4xl font-black">Bienvenue dans votre espace de gestion</h1>
              <p className="text-white/70">Créez un compte, rejoignez le canal Telegram et gérez vos dépôts, retraits et investissements en toute simplicité.</p>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/80">
                <div className="font-semibold mb-2">Pays autorisés</div>
                <div className="flex flex-wrap gap-2">
                  {appSettings.allowedCountries.map((country) => (
                    <span key={country} className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{countryLabels[country]}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 text-night shadow-soft">
              <div className="mb-6 text-center">
                <div className="text-2xl font-black">Inscription</div>
                <div className="text-sm text-slate-500">Créez votre compte NOVA ÉNERGIE</div>
              </div>

              <form onSubmit={submitRegister} className="space-y-4">
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3" value={authForm.fullName} onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })} placeholder="Nom complet" />
                <select className="w-full rounded-xl border border-slate-200 px-4 py-3" value={authForm.country} onChange={(e) => setAuthForm({ ...authForm, country: e.target.value })}>
                  <option value="">Sélectionnez votre pays</option>
                  {appSettings.allowedCountries.map((country) => <option key={country} value={country}>{countryLabels[country]}</option>)}
                </select>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3" value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} placeholder="Téléphone" />
                <input type="password" className="w-full rounded-xl border border-slate-200 px-4 py-3" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="Mot de passe" />
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3" value={authForm.sponsor} onChange={(e) => setAuthForm({ ...authForm, sponsor: e.target.value })} placeholder="Code parrain (facultatif)" />
                <button type="submit" className="w-full rounded-xl bg-energy px-4 py-3 font-bold text-white">S’inscrire</button>
              </form>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="mb-3 text-sm font-medium text-slate-500">Déjà inscrit ?</div>
                <form onSubmit={submitLogin} className="space-y-3">
                  <select className="w-full rounded-xl border border-slate-200 px-4 py-3" value={loginForm.country} onChange={(e) => setLoginForm({ ...loginForm, country: e.target.value })}>
                    {appSettings.allowedCountries.map((country) => <option key={country} value={country}>{countryLabels[country]}</option>)}
                  </select>
                  <input className="w-full rounded-xl border border-slate-200 px-4 py-3" value={loginForm.phone} onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })} placeholder="Téléphone" />
                  <input type="password" className="w-full rounded-xl border border-slate-200 px-4 py-3" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Mot de passe" />
                  <button type="submit" className="w-full rounded-xl bg-night px-4 py-3 font-bold text-white">Connexion</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl text-slate-800">
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-energy/10 text-energy"><CircleAlert size={20} /></div>
                <div>
                  <div className="text-xl font-black uppercase">INFORMATION</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <p>Bonus d’inscription : 500 FCFA, valable selon les conditions définies par l’administration.</p>
              <p>Règles du parrainage : 25 %, 3 % et 2 % sur les niveaux configurés. Les commissions sont calculées côté serveur et validées conformément au modèle.</p>
              <p>Conditions des produits : les rendements annoncés sont visibles, mais les versements réels sont soumis à validation de la conformité et des échéances.</p>
              <p>Délais de traitement : les demandes de dépôt et de retrait sont traitées selon le statut administratif et les délais effectifs annoncés à l’utilisateur.</p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setShowInfo(false)} className="flex-1 rounded-xl bg-night px-4 py-3 font-bold text-white">D’accord</button>
              <a href={appSettings.telegramLink} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-bold text-white">
                <Send size={18} /> Rejoindre Telegram
              </a>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-energy text-lg font-black text-white">N</div>
            <div>
              <div className="text-lg font-black">NOVA ÉNERGIE</div>
              <div className="text-xs text-slate-500">Africa/Ouagadougou</div>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <a href="https://t.me/+74TGsMBlIwwyYTI0" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-sky-600"><Send size={16} /> Canal Telegram</a>
            <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700"><MessageSquareText size={16} /> Service client</a>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-full border border-slate-200 p-2 text-slate-600" aria-label="Notifications">
              <Bell size={18} />
              {currentNotificationCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-energy text-[10px] font-bold text-white">{currentNotificationCount}</span>}
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="rounded-xl border border-slate-200 p-2 md:hidden" aria-label="Menu mobile">
              {mobileMenu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 text-sm font-medium">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={() => setMobileMenu(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 ${isActive ? 'bg-night text-white' : 'text-slate-700'}`}>
                  <item.icon size={16} /> {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage setRole={setRole} role={role} />} />
          <Route path="/produits" element={<ProductsPage products={filteredProducts} search={search} setSearch={setSearch} />} />
          <Route path="/depot" element={<DepositPage depositForm={depositForm} setDepositForm={setDepositForm} onSubmit={submitDeposit} />} />
          <Route path="/retrait" element={<WithdrawalPage withdrawForm={withdrawForm} setWithdrawForm={setWithdrawForm} onSubmit={submitWithdrawal} wallet={walletState} />} />
          <Route path="/transactions" element={<TransactionsPage deposits={deposits} withdrawals={withdrawals} />} />
          <Route path="/notifications" element={<NotificationsPage notifications={notificationsState} setNotifications={setNotificationsState} />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage deposits={deposits} withdrawals={withdrawals} products={productsState} setProducts={setProductsState} productEdit={productEdit} setProductEdit={setProductEdit} />} />
        </Routes>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm md:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-5 gap-1 px-2 py-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] ${isActive ? 'bg-night text-white' : 'text-slate-600'}`}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

const navItems = [
  { label: 'Accueil', to: '/', icon: Home },
  { label: 'Produits', to: '/produits', icon: Package2 },
  { label: 'Transactions', to: '/transactions', icon: CreditCard },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Moi', to: '/profil', icon: UserCircle2 },
];

function HomePage({ setRole, role }: { setRole: (role: Role) => void; role: Role }) {
  return (
    <div className="space-y-6 pb-24">
      <section className="overflow-hidden rounded-[28px] bg-hero text-white shadow-soft">
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">NOVA ÉNERGIE</div>
            <h1 className="text-3xl font-black md:text-5xl">Votre avenir énergétique commence ici.</h1>
            <p className="max-w-xl text-sm text-white/80 md:text-base">Une plateforme professionnelle pour gérer vos investissements, vos dépôts, vos retraits et vos souscriptions.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/depot" className="rounded-xl bg-white px-5 py-3 font-bold text-night">Déposer</Link>
              <Link to="/retrait" className="rounded-xl border border-white/30 bg-transparent px-5 py-3 font-bold text-white">Retirer</Link>
            </div>
          </div>

          <div className="rounded-[24px] bg-white/10 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-white/70">Portefeuille</div>
              <div className="rounded-full bg-white/10 px-2 py-1 text-xs">Actif</div>
            </div>
            <div className="text-3xl font-black">{formatCurrency(wallet.availableBalance)}</div>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div className="flex justify-between"><span>Solde disponible</span><span>{formatCurrency(wallet.availableBalance)}</span></div>
              <div className="flex justify-between"><span>Fonds réservés</span><span>{formatCurrency(wallet.reservedBalance)}</span></div>
              <div className="flex justify-between"><span>Versements dûs</span><span>{formatCurrency(wallet.contractDue)}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-black">Rejoignez notre Canal Telegram</div>
          <a href={appSettings.telegramLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 font-semibold text-white"><Send size={16} /> Rejoindre</a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Déposer', to: '/depot', icon: ArrowDownToLine },
          { title: 'Retirer', to: '/retrait', icon: ArrowUpFromLine },
          { title: 'Mes transactions', to: '/transactions', icon: CreditCard },
          { title: 'Assistance', to: '/profil', icon: ShieldCheck },
        ].map((item) => (
          <Link key={item.title} to={item.to} className="rounded-3xl bg-white p-5 shadow-soft transition hover:-translate-y-0.5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-night text-white"><item.icon size={20} /></div>
            <div className="text-lg font-bold">{item.title}</div>
            <div className="mt-2 text-sm text-slate-500">Accès rapide</div>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-black">Offres disponibles</div>
          <Link to="/produits" className="text-sm font-semibold text-energy">Voir tout</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <div key={product.id} className="overflow-hidden rounded-3xl border border-slate-200">
              <img src={product.image} alt={product.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <div className="mb-2 text-lg font-bold">{product.name}</div>
                <div className="mb-2 text-2xl font-black text-night">{formatCurrency(product.amount)}</div>
                <div className="text-sm text-slate-500">Rendement annoncé : {formatCurrency(product.dailyYield)} / j</div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">Voir les détails</button>
                  <button className="flex-1 rounded-xl bg-energy px-3 py-2 text-sm font-semibold text-white">Souscrire</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="text-xl font-black mb-4">Conditions applicables</div>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Le montant minimum de dépôt est de 2 000 FCFA.</li>
          <li>• Le montant minimum de retrait est de 800 FCFA.</li>
          <li>• Les frais de retrait sont de 15 % avant confirmation.</li>
          <li>• Les produits sont soumis à validation administrative et à des conditions contractuelles explicites.</li>
        </ul>
      </section>

      <div className="flex gap-3 pb-20">
        <button onClick={() => setRole('admin')} className="rounded-xl bg-night px-4 py-3 font-semibold text-white">Mode admin</button>
        <button onClick={() => setRole('user')} className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700">Mode utilisateur</button>
      </div>
    </div>
  );
}

function ProductsPage({ products, search, setSearch }: { products: Product[]; search: string; setSearch: (value: string) => void }) {
  return (
    <div className="space-y-6 pb-24">
      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-2xl font-black">Produits NOVA ÉNERGIE</div>
            <div className="text-sm text-slate-500">Grille responsive avec rendements et conditions administrables.</div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit" className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="overflow-hidden rounded-3xl bg-white shadow-soft">
            <img src={product.image} alt={product.name} className="h-44 w-full object-cover" />
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <div className="text-xl font-black">{product.name}</div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">{product.active ? 'Actif' : 'Inactif'}</span>
              </div>
              <div className="text-2xl font-black text-night">{formatCurrency(product.amount)}</div>
              <p className="text-sm text-slate-600">{product.description}</p>
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                <div>Rendement annoncé : {formatCurrency(product.dailyYield)} / jour</div>
                <div>Retour total : {formatCurrency(product.totalReturn)}</div>
                <div>Durée : {product.duration}</div>
              </div>
              <div className="text-sm text-slate-500">Conditions : {product.conditions}</div>
              <div className="flex gap-2">
                <button className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">Voir les détails</button>
                <button className="flex-1 rounded-xl bg-energy px-3 py-2 text-sm font-semibold text-white">Souscrire</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DepositPage({ depositForm, setDepositForm, onSubmit }: { depositForm: any; setDepositForm: any; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <div className="space-y-6 pb-24">
      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="text-2xl font-black">Dépôt / Recharger</div>
        <div className="mt-2 text-sm text-slate-500">Méthode de paiement : Mobile Money. Réseaux : Orange Money, Moov Money, MTN Money et Wave.</div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="mb-4 text-lg font-bold">Informations</div>
        <div className="space-y-3 text-sm text-slate-600">
          <div>Montant minimum : 2 000 FCFA</div>
          <div>Le lien de paiement reste caché et n’est jamais affiché dans le navigateur utilisateur.</div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-white p-5 shadow-soft">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Montant</label>
          <input value={depositForm.amount} onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Montant" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Réseau</label>
          <select value={depositForm.network} onChange={(e) => setDepositForm({ ...depositForm, network: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3">
            <option>Orange Money</option>
            <option>Moov Money</option>
            <option>MTN Money</option>
            <option>Wave</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Numéro de téléphone utilisé pour le paiement</label>
          <input value={depositForm.paymentNumber} onChange={(e) => setDepositForm({ ...depositForm, paymentNumber: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Numéro" />
          <div className="mt-2 text-xs text-slate-500">Indiquez le numéro mobile money utilisé.</div>
        </div>
        <button type="button" className="w-full rounded-xl bg-night px-4 py-3 font-bold text-white">Payer</button>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="mb-2 font-bold">À la suite du paiement</div>
          <ol className="list-decimal pl-5 leading-6">
            <li>Effectuez le paiement.</li>
            <li>Revenez sur NOVA ÉNERGIE.</li>
            <li>Cliquez sur « Confirmation de dépôt ».</li>
          </ol>
        </div>

        <div className="pt-2">
          <div className="text-lg font-black">Confirmation de dépôt</div>
          <div className="mt-4 grid gap-4">
            <input value={depositForm.amount} onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Montant" />
            <select value={depositForm.network} onChange={(e) => setDepositForm({ ...depositForm, network: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3">
              <option>Orange Money</option>
              <option>Moov Money</option>
              <option>MTN Money</option>
              <option>Wave</option>
            </select>
            <input value={depositForm.paymentNumber} onChange={(e) => setDepositForm({ ...depositForm, paymentNumber: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Numéro utilisé" />
            <input value={depositForm.reference} onChange={(e) => setDepositForm({ ...depositForm, reference: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Référence" />
            <textarea value={depositForm.proof} onChange={(e) => setDepositForm({ ...depositForm, proof: e.target.value })} className="min-h-[100px] w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Preuve de paiement" />
          </div>
          <button type="submit" className="mt-4 w-full rounded-xl bg-success px-4 py-3 font-bold text-white">Envoyer la demande</button>
        </div>
      </form>
    </div>
  );
}

function WithdrawalPage({ withdrawForm, setWithdrawForm, onSubmit, wallet }: { withdrawForm: any; setWithdrawForm: any; onSubmit: (e: React.FormEvent) => void; wallet: any }) {
  const amount = Number(withdrawForm.amount || 0);
  const fee = Math.round(amount * appSettings.withdrawalFeePercent / 100);
  const net = amount - fee;

  return (
    <div className="space-y-6 pb-24">
      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="text-2xl font-black">Retirer</div>
        <div className="mt-2 text-sm text-slate-500">Montant minimum demandé : 800 FCFA. Frais : 15 %. Disponibilité : demandes possibles à tout moment, traitement réel selon validation administrative.</div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-white p-5 shadow-soft">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Montant</label>
          <input value={withdrawForm.amount} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Montant" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Réseau</label>
          <select value={withdrawForm.network} onChange={(e) => setWithdrawForm({ ...withdrawForm, network: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3">
            <option>Orange Money</option>
            <option>Moov Money</option>
            <option>MTN Money</option>
            <option>Wave</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Numéro du bénéficiaire</label>
          <input value={withdrawForm.beneficiary} onChange={(e) => setWithdrawForm({ ...withdrawForm, beneficiary: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Numéro du bénéficiaire" />
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex justify-between"><span>Frais de retrait</span><span>{formatCurrency(fee)}</span></div>
          <div className="mt-2 flex justify-between"><span>Montant net</span><span>{formatCurrency(net)}</span></div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {wallet.availableBalance <= 0 ? 'Aucun fond disponible. Le retrait ne peut pas être traité pour le moment.' : `Solde disponible : ${formatCurrency(wallet.availableBalance)}`}
        </div>

        <button type="submit" className="w-full rounded-xl bg-night px-4 py-3 font-bold text-white">Confirmer le retrait</button>
      </form>
    </div>
  );
}

function TransactionsPage({ deposits, withdrawals }: { deposits: any[]; withdrawals: any[] }) {
  return (
    <div className="space-y-8 pb-24">
      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="text-2xl font-black">Mes transactions</div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="mb-4 text-xl font-black">Historique des dépôts</div>
        <div className="space-y-3">
          {deposits.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
              <div>
                <div className="font-bold">{formatCurrency(item.amount)}</div>
                <div className="text-sm text-slate-500">{item.network} • {item.reference}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-600">{item.status}</div>
                <div className="text-xs text-slate-400">{formatDate(item.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="mb-4 text-xl font-black">Historique des retraits</div>
        <div className="space-y-3">
          {withdrawals.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
              <div>
                <div className="font-bold">{formatCurrency(item.amount)}</div>
                <div className="text-sm text-slate-500">Net {formatCurrency(item.net)} • {item.network}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-600">{item.status}</div>
                <div className="text-xs text-slate-400">{formatDate(item.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsPage({ notifications, setNotifications }: { notifications: any[]; setNotifications: any }) {
  const markSeen = (id: string) => {
    setNotifications((prev: any[]) => prev.map((n) => n.id === id ? { ...n, seen: true } : n));
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="text-2xl font-black">Centre de notifications</div>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <div key={item.id} onClick={() => markSeen(item.id)} className={`rounded-3xl border p-4 shadow-soft ${item.seen ? 'border-slate-200 bg-white' : 'border-energy/20 bg-energy/5'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-bold">{item.title}</div>
                <div className="mt-1 text-sm text-slate-600">{item.message}</div>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.type === 'success' ? 'bg-green-100 text-green-700' : item.type === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {item.type}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="space-y-6 pb-24">
      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-night text-2xl font-black text-white">AS</div>
          <div>
            <div className="text-2xl font-black">{profile.fullName}</div>
            <div className="text-sm text-slate-500">{countryLabels[profile.country]} • {profile.phone}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-soft">
          <div className="mb-3 text-lg font-black">Mon portefeuille</div>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>Solde disponible</span><span>{formatCurrency(wallet.availableBalance)}</span></div>
            <div className="flex justify-between"><span>Fonds réservés</span><span>{formatCurrency(wallet.reservedBalance)}</span></div>
            <div className="flex justify-between"><span>Total dépôts</span><span>{formatCurrency(wallet.totalDeposits)}</span></div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-soft">
          <div className="mb-3 text-lg font-black">Parrainage</div>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>Code</span><span>{profile.referralCode}</span></div>
            <div className="flex justify-between"><span>Filleuls</span><span>{referrals.length}</span></div>
            <div className="flex justify-between"><span>Commission validée</span><span>{formatCurrency(referrals.reduce((sum, r) => sum + r.commission, 0))}</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="mb-4 text-lg font-black">Mes dépôts en attente</div>
        <div className="space-y-3">
          {depositRequests.filter((d) => d.userId === profile.id).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
              <div>
                <div className="font-bold">{formatCurrency(item.amount)}</div>
                <div className="text-sm text-slate-500">{item.network} • {item.reference}</div>
              </div>
              <div className="text-right text-sm font-medium text-amber-600">{item.status}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-night px-4 py-3 font-bold text-white"><LogOut size={18} /> Déconnexion</button>
    </div>
  );
}

function AdminPage({ deposits, withdrawals, products, setProducts, productEdit, setProductEdit }: { deposits: any[]; withdrawals: any[]; products: any[]; setProducts: any; productEdit: any; setProductEdit: any }) {
  const approve = (id: string) => {
    console.log('Approver la demande', id);
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="text-2xl font-black">Back-office administrateur</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Utilisateurs', value: '1 284' },
          { label: 'Dépôts en attente', value: String(deposits.filter((d) => d.status === 'En attente').length) },
          { label: 'Retraits en attente', value: String(withdrawals.filter((w) => w.status === 'En attente').length) },
          { label: 'Produits actifs', value: String(products.length) },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl bg-white p-5 shadow-soft">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-3 text-3xl font-black text-night">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-soft">
          <div className="mb-4 text-xl font-black">DEMANDES EN ATTENTE</div>
          <div className="space-y-3">
            {deposits.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="font-bold">{item.userName}</div>
                    <div className="text-sm text-slate-500">{item.network} • {item.reference}</div>
                  </div>
                  <div className="text-right text-sm font-medium text-slate-700">{item.status}</div>
                </div>
                <div className="mt-3 flex justify-between text-sm text-slate-600">
                  <span>{formatCurrency(item.amount)}</span>
                  <span>{item.country}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => approve(item.id)} className="flex-1 rounded-xl bg-success px-3 py-2 text-sm font-semibold text-white">Approuver</button>
                  <button className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">Rejeter</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-soft">
          <div className="mb-4 text-xl font-black">Gestion des produits</div>
          <div className="space-y-3">
            <input value={productEdit.name} onChange={(e) => setProductEdit({ ...productEdit, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Nom du produit" />
            <input value={productEdit.amount} onChange={(e) => setProductEdit({ ...productEdit, amount: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Montant" />
            <input value={productEdit.dailyYield} onChange={(e) => setProductEdit({ ...productEdit, dailyYield: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Rendement journalier" />
            <input value={productEdit.duration} onChange={(e) => setProductEdit({ ...productEdit, duration: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Durée" />
            <textarea value={productEdit.conditions} onChange={(e) => setProductEdit({ ...productEdit, conditions: e.target.value })} className="min-h-[100px] w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Conditions" />
            <button onClick={() => setProducts((current: any[]) => [{ id: `P-${Date.now()}`, ...productEdit, active: true, image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80' }, ...current])} className="w-full rounded-xl bg-energy px-4 py-3 font-bold text-white">Ajouter un produit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
