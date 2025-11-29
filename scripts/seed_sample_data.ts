import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials (same as before)
const supabaseUrl = 'https://ulytebnddgcpoyoogigq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXRlYm5kZGdjcG95b29naWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjg2MjQsImV4cCI6MjA3OTY0NDYyNH0.AbmyjWPJaF3v46DVKeWdmHjua5Qn2jCUNu-NBE4O2BI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to pad numbers
const pad = (num: number) => String(num).padStart(3, '0');

// Helper to get random item
const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random date within last 3 months
const randomDate = () => {
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

// Mock Data Source
const firstNames = ['สมชาย', 'สมหญิง', 'วิชัย', 'สุดา', 'ประวิทย์', 'รัตนา', 'อำนาจ', 'พิม', 'ณเดชน์', 'ญาญ่า', 'มานี', 'มานะ', 'ปิติ', 'ชูใจ', 'สมศักดิ์', 'สมศรี', 'บุญมี', 'บุญมา', 'แก้ว', 'กล้า'];
const lastNames = ['ใจดี', 'รักชาติ', 'มีสุข', 'เจริญ', 'มั่นคง', 'รุ่งเรือง', 'สวัสดิ์', 'ดีงาม', 'สุขใจ', 'มีทรัพย์', 'ร่ำรวย', 'สมบูรณ์', 'แข็งแรง', 'สดใส', 'งดงาม', 'ยิ่งใหญ่', 'เกรียงไกร', 'ไพศาล', 'วิทยา', 'พัฒนา'];
const companies = ['บริษัท 168 จำกัด', 'หจก. แสงสว่าง', 'บจก. รุ่งโรจน์', 'ร้านค้าเจริญ', 'บ. มั่นคงทรัพย์', 'Siam Trading', 'Bangkok Inter', 'Thai Global', 'Future Tech', 'Smart Home'];
const provinces = ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'เชียงใหม่', 'ขอนแก่น', 'ภูเก็ต', 'ชลบุรี', 'ระยอง', 'นครราชสีมา'];
const teams = ['Team A', 'Team B', 'Team C', 'ช่างหนึ่ง', 'ช่างสอง', 'ช่างสาม'];

const generateData = async () => {
    console.log('Starting data seeding...');

    // 1. Clear existing data (Order matters due to FK)
    console.log('Clearing old data...');
    await supabase.from('Installation_Ship').delete().neq('IID', 'placeholder');
    await supabase.from('Sale').delete().neq('SID', 'placeholder');
    await supabase.from('Bill').delete().neq('BID', 'placeholder');
    await supabase.from('CShip').delete().neq('ShipName', 'placeholder'); // CShip has UUID PK
    await supabase.from('CTax').delete().neq('TaxName', 'placeholder');   // CTax has UUID PK
    await supabase.from('Customer').delete().neq('CID', 'placeholder');

    // 2. Generate Customers
    console.log('Generating Customers...');
    const customers = [];
    for (let i = 1; i <= 20; i++) {
        const fname = random(firstNames);
        const lname = random(lastNames);
        customers.push({
            CID: `C${pad(i)}`,
            TimeStamp: new Date().toISOString(),
            RecBy: 'Admin',
            DelDate: randomDate(),
            ContractName: `${fname} ${lname}`,
            ContractTel: `08${Math.floor(Math.random() * 100000000)}`,
            ContractCompany: Math.random() > 0.5 ? random(companies) : '',
            ContractCh: random(['Line', 'Facebook', 'Walk-in', 'Tel']),
            WelcomeBy: 'Admin',
            WelcomeDate: randomDate(),
            ContractPic: ''
        });
    }
    const { error: errCust } = await supabase.from('Customer').insert(customers);
    if (errCust) console.error('Error inserting Customers:', errCust);

    // 3. Generate Bills (Linked to Customers)
    console.log('Generating Bills...');
    const bills = [];
    for (let i = 1; i <= 20; i++) {
        bills.push({
            BID: `B${pad(i)}`,
            TimeStamp: new Date().toISOString(),
            RecBy: 'Sale01',
            DelDate: randomDate(),
            CID: `C${pad(i)}`, // 1:1 mapping for simplicity
            Seller: 'Sale01',
            Vat: random(['7%', '0%', 'Included'])
        });
    }
    const { error: errBill } = await supabase.from('Bill').insert(bills);
    if (errBill) console.error('Error inserting Bills:', errBill);

    // 4. Generate Sales (Linked to Bills)
    console.log('Generating Sales...');
    const sales = [];
    for (let i = 1; i <= 20; i++) {
        const price = Math.floor(Math.random() * 5000) + 1000;
        const qty = Math.floor(Math.random() * 5) + 1;
        sales.push({
            SID: `S${pad(i)}`,
            TimeStamp: new Date().toISOString(),
            RecBy: 'Sale01',
            DelDate: randomDate(),
            BID: `B${pad(i)}`, // 1:1 mapping
            PID: `P${pad(Math.floor(Math.random() * 50) + 1)}`,
            Dimention: '10x10x10',
            ItemColor: random(['Black', 'White', 'Gold', 'Silver']),
            BulbCollor: random(['Warm White', 'Cool White', 'Daylight']),
            Remote: random(['Yes', 'No']),
            Remark: '',
            Action: 'Sell',
            Discount: '0',
            Price: price.toString(),
            Qty: qty.toString(),
            ShipPrice: '100',
            InstallationPrice: '500',
            SumPrice: ((price * qty) + 600).toString(),
            Pay1Date: randomDate(),
            Pay1Price: ((price * qty) + 600).toString(),
            Pay1Ch: 'Transfer',
            CommissionID: 'COM001',
            Profit: '500'
        });
    }
    const { error: errSale } = await supabase.from('Sale').insert(sales);
    if (errSale) console.error('Error inserting Sales:', errSale);

    // 5. Generate CShip (Linked to Customers)
    console.log('Generating CShip...');
    const cships = [];
    for (let i = 1; i <= 20; i++) {
        const cust = customers[i - 1];
        cships.push({
            TimeStamp: new Date().toISOString(),
            RecBy: 'Admin',
            DelDate: randomDate(),
            CID: cust.CID,
            ShipName: cust.ContractName,
            ShipTel: cust.ContractTel,
            ShipAddress: `123/${i} หมู่ ${Math.floor(Math.random() * 10)} ถ.สุขุมวิท แขวงบางนา เขตบางนา ${random(provinces)} 10260`,
            ShipMap: 'https://maps.google.com/?q=13.123,100.123'
        });
    }
    const { error: errCShip } = await supabase.from('CShip').insert(cships);
    if (errCShip) console.error('Error inserting CShip:', errCShip);

    // 6. Generate CTax (Linked to Customers)
    console.log('Generating CTax...');
    const ctaxes = [];
    for (let i = 1; i <= 20; i++) {
        const cust = customers[i - 1];
        ctaxes.push({
            TimeStamp: new Date().toISOString(),
            RecBy: 'Admin',
            DelDate: randomDate(),
            CID: cust.CID,
            TaxName: cust.ContractCompany || cust.ContractName,
            TaxNumber: cust.ContractCompany ? `01055${Math.floor(Math.random() * 100000000)}` : '',
            TaxTel: cust.ContractTel,
            TaxAddress: `99/${i} อาคาร ABC ชั้น ${i} ${random(provinces)}`,
            TaxShip: 'Same as Address'
        });
    }
    const { error: errCTax } = await supabase.from('CTax').insert(ctaxes);
    if (errCTax) console.error('Error inserting CTax:', errCTax);

    // 7. Generate Installation_Ship (Linked to Sales)
    console.log('Generating Installation_Ship...');
    const installs = [];
    for (let i = 1; i <= 20; i++) {
        installs.push({
            IID: `I${pad(i)}`,
            TimeStamp: new Date().toISOString(),
            RecBy: 'Admin',
            DelDate: randomDate(),
            SID: `S${pad(i)}`, // 1:1 mapping
            InstallationTeam: random(teams),
            Status: random(['Pending', 'In Progress', 'Completed', 'Canceled']),
            PlanDate: randomDate(),
            CompleteDate: randomDate(),
            ShipTravelPrice: '300',
            InstallationPrice: '1500',
            InstallationPayDate: randomDate(),
            InstallationPaySlip: '',
            Remark: 'ติดตั้งระวังแตก',
            Score: '5',
            Sign: '',
            QCDefect: 'None'
        });
    }
    const { error: errInstall } = await supabase.from('Installation_Ship').insert(installs);
    if (errInstall) console.error('Error inserting Installation_Ship:', errInstall);

    console.log('Data seeding completed successfully!');
};

generateData();
