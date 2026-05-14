# MediaShare — Plateforme d'envoi de médias

Stack : **React JS** + **Tailwind CSS** + **daisyUI** + **Supabase** + **Cloudflare R2**

---

## Démarrage rapide

### 1. Cloner et installer

```bash
git clone https://github.com/toi/media-app
cd media-app
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir `.env` avec tes clés :

| Variable | Où trouver |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `VITE_R2_ACCOUNT_ID` | Cloudflare → Overview |
| `VITE_R2_ACCESS_KEY` | Cloudflare → R2 → Manage API tokens |
| `VITE_R2_SECRET_KEY` | Cloudflare → R2 → Manage API tokens |
| `VITE_R2_BUCKET` | Nom du bucket R2 créé |
| `VITE_R2_PUBLIC_URL` | URL publique du bucket R2 |

### 3. Créer la table Supabase

Dans l'éditeur SQL de ton projet Supabase :

```sql
create table medias (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  nom text not null,
  url text not null,
  type text not null,
  taille bigint,
  created_at timestamptz default now()
);

alter table medias enable row level security;

create policy "voir ses fichiers" on medias
  for select using (auth.uid() = user_id);

create policy "uploader ses fichiers" on medias
  for insert with check (auth.uid() = user_id);

create policy "supprimer ses fichiers" on medias
  for delete using (auth.uid() = user_id);
```

### 4. Démarrer le projet

```bash
npm run dev
```

L'application est disponible sur http://localhost:5173

---

## Structure du projet

```
src/
├── components/
│   ├── Navbar.jsx        — Barre de navigation + toggle dark/light
│   ├── UploadZone.jsx    — Zone drag & drop avec progression
│   ├── MediaCard.jsx     — Carte média avec aperçu + actions
│   └── MediaGallery.jsx  — Grille responsive + filtres par type
├── pages/
│   ├── Login.jsx         — Page connexion / inscription
│   └── Dashboard.jsx     — Page principale avec upload et galerie
├── hooks/
│   └── useAuth.js        — Hook de gestion de session
├── lib/
│   └── supabase.js       — Client Supabase partagé
├── App.jsx               — Routage + protection des routes
├── main.jsx              — Point d'entrée React
└── index.css             — Directives Tailwind
```

---

## Déploiement sur Vercel

```bash
npm run build   # Vérifier que le build passe
npm run preview # Tester le build en local
```

1. Pousser sur GitHub
2. Importer le repo sur [vercel.com](https://vercel.com)
3. Ajouter toutes les variables `VITE_` dans Settings → Environment Variables
4. Configurer le CORS de ton bucket R2 pour autoriser le domaine Vercel

---

## Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Démarrer en développement |
| `npm run build` | Créer le build de production |
| `npm run preview` | Tester le build en local |
