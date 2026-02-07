from django.db import models
from django.contrib.auth.models import User

class ATSAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ats_analyses')
    score = models.IntegerField(help_text="ATS score 0-100")
    suggestions_json = models.JSONField(help_text="Detailed suggestions from ATS")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'ATS Analysis'
        verbose_name_plural = 'ATS Analyses'
    
    def __str__(self):
        return f"{self.user.username} - Score: {self.score} ({self.created_at.date()})"
