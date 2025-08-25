#!/usr/bin/env node

const chalk = require('chalk');

async function showWorkflowDemo() {
    console.log(chalk.cyan.bold(`
🌟 INTERACTIVE REGISTRATION WORKFLOW DEMO
=========================================
This simulates the complete onboarding experience!
`));

    // Simulate delays for realistic feel
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Step 1: Welcome
    console.log(chalk.green.bold('STEP 1: WELCOME SCREEN'));
    console.log(chalk.white(`
The salon owner sees:
• Professional welcome message
• Clear value proposition
• 14-day free trial offer
• "Get Started" button
`));
    await delay(2000);

    // Step 2: Salon Info
    console.log(chalk.green.bold('\nSTEP 2: SALON INFORMATION'));
    console.log(chalk.yellow('Owner enters:'));
    console.log('  Salon name: Sparkle Nails & Spa');
    console.log('  Business type: [✓] Nail Salon');
    console.log('  Phone: (310) 555-1234');
    console.log('  Email: hello@sparklenails.com');
    console.log('  Address: 123 Main St, Los Angeles, CA 90210');
    console.log('  Timezone: [✓] Pacific Time');
    await delay(2000);

    // Step 3: Owner Info
    console.log(chalk.green.bold('\nSTEP 3: OWNER INFORMATION'));
    console.log(chalk.yellow('Owner provides:'));
    console.log('  First name: Jennifer');
    console.log('  Last name: Smith');
    console.log('  Email: jennifer@sparklenails.com');
    console.log('  Phone: (310) 555-5678');
    await delay(2000);

    // Step 4: Plan Selection
    console.log(chalk.green.bold('\nSTEP 4: PLAN SELECTION'));
    console.log(chalk.cyan('Available plans:'));
    console.log(chalk.green('  [✓] STARTER - $49/month'));
    console.log('      • 1 location'));
    console.log('      • AI voice booking'));
    console.log('      • Basic dashboard\n');
    console.log(chalk.blue('  [ ] PROFESSIONAL - $99/month'));
    console.log('      • Multi-location'));
    console.log('      • Advanced analytics\n');
    console.log(chalk.magenta('  [ ] ENTERPRISE - $199/month'));
    console.log('      • White-label platform'));
    console.log('      • API access');
    await delay(2000);

    // Step 5: Automated Setup
    console.log(chalk.green.bold('\nSTEP 5: AUTOMATED SETUP (2-3 minutes)'));
    console.log(chalk.yellow('System performs:'));
    
    const steps = [
        '🔄 Creating business account in database...',
        '🔄 Provisioning Twilio phone number via Vapi...',
        '🔄 Creating AI assistant with custom prompts...',
        '🔄 Setting up 4 booking tools (check/book/view/cancel)...',
        '🔄 Configuring n8n workflow routing...',
        '🔄 Finalizing setup and sending welcome email...'
    ];

    for (const step of steps) {
        console.log(chalk.gray(step));
        await delay(800);
        console.log(chalk.green(step.replace('🔄', '✅')));
    }

    await delay(1000);

    // Success Screen
    console.log(chalk.green.bold(`
========================================
🎉 SUCCESS! SALON IS NOW LIVE!
========================================

WHAT THE OWNER RECEIVES:
`));

    console.log(chalk.cyan(`
✅ AI Receptionist: ACTIVE & READY
📱 Phone Number: (310) 555-0001
🌐 Booking Site: https://sparkle-nails.dropfly.ai
📊 Dashboard: https://admin.dropfly.ai
⏰ Trial Ends: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
`));

    console.log(chalk.yellow.bold('IMMEDIATE TEST:'));
    console.log(chalk.white(`
The owner can now:
1. Call (310) 555-0001
2. Say: "I'd like to book a gel manicure tomorrow at 2 PM"
3. The AI responds naturally and books the appointment!
`));

    await delay(2000);

    // Next Steps Menu
    console.log(chalk.green.bold('\nSTEP 6: NEXT STEPS MENU'));
    console.log(chalk.white('Owner chooses what to do next:'));
    console.log(`
  • 📊 Open Dashboard → Manage staff, services, hours
  • 📱 Update Google → Add new phone to Google Business
  • 🔗 Get Widget Code → Embed booking on website
  • 📞 Forward Calls → Route existing number to AI
  • ✅ All Done → Start using the system!
`);

    await delay(1500);

    // Technical Details
    console.log(chalk.blue.bold('\n📋 TECHNICAL DETAILS (What Actually Happened):'));
    console.log(chalk.gray(`
Behind the scenes, the system:
1. Created PostgreSQL database record with unique webhook token
2. Provisioned Twilio number through Vapi API ($1.15/month)
3. Created Vapi assistant with business-specific prompts
4. Generated 4 function tools with proper webhook URLs
5. Deployed n8n workflow with dynamic routing
6. Sent credentials and welcome package

Total Time: ~2-3 minutes
Total Cost: ~$12-32/month per salon
Your Price: $49-199/month
Profit Margin: 300-600%
`));

    console.log(chalk.green.bold(`
✨ END OF WORKFLOW DEMO
======================
This entire process is automated and takes under 5 minutes!
`));
}

// Run demo
if (require.main === module) {
    showWorkflowDemo().catch(console.error);
}

module.exports = { showWorkflowDemo };