const chalk = require('chalk');

console.log(chalk.cyan.bold(`
🌟 INTERACTIVE REGISTRATION WORKFLOW
===================================
Here's how the salon owner experience works:
`));

console.log(chalk.green.bold('STEP 1: WELCOME SCREEN'));
console.log(`
✨ Welcome to DropFly AI Salon Platform
Transform your nail salon with AI in 5 minutes!

What you get:
• AI voice receptionist (24/7)  
• Professional phone number
• Booking dashboard
• 14-day free trial
`);

console.log(chalk.green.bold('STEP 2: SALON INFORMATION'));
console.log(`
Interactive questions:
> What is your salon name? Sparkle Nails
> Business type? [✓] Nail Salon
> Phone number? (310) 555-1234
> Email address? hello@sparklenails.com
> Address? 123 Main St, Los Angeles, CA
`);

console.log(chalk.green.bold('STEP 3: OWNER DETAILS'));
console.log(`
> Your first name? Jennifer
> Your last name? Smith  
> Your email? jennifer@sparklenails.com
> Your phone? (310) 555-5678
`);

console.log(chalk.green.bold('STEP 4: PLAN SELECTION'));
console.log(`
Choose your plan:
[✓] STARTER - $49/month (1 location, basic features)
[ ] PROFESSIONAL - $99/month (multi-location)
[ ] ENTERPRISE - $199/month (white-label)

Confirm Starter plan? Yes
`);

console.log(chalk.green.bold('STEP 5: AUTOMATED SETUP'));
console.log(`
🚀 Creating your salon platform...
This takes 2-3 minutes.

✅ Creating business account...
✅ Provisioning phone number... (310) 555-0001  
✅ Creating AI assistant...
✅ Setting up booking tools...
✅ Finalizing setup...
`);

console.log(chalk.green.bold('STEP 6: SUCCESS SCREEN'));
console.log(`
🎉 CONGRATULATIONS! YOUR SALON IS LIVE!

✅ AI Receptionist: ACTIVE
📱 Your Phone Number: (310) 555-0001
🌐 Booking Website: https://sparkle-nails.dropfly.ai
📊 Dashboard: https://admin.dropfly.ai
⏰ Free Trial Until: February 7, 2025

📞 TEST IT RIGHT NOW!
Call (310) 555-0001 and say:
"I want a gel manicure tomorrow at 2 PM"
`);

console.log(chalk.green.bold('STEP 7: NEXT STEPS'));
console.log(`
What would you like to do next?
> [✓] Open Dashboard
  📊 Dashboard URL: https://admin.dropfly.ai
  Login with: jennifer@sparklenails.com

Other options:
• Update Google Business with new number
• Get booking widget code for website  
• Forward existing calls to AI number
• All done for now
`);

console.log(chalk.blue.bold('TECHNICAL DETAILS:'));
console.log(`
What actually happened behind the scenes:
1. PostgreSQL database record created
2. Twilio number provisioned via Vapi API
3. AI assistant created with custom prompts
4. 4 booking tools generated (check/book/view/cancel)
5. n8n workflow configured for routing
6. Welcome email sent with credentials

Time: 2-3 minutes
Cost per salon: ~$12-32/month
Revenue per salon: $49-199/month  
Profit margin: 300-600%
`);

console.log(chalk.green.bold(`
✨ WORKFLOW COMPLETE!
====================
The salon is now live and can take AI bookings immediately!
`));