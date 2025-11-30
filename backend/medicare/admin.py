from django.contrib import admin
from .models import (
    Patient, Doctor, Reminder, JournalEntry, Consultation,
    Message, Payment, AITriage, OTPCode
)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'age', 'created_at')
    search_fields = ('name', 'phone')
    list_filter = ('created_at',)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialty', 'price', 'is_online', 'rating')
    search_fields = ('name', 'specialty')
    list_filter = ('specialty', 'is_online')


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ('title', 'patient', 'type', 'date', 'time', 'is_active')
    list_filter = ('type', 'is_active', 'date')
    search_fields = ('title', 'patient__name')


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('patient', 'type', 'date', 'created_at')
    list_filter = ('type', 'date')
    search_fields = ('patient__name', 'content')


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('patient__name', 'doctor__name')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('consultation', 'sender_type', 'created_at')
    list_filter = ('sender_type', 'created_at')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('consultation', 'amount', 'operator', 'status', 'created_at')
    list_filter = ('operator', 'status', 'created_at')


@admin.register(AITriage)
class AITriageAdmin(admin.ModelAdmin):
    list_display = ('patient', 'severity', 'created_at')
    list_filter = ('severity', 'created_at')
    search_fields = ('symptoms',)


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ('phone', 'code', 'is_used', 'expires_at', 'created_at')
    list_filter = ('is_used', 'expires_at')
    search_fields = ('phone',)
