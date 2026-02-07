from django.shortcuts import render, redirect
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
