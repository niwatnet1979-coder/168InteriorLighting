import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ulytebnddgcpoyoogigq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXRlYm5kZGdjcG95b29naWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjg2MjQsImV4cCI6MjA3OTY0NDYyNH0.AbmyjWPJaF3v46DVKeWdmHjua5Qn2jCUNu-NBE4O2BI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateRecByToValidEID() {
    console.log('🔍 Fetching valid EIDs from Team table...');

    try {
        // Get all valid EIDs from Team table
        const { data: teams, error: teamError } = await supabase
            .from('Team')
            .select('EID, NickName')
            .order('EID');

        if (teamError) throw teamError;

        if (!teams || teams.length === 0) {
            console.log('❌ No teams found in Team table!');
            return;
        }

        console.log(`✅ Found ${teams.length} team members.`);
        console.log('Available EIDs:');
        teams.forEach(team => console.log(`  - ${team.EID} (${team.NickName})`));

        // Use the first EID as default (usually EID0001)
        const defaultEID = teams[0].EID;
        console.log(`\n📌 Using ${defaultEID} (${teams[0].NickName}) as default RecBy value.`);

        // Update Customer table
        console.log('\n📝 Updating Customer table...');
        const { data: customers } = await supabase
            .from('Customer')
            .select('CID, RecBy');

        const invalidCustomers = customers?.filter(c => c.RecBy === 'Admin' || !c.RecBy || !c.RecBy.startsWith('EID')) || [];

        if (invalidCustomers.length > 0) {
            console.log(`Found ${invalidCustomers.length} customers with invalid RecBy.`);

            for (const customer of invalidCustomers) {
                const { error } = await supabase
                    .from('Customer')
                    .update({ RecBy: defaultEID })
                    .eq('CID', customer.CID);

                if (error) {
                    console.error(`Error updating ${customer.CID}:`, error);
                } else {
                    console.log(`  ✓ Updated ${customer.CID}: "${customer.RecBy}" → "${defaultEID}"`);
                }
            }
        } else {
            console.log('All customers already have valid RecBy.');
        }

        // Update CShip table
        console.log('\n📝 Updating CShip table...');
        const { data: ships } = await supabase
            .from('CShip')
            .select('CShipID, RecBy');

        const invalidShips = ships?.filter(s => s.RecBy === 'Admin' || !s.RecBy || !s.RecBy.startsWith('EID')) || [];

        if (invalidShips.length > 0) {
            console.log(`Found ${invalidShips.length} shipping addresses with invalid RecBy.`);

            for (const ship of invalidShips) {
                const { error } = await supabase
                    .from('CShip')
                    .update({ RecBy: defaultEID })
                    .eq('CShipID', ship.CShipID);

                if (error) {
                    console.error(`Error updating ${ship.CShipID}:`, error);
                } else {
                    console.log(`  ✓ Updated CShip ${ship.CShipID}`);
                }
            }
        } else {
            console.log('All shipping addresses already have valid RecBy.');
        }

        // Update CTax table
        console.log('\n📝 Updating CTax table...');
        const { data: taxes } = await supabase
            .from('CTax')
            .select('CTaxID, RecBy');

        const invalidTaxes = taxes?.filter(t => t.RecBy === 'Admin' || !t.RecBy || !t.RecBy.startsWith('EID')) || [];

        if (invalidTaxes.length > 0) {
            console.log(`Found ${invalidTaxes.length} tax records with invalid RecBy.`);

            for (const tax of invalidTaxes) {
                const { error } = await supabase
                    .from('CTax')
                    .update({ RecBy: defaultEID })
                    .eq('CTaxID', tax.CTaxID);

                if (error) {
                    console.error(`Error updating ${tax.CTaxID}:`, error);
                } else {
                    console.log(`  ✓ Updated CTax ${tax.CTaxID}`);
                }
            }
        } else {
            console.log('All tax records already have valid RecBy.');
        }

        console.log('\n🎉 RecBy update complete!');
        console.log(`All "Admin" values have been replaced with "${defaultEID}".`);

    } catch (error) {
        console.error('❌ Error during update:', error);
        throw error;
    }
}

updateRecByToValidEID();
