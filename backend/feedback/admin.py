from django.contrib import admin
from .models import ContactUs

@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'created_at')
    list_display_links = ('id',)
    search_fields = ['sender__email']
