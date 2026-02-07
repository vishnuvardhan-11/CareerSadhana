#!/bin/bash

# ATS Checker Template
cat > ats/templates/ats/checker.html << 'EOF'
{% extends 'base.html' %}
{% load crispy_forms_tags %}

{% block title %}ATS Score Checker - CareerSadhana{% endblock %}

{% block content %}
<div class="container py-5">
    <h1 class="mb-4">ATS Resume Score Checker</h1>
    <p class="lead">Upload your resume and get instant AI-powered feedback</p>
    
    {% if analysis_result %}
    <!-- Analysis Results -->
    <div class="card mb-4 shadow">
        <div class="card-header bg-primary-custom text-white">
            <h3><i class="bi bi-check-circle"></i> Analysis Complete</h3>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-4 text-center">
                    <h5>Your ATS Score</h5>
                    <div class="score-display">
                        <h1 class="display-1 text-accent-custom">{{ analysis_result.score }}</h1>
                        <p class="text-muted">out of 100</p>
                    </div>
                    <div class="progress" style="height: 25px;">
                        <div class="progress-bar" role="progressbar" 
                             style="width: {{ analysis_result.score }}%; background-color: {% if analysis_result.score >= 70 %}#28a745{% elif analysis_result.score >= 50 %}#ffc107{% else %}#dc3545{% endif %};"
                             aria-valuenow="{{ analysis_result.score }}" aria-valuemin="0" aria-valuemax="100">
                            {{ analysis_result.score }}%
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <h5>Suggestions for Improvement</h5>
                    {% for section in analysis_result.sections %}
                    <div class="alert {% if section.severity == 'high' %}severity-high{% elif section.severity == 'medium' %}severity-medium{% else %}severity-low{% endif %} mb-2">
                        <strong>{{ section.name }}:</strong> {{ section.advice }}
                    </div>
                    {% endfor %}
                </div>
            </div>
        </div>
    </div>
    {% endif %}
    
    <!-- Upload Form -->
    <div class="card shadow">
        <div class="card-body">
            <h4>Upload Your Resume</h4>
            <form method="post" enctype="multipart/form-data">
                {% csrf_token %}
                {% crispy form %}
                <button type="submit" class="btn btn-primary-custom btn-lg">
                    <i class="bi bi-upload"></i> Analyze Resume
                </button>
            </form>
        </div>
    </div>
    
    <!-- Recent Analyses -->
    {% if recent_analyses %}
    <div class="mt-5">
        <h4>Your Recent Analyses</h4>
        <div class="list-group">
            {% for analysis in recent_analyses %}
            <div class="list-group-item">
                <div class="d-flex justify-content-between">
                    <span>Score: <strong>{{ analysis.score }}/100</strong></span>
                    <small class="text-muted">{{ analysis.created_at|date:"M d, Y H:i" }}</small>
                </div>
            </div>
            {% endfor %}
        </div>
    </div>
    {% endif %}
</div>
{% endblock %}
EOF

# Government Jobs Template
cat > jobs/templates/jobs/government.html << 'EOF'
{% extends 'base.html' %}

{% block title %}Government Jobs - CareerSadhana{% endblock %}

{% block content %}
<div class="container py-5">
    <h1 class="mb-4">Government Job Listings</h1>
    
    <!-- Search and Filter -->
    <div class="card mb-4">
        <div class="card-body">
            <form method="get" class="row g-3">
                <div class="col-md-4">
                    <input type="text" name="q" class="form-control" placeholder="Search jobs..." value="{{ query }}">
                </div>
                <div class="col-md-3">
                    <input type="text" name="location" class="form-control" placeholder="Location" value="{{ location }}">
                </div>
                <div class="col-md-3">
                    <select name="status" class="form-select">
                        <option value="all" {% if status == 'all' %}selected{% endif %}>All</option>
                        <option value="active" {% if status == 'active' %}selected{% endif %}>Active</option>
                        <option value="expired" {% if status == 'expired' %}selected{% endif %}>Expired</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <button type="submit" class="btn btn-primary-custom w-100">Search</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Results Count -->
    <p class="text-muted">Found {{ total_jobs }} job{{ total_jobs|pluralize }}</p>
    
    <!-- Job Listings -->
    {% for job in page_obj %}
    <div class="card job-card mb-3">
        <div class="card-body">
            <div class="row">
                <div class="col-md-8">
                    <h5 class="card-title">{{ job.post_name }}</h5>
                    <p class="mb-1"><strong>{{ job.company }}</strong></p>
                    <p class="mb-1"><i class="bi bi-mortarboard"></i> {{ job.education }}</p>
                    <p class="mb-1"><i class="bi bi-geo-alt"></i> {{ job.location }}</p>
                    <p class="mb-1"><i class="bi bi-people"></i> Total Posts: {{ job.total_posts }}</p>
                </div>
                <div class="col-md-4 text-end">
                    <p class="mb-1">Last Date: <strong>{{ job.last_date }}</strong></p>
                    {% if not job.is_expired %}
                    <span class="badge bg-success">{{ job.days_remaining }} days left</span>
                    {% else %}
                    <span class="badge bg-danger">Expired</span>
                    {% endif %}
                    <div class="mt-3">
                        <a href="{{ job.apply_link }}" target="_blank" class="btn btn-accent-custom">Apply Now</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {% empty %}
    <div class="alert alert-info">No jobs found matching your criteria.</div>
    {% endfor %}
    
    <!-- Pagination -->
    {% if page_obj.has_other_pages %}
    <nav>
        <ul class="pagination justify-content-center">
            {% if page_obj.has_previous %}
            <li class="page-item"><a class="page-link" href="?page=1&q={{ query }}&location={{ location }}&status={{ status }}">First</a></li>
            <li class="page-item"><a class="page-link" href="?page={{ page_obj.previous_page_number }}&q={{ query }}&location={{ location }}&status={{ status }}">Previous</a></li>
            {% endif %}
            <li class="page-item active"><span class="page-link">Page {{ page_obj.number }} of {{ page_obj.paginator.num_pages }}</span></li>
            {% if page_obj.has_next %}
            <li class="page-item"><a class="page-link" href="?page={{ page_obj.next_page_number }}&q={{ query }}&location={{ location }}&status={{ status }}">Next</a></li>
            <li class="page-item"><a class="page-link" href="?page={{ page_obj.paginator.num_pages }}&q={{ query }}&location={{ location }}&status={{ status }}">Last</a></li>
            {% endif %}
        </ul>
    </nav>
    {% endif %}
</div>
{% endblock %}
EOF

# Private Jobs Template
cat > jobs/templates/jobs/private.html << 'EOF'
{% extends 'base.html' %}

{% block title %}Private Jobs - CareerSadhana{% endblock %}

{% block content %}
<div class="container py-5">
    <h1 class="mb-4">Private Sector Jobs</h1>
    
    <!-- Search and Filter -->
    <div class="card mb-4">
        <div class="card-body">
            <form method="get" class="row g-3">
                <div class="col-md-5">
                    <input type="text" name="q" class="form-control" placeholder="Search by role or company..." value="{{ query }}">
                </div>
                <div class="col-md-4">
                    <input type="text" name="location" class="form-control" placeholder="Location" value="{{ location }}">
                </div>
                <div class="col-md-3">
                    <button type="submit" class="btn btn-primary-custom w-100">Search</button>
                </div>
            </form>
        </div>
    </div>
    
    <p class="text-muted">Found {{ total_jobs }} job{{ total_jobs|pluralize }}</p>
    
    <!-- Job Listings -->
    {% for job in page_obj %}
    <div class="card job-card mb-3">
        <div class="card-body">
            <div class="row">
                <div class="col-md-8">
                    <h5 class="card-title">{{ job.role }}</h5>
                    <p class="mb-1"><strong>{{ job.company_name }}</strong></p>
                    <p class="mb-1"><i class="bi bi-cash-stack"></i> {{ job.salary }}</p>
                    <p class="mb-1"><i class="bi bi-geo-alt"></i> {{ job.location }}</p>
                    <p class="mb-1"><i class="bi bi-mortarboard"></i> {{ job.qualification }}</p>
                    <p class="mb-1"><i class="bi bi-briefcase"></i> Experience: {{ job.experience }}</p>
                </div>
                <div class="col-md-4 text-end">
                    <a href="{{ job.apply_link }}" target="_blank" class="btn btn-accent-custom">Apply Now</a>
                </div>
            </div>
        </div>
    </div>
    {% empty %}
    <div class="alert alert-info">No jobs found.</div>
    {% endfor %}
    
    <!-- Pagination -->
    {% if page_obj.has_other_pages %}
    <nav>
        <ul class="pagination justify-content-center">
            {% if page_obj.has_previous %}
            <li class="page-item"><a class="page-link" href="?page={{ page_obj.previous_page_number }}&q={{ query }}&location={{ location }}">Previous</a></li>
            {% endif %}
            <li class="page-item active"><span class="page-link">{{ page_obj.number }}</span></li>
            {% if page_obj.has_next %}
            <li class="page-item"><a class="page-link" href="?page={{ page_obj.next_page_number }}&q={{ query }}&location={{ location }}">Next</a></li>
            {% endif %}
        </ul>
    </nav>
    {% endif %}
</div>
{% endblock %}
EOF

# Login Template
cat > users/templates/users/login.html << 'EOF'
{% extends 'base.html' %}
{% load crispy_forms_tags %}

{% block title %}Login - CareerSadhana{% endblock %}

{% block content %}
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow">
                <div class="card-header bg-primary-custom text-white text-center">
                    <h3><i class="bi bi-person-circle"></i> Login</h3>
                </div>
                <div class="card-body p-4">
                    <form method="post">
                        {% csrf_token %}
                        {% crispy form %}
                        <button type="submit" class="btn btn-primary-custom w-100">Login</button>
                    </form>
                    <hr>
                    <p class="text-center mb-0">
                        Don't have an account? <a href="{% url 'users:register' %}">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}
EOF

# Register Template
cat > users/templates/users/register.html << 'EOF'
{% extends 'base.html' %}
{% load crispy_forms_tags %}

{% block title %}Sign Up - CareerSadhana{% endblock %}

{% block content %}
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow">
                <div class="card-header bg-primary-custom text-white text-center">
                    <h3><i class="bi bi-person-plus"></i> Create Account</h3>
                </div>
                <div class="card-body p-4">
                    <form method="post">
                        {% csrf_token %}
                        {% crispy form %}
                        <button type="submit" class="btn btn-primary-custom w-100">Sign Up</button>
                    </form>
                    <hr>
                    <p class="text-center mb-0">
                        Already have an account? <a href="{% url 'users:login' %}">Login</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}
EOF

echo "✓ All templates created successfully!"
