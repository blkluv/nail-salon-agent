const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runCustomerMigration() {
  console.log('🚀 Running customer_business_relationships migration...\n');
  
  try {
    // Check if table already exists
    const { data: existsCheck, error: checkError } = await supabase
      .from('customer_business_relationships')
      .select('*')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ customer_business_relationships table already exists');
      return;
    }
    
    console.log('📋 Creating customer_business_relationships table...');
    
    // Create the table using raw SQL
    const createTableSQL = `
-- Create customer_business_relationships table
CREATE TABLE customer_business_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    first_visit_date DATE,
    last_visit_date DATE,
    total_visits INTEGER DEFAULT 0,
    is_preferred BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate relationships
    UNIQUE(customer_id, business_id)
);

-- Create indexes for performance
CREATE INDEX idx_cbr_customer_id ON customer_business_relationships(customer_id);
CREATE INDEX idx_cbr_business_id ON customer_business_relationships(business_id);
CREATE INDEX idx_cbr_is_preferred ON customer_business_relationships(is_preferred);

-- Enable RLS
ALTER TABLE customer_business_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role full access" ON customer_business_relationships
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anonymous can read relationships" ON customer_business_relationships
    FOR SELECT USING (TRUE);

-- Grant permissions
GRANT SELECT ON customer_business_relationships TO anon, authenticated;
GRANT ALL ON customer_business_relationships TO service_role;
`;

    // Execute via RPC
    const { error: execError } = await supabase.rpc('exec', {
      sql: createTableSQL
    });

    if (execError) {
      console.error('❌ Error creating table via RPC:', execError);
      
      // Try executing each statement separately
      console.log('🔄 Trying individual statements...');
      const statements = createTableSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (!stmt) continue;
        
        console.log(`📝 Executing statement ${i + 1}: ${stmt.substring(0, 50)}...`);
        
        const { error: stmtError } = await supabase.rpc('exec', { sql: stmt });
        
        if (stmtError) {
          console.warn(`⚠️  Statement ${i + 1} error:`, stmtError.message);
        } else {
          console.log(`✅ Statement ${i + 1} completed`);
        }
      }
    } else {
      console.log('✅ Table created successfully via RPC');
    }
    
    // Verify table creation
    const { data: verifyData, error: verifyError } = await supabase
      .from('customer_business_relationships')
      .select('*')
      .limit(1);
    
    if (verifyError) {
      console.error('❌ Table verification failed:', verifyError);
    } else {
      console.log('✅ Table verification successful');
    }
    
    console.log('\n🎉 Customer business relationships migration completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

runCustomerMigration();