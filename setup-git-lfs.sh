#!/bin/bash

# Git LFS Setup for Model File Upload
# This script helps you upload the trained model (85MB) to GitHub using Git LFS

echo "🔧 Setting up Git LFS for model files..."
echo "=========================================="

# Check if Git LFS is installed
if ! command -v git-lfs &> /dev/null; then
    echo "❌ Git LFS is not installed!"
    echo ""
    echo "Install Git LFS first:"
    echo "  Ubuntu/Debian: sudo apt-get install git-lfs"
    echo "  macOS: brew install git-lfs"
    echo "  Or download from: https://git-lfs.github.com/"
    exit 1
fi

echo "✅ Git LFS is installed"

# Initialize Git LFS
echo ""
echo "Initializing Git LFS..."
git lfs install

# Track model files
echo ""
echo "Configuring Git LFS to track model files..."
git lfs track "models/*.h5"
git lfs track "models/*.keras"

# Add .gitattributes
echo ""
echo "Adding .gitattributes..."
git add .gitattributes

echo ""
echo "✅ Git LFS setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add all files: git add ."
echo "2. Commit changes: git commit -m 'Add model files with Git LFS'"
echo "3. Push to GitHub: git push origin master"
echo ""
echo "⚠️  Note: First push may take time to upload 85MB model file"
echo "    Subsequent pushes will be much faster"
