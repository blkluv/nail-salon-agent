/**
 * Production Deployment Script for Railway
 * Deploys the production-ready webhook server
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing production deployment...');

// 1. Replace the current webhook-server.js with production version
const productionWebhook = fs.readFileSync('production-webhook-server.js', 'utf8');
const backupPath = `webhook-server.backup.${Date.now()}.js`;

// Backup current version
if (fs.existsSync('webhook-server.js')) {
    fs.writeFileSync(backupPath, fs.readFileSync('webhook-server.js', 'utf8'));
    console.log(`💾 Backed up current webhook to: ${backupPath}`);
}

// Deploy production version
fs.writeFileSync('webhook-server.js', productionWebhook);
console.log('✅ Production webhook deployed to webhook-server.js');

// 2. Update package.json for production
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts = {
    ...packageJson.scripts,
    "start": "node webhook-server.js",
    "production": "NODE_ENV=production node webhook-server.js"
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json for production');

console.log(`
🎉 PRODUCTION DEPLOYMENT READY!

📋 Manual Steps:
1. Commit and push the updated webhook-server.js to Railway
2. Railway will automatically deploy the new version
3. Test with: https://web-production-60875.up.railway.app/health

🔧 Production Features:
✅ Business Context Injection
✅ Multi-Tenant Support  
✅ Enhanced Error Handling
✅ Production Logging
✅ Comprehensive Input Validation
✅ Graceful Failure Recovery

📞 Your Vapi webhook URL remains:
https://web-production-60875.up.railway.app/webhook/vapi

🎯 Next: Call (424) 351-9304 to test the production booking!
`);

module.exports = { deployed: true };