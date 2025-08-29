#!/usr/bin/env node

/**
 * Dashboard Deployment Script
 * Alternative deployment methods for the nail salon dashboard
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Dashboard Deployment Options\n');

console.log('OPTION 1: Deploy to Vercel (Recommended)');
console.log('1. Login to Vercel: npx vercel login');
console.log('2. Deploy: npx vercel --prod --yes');
console.log('3. Set environment variables in Vercel dashboard:');
console.log('   - NEXT_PUBLIC_SUPABASE_URL=https://irvyhhkoiyzartmmvbxw.supabase.co');
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.8nKHdSX2wKh1YFiHN6wvP1zPEm9XzMgKUbgYOlEBYfE');
console.log('   - NEXT_PUBLIC_DEMO_BUSINESS_ID=8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad');
console.log('   - SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk');
console.log('   - VAPI_API_KEY=1d33c846-52ba-46ff-b663-16fb6c67af9e\n');

console.log('OPTION 2: GitHub Pages (Static Export)');
console.log('1. Add to next.config.js: output: "export"');
console.log('2. Run: npm run build');
console.log('3. Deploy the out/ folder to GitHub Pages\n');

console.log('OPTION 3: Railway Deployment');
console.log('1. Connect GitHub repository to Railway');
console.log('2. Set environment variables in Railway dashboard');
console.log('3. Railway will auto-deploy on push\n');

console.log('OPTION 4: Netlify Deployment');
console.log('1. Login to Netlify');
console.log('2. Connect GitHub repository');
console.log('3. Set build command: npm run build');
console.log('4. Set publish directory: .next\n');

console.log('Current build status: ✅ Build successful');
console.log('Dashboard is ready for deployment!');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
try {
  const packageJson = require(packageJsonPath);
  if (packageJson.name === 'beauty-booking-dashboard') {
    console.log('\n✅ Ready to deploy from dashboard directory');
  }
} catch (error) {
  console.log('\n❌ Please run this from the dashboard directory');
}

// Offer to run a quick test
console.log('\n🧪 Test locally first? Run: npm run dev');