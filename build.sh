#!/bin/bash
# Build script for Vercel deployment

echo "Starting build process..."

# Navigate to client directory
cd client

# Remove existing dependencies
echo "Cleaning existing dependencies..."
rm -rf node_modules package-lock.json

# Install dependencies with explicit rollup support
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Explicitly install rollup native binaries
echo "Installing Rollup native binaries..."
npm install @rollup/rollup-linux-x64-gnu --legacy-peer-deps

# Rebuild native dependencies
echo "Rebuilding native dependencies..."
npm rebuild

# Run the build
echo "Running build..."
npm run build

echo "Build complete!"