-- Restore Foreign Key Constraints
-- Note: This might fail if there are orphaned records (e.g. Bill with CID not in Customer)
-- 1. Bill -> Customer
ALTER TABLE "Bill"
ADD CONSTRAINT "Bill_CID_fkey" FOREIGN KEY ("CID") REFERENCES "Customer"("CID");
-- 2. Sale -> Bill
ALTER TABLE "Sale"
ADD CONSTRAINT "Sale_BID_fkey" FOREIGN KEY ("BID") REFERENCES "Bill"("BID");
-- 3. CShip -> Customer
ALTER TABLE "CShip"
ADD CONSTRAINT "CShip_CID_fkey" FOREIGN KEY ("CID") REFERENCES "Customer"("CID");
-- 4. CTax -> Customer
ALTER TABLE "CTax"
ADD CONSTRAINT "CTax_CID_fkey" FOREIGN KEY ("CID") REFERENCES "Customer"("CID");
-- 5. Installation_Ship -> Sale
ALTER TABLE "Installation_Ship"
ADD CONSTRAINT "Installation_Ship_SID_fkey" FOREIGN KEY ("SID") REFERENCES "Sale"("SID");