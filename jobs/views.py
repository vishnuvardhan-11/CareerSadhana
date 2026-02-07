"""
Views for jobs app
"""
from django.shortcuts import render
from django.core.paginator import Paginator
from django.db.models import Q
from .models import GovernmentJob, PrivateJob


def government_jobs(request):
    """Display government job listings with search and filter"""
    query = request.GET.get('q', '')
    location = request.GET.get('location', '')
    status = request.GET.get('status', 'all')  # all, active, expired
    
    jobs = GovernmentJob.objects.filter(is_active=True)
    
    # Search filter
    if query:
        jobs = jobs.filter(
            Q(company__icontains=query) |
            Q(post_name__icontains=query) |
            Q(education__icontains=query)
        )
    
    # Location filter
    if location:
        jobs = jobs.filter(location__icontains=location)
    
    # Status filter
    from django.utils import timezone
    today = timezone.now().date()
    if status == 'active':
        jobs = jobs.filter(last_date__gte=today)
    elif status == 'expired':
        jobs = jobs.filter(last_date__lt=today)
    
    # Pagination
    paginator = Paginator(jobs, 15)  # Show 15 jobs per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'query': query,
        'location': location,
        'status': status,
        'total_jobs': jobs.count(),
    }
    
    return render(request, 'jobs/government.html', context)


def private_jobs(request):
    """Display private job listings with search and filter"""
    query = request.GET.get('q', '')
    location = request.GET.get('location', '')
    
    jobs = PrivateJob.objects.filter(is_active=True)
    
    # Search filter
    if query:
        jobs = jobs.filter(
            Q(company_name__icontains=query) |
            Q(role__icontains=query) |
            Q(qualification__icontains=query)
        )
    
    # Location filter
    if location:
        jobs = jobs.filter(location__icontains=location)
    
    # Pagination
    paginator = Paginator(jobs, 15)  # Show 15 jobs per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'query': query,
        'location': location,
        'total_jobs': jobs.count(),
    }
    
    return render(request, 'jobs/private.html', context)
