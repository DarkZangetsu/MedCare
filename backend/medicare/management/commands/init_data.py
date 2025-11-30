from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from medicare.models import Doctor


class Command(BaseCommand):
    help = 'Initialise les données de test (médecins)'

    def handle(self, *args, **options):
        self.stdout.write('Création des médecins de test...')
        
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
            {
                'name': 'Dr. Randria',
                'specialty': 'Dermatologie',
                'price': 18000,
                'is_online': True,
                'rating': 4.6,
            },
            {
                'name': 'Dr. Ravelo',
                'specialty': 'Gynécologie',
                'price': 22000,
                'is_online': True,
                'rating': 4.8,
            },
        ]
        
        for doctor_data in doctors_data:
            username = doctor_data['name'].lower().replace(' ', '_').replace('.', '')
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@medcare.mg',
                    'first_name': doctor_data['name'].split()[1] if len(doctor_data['name'].split()) > 1 else '',
                    'last_name': doctor_data['name'].split()[0],
                }
            )
            
            if created:
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
            else:
                self.stdout.write(
                    self.style.WARNING(f'→ Médecin existe déjà: {doctor.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS('\n✓ Initialisation terminée!')
        )

