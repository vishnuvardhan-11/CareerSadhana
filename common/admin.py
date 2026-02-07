"""
Admin configuration for common app
"""
from django.contrib import admin
from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    """Admin interface for contact messages"""
    list_display = ['name', 'email', 'subject', 'created_at', 'is_read']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    readonly_fields = ['name', 'email', 'subject', 'message', 'created_at']
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        """Disable adding messages from admin"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Allow deleting messages"""
        return True
