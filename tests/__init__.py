"""
Test suite for CareerSadhana
Run with: python manage.py test
"""
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from jobs.models import GovernmentJob, PrivateJob
from ats.models import ATSAnalysis
from common.models import ContactMessage
from datetime import date, timedelta
import json


class HomeViewTest(TestCase):
    """Test home page"""
    
    def setUp(self):
        self.client = Client()
    
    def test_home_page_loads(self):
        response = self.client.get(reverse('common:home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'CareerSadhana')


class AuthenticationTest(TestCase):
    """Test user authentication"""
    
    def setUp(self):
        self.client = Client()
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password1': 'TestPass123!',
            'password2': 'TestPass123!'
        }
    
    def test_user_registration(self):
        response = self.client.post(reverse('users:register'), self.user_data)
        self.assertEqual(User.objects.count(), 1)
        user = User.objects.first()
        self.assertEqual(user.username, 'testuser')
    
    def test_user_login(self):
        User.objects.create_user(username='testuser', password='TestPass123!')
        response = self.client.post(reverse('users:login'), {
            'username': 'testuser',
            'password': 'TestPass123!'
        })
        self.assertTrue(response.wsgi_request.user.is_authenticated)


class JobModelsTest(TestCase):
    """Test job models"""
    
    def test_government_job_creation(self):
        job = GovernmentJob.objects.create(
            company='Test Dept',
            post_name='Test Post',
            education='Graduate',
            total_posts=10,
            location='Test City',
            last_date=date.today() + timedelta(days=30),
            apply_link='http://example.com'
        )
        self.assertEqual(str(job), 'Test Post - Test Dept')
        self.assertFalse(job.is_expired)
    
    def test_private_job_creation(self):
        job = PrivateJob.objects.create(
            company_name='Test Corp',
            role='Developer',
            salary='5-8 LPA',
            location='Test City',
            qualification='B.Tech',
            experience='2-4 years',
            apply_link='http://example.com'
        )
        self.assertEqual(str(job), 'Developer - Test Corp')


class ATSViewTest(TestCase):
    """Test ATS resume checker"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='TestPass123!')
        self.client.login(username='testuser', password='TestPass123!')
    
    def test_ats_page_requires_login(self):
        self.client.logout()
        response = self.client.get(reverse('ats:checker'))
        self.assertEqual(response.status_code, 302)  # Redirect to login
    
    def test_ats_page_loads_for_authenticated_user(self):
        response = self.client.get(reverse('ats:checker'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Upload Your Resume')


class ContactFormTest(TestCase):
    """Test contact form"""
    
    def setUp(self):
        self.client = Client()
    
    def test_contact_form_submission(self):
        response = self.client.post(reverse('common:about'), {
            'name': 'Test User',
            'email': 'test@example.com',
            'subject': 'Test Subject',
            'message': 'Test message'
        })
        self.assertEqual(ContactMessage.objects.count(), 1)
        message = ContactMessage.objects.first()
        self.assertEqual(message.name, 'Test User')


class Custom404Test(TestCase):
    """Test custom 404 page"""
    
    def setUp(self):
        self.client = Client()
    
    def test_custom_404_page(self):
        response = self.client.get('/nonexistent-page/')
        self.assertEqual(response.status_code, 404)
        self.assertContains(response, '404', status_code=404)


class JobSearchTest(TestCase):
    """Test job search functionality"""
    
    def setUp(self):
        self.client = Client()
        GovernmentJob.objects.create(
            company='Test Dept',
            post_name='Engineer',
            education='B.Tech',
            total_posts=10,
            location='Delhi',
            last_date=date.today() + timedelta(days=30),
            apply_link='http://example.com'
        )
    
    def test_job_search(self):
        response = self.client.get(reverse('jobs:government') + '?q=Engineer')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Engineer')
    
    def test_job_location_filter(self):
        response = self.client.get(reverse('jobs:government') + '?location=Delhi')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Delhi')


# Run tests with: python manage.py test
