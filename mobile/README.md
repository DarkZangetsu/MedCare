# MedCare Mobile - Application Patient

Application mobile React Native (Expo) pour les patients du système MedCare Mada.

## 🚀 Fonctionnalités

### ✅ Authentification
- Connexion via numéro de téléphone + OTP
- Création et modification du profil patient

### 📱 Dashboard
- Vue d'ensemble des prochains rappels
- Accès rapide aux fonctionnalités principales

### ⏰ Rappels Santé
- CRUD complet pour les rappels (médicaments, rendez-vous, analyses)
- Notifications locales programmées
- Filtrage par type

### 📔 Journal Santé
- Ajout de notes textuelles
- Enregistrement de mesures (glycémie, tension, poids, température)
- Ajout de photos (ex: ordonnances)
- Historique filtrable par date

### 🤖 Triage IA
- Saisie des symptômes
- Analyse par IA (backend Django)
- Retour avec gravité, conseils et recommandations

### 💬 Téléconsultation
- Liste des médecins disponibles avec statut en ligne
- Chat en temps réel (texte, photo, audio optionnel)
- Indicateur de présence du médecin

### 💳 Paiement Mobile
- Support des opérateurs : MVola, Orange Money, Airtel Money
- Suivi du statut de paiement (pending/success/failed)

### 📄 Documents Médicaux
- Téléchargement des PDF depuis le backend
- Ouverture et partage (WhatsApp, email, etc.)

## 🛠️ Technologies

- **React Native** 0.81.5
- **Expo** 54.0.0
- **TypeScript** 5.9.2
- **Expo Router** 4.0.0 (Navigation)
- **Zustand** 5.0.0 (Gestion d'état)
- **Apollo Client** 3.11.0 (GraphQL)
- **NativeWind** (Styling avec Tailwind CSS)
- **Expo Notifications** (Notifications locales)
- **AsyncStorage** (Stockage local)

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Démarrer l'application
npm start

# Lancer sur Android
npm run android

# Lancer sur iOS
npm run ios
```

## 📁 Structure du Projet

```
mobile/
├── app/                    # Écrans avec expo-router
│   ├── (auth)/            # Écrans d'authentification
│   ├── (tabs)/            # Écrans avec navigation par onglets
│   ├── chat/              # Écran de chat
│   ├── payment/           # Écran de paiement
│   └── pdf/               # Écran PDF
├── src/
│   ├── components/        # Composants UI réutilisables
│   │   └── ui/           # Composants de base (Button, Input, Card, etc.)
│   ├── stores/           # Stores Zustand
│   │   ├── authStore.ts
│   │   ├── remindersStore.ts
│   │   ├── journalStore.ts
│   │   └── consultationsStore.ts
│   ├── services/         # Services (API, Notifications, Storage)
│   ├── types/            # Types TypeScript
│   ├── utils/            # Utilitaires
│   └── providers/        # Providers (Apollo, etc.)
├── assets/               # Images et ressources
└── global.css            # Styles Tailwind
```

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` (optionnel) :

```
GRAPHQL_URI=http://localhost:8000/graphql/
```

Ou configurer dans `app.json` :

```json
{
  "expo": {
    "extra": {
      "graphqlUri": "https://votre-backend.com/graphql/"
    }
  }
}
```

## 📱 Fonctionnalités Techniques

### Notifications Locales
- Configuration automatique au démarrage
- Programmation des rappels santé
- Support Android et iOS

### GraphQL
- Client Apollo configuré
- Requêtes prêtes (à connecter au backend)
- Authentification via token Bearer

### Stockage Local
- Persistance des données avec Zustand + AsyncStorage
- Sauvegarde automatique des états

## 🚧 TODO / Améliorations

- [ ] Connecter les requêtes GraphQL au backend réel
- [ ] Implémenter WebSocket pour le chat en temps réel
- [ ] Ajouter l'enregistrement audio dans le chat
- [ ] Intégrer les vrais opérateurs de paiement mobile
- [ ] Ajouter la gestion des erreurs réseau
- [ ] Implémenter le refresh token
- [ ] Ajouter les tests unitaires

## 📄 Licence

Propriétaire - MedCare Mada

