from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from medicare.models import Admin


class Command(BaseCommand):
    help = 'Crée un administrateur de test'

    def handle(self, *args, **options):
        self.stdout.write('Création d\'un administrateur de test...')
        
        # Données de l'admin de test
        email = 'admin@medcare.mg'
        password = 'admin123'
        name = 'Administrateur MedCare'
        
        # Créer l'utilisateur
        username = 'admin_medcare'
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': 'Admin',
                'last_name': 'MedCare',
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
        
        # Créer l'admin
        admin, created = Admin.objects.get_or_create(
            user=user,
            defaults={
                'name': name,
                'email': email,
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'✓ Administrateur créé: {admin.name}')
            )
        else:
            # Mettre à jour les données si l'admin existe déjà
            admin.name = name
            admin.email = email
            admin.save()
            self.stdout.write(
                self.style.WARNING(f'→ Administrateur existe déjà, données mises à jour: {admin.name}')
            )
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('Informations de connexion:'))
        self.stdout.write(f'Email: {email}')
        self.stdout.write(f'Mot de passe: {password}')
        self.stdout.write('='*50)
        self.stdout.write(
            self.style.SUCCESS('\n✓ Administrateur de test créé avec succès!')
        )

