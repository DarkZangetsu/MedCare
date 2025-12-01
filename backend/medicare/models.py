from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class Patient(models.Model):
    """Modèle pour les patients"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    pathologies = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patients'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name or 'Patient'} - {self.phone}"


class Doctor(models.Model):
    """Modèle pour les médecins"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    specialty = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, null=True, blank=True)
    avatar = models.URLField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_online = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)  # Validation par l'admin
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctors'
        ordering = ['-rating', 'name']

    def __str__(self):
        return f"Dr. {self.name} - {self.specialty}"


class Admin(models.Model):
    """Modèle pour les administrateurs"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'admins'
        ordering = ['-created_at']

    def __str__(self):
        return f"Admin: {self.name}"


class Reminder(models.Model):
    """Modèle pour les rappels santé"""
    REMINDER_TYPES = [
        ('medication', 'Médicament'),
        ('appointment', 'Rendez-vous'),
        ('analysis', 'Analyse'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reminders')
    type = models.CharField(max_length=20, choices=REMINDER_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    date = models.DateField()
    time = models.TimeField()
    is_active = models.BooleanField(default=True)
    notification_id = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reminders'
        ordering = ['date', 'time']

    def __str__(self):
        return f"{self.title} - {self.patient.name}"


class JournalEntry(models.Model):
    """Modèle pour les entrées du journal santé"""
    ENTRY_TYPES = [
        ('note', 'Note'),
        ('measurement', 'Mesure'),
        ('photo', 'Photo'),
    ]

    MEASUREMENT_TYPES = [
        ('glycemia', 'Glycémie'),
        ('blood_pressure', 'Tension artérielle'),
        ('weight', 'Poids'),
        ('temperature', 'Température'),
        ('other', 'Autre'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='journal_entries')
    date = models.DateField()
    type = models.CharField(max_length=20, choices=ENTRY_TYPES)
    content = models.TextField(null=True, blank=True)
    measurement_type = models.CharField(max_length=50, choices=MEASUREMENT_TYPES, null=True, blank=True)
    measurement_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    measurement_unit = models.CharField(max_length=20, null=True, blank=True)
    photo_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'journal_entries'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} - {self.patient.name} - {self.date}"


class Consultation(models.Model):
    """Modèle pour les consultations"""
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('active', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='consultations')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='consultations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'consultations'
        ordering = ['-created_at']

    def __str__(self):
        return f"Consultation {self.id} - {self.patient.name} / {self.doctor.name}"


class Message(models.Model):
    """Modèle pour les messages de chat"""
    SENDER_TYPES = [
        ('patient', 'Patient'),
        ('doctor', 'Médecin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name='messages')
    sender_id = models.UUIDField()
    sender_type = models.CharField(max_length=20, choices=SENDER_TYPES)
    content = models.TextField(null=True, blank=True)
    photo_url = models.URLField(null=True, blank=True)
    audio_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Message {self.id} - {self.sender_type}"


class Payment(models.Model):
    """Modèle pour les paiements"""
    OPERATOR_CHOICES = [
        ('mvola', 'MVola'),
        ('orange', 'Orange Money'),
        ('airtel', 'Airtel Money'),
    ]

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('success', 'Réussi'),
        ('failed', 'Échoué'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    operator = models.CharField(max_length=20, choices=OPERATOR_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Paiement {self.id} - {self.amount} {self.operator}"


class AITriage(models.Model):
    """Modèle pour les résultats de triage IA"""
    SEVERITY_CHOICES = [
        ('low', 'Faible'),
        ('medium', 'Modérée'),
        ('high', 'Élevée'),
        ('critical', 'Critique'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='ai_triages', null=True, blank=True)
    symptoms = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    advice = models.TextField()
    recommendation = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_triages'
        ordering = ['-created_at']

    def __str__(self):
        return f"Triage IA {self.id} - {self.severity}"


class OTPCode(models.Model):
    """Modèle pour les codes OTP"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20)
    code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'otp_codes'
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP {self.code} - {self.phone}"
