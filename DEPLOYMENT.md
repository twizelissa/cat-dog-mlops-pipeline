# Deployment Guide - Render

This guide will help you deploy the Cats vs Dogs ML classifier to Render with both backend API and frontend UI.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Trained Model**: Your `cats_dogs_model.h5` file (85MB)

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Commit all files** to your GitHub repository:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin master
```

2. **Verify these files exist**:
   - `render.yaml` - Infrastructure configuration
   - `requirements-prod.txt` - Production dependencies
   - `build.sh` - Backend build script
   - `frontend/package.json` - Frontend dependencies
   - `frontend/next.config.js` - Next.js configuration

### Step 2: Deploy to Render

#### Option A: One-Click Deploy (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create both services

#### Option B: Manual Deploy

**Backend Service:**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `catdog-ml-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or paid for better performance)

**Frontend Service:**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `catdog-ml-frontend`
   - **Runtime**: `Node`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid)

### Step 3: Upload Trained Model

**Important:** The model file (85MB) is too large for Git. Upload it to Render:

#### Method 1: Environment Variable (Small Models)
If your model is compressed and small enough:
```bash
# Not recommended for 85MB file
```

#### Method 2: Persistent Disk (Recommended)
1. In Render Dashboard, go to your backend service
2. Click **"Disks"** → **"Add Disk"**
3. Configure:
   - **Name**: `model-storage`
   - **Mount Path**: `/opt/render/project/src/models`
   - **Size**: 1GB
4. Upload `cats_dogs_model.h5` via SFTP or SSH

#### Method 3: Cloud Storage (Best for Production)
1. Upload model to AWS S3, Google Cloud Storage, or similar
2. Modify `build.sh` to download model during build:
```bash
# Add to build.sh
wget -O models/cats_dogs_model.h5 "YOUR_MODEL_URL"
```

#### Method 4: GitHub LFS (Alternative)
```bash
# Install Git LFS
git lfs install
git lfs track "models/*.h5"
git add .gitattributes
git add models/cats_dogs_model.h5
git commit -m "Add model with LFS"
git push
```

### Step 4: Configure Environment Variables

**Backend Service:**
1. Go to backend service → **"Environment"**
2. Add variables:
   - `PYTHON_VERSION` = `3.12.0`
   - `MODEL_PATH` = `/opt/render/project/src/models/cats_dogs_model.h5`
   - `ENVIRONMENT` = `production`

**Frontend Service:**
1. Go to frontend service → **"Environment"**
2. Add variables:
   - `NODE_VERSION` = `18.17.0`
   - `NEXT_PUBLIC_API_URL` = `https://catdog-ml-backend.onrender.com` (your backend URL)

### Step 5: Deploy and Verify

1. **Trigger Deploy**: Click "Manual Deploy" → "Deploy latest commit"
2. **Monitor Logs**: Watch build and deployment logs for errors
3. **Check Health**:
   - Backend: `https://catdog-ml-backend.onrender.com/health`
   - Frontend: `https://catdog-ml-frontend.onrender.com`

## Troubleshooting

### Backend Issues

**Problem: Model file not found**
```
Solution: Verify model uploaded to persistent disk or accessible URL
```

**Problem: Out of memory during build**
```
Solution: Upgrade to paid plan or reduce model size
```

**Problem: TensorFlow installation fails**
```
Solution: Check Python version is 3.12, verify requirements-prod.txt
```

### Frontend Issues

**Problem: API connection refused**
```
Solution: Update NEXT_PUBLIC_API_URL with correct backend URL
```

**Problem: Build fails**
```
Solution: Check Node version (18+), clear build cache, redeploy
```

## Expected Deployment Times

- **Backend**: 5-8 minutes (first deploy with TensorFlow installation)
- **Frontend**: 2-4 minutes (first deploy with npm install)
- **Subsequent deploys**: 1-3 minutes (cached dependencies)

## Cost Estimates

### Free Tier (Recommended for Testing)
- Both services free
- Services sleep after 15 minutes of inactivity
- 750 hours/month limit
- First request after sleep takes 30-60 seconds

### Paid Tier (Production Ready)
- **Starter ($7/month per service)**: 
  - No sleep
  - 512MB RAM
  - Good for light production use
  
- **Standard ($25/month per service)**:
  - 2GB RAM
  - Better for ML workloads

## Accessing Your Deployed App

After successful deployment:

1. **Backend API**: `https://catdog-ml-backend.onrender.com`
   - Health check: `/health`
   - Predict: `/api/predict`
   - Metrics: `/api/metrics`

2. **Frontend UI**: `https://catdog-ml-frontend.onrender.com`
   - Dashboard: `/`
   - Predict: `/predict`
   - Retrain: `/retrain`

## Security Best Practices

1. **Add CORS origins** in `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://catdog-ml-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. **Enable HTTPS only** (Render does this automatically)

3. **Set rate limiting** to prevent abuse

4. **Use environment variables** for sensitive data

## Post-Deployment Checklist

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] Image upload works on `/predict`
- [ ] Predictions return valid results
- [ ] Dashboard displays metrics
- [ ] Object detection filters non-cat/dog images
- [ ] Both services respond in <5 seconds
- [ ] CORS configured correctly
- [ ] Custom domain configured (optional)

## Demo for Assignment

For your 5-point camera demo:
1. Show the live deployed URLs
2. Upload cat/dog images → show correct predictions
3. Upload human/other images → show object detection filtering
4. Navigate through all pages (dashboard, predict, retrain)
5. Show backend API responses in browser DevTools

## Important Notes

1. **Free tier sleeps**: First request after 15 minutes takes ~30s to wake up
2. **Model size**: 85MB model requires persistent disk or cloud storage
3. **Build time**: TensorFlow takes 5-8 minutes to install on first deploy
4. **Memory**: Free tier has 512MB RAM - sufficient for this project
5. **Bandwidth**: Free tier includes 100GB/month bandwidth

## Continuous Deployment

Once connected to GitHub:
- Every push to `master` triggers automatic redeployment
- You can disable auto-deploy and deploy manually
- Use branches for testing before deploying to production

## Support

If deployment fails:
1. Check Render logs for specific errors
2. Verify all environment variables are set
3. Ensure model file is accessible
4. Check your code is pushed to GitHub
5. Contact Render support via dashboard

---

**Good luck with your deployment!**

For more details: [Render Documentation](https://render.com/docs)
