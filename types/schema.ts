// Level 2: Database Schema as Code
// Define all data structures here for consistency

export type Sale = {
    SID: string; // Primary Key (S + YYMMDDHHMMSS)
    TimeStamp: string;
    RecBy: string;
    DelDate: string | null;
    BID: string | null; // Foreign Key -> Bill
    // Staff removed - use RecBy or Bill.Seller instead
    // CID removed - access via Bill.CID instead (Sale -> Bill -> Customer)
    PID: string; // Foreign Key -> Product
    Dimention: string | null;
    ItemColor: string | null;
    BulbCollor: string | null;
    Remote: string | null;
    Remark: string | null;
    Action: string;
    Discount: number;
    Price: number;
    Qty: number;
    ShipPrice: number;
    InstallationPrice: number;
    SumPrice: number;
    // Payment Info
    Pay1Date: string | null;
    Pay1Price: number;
    Pay1Ch: string | null;
    TAX1ShipDate: string | null;
    Pay2Date: string | null;
    Pay2Price: number;
    Pay2Ch: string | null;
    TAX2ShipDate: string | null;
    CommissionID: string | null;
    Profit: number;
};

export type QC = {
    SN: string; // Primary Key
    TimeStamp: string;
    RecBy: string;
    DelDate: string | null;
    QCDATE: string;
    Staff: string;
    ShopLabel: string;
    QCPass: string;
    YDLabel: string;
    ProductType: string;
    BodyColor: string;
    BulbType: string;
    BulbColor: string;
    Dimention: string;
    QCRemark: string;
    QCQty: number;
    // Images
    PicLabel1: string | null;
    PicLabel2: string | null;
    PicManual1: string | null;
    PicManual2: string | null;
    PicQC1: string | null;
    PicQC2: string | null;
    PicQC3: string | null;
    PicQC4: string | null;
    PicQC5: string | null;
    PicQC6: string | null;
    PicQC7: string | null;
    PicQC8: string | null;
    PicQC9: string | null;
    PicQC10: string | null;
    PicDriver: string | null;
    PicRemote: string | null;
    ShipID: string | null;
};

export type Product = {
    PID: string; // Primary Key
    TimeStamp: string;
    RecBy: string;
    DelDate: string | null;
    PIDSub: string;
    PDType: string;
    PDName: string;
    PDDetrail: string; // Note: Schema uses PDDetrail (typo in DB)
    PDPrice: number;
    // Images
    PDPic1: string | null;
    PDPic2: string | null;
    PDPic3: string | null;
    PDPic4: string | null;
    PDPic5: string | null;
    PDPic6: string | null;
    PDPic7: string | null;
    PDPic8: string | null;
    PDPic9: string | null;
    PDPic10: string | null;
};

export type Customer = {
    CID: string; // Primary Key
    TimeStamp: string;
    RecBy: string;
    DelDate: string | null;
    ContractName: string; // Changed from Contract
    ContractTel: string;
    ContractCompany: string;
    ContractCh: string;
    // Social Media Contacts
    LineID?: string;
    Facebook?: string;
    Instagram?: string;
    Other?: string;
    // Customer Source
    ComeFrom?: string; // Facebook, LineOA, Google, Walkin, Friend, etc.
    WelcomeBy?: string;
    WelcomeDate?: string;
    ContractPic?: string;
    CIDImportBy?: string;
};

export type Team = {
    TimeStamp: string;
    RecBy: string;
    DelDate?: string | null;
    EID: string; // Primary Key - Employee ID
    TeamName?: string;
    TeamType?: string;
    UserType?: string;
    Email?: string;
    NickName?: string;
    FullName?: string;
    LastName?: string;
    CitizenID?: string;
    Bank?: string;
    ACNumber?: string;
    BirthDay?: string;
    StartDate?: string;
    Address?: string;
    Tel1?: string;
    Tel2?: string;
    Job?: string;
    Level?: string;
    WorkType?: string;
    PayType?: string;
    PayRate?: string;
    IncentiveRate?: string;
    Pic?: string;
    CitizenIDPic?: string;
    HouseRegPic?: string;
    EndDate?: string;
};

export type Bill = {
    BID: string;           // Primary Key
    TimeStamp: string;
    RecBy: string;
    DelDate: string | null; // วันที่ลบข้อมูล (Soft Delete)
    BillDate?: string;      // วันที่เปิดบิล (เพิ่มใหม่)
    CID: string;          // FK -> Customer
    Seller: string;
    SID: string | null;   // FK -> Sale (Nullable to allow creating Bill before Sale)
    Vat: string;
};

export type CTax = {
    CTaxID?: string; // Optional because it's auto-generated or handled by DB
    CID: string;
    TaxName: string;
    TaxNumber: string;
    TaxTel?: string;
    TaxAddress: string;
    TaxShip?: string;
    RecBy?: string;
    TimeStamp?: string;
};

export type CShip = {
    CShipID?: string;
    CID: string;
    ShipName: string;
    ShipTel: string;
    ShipAddress: string;
    ShipMap?: string;
    RecBy?: string;
    TimeStamp?: string;
};

// Helper to generate IDs
export const generateID = {
    customer: () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `C${year}${month}${day}${hours}${minutes}${seconds}`;
    },
    sale: () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `S${year}${month}${day}${hours}${minutes}${seconds}`;
    },
    bill: () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `BD${year}${month}${day}${hours}${minutes}${seconds}`;
    },
    team: (latestEID?: string) => {
        // Extract number from latest EID (e.g., "EID0011" -> 11)
        let nextNumber = 1;
        if (latestEID && latestEID.startsWith('EID')) {
            const currentNumber = parseInt(latestEID.replace('EID', ''), 10);
            if (!isNaN(currentNumber)) {
                nextNumber = currentNumber + 1;
            }
        }
        // Format as EID0001, EID0002, etc.
        return `EID${nextNumber.toString().padStart(4, '0')}`;
    },
    product: () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `PN${year}${month}${day}${hours}${minutes}${seconds}`;
    }
};
