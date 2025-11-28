import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Hardcoded for script usage
const supabaseUrl = 'https://ulytebnddgcpoyoogigq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXRlYm5kZGdjcG95b29naWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjg2MjQsImV4cCI6MjA3OTY0NDYyNH0.AbmyjWPJaF3v46DVKeWdmHjua5Qn2jCUNu-NBE4O2BI';

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const importCsv = async (filePath: string, tableName: string, mapFn?: (row: any) => any) => {
    console.log(`\nImporting ${tableName} from ${filePath}...`);
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        console.log(`Found ${records.length} records.`);

        const mappedRecords = mapFn ? records.map(mapFn) : records;

        // Deduplicate based on Primary Key if possible (simple check)
        // For Installation_Ship, PK is IID
        let uniqueRecords = mappedRecords;
        if (tableName === 'Installation_Ship') {
            const seen = new Set();
            uniqueRecords = mappedRecords.filter((row: any) => {
                const duplicate = seen.has(row.IID);
                seen.add(row.IID);
                return !duplicate;
            });
            if (uniqueRecords.length < mappedRecords.length) {
                console.log(`Removed ${mappedRecords.length - uniqueRecords.length} duplicate records.`);
            }
        }

        // Insert in batches of 100 to avoid payload limit
        const batchSize = 100;
        for (let i = 0; i < uniqueRecords.length; i += batchSize) {
            const batch = uniqueRecords.slice(i, i + batchSize);
            const { error } = await supabase.from(tableName).upsert(batch); // Use upsert to avoid duplicates

            if (error) {
                console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
            } else {
                console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} records)`);
            }
        }
        console.log(`Finished importing ${tableName}.`);

    } catch (error) {
        console.error(`Error reading or processing file ${filePath}:`, error);
    }
};

const run = async () => {
    const baseDir = process.cwd();

    // 1. Customer
    await importCsv(path.join(baseDir, '168APP - Customer.csv'), 'Customer');

    // 2. Bill
    await importCsv(path.join(baseDir, '168APP - Bill.csv'), 'Bill');

    // 3. Sale
    await importCsv(path.join(baseDir, '168APP - Sale.csv'), 'Sale', (row) => ({
        ...row,
        // Map CSV header 'BulbCollor' to DB column 'BulbCollor' (matches, but explicit is safe)
        BulbCollor: row.BulbCollor
    }));

    // 4. CShip
    await importCsv(path.join(baseDir, '168APP - CShip.csv'), 'CShip');

    // 5. CTax
    await importCsv(path.join(baseDir, '168APP - CTax.csv'), 'CTax');

    // 6. Installation_Ship
    await importCsv(path.join(baseDir, '168APP - Installation_Ship.csv'), 'Installation_Ship', (row) => {
        const newRow = { ...row };
        // Map CSV header 'Ship/TravelPrice' to DB column 'ShipTravelPrice'
        newRow.ShipTravelPrice = row['Ship/TravelPrice'];
        delete newRow['Ship/TravelPrice']; // Remove the old key
        return newRow;
    });

    console.log('\nAll imports completed!');
};

run();
