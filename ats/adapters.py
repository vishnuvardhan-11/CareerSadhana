import requests
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
                return "\n".join([para.text for para in doc.paragraphs])
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
