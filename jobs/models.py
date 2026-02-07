"""
Models for jobs app
"""
from django.db import models
from django.utils import timezone


class GovernmentJob(models.Model):
    """Model for government job postings"""
    company = models.CharField(max_length=200, help_text="Organization/Department name")
    post_name = models.CharField(max_length=200, help_text="Position title")
    education = models.CharField(max_length=200, help_text="Required qualification")
    total_posts = models.PositiveIntegerField(help_text="Number of vacancies")
    location = models.CharField(max_length=200, help_text="Job location")
    last_date = models.DateField(help_text="Application deadline")
    apply_link = models.URLField(max_length=500, help_text="Application URL")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-last_date', '-created_at']
        verbose_name = 'Government Job'
        verbose_name_plural = 'Government Jobs'
        indexes = [
            models.Index(fields=['last_date']),
            models.Index(fields=['location']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.post_name} - {self.company}"
    
    @property
    def is_expired(self):
        """Check if application deadline has passed"""
        return self.last_date < timezone.now().date()
    
    @property
    def days_remaining(self):
        """Calculate days until deadline"""
        if self.is_expired:
            return 0
        delta = self.last_date - timezone.now().date()
        return delta.days


class PrivateJob(models.Model):
    """Model for private sector job postings"""
    company_name = models.CharField(max_length=200, help_text="Company name")
    role = models.CharField(max_length=200, help_text="Job title/role")
    salary = models.CharField(max_length=100, help_text="Salary range (e.g., ₹5-8 LPA)")
    location = models.CharField(max_length=200, help_text="Job location")
    qualification = models.CharField(max_length=200, help_text="Required qualification")
    experience = models.CharField(max_length=100, help_text="Experience required (e.g., 2-5 years)")
    apply_link = models.URLField(max_length=500, help_text="Application URL")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Private Job'
        verbose_name_plural = 'Private Jobs'
        indexes = [
            models.Index(fields=['location']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.role} - {self.company_name}"
