CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('BJ','CM','CI','BF','NE')),
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL,
  password_hash TEXT,
  referral_code TEXT UNIQUE,
  sponsor_code TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  daily_yield NUMERIC(18,2) NOT NULL,
  total_return NUMERIC(18,2) NOT NULL,
  duration_days INTEGER,
  duration_label TEXT,
  description TEXT,
  conditions TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','deleted')),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  amount NUMERIC(18,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','cancelled','completed')),
  contract_conditions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(18,2) NOT NULL CHECK (amount >= 2000),
  network TEXT NOT NULL,
  payment_number TEXT NOT NULL,
  country TEXT NOT NULL,
  reference TEXT,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(18,2) NOT NULL CHECK (amount >= 800),
  fee_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  network TEXT NOT NULL,
  beneficiary_number TEXT NOT NULL,
  country TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','rejected','failed')),
  rejection_reason TEXT,
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  reserved_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_deposits NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_withdrawals NUMERIC(18,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('deposit','withdrawal','adjustment','commission','contract','bonus')),
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  balance_after NUMERIC(18,2) NOT NULL,
  related_request_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  immutable BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_level INTEGER NOT NULL CHECK (referral_level BETWEEN 1 AND 3),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','validated','blocked')),
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sponsor_id, referred_user_id)
);

CREATE TABLE IF NOT EXISTS public.commission_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  base_amount NUMERIC(18,2) NOT NULL,
  rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(18,2) NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('deposit','subscription','bonus')),
  source_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning','danger')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_link TEXT,
  enabled_methods TEXT[] NOT NULL DEFAULT ARRAY['Orange Money','Moov Money','MTN Money','Wave'],
  allowed_networks TEXT[] NOT NULL DEFAULT ARRAY['Orange Money','Moov Money','MTN Money','Wave'],
  min_amount NUMERIC(18,2) NOT NULL DEFAULT 2000,
  max_amount NUMERIC(18,2) NOT NULL DEFAULT 5000000,
  fee_percent NUMERIC(5,2) NOT NULL DEFAULT 15,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  mode TEXT NOT NULL DEFAULT 'manual' CHECK (mode IN ('manual','automatic')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name TEXT NOT NULL DEFAULT 'NOVA ÉNERGIE',
  logo_url TEXT,
  telegram_link TEXT,
  support_link TEXT,
  support_contact TEXT,
  allowed_countries TEXT[] NOT NULL DEFAULT ARRAY['BJ','CM','CI','BF','NE'],
  min_deposit NUMERIC(18,2) NOT NULL DEFAULT 2000,
  min_withdrawal NUMERIC(18,2) NOT NULL DEFAULT 800,
  withdrawal_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 15,
  welcome_bonus NUMERIC(18,2) NOT NULL DEFAULT 500,
  bonus_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  terms_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.scheduled_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled')),
  unique_reference TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.promoter_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promoter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  assignment_value NUMERIC(18,2) NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('free','paid')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','active')),
  reason TEXT,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_normalized ON public.profiles(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON public.deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_obligations_due_date ON public.scheduled_obligations(due_date);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoter_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users read own subscriptions" ON public.product_subscriptions FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users read own deposits" ON public.deposit_requests FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users read own withdrawals" ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users read own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Public config read" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Public payment settings read" ON public.payment_settings FOR SELECT USING (true);
CREATE POLICY "Logs admin only" ON public.audit_logs FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
