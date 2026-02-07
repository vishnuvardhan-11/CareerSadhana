#!/bin/bash
# Quick Start Script for CareerSadhana Local Development

set -e

echo "===================================="
echo "CareerSadhana Quick Start"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python version
echo -e "${YELLOW}Checking Python version...${NC}"
python3 --version

# Create virtual environment
echo -e "${YELLOW}Creating virtual environment...${NC}"
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Setup environment file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠ Please edit .env file with your actual values!${NC}"
fi

# Generate secret key
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
sed -i "s/your-secret-key-here-generate-with-django/$SECRET_KEY/" .env

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "===================================="
echo "Next Steps:"
echo "===================================="
echo "1. Setup MySQL database:"
echo "   mysql -u root -p < manual_create_db.sql"
echo ""
echo "2. Edit .env file with your database credentials"
echo ""
echo "3. Run migrations:"
echo "   source venv/bin/activate"
echo "   python manage.py migrate"
echo ""
echo "4. Create superuser:"
echo "   python manage.py createsuperuser"
echo ""
echo "5. Run development server:"
echo "   python manage.py runserver"
echo ""
echo "6. Visit http://localhost:8000"
echo "===================================="
