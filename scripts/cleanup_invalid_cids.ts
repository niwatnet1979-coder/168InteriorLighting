import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ulytebnddgcpoyoogigq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXRlYm5kZGdjcG95b29naWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjg2MjQsImV4cCI6MjA3OTY0NDYyNH0.AbmyjWPJaF3v46DVKeWdmHjua5Qn2jCUNu-NBE4O2BI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanupInvalidCIDs() {
    console.log('🔍 Checking for invalid CID formats...');

    try {
        // Fetch all customers
        const { data: customers, error: fetchError } = await supabase
            .from('Customer')
            .select('CID');

        if (fetchError) throw fetchError;

        if (!customers || customers.length === 0) {
            console.log('No customers found.');
            return;
        }

        console.log(`Found ${customers.length} total customers.`);

        // Separate valid and invalid CIDs
        const validCIDs: string[] = [];
        const invalidCIDs: string[] = [];

        // Valid format: C + 12 digits (YYMMDDHHMMSS)
        const validPattern = /^C\d{12}$/;

        customers.forEach(customer => {
            if (validPattern.test(customer.CID)) {
                validCIDs.push(customer.CID);
            } else {
                invalidCIDs.push(customer.CID);
            }
        });

        console.log(`✅ Valid CIDs (C + 12 digits): ${validCIDs.length}`);
        console.log(`❌ Invalid CIDs (old format): ${invalidCIDs.length}`);

        if (invalidCIDs.length === 0) {
            console.log('🎉 All CIDs are already in the correct format!');
            return;
        }

        console.log('\n📋 Invalid CIDs to be deleted:');
        invalidCIDs.forEach(cid => console.log(`  - ${cid}`));

        // Delete related records first (CShip and CTax)
        console.log('\n🗑️  Deleting related CShip records...');
        const { error: shipDeleteError } = await supabase
            .from('CShip')
            .delete()
            .in('CID', invalidCIDs);

        if (shipDeleteError) throw shipDeleteError;
        console.log('✅ CShip records deleted.');

        console.log('🗑️  Deleting related CTax records...');
        const { error: taxDeleteError } = await supabase
            .from('CTax')
            .delete()
            .in('CID', invalidCIDs);

        if (taxDeleteError) throw taxDeleteError;
        console.log('✅ CTax records deleted.');

        // Delete invalid customers
        console.log('🗑️  Deleting invalid Customer records...');
        const { error: customerDeleteError } = await supabase
            .from('Customer')
            .delete()
            .in('CID', invalidCIDs);

        if (customerDeleteError) throw customerDeleteError;
        console.log('✅ Invalid Customer records deleted.');

        console.log(`\n🎉 Cleanup complete! Deleted ${invalidCIDs.length} invalid customers.`);
        console.log(`📊 Remaining valid customers: ${validCIDs.length}`);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    }
}

cleanupInvalidCIDs();
