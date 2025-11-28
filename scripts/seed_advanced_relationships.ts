
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ulytebnddgcpoyoogigq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXRlYm5kZGdjcG95b29naWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjg2MjQsImV4cCI6MjA3OTY0NDYyNH0.AbmyjWPJaF3v46DVKeWdmHjua5Qn2jCUNu-NBE4O2BI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
    console.log('Starting advanced seed...');

    // 1. Clear existing data
    console.log('Clearing existing data...');
    const tables = ['Installation_Ship', 'Sale', 'Bill', 'CShip', 'CTax', 'Customer'];
    for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('RecBy', 'placeholder_to_delete_all');
        // Note: .delete().neq(...) is a hack to delete all rows if no primary key is known or to bypass some checks, 
        // but standard way is .delete().gte('id', 0) or similar. 
        // For text PKs, we can use a condition that is always true or delete by listing IDs.
        // Let's try deleting everything by using a condition that matches all records.

        // Actually, for safety and simplicity in this script, let's fetch IDs and delete.
        // But that's slow.
        // Supabase delete without where clause is not allowed by default in client, but we can use a broad condition.
        // Let's use .not('Timestamp', 'is', null) if Timestamp exists, or just use a known column.

        // Better approach:
        if (table === 'Customer') {
            const { data } = await supabase.from(table).select('CID');
            if (data && data.length > 0) {
                const ids = data.map(r => r.CID);
                await supabase.from(table).delete().in('CID', ids);
            }
        } else if (table === 'CShip') {
            const { data } = await supabase.from(table).select('CShipID');
            if (data && data.length > 0) {
                const ids = data.map(r => r.CShipID);
                await supabase.from(table).delete().in('CShipID', ids);
            }
        } else if (table === 'CTax') {
            const { data } = await supabase.from(table).select('CTaxID');
            if (data && data.length > 0) {
                const ids = data.map(r => r.CTaxID);
                await supabase.from(table).delete().in('CTaxID', ids);
            }
        } else if (table === 'Bill') {
            const { data } = await supabase.from(table).select('BID');
            if (data && data.length > 0) {
                const ids = data.map(r => r.BID);
                await supabase.from(table).delete().in('BID', ids);
            }
        } else if (table === 'Sale') {
            const { data } = await supabase.from(table).select('SID');
            if (data && data.length > 0) {
                const ids = data.map(r => r.SID);
                await supabase.from(table).delete().in('SID', ids);
            }
        } else if (table === 'Installation_Ship') {
            const { data } = await supabase.from(table).select('IID');
            if (data && data.length > 0) {
                const ids = data.map(r => r.IID);
                await supabase.from(table).delete().in('IID', ids);
            }
        }
    }
    console.log('Data cleared.');

    // 2. Create 20 Customers
    console.log('Creating 20 customers...');
    const customers = [];
    for (let i = 1; i <= 20; i++) {
        const cid = `C${i.toString().padStart(3, '0')}`;
        customers.push({
            CID: cid,
            ContractName: `Customer ${i}`,
            ContractTel: `08${i.toString().padStart(8, '0')}`,
            ContractCompany: `Company ${i} Co., Ltd.`,
            RecBy: 'Admin',
            Timestamp: new Date().toISOString()
        });
    }

    const { error: custError } = await supabase.from('Customer').insert(customers);
    if (custError) {
        console.error('Error creating customers:', custError);
        return;
    }

    // 3. Create CShip (Shipping Addresses)
    console.log('Creating CShip records...');
    const cships = [];
    for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        let numShips = Math.floor(Math.random() * 5) + 1; // Default 1-5

        // Special case: Customer 1 has 50 addresses
        if (i === 0) numShips = 50;
        // Special case: Customer 2 has 2 addresses (just to be sure we have variety)
        if (i === 1) numShips = 2;

        for (let j = 1; j <= numShips; j++) {
            cships.push({
                CID: customer.CID,
                ShipName: `${customer.ContractName} - Branch ${j}`,
                ShipTel: customer.ContractTel,
                ShipAddress: `Address ${j} for ${customer.CID}, Some District, Some Province`,
                ShipMap: `https://maps.google.com/?q=13.7${j},100.5${j}`,
                RecBy: 'Admin',
                Timestamp: new Date().toISOString()
            });
        }
    }

    // Insert in chunks to avoid payload limit
    const chunkSize = 50;
    for (let i = 0; i < cships.length; i += chunkSize) {
        const chunk = cships.slice(i, i + chunkSize);
        const { error } = await supabase.from('CShip').insert(chunk);
        if (error) console.error('Error inserting CShip chunk:', error);
    }

    // 4. Create CTax (Tax Info)
    console.log('Creating CTax records...');
    const ctaxes = [];
    for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        let numTaxes = Math.floor(Math.random() * 3) + 1; // Default 1-3

        // Special case: Customer 1 has 10 tax records
        if (i === 0) numTaxes = 10;

        for (let j = 1; j <= numTaxes; j++) {
            ctaxes.push({
                CID: customer.CID,
                TaxName: `${customer.ContractCompany} (Head Office ${j})`,
                TaxNumber: `TAX${customer.CID}${j.toString().padStart(3, '0')}`,
                TaxTel: customer.ContractTel,
                TaxAddress: `Tax Address ${j} for ${customer.CID}`,
                TaxShip: `Invoice Address ${j} for ${customer.CID}`,
                RecBy: 'Admin',
                Timestamp: new Date().toISOString()
            });
        }
    }

    for (let i = 0; i < ctaxes.length; i += chunkSize) {
        const chunk = ctaxes.slice(i, i + chunkSize);
        const { error } = await supabase.from('CTax').insert(chunk);
        if (error) console.error('Error inserting CTax chunk:', error);
    }

    console.log('Seed completed successfully!');
    console.log(`Created ${customers.length} customers.`);
    console.log(`Created ${cships.length} shipping addresses.`);
    console.log(`Created ${ctaxes.length} tax records.`);
}

seed();
