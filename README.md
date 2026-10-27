# NOVA ÉNERGIE

Application mobile-first NOVA ÉNERGIE en React + TypeScript + Vite + Tailwind.

Configuration de base :
- Frontend : React + TypeScript + Vite + Tailwind
- Auth & données : Supabase
- Hébergement : Vercel
- Langue : français
- Devise : FCFA (XOF)
- Timezone d’affichage : Africa/Ouagadougou

## Variables d’environnement

Les variables publiques suivantes sont déjà fournies et utilisées côté frontend :

VITE_SUPABASE_URL=https://vptysjxfjngcmequsdps.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_m1T2c3H_OtzwJqcYJKxy8g_qvJp2YpJ

Ne jamais ajouter de service_role ou de secret de paiement dans une variable VITE_*.

## Structure projet

- src/App.tsx : écrans et logique applicative de démonstration.
- src/data/mockData.ts : données initiales des produits, utilisateurs, dépôts, retraits et notifications.
- src/lib/supabase.ts : client frontend Supabase.
- supabase/migrations/001_initial_schema.sql : schéma de base pour les tables principales.

## Démarrage

npm install
npm run dev

## Déploiement Vercel

- Ajouter les variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY dans les Variables d’environnement de Vercel.
- Vérifier que le projet Supabase correspond bien au même projet que celui référencé par la configuration publique.
