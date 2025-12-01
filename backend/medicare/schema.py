import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from graphql_jwt import mutations as graphql_jwt
from graphql_jwt.decorators import login_required
from graphql_jwt.shortcuts import get_token
from .models import (
    Patient, Doctor, Admin, Reminder, JournalEntry, Consultation,
    Message, Payment, AITriage
)


# ==================== TYPES ====================

class PatientType(DjangoObjectType):
    pathologies = graphene.List(graphene.String)
    
    class Meta:
        model = Patient
        fields = ('id', 'phone', 'name', 'age', 'pathologies', 'created_at')
    
    def resolve_pathologies(self, info):
        # S'assurer que pathologies est toujours un tableau
        if self.pathologies is None:
            return []
        if isinstance(self.pathologies, list):
            return self.pathologies
        return []


class DoctorType(DjangoObjectType):
    email = graphene.String()
    phone = graphene.String()
    is_approved = graphene.Boolean()
    
    class Meta:
        model = Doctor
        fields = ('id', 'name', 'specialty', 'phone', 'avatar', 'price', 'is_online', 'is_approved', 'rating')
    
    def resolve_email(self, info):
        return self.user.email if self.user else None
    
    def resolve_phone(self, info):
        return self.phone if self.phone else None
    
    def resolve_is_approved(self, info):
        return getattr(self, 'is_approved', False)


class AdminType(DjangoObjectType):
    email = graphene.String()
    
    class Meta:
        model = Admin
        fields = ('id', 'name', 'email', 'created_at')
    
    def resolve_email(self, info):
        return self.email


class ReminderType(DjangoObjectType):
    class Meta:
        model = Reminder
        fields = ('id', 'type', 'title', 'description', 'date', 'time', 'is_active', 'notification_id')


class JournalEntryType(DjangoObjectType):
    class Meta:
        model = JournalEntry
        fields = ('id', 'date', 'type', 'content', 'measurement_type', 'measurement_value', 
                 'measurement_unit', 'photo_url', 'created_at')


class MessageType(DjangoObjectType):
    class Meta:
        model = Message
        fields = ('id', 'consultation', 'sender_id', 'sender_type', 'content', 
                 'photo_url', 'audio_url', 'created_at')


class ConsultationType(DjangoObjectType):
    doctor = graphene.Field(DoctorType)
    messages = graphene.List(MessageType)

    class Meta:
        model = Consultation
        fields = ('id', 'patient', 'doctor', 'status', 'created_at', 'updated_at')

    def resolve_messages(self, info):
        return self.messages.all().order_by('created_at')


class PaymentType(DjangoObjectType):
    class Meta:
        model = Payment
        fields = ('id', 'consultation', 'amount', 'operator', 'status', 'transaction_id', 'created_at')


class AITriageType(DjangoObjectType):
    class Meta:
        model = AITriage
        fields = ('id', 'symptoms', 'severity', 'advice', 'recommendation', 'created_at')


# ==================== INPUT TYPES ====================

class ProfileInput(graphene.InputObjectType):
    name = graphene.String()
    age = graphene.Int()
    pathologies = graphene.List(graphene.String)


# ==================== MUTATIONS ====================

class Register(graphene.Mutation):
    class Arguments:
        phone = graphene.String(required=True)
        password = graphene.String(required=True)
        name = graphene.String(required=False)
        age = graphene.Int(required=False)

    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String()
    user = graphene.Field(PatientType)

    def mutate(self, info, phone, password, name=None, age=None):
        try:
            # Valider le numéro de téléphone
            if not phone or len(phone.strip()) < 10:
                raise Exception("Numéro de téléphone invalide")
            
            # Valider le mot de passe
            if not password or len(password) < 6:
                raise Exception("Le mot de passe doit contenir au moins 6 caractères")
            
            phone = phone.strip()
            
            # Vérifier si le patient existe déjà
            if Patient.objects.filter(phone=phone).exists():
                raise Exception("Ce numéro de téléphone est déjà enregistré")
            
            # Créer l'utilisateur Django
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            username = f"patient_{phone}"
            if User.objects.filter(username=username).exists():
                raise Exception("Ce numéro de téléphone est déjà enregistré")
            
            user = User.objects.create_user(
                username=username,
                email=f"{phone}@medcare.mg",
                password=password
            )
            
            # Créer le patient
            patient = Patient.objects.create(
                phone=phone,
                user=user,
                name=name,
                age=age
            )
            
            # Générer un token JWT
            token = get_token(user)
            
            return Register(
                success=True,
                message="Inscription réussie",
                token=token,
                user=patient
            )
        except Exception as e:
            raise Exception(f"Erreur lors de l'inscription: {str(e)}")


class Login(graphene.Mutation):
    class Arguments:
        phone = graphene.String(required=True)
        password = graphene.String(required=True)

    token = graphene.String()
    user = graphene.Field(PatientType)

    def mutate(self, info, phone, password):
        try:
            phone = phone.strip()
            
            # Récupérer le patient
            try:
                patient = Patient.objects.get(phone=phone)
            except Patient.DoesNotExist:
                raise Exception("Numéro de téléphone ou mot de passe incorrect")
            
            # Vérifier que le patient a un utilisateur
            if not patient.user:
                raise Exception("Compte invalide. Veuillez vous réinscrire.")
            
            # Vérifier le mot de passe
            from django.contrib.auth import authenticate
            user = authenticate(username=patient.user.username, password=password)
            
            if not user:
                raise Exception("Numéro de téléphone ou mot de passe incorrect")
            
            # Générer un token JWT
            token = get_token(user)
            
            return Login(token=token, user=patient)
        except Exception as e:
            raise Exception(f"Erreur lors de la connexion: {str(e)}")


class LoginDoctor(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=False)
        phone = graphene.String(required=False)
        password = graphene.String(required=True)

    token = graphene.String()
    doctor = graphene.Field(DoctorType)

    def mutate(self, info, password, email=None, phone=None):
        try:
            # Vérifier qu'au moins email ou phone est fourni
            if not email and not phone:
                raise Exception("Email ou numéro de téléphone requis")
            
            # Récupérer l'utilisateur par email ou phone
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            user = None
            if email:
                email = email.strip().lower()
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    raise Exception("Email ou mot de passe incorrect")
            elif phone:
                phone = phone.strip()
                # Chercher le médecin par le champ phone
                try:
                    doctor = Doctor.objects.get(phone=phone)
                    user = doctor.user
                except Doctor.DoesNotExist:
                    raise Exception("Numéro de téléphone ou mot de passe incorrect")
            
            if not user:
                raise Exception("Identifiant ou mot de passe incorrect")
            
            # Vérifier le mot de passe
            from django.contrib.auth import authenticate
            authenticated_user = authenticate(username=user.username, password=password)
            
            if not authenticated_user:
                raise Exception("Identifiant ou mot de passe incorrect")
            
            # Vérifier que c'est un médecin
            try:
                doctor = Doctor.objects.get(user=authenticated_user)
            except Doctor.DoesNotExist:
                raise Exception("Ce compte n'est pas un compte médecin")
            
            # Générer un token JWT
            token = get_token(authenticated_user)
            
            return LoginDoctor(token=token, doctor=doctor)
        except Exception as e:
            raise Exception(f"Erreur lors de la connexion: {str(e)}")


class LoginAdmin(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    token = graphene.String()
    admin = graphene.Field(AdminType)

    def mutate(self, info, email, password):
        try:
            email = email.strip().lower()
            
            # Récupérer l'utilisateur par email
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise Exception("Email ou mot de passe incorrect")
            
            # Vérifier le mot de passe
            from django.contrib.auth import authenticate
            authenticated_user = authenticate(username=user.username, password=password)
            
            if not authenticated_user:
                raise Exception("Email ou mot de passe incorrect")
            
            # Vérifier que c'est un administrateur
            try:
                admin = Admin.objects.get(user=authenticated_user)
            except Admin.DoesNotExist:
                raise Exception("Ce compte n'est pas un compte administrateur")
            
            # Générer un token JWT
            token = get_token(authenticated_user)
            
            return LoginAdmin(token=token, admin=admin)
        except Exception as e:
            raise Exception(f"Erreur lors de la connexion: {str(e)}")


class UpdateProfile(graphene.Mutation):
    class Arguments:
        input = ProfileInput(required=True)

    patient = graphene.Field(PatientType)

    @login_required
    def mutate(self, info, input):
        # Récupérer le patient depuis l'utilisateur authentifié
        user = info.context.user
        try:
            patient = Patient.objects.get(user=user)
        except Patient.DoesNotExist:
            raise Exception("Patient non trouvé")
        
        # Mettre à jour le profil
        if input.name:
            patient.name = input.name
        if input.age:
            patient.age = input.age
        if input.pathologies:
            patient.pathologies = input.pathologies
        
        patient.save()
        
        return UpdateProfile(patient=patient)


class AITriage(graphene.Mutation):
    class Arguments:
        symptoms = graphene.String(required=True)

    triage = graphene.Field(AITriageType)

    def mutate(self, info, symptoms):
        # TODO: Implémenter l'analyse IA réelle (appel à OpenAI, etc.)
        # Pour l'instant, logique simple basée sur des mots-clés
        
        symptoms_lower = symptoms.lower()
        
        # Déterminer la gravité
        critical_keywords = ['douleur poitrine', 'difficulté respirer', 'perte connaissance']
        high_keywords = ['fièvre élevée', 'vomissements', 'saignement']
        medium_keywords = ['maux tête', 'fatigue', 'nausée']
        
        if any(keyword in symptoms_lower for keyword in critical_keywords):
            severity = 'critical'
            advice = "URGENCE MÉDICALE - Consultez immédiatement un médecin ou appelez les urgences."
            recommendation = "Consultation d'urgence requise immédiatement."
        elif any(keyword in symptoms_lower for keyword in high_keywords):
            severity = 'high'
            advice = "Consultez un médecin dans les prochaines heures. Surveillez vos symptômes attentivement."
            recommendation = "Consultation recommandée dans les 2-4 heures."
        elif any(keyword in symptoms_lower for keyword in medium_keywords):
            severity = 'medium'
            advice = "Surveillez vos symptômes. Reposez-vous et hydratez-vous bien. Si les symptômes persistent, consultez un médecin."
            recommendation = "Consultation recommandée dans les 24-48h si les symptômes persistent."
        else:
            severity = 'low'
            advice = "Vos symptômes semblent légers. Reposez-vous, hydratez-vous et surveillez l'évolution."
            recommendation = "Surveillance à domicile recommandée. Consultez si aggravation."
        
        # Créer l'entrée de triage
        triage = AITriage.objects.create(
            symptoms=symptoms,
            severity=severity,
            advice=advice,
            recommendation=recommendation
        )
        
        return AITriage(triage=triage)


# ==================== QUERIES ====================

class Query(graphene.ObjectType):
    # Queries pour les médecins
    doctors = graphene.List(DoctorType)
    doctor = graphene.Field(DoctorType, id=graphene.UUID(required=True))
    
    # Queries pour les patients
    me = graphene.Field(PatientType)
    
    # Queries pour les rappels
    reminders = graphene.List(ReminderType)
    
    # Queries pour le journal
    journal_entries = graphene.List(JournalEntryType, date=graphene.String())
    
    # Queries pour les consultations
    consultations = graphene.List(ConsultationType, status=graphene.String())
    consultation = graphene.Field(ConsultationType, id=graphene.UUID(required=True))
    
    # Queries pour les triages IA
    ai_triages = graphene.List(AITriageType)
    
    # Queries admin
    all_patients = graphene.List(PatientType)
    all_doctors = graphene.List(DoctorType)
    pending_doctors = graphene.List(DoctorType)  # Médecins en attente de validation

    def resolve_doctors(self, info):
        return Doctor.objects.filter(is_online=True).order_by('-rating', 'name')
    
    def resolve_doctor(self, info, id):
        try:
            return Doctor.objects.get(id=id)
        except Doctor.DoesNotExist:
            return None
    
    @login_required
    def resolve_me(self, info):
        # Récupérer le patient depuis l'utilisateur authentifié
        user = info.context.user
        try:
            return Patient.objects.get(user=user)
        except Patient.DoesNotExist:
            return None
    
    @login_required
    def resolve_reminders(self, info):
        # Filtrer par patient authentifié
        user = info.context.user
        try:
            patient = Patient.objects.get(user=user)
            return Reminder.objects.filter(patient=patient, is_active=True).order_by('date', 'time')
        except Patient.DoesNotExist:
            return []
    
    @login_required
    def resolve_journal_entries(self, info, date=None):
        # Filtrer par patient authentifié
        user = info.context.user
        try:
            patient = Patient.objects.get(user=user)
            queryset = JournalEntry.objects.filter(patient=patient)
            if date:
                queryset = queryset.filter(date=date)
            return queryset.order_by('-created_at')
        except Patient.DoesNotExist:
            return []
    
    @login_required
    def resolve_consultations(self, info, status=None):
        # Filtrer par patient ou docteur authentifié
        user = info.context.user
        
        # Vérifier que l'utilisateur est authentifié
        if not user or not user.is_authenticated:
            raise Exception("Vous devez être authentifié pour accéder aux consultations")
        
        queryset = None
        
        # Vérifier si c'est un patient
        try:
            patient = Patient.objects.get(user=user)
            queryset = Consultation.objects.filter(patient=patient)
        except Patient.DoesNotExist:
            # Vérifier si c'est un docteur
            try:
                doctor = Doctor.objects.get(user=user)
                queryset = Consultation.objects.filter(doctor=doctor)
            except Doctor.DoesNotExist:
                # Si ni patient ni docteur, retourner une liste vide
                return []
        
        # Filtrer par status si fourni
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset.order_by('-created_at')
    
    def resolve_consultation(self, info, id):
        try:
            return Consultation.objects.get(id=id)
        except Consultation.DoesNotExist:
            return None
    
    @login_required
    def resolve_ai_triages(self, info):
        # Filtrer par patient authentifié
        user = info.context.user
        try:
            patient = Patient.objects.get(user=user)
            return AITriage.objects.filter(patient=patient).order_by('-created_at')
        except Patient.DoesNotExist:
            return []
    
    # Resolvers admin
    @login_required
    def resolve_all_patients(self, info):
        # Vérifier que l'utilisateur est admin
        user = info.context.user
        try:
            Admin.objects.get(user=user)
        except Admin.DoesNotExist:
            raise Exception("Accès refusé. Administrateur requis.")
        return Patient.objects.all().order_by('-created_at')
    
    @login_required
    def resolve_all_doctors(self, info):
        # Vérifier que l'utilisateur est admin
        user = info.context.user
        try:
            Admin.objects.get(user=user)
        except Admin.DoesNotExist:
            raise Exception("Accès refusé. Administrateur requis.")
        return Doctor.objects.all().order_by('-created_at')
    
    @login_required
    def resolve_pending_doctors(self, info):
        # Vérifier que l'utilisateur est admin
        user = info.context.user
        try:
            Admin.objects.get(user=user)
        except Admin.DoesNotExist:
            raise Exception("Accès refusé. Administrateur requis.")
        return Doctor.objects.filter(is_approved=False).order_by('-created_at')


# ==================== MUTATIONS ROOT ====================

class ApproveDoctor(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)
        approved = graphene.Boolean(required=True)

    doctor = graphene.Field(DoctorType)

    @login_required
    def mutate(self, info, id, approved):
        # Vérifier que l'utilisateur est admin
        user = info.context.user
        try:
            Admin.objects.get(user=user)
        except Admin.DoesNotExist:
            raise Exception("Accès refusé. Administrateur requis.")
        
        try:
            doctor = Doctor.objects.get(id=id)
            doctor.is_approved = approved
            doctor.save()
            return ApproveDoctor(doctor=doctor)
        except Doctor.DoesNotExist:
            raise Exception("Médecin non trouvé")


class Mutation(graphene.ObjectType):
    # Mutations personnalisées
    register = Register.Field()
    login = Login.Field()  # Pour les patients
    login_doctor = LoginDoctor.Field()  # Pour les médecins
    login_admin = LoginAdmin.Field()  # Pour les administrateurs
    update_profile = UpdateProfile.Field()
    ai_triage = AITriage.Field()
    approve_doctor = ApproveDoctor.Field()  # Pour approuver/refuser un médecin
    
    # Mutations JWT (authentification)
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    verify_token = graphql_jwt.Verify.Field()
    revoke_token = graphql_jwt.Revoke.Field()


# ==================== SCHEMA ====================

schema = graphene.Schema(query=Query, mutation=Mutation)

