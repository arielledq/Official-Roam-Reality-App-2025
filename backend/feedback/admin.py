from django.contrib import admin
from .models import ContactUs, ReportedContent

@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'created_at')
    list_display_links = ('id',)
    search_fields = ['sender__email']


@admin.register(ReportedContent)
class ReportedContentAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'reported_user', 'reason', 'is_reviewed', 'created_at')
    list_display_links = ('id',)