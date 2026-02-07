from django.contrib import admin
from .models import GovernmentJob, PrivateJob
import csv
from django.http import HttpResponse

@admin.register(GovernmentJob)
class GovernmentJobAdmin(admin.ModelAdmin):
    list_display = ['post_name', 'company', 'location', 'total_posts', 'last_date', 'is_active']
    list_filter = ['is_active', 'last_date', 'location']
    search_fields = ['company', 'post_name', 'location']
    date_hierarchy = 'last_date'
    actions = ['export_as_csv', 'mark_inactive']
    
    def mark_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} jobs marked as inactive')
    mark_inactive.short_description = "Mark selected jobs as inactive"
    
    def export_as_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="government_jobs.csv"'
        writer = csv.writer(response)
        writer.writerow(['Company', 'Post Name', 'Education', 'Total Posts', 'Location', 'Last Date', 'Apply Link'])
        for job in queryset:
            writer.writerow([job.company, job.post_name, job.education, job.total_posts, 
                           job.location, job.last_date, job.apply_link])
        return response
    export_as_csv.short_description = "Export selected as CSV"

@admin.register(PrivateJob)
class PrivateJobAdmin(admin.ModelAdmin):
    list_display = ['role', 'company_name', 'location', 'salary', 'experience', 'is_active']
    list_filter = ['is_active', 'location']
    search_fields = ['company_name', 'role', 'location']
    actions = ['export_as_csv', 'mark_inactive']
    
    def mark_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} jobs marked as inactive')
    mark_inactive.short_description = "Mark selected jobs as inactive"
    
    def export_as_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="private_jobs.csv"'
        writer = csv.writer(response)
        writer.writerow(['Company Name', 'Role', 'Salary', 'Location', 'Qualification', 'Experience', 'Apply Link'])
        for job in queryset:
            writer.writerow([job.company_name, job.role, job.salary, job.location,
                           job.qualification, job.experience, job.apply_link])
        return response
    export_as_csv.short_description = "Export selected as CSV"
