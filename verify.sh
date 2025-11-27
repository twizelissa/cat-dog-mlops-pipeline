#!/bin/bash

# Project Verification Script
# This script checks if all components are properly set up

echo "========================================="
echo "MLOps Project Verification"
echo "========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check file existence
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} Missing: $1"
        ((CHECKS_FAILED++))
    fi
}

# Function to check directory existence
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} Missing: $1"
        ((CHECKS_FAILED++))
    fi
}

echo "1. Checking Core Files..."
check_file "README.md"
check_file "requirements.txt"
check_file "setup.sh"
check_file "Dockerfile"
check_file "docker-compose.yml"
check_file "locustfile.py"
echo ""

echo "2. Checking Source Code..."
check_dir "src"
check_file "src/preprocessing.py"
check_file "src/model.py"
check_file "src/prediction.py"
echo ""

echo "3. Checking Notebook..."
check_dir "notebook"
check_file "notebook/cats_vs_dogs_classification.ipynb"
echo ""

echo "4. Checking API..."
check_dir "app"
check_file "app/main.py"
echo ""

echo "5. Checking Next.js Frontend..."
check_dir "frontend"
check_file "frontend/package.json"
check_file "frontend/next.config.js"
check_file "frontend/tsconfig.json"
check_file "frontend/tailwind.config.js"
check_dir "frontend/pages"
check_file "frontend/pages/index.tsx"
check_file "frontend/pages/predict.tsx"
check_file "frontend/pages/retrain.tsx"
check_file "frontend/pages/_app.tsx"
check_file "frontend/pages/_document.tsx"
check_dir "frontend/styles"
check_file "frontend/styles/globals.css"
echo ""

echo "6. Checking Data Structure..."
check_dir "data"
check_dir "data/train"
check_dir "data/train/cats"
check_dir "data/train/dogs"
check_dir "data/test"
check_dir "data/test/cats"
check_dir "data/test/dogs"
echo ""

echo "7. Checking Models Directory..."
check_dir "models"
echo ""

echo "8. Checking Dataset..."
cat_count=$(find data/train/cats -type f -name "*.jpg" 2>/dev/null | wc -l)
dog_count=$(find data/train/dogs -type f -name "*.jpg" 2>/dev/null | wc -l)
if [ "$cat_count" -gt 0 ] && [ "$dog_count" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Training data found: $cat_count cats, $dog_count dogs"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} Training data missing or incomplete"
    echo -e "${YELLOW}  Run: cp -r archive/training_set/training_set/* data/train/${NC}"
    ((CHECKS_FAILED++))
fi
echo ""

echo "9. Checking Python Environment..."
if [ -d "venv" ]; then
    echo -e "${GREEN}✓${NC} Virtual environment exists"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Virtual environment not found"
    echo -e "${YELLOW}  Run: python3 -m venv venv${NC}"
    ((CHECKS_FAILED++))
fi
echo ""

echo "10. Checking Node Modules..."
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Node modules installed"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Node modules not installed"
    echo -e "${YELLOW}  Run: cd frontend && npm install${NC}"
    ((CHECKS_FAILED++))
fi
echo ""

echo "11. Checking Trained Model..."
if [ -f "models/cats_dogs_model.h5" ]; then
    echo -e "${GREEN}✓${NC} Model found: models/cats_dogs_model.h5"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Model not trained yet"
    echo -e "${YELLOW}  Run the Jupyter notebook to train the model${NC}"
    ((CHECKS_FAILED++))
fi
echo ""

echo "========================================="
echo "Verification Summary"
echo "========================================="
echo -e "Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks Failed: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Your project is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Train the model (if not done): jupyter notebook"
    echo "2. Start backend: python app/main.py"
    echo "3. Start frontend: cd frontend && npm run dev"
    echo "4. Access UI: http://localhost:3000"
else
    echo -e "${YELLOW}⚠ Some checks failed. Please fix the issues above.${NC}"
fi

echo ""
echo "========================================="
