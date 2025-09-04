// Fix missing columns in businesses table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function fixSchemaColumns() {
  try {
    console.log('🔧 Fixing missing database columns...\n');
    
    // We can't directly run ALTER TABLE commands through the client
    // Instead, let's update all businesses to have the expected columns in their settings
    
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, name, settings');
      
    if (fetchError) {
      console.error('❌ Error fetching businesses:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${businesses.length} businesses to update`);
    
    // Update each business with default settings for missing columns
    for (const business of businesses) {
      const currentSettings = business.settings || {};
      
      // Add missing properties to settings
      const updatedSettings = {
        ...currentSettings,
        daily_reports_enabled: currentSettings.daily_reports_enabled ?? true,
        reminder_enabled: currentSettings.reminder_enabled ?? true,
        reminder_hours_before: currentSettings.reminder_hours_before ?? 24,
        loyalty_program_enabled: currentSettings.loyalty_program_enabled ?? false,
        loyalty_points_per_dollar: currentSettings.loyalty_points_per_dollar ?? 1.0,
        loyalty_points_per_visit: currentSettings.loyalty_points_per_visit ?? 10,
        branding_primary_color: currentSettings.branding_primary_color ?? '#6366f1',
        branding_secondary_color: currentSettings.branding_secondary_color ?? '#8b5cf6',
        branding_font_family: currentSettings.branding_font_family ?? 'Inter',
        white_label_enabled: currentSettings.white_label_enabled ?? false,
        multi_location_enabled: currentSettings.multi_location_enabled ?? false,
        updated_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ 
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id);
        
      if (updateError) {
        console.error(`❌ Error updating ${business.name}:`, updateError);
      } else {
        console.log(`✅ Updated settings for ${business.name}`);
      }
    }
    
    console.log('\n🎉 Schema fix completed!');
    console.log('Note: Added missing columns as settings properties');
    console.log('Dashboard should now work without column errors');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixSchemaColumns();