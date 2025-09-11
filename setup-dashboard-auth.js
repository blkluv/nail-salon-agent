/**
 * Setup Dashboard Authentication
 * This script sets up the proper authentication for testing the dashboard with real backend data
 */

console.log('===========================================');
console.log('VAPI NAIL SALON - DASHBOARD AUTHENTICATION SETUP');
console.log('===========================================\n');

// Valid business IDs from your database
const businesses = {
  bella: {
    id: 'bb18c6ca-7e97-449d-8245-e3c28a6b6971',
    name: "Bella's Nails Studio",
    email: 'bella@bellasnails.com'
  },
  default: {
    id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
    name: 'Beauty Business',
    email: 'admin@beautybusiness.com'
  }
};

console.log('Available businesses in your database:');
console.log('1. Bella\'s Nails Studio (ID: bb18c6ca-7e97-449d-8245-e3c28a6b6971)');
console.log('2. Default Business (ID: 8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad)\n');

console.log('To authenticate and view real data in the dashboard:\n');

console.log('OPTION 1: Use Bella\'s Nails Studio');
console.log('=========================================');
console.log('1. Open your browser and go to the dashboard');
console.log('2. Open Developer Console (F12)');
console.log('3. Paste this code in the console:\n');

console.log(`localStorage.setItem('authenticated_business_id', '${businesses.bella.id}');
localStorage.setItem('authenticated_business_name', '${businesses.bella.name}');
localStorage.setItem('authenticated_user_email', '${businesses.bella.email}');
location.reload();`);

console.log('\n\nOPTION 2: Use Default Business');
console.log('=========================================');
console.log('1. Open your browser and go to the dashboard');
console.log('2. Open Developer Console (F12)');
console.log('3. Paste this code in the console:\n');

console.log(`localStorage.setItem('authenticated_business_id', '${businesses.default.id}');
localStorage.setItem('authenticated_business_name', '${businesses.default.name}');
localStorage.setItem('authenticated_user_email', '${businesses.default.email}');
location.reload();`);

console.log('\n\nDASHBOARD URLS TO TEST:');
console.log('=========================================');
console.log('Local Development:');
console.log('- http://localhost:3000/dashboard');
console.log('- http://localhost:3000/dashboard/appointments');
console.log('- http://localhost:3000/dashboard/customers');
console.log('- http://localhost:3000/dashboard/services');
console.log('- http://localhost:3000/dashboard/staff\n');

console.log('Production (Vercel):');
console.log('- https://vapi-nail-salon-agent-mltnics51-dropflyai.vercel.app/dashboard');
console.log('- https://vapi-nail-salon-agent-mltnics51-dropflyai.vercel.app/dashboard/appointments');
console.log('- https://vapi-nail-salon-agent-mltnics51-dropflyai.vercel.app/dashboard/customers\n');

console.log('TROUBLESHOOTING:');
console.log('=========================================');
console.log('If you see UUID errors:');
console.log('- The dashboard is trying to use an invalid business ID');
console.log('- Make sure you\'ve set the localStorage values above');
console.log('- Clear any URL parameters like ?businessId=demo-nail-salon\n');

console.log('If you don\'t see any data:');
console.log('- Check that your Supabase database is running');
console.log('- Verify the business ID exists in your database');
console.log('- Check the browser console for any API errors\n');

console.log('To clear authentication and start fresh:');
console.log('=========================================');
console.log('Run this in browser console:\n');
console.log(`localStorage.clear();
location.reload();`);

console.log('\n===========================================');
console.log('Ready to test your dashboard with real backend data!');
console.log('===========================================');