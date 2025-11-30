from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from medicare.models import Patient, Doctor, OTPCode
import random
import string


class Command(BaseCommand):
    help = 'Crée des données de test (patients et codes OTP) pour tester l\'authentification'

    def add_arguments(self, parser):
        parser.add_argument(
            '--phone',
            type=str,
            help='Numéro de téléphone pour créer un patient de test',
            default='+261341234567'
        )

    def handle(self, *args, **options):
        phone = options['phone']
        
        self.stdout.write(f'Création des données de test pour {phone}...')
        
        # Créer ou récupérer le patient
        patient, created = Patient.objects.get_or_create(
            phone=phone,
            defaults={
                'phone': phone,
                'name': 'Patient Test',
                'age': 30,
                'pathologies': ['Diabète', 'Hypertension']
            }
        )
        
        if created:
            # Créer un utilisateur Django associé
            username = f"patient_{phone.replace('+', '').replace(' ', '')}"
            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@medcare.mg',
                    'first_name': 'Patient',
                    'last_name': 'Test'
                }
            )
            
            if user_created:
                # Définir un mot de passe simple (non utilisé pour OTP mais utile pour l'admin)
                user.set_password('test123')
                user.save()
            
            patient.user = user
            patient.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'✓ Patient créé: {patient.name} ({patient.phone})')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'→ Patient existe déjà: {patient.name} ({patient.phone})')
            )
        
        # Créer un code OTP valide pour ce numéro
        # Supprimer les anciens codes OTP non utilisés
        OTPCode.objects.filter(phone=phone, is_used=False).delete()
        
        # Générer un nouveau code OTP
        code = ''.join(random.choices(string.digits, k=6))
        otp = OTPCode.objects.create(
            phone=phone,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=10),
            is_used=False
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✓ Code OTP créé: {code}')
        )
        self.stdout.write(
            self.style.WARNING(f'⚠️  Ce code expire dans 10 minutes')
        )
        self.stdout.write(
            self.style.SUCCESS(f'\n📱 Vous pouvez maintenant vous connecter avec:')
        )
        self.stdout.write(f'   Téléphone: {phone}')
        self.stdout.write(f'   Code OTP: {code}')
        
        # Créer aussi quelques médecins si ils n'existent pas
        if Doctor.objects.count() == 0:
            self.stdout.write('\n📋 Création des médecins de test...')
            doctors_data = [
                {
                    'name': 'Dr. Rakoto',
                    'specialty': 'Médecine générale',
                    'price': 15000,
                    'is_online': True,
                    'rating': 4.8,
                },
                {
                    'name': 'Dr. Rabe',
                    'specialty': 'Cardiologie',
                    'price': 25000,
                    'is_online': True,
                    'rating': 4.9,
                },
                {
                    'name': 'Dr. Rasoa',
                    'specialty': 'Pédiatrie',
                    'price': 20000,
                    'is_online': False,
                    'rating': 4.7,
                },
            ]
            
            for doctor_data in doctors_data:
                username = doctor_data['name'].lower().replace(' ', '_').replace('.', '')
                user, _ = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'email': f'{username}@medcare.mg',
                        'first_name': doctor_data['name'].split()[1] if len(doctor_data['name'].split()) > 1 else '',
                        'last_name': doctor_data['name'].split()[0],
                    }
                )
                user.set_password('password123')
                user.save()
                
                doctor, created = Doctor.objects.get_or_create(
                    user=user,
                    defaults=doctor_data
                )
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Médecin créé: {doctor.name}')
                    )
        
        self.stdout.write(
            self.style.SUCCESS('\n✅ Données de test créées avec succès!')
        )

