# MedCare Web - Application Next.js

Application web professionnelle pour médecins et administrateurs de la plateforme MedCare.

## 🚀 Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** (composants UI)
- **Apollo Client** (GraphQL)
- **Zustand** (state management)
- **GraphQL Subscriptions** (WebSocket pour chat temps réel)

## 📦 Installation

1. Installer les dépendances :

```bash
npm install
```

2. Configurer les variables d'environnement :

```bash
cp .env.local.example .env.local
```

Éditer `.env.local` et configurer les URLs GraphQL :

```
NEXT_PUBLIC_GRAPHQL_URI=http://localhost:8000/graphql/
NEXT_PUBLIC_GRAPHQL_WS_URI=ws://localhost:8000/graphql/
```

3. Lancer le serveur de développement :

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🏗️ Structure du projet

```
frontend/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── login/              # Page de connexion
│   │   ├── dashboard/          # Dashboard (médecin/admin)
│   │   ├── consultations/      # Gestion consultations
│   │   ├── doctors/            # Gestion médecins (admin)
│   │   ├── payments/           # Gestion paiements (admin)
│   │   ├── logs/               # Logs système (admin)
│   │   └── settings/           # Paramètres
│   ├── components/
│   │   ├── ui/                 # Composants shadcn/ui
│   │   └── layout/             # Layout components (Sidebar, Header)
│   ├── lib/                    # Utilitaires
│   │   ├── apollo-client.ts   # Configuration Apollo Client
│   │   └── utils.ts            # Fonctions utilitaires
│   ├── stores/                 # Zustand stores
│   │   └── auth-store.ts       # Store d'authentification
│   └── types/                   # Types TypeScript
│       └── index.ts
```

## 🔐 Authentification

L'authentification utilise JWT via GraphQL. Les tokens sont stockés dans Zustand avec persistence.

### Connexion

- Email et mot de passe
- Rôle : `doctor` ou `admin`
- Redirection automatique selon le rôle

## 👨‍⚕️ Espace Médecin

### Dashboard
- Statistiques des consultations
- Revenu du jour/mois
- Consultations actives

### Consultations
- Liste des consultations (pending, active, completed)
- Chat en temps réel avec WebSocket
- Détails patient (nom, âge, pathologies)
- Bouton pour voir le PDF santé
- Terminer une consultation

### Paramètres
- Modifier le prix de consultation
- Changer la spécialité
- Basculer disponible/indisponible

## 🛠️ Espace Administrateur

### Dashboard
- Statistiques globales (médecins, patients, consultations)
- Chiffre d'affaires système
- Indicateurs de croissance

### Gestion des médecins
- Voir tous les médecins
- Valider/refuser un médecin
- Modifier les informations

### Gestion des paiements
- Historique complet des paiements
- Calcul de la commission (15%)
- Filtrage par statut (success, pending, failed)

### Logs
- Journal des actions système
- Audit trail
- Filtrage par type (info, success, error)

## 💬 Chat en temps réel

Le chat utilise GraphQL Subscriptions via WebSocket :

- Messages en temps réel
- Support texte, images, audio
- Indicateur de statut (en ligne/hors ligne)
- Historique des messages

## 🎨 Composants UI

Tous les composants utilisent **shadcn/ui** :

- `Button` - Boutons avec variantes
- `Card` - Cartes de contenu
- `Input` - Champs de saisie
- `Badge` - Badges de statut
- `Avatar` - Avatars utilisateurs
- `Dialog` - Modales
- `Select` - Sélecteurs
- `Label` - Labels de formulaire

## 📝 Notes importantes

1. **Backend requis** : L'application nécessite le backend Django GraphQL en cours d'exécution
2. **WebSocket** : Le chat temps réel nécessite une connexion WebSocket fonctionnelle
3. **Authentification** : Les mutations GraphQL doivent inclure le token JWT dans les headers
4. **Subscriptions** : Vérifier que le backend supporte GraphQL Subscriptions

## 🔧 Scripts disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run start` - Serveur de production
- `npm run lint` - Linter ESLint
- `npm run type-check` - Vérification TypeScript

## 📚 Documentation

Pour plus d'informations sur :
- [Next.js Documentation](https://nextjs.org/docs)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [shadcn/ui](https://ui.shadcn.com/)

## 🐛 Problèmes connus

- Les subscriptions WebSocket nécessitent une configuration spécifique du backend
- Certaines mutations GraphQL doivent être adaptées selon votre schéma backend

## 📄 Licence

Propriétaire - MedCare Mada
