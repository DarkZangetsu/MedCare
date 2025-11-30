# MedCare Backend - Django GraphQL API

Backend Django avec GraphQL pour l'application MedCare Mobile.

## 🚀 Installation

### 1. Créer un environnement virtuel

```bash
python -m venv env
source env/bin/activate  # Sur Windows: env\Scripts\activate
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Effectuer les migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Créer des données de test (recommandé pour le développement)

```bash
# Créer un patient de test avec un code OTP valide
python manage.py create_test_data --phone "+261341234567"

# Ou utiliser le numéro par défaut
python manage.py create_test_data

# Créer des médecins de test
python manage.py init_data
```

**Note** : Le script `create_test_data` va :
- Créer un patient avec le numéro de téléphone spécifié
- Générer un code OTP valide (affiché dans la console)
- Créer des médecins si ils n'existent pas encore

**Exemple de sortie** :
```
✓ Patient créé: Patient Test (+261341234567)
✓ Code OTP créé: 123456
⚠️  Ce code expire dans 10 minutes

📱 Vous pouvez maintenant vous connecter avec:
   Téléphone: +261341234567
   Code OTP: 123456
```

### 5. Créer un superutilisateur (optionnel)

```bash
python manage.py createsuperuser
```

### 6. Lancer le serveur

```bash
python manage.py runserver
```

Le serveur GraphQL sera accessible à :
- **GraphQL Endpoint**: http://localhost:8000/graphql/
- **GraphiQL Interface**: http://localhost:8000/graphql/ (interface graphique)
- **Admin Django**: http://localhost:8000/admin/

## 📊 Modèles Django

### Patient
- Informations du patient (nom, téléphone, âge, pathologies)
- Authentification via OTP

### Doctor
- Informations des médecins (nom, spécialité, prix, statut en ligne)

### Reminder
- Rappels santé (médicaments, rendez-vous, analyses)

### JournalEntry
- Entrées du journal santé (notes, mesures, photos)

### Consultation
- Consultations entre patients et médecins

### Message
- Messages de chat dans les consultations

### Payment
- Paiements des consultations (MVola, Orange Money, Airtel Money)

### AITriage
- Résultats de triage IA basés sur les symptômes

### OTPCode
- Codes OTP pour l'authentification

## 🔌 API GraphQL

### Mutations

#### SendOTP
```graphql
mutation {
  sendOTP(phone: "+261341234567") {
    success
    message
  }
}
```

#### VerifyOTP
```graphql
mutation {
  verifyOTP(phone: "+261341234567", otp: "123456") {
    token
    user {
      id
      phone
      name
      age
      pathologies
    }
  }
}
```

#### UpdateProfile
```graphql
mutation {
  updateProfile(input: {
    name: "Jean Dupont"
    age: 30
    pathologies: ["Diabète", "Hypertension"]
  }) {
    patient {
      id
      name
      age
      pathologies
    }
  }
}
```

#### AITriage
```graphql
mutation {
  aiTriage(symptoms: "Maux de tête, fièvre légère, fatigue") {
    triage {
      id
      severity
      advice
      recommendation
    }
  }
}
```

### Queries

#### GetDoctors
```graphql
query {
  doctors {
    id
    name
    specialty
    avatar
    price
    isOnline
    rating
  }
}
```

#### GetConsultations
```graphql
query {
  consultations {
    id
    doctor {
      name
      specialty
    }
    status
    messages {
      content
      senderType
      createdAt
    }
  }
}
```

#### GetJournalEntries
```graphql
query {
  journalEntries(date: "2024-01-15") {
    id
    type
    content
    measurementType
    measurementValue
    createdAt
  }
}
```

## 🔧 Configuration

### Settings Django

Le fichier `backend/settings.py` contient :
- Configuration GraphQL
- CORS pour permettre les requêtes depuis l'app mobile
- Timezone: Indian/Antananarivo
- Langue: Français

### Variables d'environnement (optionnel)

Créer un fichier `.env` :
```
SECRET_KEY=votre_secret_key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

## 📝 Notes importantes

1. **Authentification**: Actuellement, l'authentification utilise des tokens simples. Pour la production, implémenter JWT avec `graphql-jwt`.

2. **OTP**: Les codes OTP sont générés mais pas envoyés par SMS. Intégrer un service SMS (Twilio, etc.) pour la production.

3. **IA Triage**: La logique de triage IA est basique (mots-clés). Intégrer OpenAI ou un autre service IA pour la production.

4. **Fichiers**: Les photos et PDFs doivent être stockés (S3, Cloudinary, etc.) et les URLs retournées dans les modèles.

5. **WebSocket**: Pour le chat en temps réel, ajouter Django Channels.

## 🚧 Améliorations futures

- [ ] Authentification JWT complète
- [ ] Intégration SMS pour OTP
- [ ] Service IA réel pour le triage
- [ ] Upload de fichiers (photos, PDFs)
- [ ] WebSocket pour le chat temps réel
- [ ] Intégration paiement mobile réelle
- [ ] Tests unitaires
- [ ] Documentation API complète

## 📄 Licence

Propriétaire - MedCare Mada

