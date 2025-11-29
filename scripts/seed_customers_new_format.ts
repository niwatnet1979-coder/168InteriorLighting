import { createClient } from '@supabase/supabase-js';
import { generateID } from '../types/schema';

const SUPABASE_URL = 'https://ulytebnddgcpoyoogigq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXRlYm5kZGdjcG95b29naWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjg2MjQsImV4cCI6MjA3OTY0NDYyNH0.AbmyjWPJaF3v46DVKeWdmHjua5Qn2jCUNu-NBE4O2BI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Thai names and companies
const thaiFirstNames = ['สมชาย', 'วิชัย', 'สมศักดิ์', 'ประเสริฐ', 'สุรชัย', 'นิรันดร์', 'วิทยา', 'ธนา', 'ปรีชา', 'สมบัติ', 'สมหญิง', 'วิไล', 'สุดา', 'ประภา', 'นิภา', 'สุนิสา', 'วรรณา', 'ศิริ', 'มาลี', 'สุพรรณ'];
const thaiLastNames = ['ใจดี', 'รักชาติ', 'จำเริญ', 'สุขสม', 'ทองดี', 'เจริญสุข', 'มั่งมี', 'ศรีสุข', 'บุญมา', 'สวัสดี', 'วงศ์ใหญ่', 'ทรัพย์มี', 'ชัยชนะ', 'เพชรรัตน์', 'ทองคำ', 'เลิศล้ำ', 'ปราชญ์', 'วิริยะ', 'อนันต์', 'ศิริมงคล'];
const companies = ['บริษัท สยามก่อสร้าง จำกัด', 'บริษัท ไทยรุ่งเรือง จำกัด', 'บริษัท เอเชียพัฒนา จำกัด', 'บริษัท กรุงเทพอุตสาหกรรม จำกัด', 'บริษัท ไทยเจริญ จำกัด', 'บริษัท สยามพาณิชย์ จำกัด', 'บริษัท ไทยสมบูรณ์ จำกัด', 'บริษัท เอเชียเทรดดิ้ง จำกัด', 'บริษัท กรุงเทพการค้า จำกัด', 'บริษัท ไทยอินดัสทรี จำกัด'];
const streets = ['ถนนสุขุมวิท', 'ถนนพระราม 4', 'ถนนเพชรบุรี', 'ถนนรัชดาภิเษก', 'ถนนศรีนครินทร์', 'ถนนลาดพร้าว', 'ถนนพหลโยธิน', 'ถนนงามวงศ์วาน', 'ถนนบางนา-ตราด', 'ถนนรามอินทรา'];
const districts = ['แขวงบางรัก', 'แขวงปทุมวัน', 'แขวงคลองเตย', 'แขวงห้วยขวาง', 'แขวงบางกะปิ', 'แขวงจตุจักร', 'แขวงดินแดง', 'แขวงพระโขนง', 'แขวงลาดกระบัง', 'แขวงบางแค'];
const comeSources = ['Facebook', 'LineOA', 'Google', 'Walkin', 'Friend'];

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhoneNumber(): string {
    const prefixes = ['08', '09', '06'];
    const prefix = randomItem(prefixes);
    const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + number;
}

function generateAddress(): string {
    const houseNo = Math.floor(Math.random() * 999) + 1;
    const street = randomItem(streets);
    const district = randomItem(districts);
    return `${houseNo} ${street} ${district} กรุงเทพมหานคร 10110`;
}

async function seedRealisticCustomers() {
    console.log('Starting realistic customer seed with new CID format...');

    try {
        // Clear existing data
        console.log('Clearing existing data...');
        await supabase.from('CShip').delete().neq('CShipID', '');
        await supabase.from('CTax').delete().neq('CTaxID', '');
        await supabase.from('Customer').delete().neq('CID', '');
        console.log('Data cleared.');

        // Create 20 customers with new CID format
        console.log('Creating 20 realistic customers with CYYMMDDHHMMSS format...');
        const customers = [];

        for (let i = 0; i < 20; i++) {
            // Add delay to ensure unique timestamps (CID must be unique)
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 1100));
            }

            const cid = generateID.customer();
            const firstName = randomItem(thaiFirstNames);
            const lastName = randomItem(thaiLastNames);
            const company = randomItem(companies);

            const customer = {
                CID: cid,
                TimeStamp: new Date().toISOString(),
                RecBy: 'Admin',
                DelDate: null,
                ContractName: `${firstName} ${lastName}`,
                ContractTel: generatePhoneNumber(),
                ContractCompany: company,
                ContractCh: `@${firstName.toLowerCase()}`
            };

            customers.push(customer);
        }

        const { error: customerError } = await supabase.from('Customer').insert(customers);
        if (customerError) throw customerError;
        console.log(`Created ${customers.length} customers.`);

        // Create CShip records
        console.log('Creating CShip records...');
        const shipRecords = [];

        // First customer gets 50 shipping addresses
        for (let j = 0; j < 50; j++) {
            shipRecords.push({
                CID: customers[0].CID,
                ShipName: `${randomItem(thaiFirstNames)} ${randomItem(thaiLastNames)}`,
                ShipTel: generatePhoneNumber(),
                ShipAddress: generateAddress(),
                ShipMap: j % 5 === 0 ? `https://maps.google.com/?q=${Math.random()}` : null,
                RecBy: 'Admin',
                TimeStamp: new Date().toISOString()
            });
        }

        // Other customers get 1-4 shipping addresses
        for (let i = 1; i < customers.length; i++) {
            const numShips = Math.floor(Math.random() * 4) + 1;
            for (let j = 0; j < numShips; j++) {
                shipRecords.push({
                    CID: customers[i].CID,
                    ShipName: `${randomItem(thaiFirstNames)} ${randomItem(thaiLastNames)}`,
                    ShipTel: generatePhoneNumber(),
                    ShipAddress: generateAddress(),
                    ShipMap: j === 0 ? `https://maps.google.com/?q=${Math.random()}` : null,
                    RecBy: 'Admin',
                    TimeStamp: new Date().toISOString()
                });
            }
        }

        const { error: shipError } = await supabase.from('CShip').insert(shipRecords);
        if (shipError) throw shipError;
        console.log(`Created ${shipRecords.length} shipping addresses.`);

        // Create CTax records
        console.log('Creating CTax records...');
        const taxRecords = [];

        // First customer gets 10 tax records
        for (let j = 0; j < 10; j++) {
            const taxNumber = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}${Math.floor(Math.random() * 10)}`;
            taxRecords.push({
                CID: customers[0].CID,
                TaxName: randomItem(companies),
                TaxNumber: taxNumber,
                TaxTel: generatePhoneNumber(),
                TaxAddress: generateAddress(),
                TaxShip: j % 2 === 0 ? generateAddress() : null,
                RecBy: 'Admin',
                TimeStamp: new Date().toISOString()
            });
        }

        // Other customers get 1-3 tax records
        for (let i = 1; i < customers.length; i++) {
            const numTax = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numTax; j++) {
                const taxNumber = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}${Math.floor(Math.random() * 10)}`;
                taxRecords.push({
                    CID: customers[i].CID,
                    TaxName: randomItem(companies),
                    TaxNumber: taxNumber,
                    TaxTel: generatePhoneNumber(),
                    TaxAddress: generateAddress(),
                    TaxShip: j === 0 ? null : generateAddress(),
                    RecBy: 'Admin',
                    TimeStamp: new Date().toISOString()
                });
            }
        }

        const { error: taxError } = await supabase.from('CTax').insert(taxRecords);
        if (taxError) throw taxError;
        console.log(`Created ${taxRecords.length} tax records.`);

        console.log('✅ Realistic customer seed with new CID format completed successfully!');
        console.log(`Sample CID: ${customers[0].CID}`);
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
}

seedRealisticCustomers();
