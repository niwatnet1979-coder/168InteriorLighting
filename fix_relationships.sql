-- Re-create Foreign Key Constraints
-- This is required for Supabase to perform nested joins (e.g. fetching Customer name via Installation)
-- 1. Bill -> Customer
ALTER TABLE "Bill" DROP CONSTRAINT IF EXISTS "Bill_CID_fkey";
ALTER TABLE "Bill"
ADD CONSTRAINT "Bill_CID_fkey" FOREIGN KEY ("CID") REFERENCES "Customer"("CID");
-- 2. Sale -> Bill
ALTER TABLE "Sale" DROP CONSTRAINT IF EXISTS "Sale_BID_fkey";
ALTER TABLE "Sale"
ADD CONSTRAINT "Sale_BID_fkey" FOREIGN KEY ("BID") REFERENCES "Bill"("BID");
-- 3. CShip -> Customer
ALTER TABLE "CShip" DROP CONSTRAINT IF EXISTS "CShip_CID_fkey";
ALTER TABLE "CShip"
ADD CONSTRAINT "CShip_CID_fkey" FOREIGN KEY ("CID") REFERENCES "Customer"("CID");
-- 4. CTax -> Customer
ALTER TABLE "CTax" DROP CONSTRAINT IF EXISTS "CTax_CID_fkey";
ALTER TABLE "CTax"
ADD CONSTRAINT "CTax_CID_fkey" FOREIGN KEY ("CID") REFERENCES "Customer"("CID");
-- 5. Installation_Ship -> Sale
ALTER TABLE "Installation_Ship" DROP CONSTRAINT IF EXISTS "Installation_Ship_SID_fkey";
ALTER TABLE "Installation_Ship"
ADD CONSTRAINT "Installation_Ship_SID_fkey" FOREIGN KEY ("SID") REFERENCES "Sale"("SID");