from django import forms

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
