-- ==========================================
-- 1. Create Customer Table
-- ==========================================
CREATE TABLE IF NOT EXISTS "Customer" (
    "CID" TEXT PRIMARY KEY,
    "Timestamp" TEXT,
    "RecBy" TEXT,
    "DelDate" TEXT,
    "ContractName" TEXT,
    "ContractTel" TEXT,
    "ContractCompany" TEXT,
    "ContractCh" TEXT,
    "WelcomeBy" TEXT,
    "WelcomeDate" TEXT,
    "ContractPic" TEXT
);
-- ==========================================
-- 2. Create Bill Table
-- ==========================================
CREATE TABLE IF NOT EXISTS "Bill" (
    "BID" TEXT PRIMARY KEY,
    "Timestamp" TEXT,
    "RecBy" TEXT,
    "DelDate" TEXT,
    "CID" TEXT REFERENCES "Customer"("CID"),
    "Seller" TEXT,
    "Vat" TEXT
);
-- ==========================================
-- 3. Create Sale Table
-- ==========================================
CREATE TABLE IF NOT EXISTS "Sale" (
    "SID" TEXT PRIMARY KEY,
    "Timestamp" TEXT,
    "RecBy" TEXT,
    "DelDate" TEXT,
    "BID" TEXT REFERENCES "Bill"("BID"),
    "PID" TEXT,
    -- Product ID (Assuming Product table exists or loose reference)
    "Dimention" TEXT,
    "ItemColor" TEXT,
    "BulbCollor" TEXT,
    -- Note: CSV header says 'BulbCollor' (typo in CSV?) keeping as is
    "Remote" TEXT,
    "Remark" TEXT,
    "Action" TEXT,
    "Discount" TEXT,
    "Price" TEXT,
    "Qty" TEXT,
    "ShipPrice" TEXT,
    "InstallationPrice" TEXT,
    "SumPrice" TEXT,
    "Pay1Date" TEXT,
    "Pay1Price" TEXT,
    "Pay1Ch" TEXT,
    "TAX1ShipDate" TEXT,
    "Pay2Date" TEXT,
    "Pay2Price" TEXT,
    "Pay2Ch" TEXT,
    "TAX2ShipDate" TEXT,
    "CommissionID" TEXT,
    "Profit" TEXT
);
-- ==========================================
-- 4. Create CShip Table (Customer Shipping Address)
-- ==========================================
CREATE TABLE IF NOT EXISTS "CShip" (
    "CShipID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- No ID in CSV, generating one
    "Timestamp" TEXT,
    "RecBy" TEXT,
    "DelDate" TEXT,
    "CID" TEXT REFERENCES "Customer"("CID"),
    "ShipName" TEXT,
    "ShipTel" TEXT,
    "ShipAddress" TEXT,
    "ShipMap" TEXT
);
-- ==========================================
-- 5. Create CTax Table (Customer Tax Info)
-- ==========================================
CREATE TABLE IF NOT EXISTS "CTax" (
    "CTaxID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- No ID in CSV, generating one
    "Timestamp" TEXT,
    "RecBy" TEXT,
    "DelDate" TEXT,
    "CID" TEXT REFERENCES "Customer"("CID"),
    "TaxName" TEXT,
    "TaxNumber" TEXT,
    "TaxTel" TEXT,
    "TaxAddress" TEXT,
    "TaxShip" TEXT
);
-- ==========================================
-- 6. Create Installation_Ship Table
-- ==========================================
CREATE TABLE IF NOT EXISTS "Installation_Ship" (
    "IID" TEXT PRIMARY KEY,
    "Timestamp" TEXT,
    "RecBy" TEXT,
    "DelDate" TEXT,
    "SID" TEXT REFERENCES "Sale"("SID"),
    "InstallationTeam" TEXT,
    "Status" TEXT,
    "PlanDate" TEXT,
    "CompleteDate" TEXT,
    "ShipTravelPrice" TEXT,
    -- Renamed from 'Ship/TravelPrice' to avoid SQL syntax issues
    "InstallationPrice" TEXT,
    "InstallationPayDate" TEXT,
    "InstallationPaySlip" TEXT,
    "Remark" TEXT,
    "Score" TEXT,
    "Sign" TEXT,
    "Pic01" TEXT,
    "Pic02" TEXT,
    "Pic03" TEXT,
    "Pic04" TEXT,
    "Pic05" TEXT,
    "Pic06" TEXT,
    "Pic07" TEXT,
    "Pic08" TEXT,
    "Pic09" TEXT,
    "Pic10" TEXT,
    "QCDefect" TEXT
);
-- ==========================================
-- 7. Enable RLS and Create Policies (Allow All for now)
-- ==========================================
-- Customer
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to Customer" ON "Customer" FOR ALL USING (true) WITH CHECK (true);
-- Bill
ALTER TABLE "Bill" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to Bill" ON "Bill" FOR ALL USING (true) WITH CHECK (true);
-- Sale
ALTER TABLE "Sale" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to Sale" ON "Sale" FOR ALL USING (true) WITH CHECK (true);
-- CShip
ALTER TABLE "CShip" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to CShip" ON "CShip" FOR ALL USING (true) WITH CHECK (true);
-- CTax
ALTER TABLE "CTax" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to CTax" ON "CTax" FOR ALL USING (true) WITH CHECK (true);
-- Installation_Ship
ALTER TABLE "Installation_Ship" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to Installation_Ship" ON "Installation_Ship" FOR ALL USING (true) WITH CHECK (true);