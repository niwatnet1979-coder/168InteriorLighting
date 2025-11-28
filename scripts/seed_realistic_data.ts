
import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials as per previous usage
const SUPABASE_URL = 'https://ulytebnddgcpoyoogigq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXRlYm5kZGdjcG95b29naWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjg2MjQsImV4cCI6MjA3OTY0NDYyNH0.AbmyjWPJaF3v46DVKeWdmHjua5Qn2jCUNu-NBE4O2BI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const firstNames = ['สมชาย', 'วิชัย', 'สุชาติ', 'สมศักดิ์', 'กิตติ', 'มานะ', 'วีระ', 'ธนพล', 'จิรายุ', 'อภิชาติ', 'นภา', 'ดวงใจ', 'รัตนา', 'ศิริพร', 'วรรณา', 'สุดา', 'มณี', 'พรทิพย์', 'กานดา', 'วิไล'];
const lastNames = ['ใจดี', 'รักชาติ', 'มีสุข', 'เจริญพร', 'มั่นคง', 'สุขสันต์', 'รุ่งเรือง', 'ทรัพย์มาก', 'วงศ์สวัสดิ์', 'ทองแท้', 'ศรีสุข', 'บุญมี', 'แก้วตา', 'ยอดเยี่ยม', 'กล้าหาญ', 'เก่งกล้า', 'ปัญญาดี', 'มีชัย', 'ชนะศึก', 'รักไทย'];
const companies = ['สยามก่อสร้าง', 'ไทยรุ่งเรือง', 'เจริญโภคภัณฑ์', 'ซีพี ออลล์', 'ปตท.', 'เอสซีจี', 'เบทาโกร', 'ทรู คอร์ปอเรชั่น', 'เอไอเอส', 'ธนาคารกสิกรไทย', 'ธนาคารกรุงเทพ', 'ธนาคารไทยพาณิชย์', 'เซ็นทรัลพัฒนา', 'เดอะมอลล์ กรุ๊ป', 'บีทีเอส', 'ทางด่วนและรถไฟฟ้ากรุงเทพ', 'การบินไทย', 'ท่าอากาศยานไทย', 'โรงพยาบาลกรุงเทพ', 'โรงพยาบาลบำรุงราษฎร์'];
const districts = ['บางรัก', 'ปทุมวัน', 'สาทร', 'วัฒนา', 'คลองเตย', 'พญาไท', 'ดินแดง', 'ห้วยขวาง', 'จตุจักร', 'บางซื่อ', 'ลาดพร้าว', 'บางกะปิ', 'สวนหลวง', 'พระโขนง', 'บางนา', 'ประเวศ', 'มีนบุรี', 'หนองจอก', 'ลาดกระบัง', 'บางขุนเทียน'];

function getRandomItem(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateThaiPhoneNumber() {
    return `08${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
}

async function seed() {
    console.log('Starting realistic seed...');

    // 1. Clear existing data
    console.log('Clearing existing data...');
    const tables = ['Installation_Ship', 'Sale', 'Bill', 'CShip', 'CTax', 'Customer'];
    for (const table of tables) {
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
    console.log('Creating 20 realistic customers...');
    const customers = [];
    for (let i = 0; i < 20; i++) {
        const cid = `C${(i + 1).toString().padStart(3, '0')}`;
        const fname = firstNames[i];
        const lname = lastNames[i];
        const company = companies[i];

        customers.push({
            CID: cid,
            ContractName: `${fname} ${lname}`,
            ContractTel: generateThaiPhoneNumber(),
            ContractCompany: `${company} จำกัด`,
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
        let numShips = Math.floor(Math.random() * 4) + 1; // Default 1-4

        // Customer 1 has 50 addresses
        if (i === 0) numShips = 50;
        // Customer 2 has 10 addresses
        if (i === 1) numShips = 10;

        for (let j = 1; j <= numShips; j++) {
            const district = getRandomItem(districts);
            cships.push({
                CID: customer.CID,
                ShipName: j === 1 ? customer.ContractName : `${customer.ContractName} (สาขา ${j})`,
                ShipTel: customer.ContractTel,
                ShipAddress: `${Math.floor(Math.random() * 900) + 1} ซอย ${Math.floor(Math.random() * 50) + 1} ถนนสุขุมวิท แขวง${district} เขต${district} กรุงเทพฯ 10${Math.floor(Math.random() * 50) + 10}`,
                ShipMap: `https://maps.google.com/?q=13.${Math.floor(Math.random() * 5000) + 7000},100.${Math.floor(Math.random() * 5000) + 5000}`,
                RecBy: 'Admin',
                Timestamp: new Date().toISOString()
            });
        }
    }

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

        // Customer 1 has 10 tax records
        if (i === 0) numTaxes = 10;

        for (let j = 1; j <= numTaxes; j++) {
            const district = getRandomItem(districts);
            ctaxes.push({
                CID: customer.CID,
                TaxName: customer.ContractCompany,
                TaxNumber: `01055${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
                TaxTel: customer.ContractTel,
                TaxAddress: `${Math.floor(Math.random() * 900) + 1} อาคาร${customer.ContractCompany.split(' ')[0]} ชั้น ${Math.floor(Math.random() * 30) + 1} ถนนสีลม แขวง${district} เขต${district} กรุงเทพฯ 10500`,
                TaxShip: `ใช้ที่อยู่เดียวกับบริษัท`,
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

    console.log('Realistic seed completed successfully!');
}

seed();
