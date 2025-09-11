/**
 * Create Demo Accounts for Maya Job System Testing
 * This script creates demo accounts for each Maya job type with different tiers
 */

const MAYA_DEMO_ACCOUNTS = [
  {
    // Nail Salon - Starter Tier Demo
    name: "Demo Bella's Nails",
    email: "demo-nail-starter@test.com",
    phone: "+15551234567",
    businessType: "Nail Salon",
    mayaJobId: "nail-salon-receptionist",
    tier: "starter",
    password: "DemoPass123!"
  },
  {
    // Hair Salon - Professional Tier Demo
    name: "Demo Style Studio",
    email: "demo-hair-pro@test.com", 
    phone: "+15551234568",
    businessType: "Hair Salon",
    mayaJobId: "hair-salon-coordinator",
    tier: "professional",
    password: "DemoPass123!"
  },
  {
    // Spa - Business Tier Demo
    name: "Demo Serenity Spa",
    email: "demo-spa-business@test.com",
    phone: "+15551234569",
    businessType: "Day Spa",
    mayaJobId: "spa-wellness-assistant",
    tier: "business",
    password: "DemoPass123!"
  },
  {
    // Massage Therapy - Professional Tier Demo
    name: "Demo Healing Hands",
    email: "demo-massage@test.com",
    phone: "+15551234570",
    businessType: "Massage Therapy",
    mayaJobId: "massage-therapy-scheduler",
    tier: "professional",
    password: "DemoPass123!"
  },
  {
    // Beauty Salon - Starter Tier Demo
    name: "Demo Glow Beauty",
    email: "demo-beauty@test.com",
    phone: "+15551234571",
    businessType: "Beauty Salon",
    mayaJobId: "beauty-salon-assistant",
    tier: "starter",
    password: "DemoPass123!"
  },
  {
    // Barbershop - Professional Tier Demo
    name: "Demo Classic Cuts",
    email: "demo-barber@test.com",
    phone: "+15551234572",
    businessType: "Barbershop",
    mayaJobId: "barbershop-coordinator",
    tier: "professional",
    password: "DemoPass123!"
  }
];

console.log('🎯 MAYA JOB SYSTEM - DEMO ACCOUNT SETUP');
console.log('========================================\n');

console.log('📋 Demo accounts ready to create:\n');

MAYA_DEMO_ACCOUNTS.forEach((account, index) => {
  console.log(`${index + 1}. ${account.name}`);
  console.log(`   - Maya Job: ${account.mayaJobId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
  console.log(`   - Tier: ${account.tier.toUpperCase()}`);
  console.log(`   - Email: ${account.email}`);
  console.log(`   - Password: ${account.password}`);
  console.log('');
});

console.log('🚀 TO CREATE THESE DEMO ACCOUNTS:\n');
console.log('Option 1: Use the Onboarding Flow (Recommended)');
console.log('------------------------------------------------');
console.log('1. Start the dashboard server:');
console.log('   cd dashboard && npm run dev\n');
console.log('2. Go to: http://localhost:3000/onboarding\n');
console.log('3. Select a Maya job and complete the flow');
console.log('   - Use "test" as payment method ID for demo\n');

console.log('Option 2: Direct Database Insert (Advanced)');
console.log('--------------------------------------------');
console.log('Run the provision-client API with test data for each account\n');

console.log('Option 3: Quick Test Access (No Setup)');
console.log('---------------------------------------');
console.log('1. Start the dashboard:');
console.log('   cd dashboard && npm run dev\n');
console.log('2. Open browser console and run:');
console.log('   localStorage.setItem("authenticated_business_id", "test-demo-001");');
console.log('   localStorage.setItem("authenticated_business_name", "Demo Bella\'s Nails");');
console.log('   localStorage.setItem("authenticated_user_email", "demo@test.com");');
console.log('   window.location.href = "/dashboard";\n');

console.log('📱 DEMO DASHBOARD FEATURES TO TEST:\n');
console.log('Based on Maya Job Selection:');
console.log('- Nail Salon: Manicure/pedicure booking, nail art scheduling');
console.log('- Hair Salon: Cut & color booking, stylist matching');
console.log('- Spa: 18+ treatments, package coordination');
console.log('- Massage: Therapeutic sessions, health screening');
console.log('- Beauty: Facials, waxing, consultations');
console.log('- Barbershop: Cuts, shaves, grooming services\n');

console.log('Based on Tier:');
console.log('- STARTER: Basic features, shared AI agent');
console.log('- PROFESSIONAL: Advanced features, shared AI agent');
console.log('- BUSINESS: Full features, CUSTOM Maya agent with branding\n');

console.log('💡 TIP: For fastest testing, use Option 3 above to bypass setup!');
console.log('This creates a mock session without needing database access.\n');

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MAYA_DEMO_ACCOUNTS;
}