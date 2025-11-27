#!/bin/bash

# Quick Deployment Script for Render
# Run this before pushing to GitHub

echo "🔍 Pre-Deployment Checklist"
echo "=============================="

# Check if required files exist
echo -n "✓ render.yaml exists... "
if [ -f "render.yaml" ]; then echo "YES"; else echo "MISSING!"; exit 1; fi

echo -n "✓ requirements-prod.txt exists... "
if [ -f "requirements-prod.txt" ]; then echo "YES"; else echo "MISSING!"; exit 1; fi

echo -n "✓ build.sh exists... "
if [ -f "build.sh" ]; then echo "YES"; else echo "MISSING!"; exit 1; fi

echo -n "✓ Making build.sh executable... "
chmod +x build.sh
echo "DONE"

# Check frontend
echo -n "✓ Frontend package.json exists... "
if [ -f "frontend/package.json" ]; then echo "YES"; else echo "MISSING!"; exit 1; fi

echo -n "✓ Frontend next.config.js exists... "
if [ -f "frontend/next.config.js" ]; then echo "YES"; else echo "MISSING!"; exit 1; fi

# Check if .gitignore exists
echo -n "✓ .gitignore exists... "
if [ -f ".gitignore" ]; then echo "YES"; else echo "MISSING! Creating..."; fi

# Model file check
echo ""
echo "📦 Model File Status"
echo "===================="
if [ -f "models/cats_dogs_model.h5" ]; then
    model_size=$(du -h models/cats_dogs_model.h5 | cut -f1)
    echo "✓ Model file found: $model_size"
    echo "⚠️  Note: Model file is too large for Git (use Git LFS or cloud storage)"
else
    echo "⚠️  Model file not found at models/cats_dogs_model.h5"
    echo "   You'll need to upload it separately after deployment"
fi

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Install Git LFS (optional, for model file):"
echo "   git lfs install"
echo "   git lfs track 'models/*.h5'"
echo ""
echo "2. Add and commit all files:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo ""
echo "3. Push to GitHub:"
echo "   git push origin master"
echo ""
echo "4. Deploy on Render:"
echo "   - Go to https://dashboard.render.com"
echo "   - Click 'New +' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Render will auto-detect render.yaml"
echo ""
echo "5. Upload model file (choose one method):"
echo "   a) Persistent Disk (recommended)"
echo "   b) Cloud Storage (S3, GCS)"
echo "   c) Git LFS"
echo ""
echo "6. Set environment variables:"
echo "   Backend: ENVIRONMENT=production, MODEL_PATH=..."
echo "   Frontend: NEXT_PUBLIC_API_URL=https://your-backend.onrender.com"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "✅ Pre-deployment check complete!"
