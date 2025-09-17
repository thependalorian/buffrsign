#!/bin/bash

# BuffrSign Vercel Deployment Script
# This script automates the deployment process to Vercel

set -e  # Exit on any error

echo "🚀 BuffrSign Vercel Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed${NC}"
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Check if logged in to Vercel
echo -e "${BLUE}🔐 Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo -e "${BLUE}Please login to Vercel:${NC}"
    vercel login
fi

# Run tests before deployment
echo -e "${BLUE}🧪 Running tests before deployment...${NC}"
npm test

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed! Deployment aborted.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All tests passed!${NC}"

# Build the project
echo -e "${BLUE}🔨 Building the project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Deployment aborted.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Check if project is linked to Vercel
echo -e "${BLUE}🔗 Checking Vercel project link...${NC}"
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}⚠️  Project not linked to Vercel${NC}"
    echo -e "${BLUE}Linking project to Vercel...${NC}"
    vercel link
fi

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
vercel --prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🎉 BuffrSign is now live on Vercel!${NC}"
    
    # Get the deployment URL
    DEPLOYMENT_URL=$(vercel ls --scope=buffr-inc | grep buffrsign | head -1 | awk '{print $2}')
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        echo -e "${BLUE}🌐 Deployment URL: https://${DEPLOYMENT_URL}${NC}"
    fi
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

echo "======================================"
echo -e "${GREEN}🎊 Deployment Complete!${NC}"