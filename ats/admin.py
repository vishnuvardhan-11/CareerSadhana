from django.contrib import admin
from .models import ATSAnalysis

@admin.register(ATSAnalysis)
class ATSAnalysisAdmin(admin.ModelAdmin):
    list_display = ['user', 'score', 'created_at']
    list_filter = ['created_at', 'score']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['user', 'score', 'suggestions_json', 'created_at']
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        return False
