#!/usr/bin/env python3
"""
Complete CareerSadhana File Generator
Generates all remaining Django app files for the project
Run this script from the careersadhana directory
"""

import os

# Define all files to create
FILES = {
    # Jobs App
    'jobs/urls.py': '''from django.urls import path
from . import views

app_name = 'jobs'

urlpatterns = [
    path('government/', views.government_jobs, name='government'),
    path('private/', views.private_jobs, name='private'),
]
''',
    
    'jobs/admin.py': '''from django.contrib import admin
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
''',
    
    'jobs/apps.py': '''from django.apps import AppConfig

class JobsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'jobs'
    verbose_name = 'Job Listings'
''',

    # ATS App
    'ats/models.py': '''from django.db import models
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
''',

    'ats/adapters.py': '''import requests
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class ATSAdapter:
    """Real ATS API adapter"""
    
    def __init__(self):
        self.api_url = settings.ATS_API_URL
        self.api_key = settings.ATS_API_KEY
    
    def analyze(self, file_path):
        """Send resume to ATS API for analysis"""
        try:
            with open(file_path, 'rb') as f:
                files = {'resume': f}
                headers = {'Authorization': f'Bearer {self.api_key}'}
                response = requests.post(
                    self.api_url,
                    files=files,
                    headers=headers,
                    timeout=30
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"ATS API error: {e}")
            raise

class MockATSAdapter:
    """Mock ATS adapter for development/testing"""
    
    def analyze(self, file_path):
        """Perform deterministic scoring based on simple heuristics"""
        try:
            # Read file content
            import os
            file_size = os.path.getsize(file_path)
            file_ext = os.path.splitext(file_path)[1].lower()
            
            # Base score
            score = 60
            
            # File format check
            if file_ext in ['.pdf', '.docx']:
                score += 10
            
            # File size check (reasonable size)
            if 50000 < file_size < 500000:  # 50KB to 500KB
                score += 10
            
            # Try to extract text and check for keywords
            text = self._extract_text(file_path)
            keywords = ['experience', 'education', 'skills', 'projects', 'work', 
                       'bachelor', 'master', 'technical', 'management']
            
            matched_keywords = sum(1 for kw in keywords if kw.lower() in text.lower())
            score += min(matched_keywords * 2, 20)
            
            # Generate suggestions
            suggestions = []
            
            if matched_keywords < 5:
                suggestions.append({
                    'name': 'Keywords',
                    'advice': 'Add more relevant keywords like: experience, skills, projects, education',
                    'severity': 'high'
                })
            
            if file_size < 50000:
                suggestions.append({
                    'name': 'Content',
                    'advice': 'Your resume seems short. Add more details about your experience and projects',
                    'severity': 'medium'
                })
            
            if 'bullet' not in text.lower() and '*' not in text:
                suggestions.append({
                    'name': 'Formatting',
                    'advice': 'Use bullet points to list achievements and responsibilities',
                    'severity': 'low'
                })
            
            # Cap score at 100
            score = min(score, 100)
            
            return {
                'score': score,
                'sections': suggestions if suggestions else [{
                    'name': 'Overall',
                    'advice': 'Good resume! Keep it updated with recent achievements.',
                    'severity': 'low'
                }],
                'meta': {
                    'matched_keywords': matched_keywords,
                    'total_keywords': len(keywords)
                }
            }
        except Exception as e:
            logger.error(f"Mock ATS error: {e}")
            # Return default score on error
            return {
                'score': 70,
                'sections': [{
                    'name': 'Analysis',
                    'advice': 'Resume received. Unable to perform detailed analysis.',
                    'severity': 'low'
                }],
                'meta': {}
            }
    
    def _extract_text(self, file_path):
        """Extract text from PDF or DOCX"""
        import os
        file_ext = os.path.splitext(file_path)[1].lower()
        
        try:
            if file_ext == '.pdf':
                from PyPDF2 import PdfReader
                reader = PdfReader(file_path)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()
                return text
            elif file_ext == '.docx':
                from docx import Document
                doc = Document(file_path)
                return "\\n".join([para.text for para in doc.paragraphs])
            else:
                return ""
        except:
            return ""

def get_ats_adapter():
    """Factory function to get appropriate ATS adapter"""
    if settings.ATS_API_URL and settings.ATS_API_KEY:
        logger.info("Using real ATS API adapter")
        return ATSAdapter()
    else:
        logger.info("Using mock ATS adapter")
        return MockATSAdapter()
''',

    'ats/forms.py': '''from django import forms

class ResumeUploadForm(forms.Form):
    resume = forms.FileField(
        label='Upload Resume',
        help_text='Accepted formats: PDF, DOC, DOCX (Max 5MB)',
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'accept': '.pdf,.doc,.docx'
        })
    )
    
    def clean_resume(self):
        resume = self.cleaned_data.get('resume')
        
        if resume:
            # Check file size
            if resume.size > 5 * 1024 * 1024:  # 5MB
                raise forms.ValidationError('File size must be under 5MB')
            
            # Check file extension
            import os
            ext = os.path.splitext(resume.name)[1].lower()
            if ext not in ['.pdf', '.doc', '.docx']:
                raise forms.ValidationError('Only PDF, DOC, and DOCX files are allowed')
            
            # Check MIME type
            import magic
            mime = magic.from_buffer(resume.read(1024), mime=True)
            resume.seek(0)  # Reset file pointer
            
            allowed_mimes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
            
            if mime not in allowed_mimes:
                raise forms.ValidationError('Invalid file type')
        
        return resume
''',

    'ats/views.py': '''from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings
from django_ratelimit.decorators import ratelimit
from .forms import ResumeUploadForm
from .models import ATSAnalysis
from .adapters import get_ats_adapter
import os
import logging

logger = logging.getLogger('ats')

@login_required
@ratelimit(key='user', rate='10/h', method='POST')
def ats_checker(request):
    """ATS resume score checker view"""
    analysis_result = None
    
    if request.method == 'POST':
        form = ResumeUploadForm(request.POST, request.FILES)
        if form.is_valid():
            resume_file = request.FILES['resume']
            
            # Save file temporarily
            temp_dir = settings.TEMP_UPLOAD_DIR
            temp_path = os.path.join(temp_dir, f"{request.user.id}_{resume_file.name}")
            
            try:
                # Write file to temp location
                with open(temp_path, 'wb+') as destination:
                    for chunk in resume_file.chunks():
                        destination.write(chunk)
                
                logger.info(f"Resume uploaded by {request.user.username}: {resume_file.name}")
                
                # Get ATS adapter and analyze
                adapter = get_ats_adapter()
                result = adapter.analyze(temp_path)
                
                # Save analysis to database (metadata only, not file)
                analysis = ATSAnalysis.objects.create(
                    user=request.user,
                    score=result['score'],
                    suggestions_json=result
                )
                
                logger.info(f"ATS analysis complete for {request.user.username}: Score {result['score']}")
                
                analysis_result = result
                messages.success(request, f'Resume analyzed successfully! Your ATS score: {result["score"]}/100')
                
            except Exception as e:
                logger.error(f"ATS analysis error: {e}")
                messages.error(request, 'An error occurred while analyzing your resume. Please try again.')
            
            finally:
                # CRITICAL: Delete temporary file immediately
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    logger.info(f"Temporary file deleted: {temp_path}")
    else:
        form = ResumeUploadForm()
    
    # Get user's recent analyses
    recent_analyses = ATSAnalysis.objects.filter(user=request.user)[:5]
    
    context = {
        'form': form,
        'analysis_result': analysis_result,
        'recent_analyses': recent_analyses,
    }
    
    return render(request, 'ats/checker.html', context)
''',

    'ats/urls.py': '''from django.urls import path
from . import views

app_name = 'ats'

urlpatterns = [
    path('checker/', views.ats_checker, name='checker'),
]
''',

    'ats/admin.py': '''from django.contrib import admin
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
''',

    'ats/apps.py': '''from django.apps import AppConfig

class AtsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ats'
    verbose_name = 'ATS Resume Checker'
''',

    # Users App
    'users/models.py': '''# Using Django's built-in User model
# Additional user profile fields can be added here if needed
''',

    'users/forms.py': '''from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User

class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({'class': 'form-control'})

class LoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({'class': 'form-control'})
''',

    'users/views.py': '''from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib import messages
from .forms import RegistrationForm, LoginForm

def register(request):
    if request.user.is_authenticated:
        return redirect('ats:checker')
    
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Account created successfully! Welcome to CareerSadhana.')
            return redirect('ats:checker')
    else:
        form = RegistrationForm()
    
    return render(request, 'users/register.html', {'form': form})

def user_login(request):
    if request.user.is_authenticated:
        return redirect('ats:checker')
    
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            next_url = request.GET.get('next', 'ats:checker')
            return redirect(next_url)
    else:
        form = LoginForm()
    
    return render(request, 'users/login.html', {'form': form})

def user_logout(request):
    logout(request)
    messages.info(request, 'You have been logged out successfully.')
    return redirect('common:home')
''',

    'users/urls.py': '''from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
]
''',

    'users/admin.py': '''from django.contrib import admin
# Using Django's default User admin
''',

    'users/apps.py': '''from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    verbose_name = 'Users'
''',

    # Dockerfile
    'Dockerfile': '''FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    default-libmysqlclient-dev \\
    build-essential \\
    libmagic1 \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Create necessary directories
RUN mkdir -p logs staticfiles media uploads/temp

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "careersadhana_project.wsgi:application"]
''',

    'docker-compose.yml': '''version: '3.8'

services:
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: careersadhana
      MYSQL_USER: careers_user
      MYSQL_PASSWORD: changeme
      MYSQL_ROOT_PASSWORD: rootchangeme
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  web:
    build: .
    command: gunicorn careersadhana_project.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DEBUG=True
      - DB_HOST=db
      - DB_NAME=careersadhana
      - DB_USER=careers_user
      - DB_PASS=changeme

volumes:
  mysql_data:
  static_volume:
  media_volume:
''',

    '.dockerignore': '''*.pyc
__pycache__/
*.log
.env
.git/
venv/
staticfiles/
media/
*.sqlite3
.DS_Store
''',
}

# Create all files
def create_files():
    for filepath, content in FILES.items():
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Write file
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✓ Created: {filepath}")

if __name__ == '__main__':
    print("Generating CareerSadhana project files...")
    create_files()
    print("\\n✓ All files generated successfully!")
    print("\\nNext steps:")
    print("1. Create virtual environment: python3 -m venv venv")
    print("2. Activate venv: source venv/bin/activate")
    print("3. Install dependencies: pip install -r requirements.txt")
    print("4. Setup database: mysql -u root -p < manual_create_db.sql")
    print("5. Configure .env file")
    print("6. Run migrations: python manage.py migrate")
    print("7. Create superuser: python manage.py createsuperuser")
    print("8. Run server: python manage.py runserver")
