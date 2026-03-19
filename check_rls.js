
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://tdfatnbinudeeqhqkvna.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZmF0bmJpbnVkZWVxaHFrdm5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk3Mjg2MCwiZXhwIjoyMDg1NTQ4ODYwfQ._HF6tNuHo8en6O6By2hFhfusgCX-P7vw5UowPIVmkzY';

async function checkRLS() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: policies, error } = await supabase.rpc('get_policies', { tablename: 'estudiantes' });
    // Since Rpc likely doesn't exist, let's just query from pg_policies if the service role key has enough privilege or use a known explorer method.
    // Actually, I'll just check if RLS is enabled.
    const { data: rlsStatus, error: rlsError } = await supabase.from('estudiantes').select('*').limit(1);
    console.log('RLS Check Done');
}

// Better way: use pg_catalog if allowed
async function checkPgPolicies() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from('pg_policies').select('*').eq('schemaname', 'public').eq('tablename', 'estudiantes');
    // Service role cannot query pg_policies usually (it's restricted).
    if (error) {
        console.log('Error querying pg_policies:', error.message);
    } else {
        console.log('Policies for estudiantes:', data);
    }
}

checkPgPolicies();
