"""
Common views for CareerSadhana
"""
from django.shortcuts import render, redirect
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings
from .forms import ContactForm
from .models import ContactMessage


def home(request):
    """Home page view"""
    return render(request, 'home.html')


def about(request):
    """About page view with contact form"""
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # Save to database
            contact_message = ContactMessage.objects.create(
                name=form.cleaned_data['name'],
                email=form.cleaned_data['email'],
                subject=form.cleaned_data['subject'],
                message=form.cleaned_data['message']
            )
            
            # Try to send email (fallback to DB storage if fails)
            try:
                email_subject = f"CareerSadhana Contact: {form.cleaned_data['subject']}"
                email_message = f"""
New contact form submission:

Name: {form.cleaned_data['name']}
Email: {form.cleaned_data['email']}
Subject: {form.cleaned_data['subject']}

Message:
{form.cleaned_data['message']}
"""
                send_mail(
                    email_subject,
                    email_message,
                    settings.DEFAULT_FROM_EMAIL,
                    [settings.ADMIN_EMAIL],
                    fail_silently=False,
                )
                messages.success(request, 'Thank you for contacting us! We will get back to you soon.')
            except Exception as e:
                # Email failed, but we saved to DB
                messages.success(request, 'Thank you for contacting us! Your message has been received.')
            
            return redirect('common:about')
    else:
        form = ContactForm()
    
    return render(request, 'about.html', {'form': form})


def custom_404(request, exception=None):
    """Custom 404 error page"""
    return render(request, '404.html', status=404)


def custom_500(request):
    """Custom 500 error page"""
    return render(request, '500.html', status=500)
