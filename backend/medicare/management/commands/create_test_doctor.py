from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from medicare.models import Doctor


class Command(BaseCommand):
    help = 'Crée un médecin de test pour la connexion'

    def handle(self, *args, **options):
        self.stdout.write('Création d\'un médecin de test...')
        
        # Données du médecin de test
        test_doctor_data = {
            'name': 'Dr. Test',
            'specialty': 'Médecine générale',
            'phone': '+261341234567',
            'price': 20000,
            'is_online': True,
            'rating': 4.5,
        }
        
        # Créer l'utilisateur
        username = 'doctor_test'
        email = 'doctor@medcare.mg'
        password = 'password123'
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': 'Test',
                'last_name': 'Doctor',
            }
        )
        
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'✓ Utilisateur créé: {username} / {email}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'→ Utilisateur existe déjà: {username}')
            )
            # Mettre à jour le mot de passe au cas où
            user.set_password(password)
            user.save()
        
        # Créer le médecin
        doctor, created = Doctor.objects.get_or_create(
            user=user,
            defaults=test_doctor_data
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'✓ Médecin créé: {doctor.name}')
            )
        else:
            # Mettre à jour les données si le médecin existe déjà
            for key, value in test_doctor_data.items():
                setattr(doctor, key, value)
            doctor.save()
            self.stdout.write(
                self.style.WARNING(f'→ Médecin existe déjà, données mises à jour: {doctor.name}')
            )
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('Informations de connexion:'))
        self.stdout.write(f'Email: {email}')
        self.stdout.write(f'Téléphone: {test_doctor_data["phone"]}')
        self.stdout.write(f'Mot de passe: {password}')
        self.stdout.write('='*50)
        self.stdout.write(
            self.style.SUCCESS('\n✓ Médecin de test créé avec succès!')
        )

