# 🚀 Quick Deployment Guide

## Your project is ready for Render deployment!

### ✅ Files Created:
1. `render.yaml` - Infrastructure as code config
2. `requirements-prod.txt` - Production dependencies
3. `build.sh` - Backend build script
4. `DEPLOYMENT.md` - Complete deployment guide
5. `deploy-check.sh` - Pre-deployment validation
6. `setup-git-lfs.sh` - Git LFS helper script
7. `.gitignore` - Git ignore rules

### 🎯 Quick Deploy (3 Options):

#### Option A: Git LFS (Recommended for GitHub)
```bash
# Install Git LFS if not installed
sudo apt-get install git-lfs  # Ubuntu/Debian
# OR
brew install git-lfs  # macOS

# Run setup script
./setup-git-lfs.sh

# Commit and push
git add .
git commit -m "Prepare for Render deployment with Git LFS"
git push origin master
```

#### Option B: Without Model File (Upload Later)
```bash
# Add to .gitignore to skip model file
echo "models/*.h5" >> .gitignore
echo "models/*.keras" >> .gitignore

# Commit and push
git add .
git commit -m "Prepare for Render deployment"
git push origin master

# Upload model after deployment via:
# - Render persistent disk
# - Cloud storage (S3, GCS)
```

#### Option C: Cloud Storage (Best for Production)
```bash
# Upload model to cloud first
# AWS S3 example:
# aws s3 cp models/cats_dogs_model.h5 s3://your-bucket/

# Update build.sh to download model
# Then commit and push
git add .
git commit -m "Prepare for Render deployment with cloud storage"
git push origin master
```

### 📋 Deployment Steps:

1. **Push to GitHub** (choose option above)

2. **Deploy on Render**:
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render auto-detects `render.yaml`
   - Click "Apply" to create services

3. **Configure Environment Variables**:
   
   **Backend Service:**
   - `ENVIRONMENT` = `production`
   - `MODEL_PATH` = `/opt/render/project/src/models/cats_dogs_model.h5`
   - `FRONTEND_URL` = `https://catdog-ml-frontend.onrender.com` (update after frontend deploys)
   
   **Frontend Service:**
   - `NEXT_PUBLIC_API_URL` = `https://catdog-ml-backend.onrender.com` (update after backend deploys)

4. **Upload Model** (if not using Git LFS):
   - Add persistent disk to backend service
   - Upload via SSH/SFTP or cloud storage

5. **Test Your Deployment**:
   - Backend: `https://catdog-ml-backend.onrender.com/health`
   - Frontend: `https://catdog-ml-frontend.onrender.com`

### 💰 Cost:
- **Free Tier**: Both services free (sleep after 15 min inactivity)
- **Paid**: $7/month per service (no sleep, faster)

### 📖 Full Documentation:
See `DEPLOYMENT.md` for complete step-by-step guide with troubleshooting.

### 🎥 For Your Assignment Demo:
1. Show live deployed URLs
2. Test predictions with cat/dog images
3. Test object detection with human photos
4. Navigate all pages (dashboard, predict, retrain)
5. Show backend API responses

---

**Need help?** Read `DEPLOYMENT.md` or check Render docs.
