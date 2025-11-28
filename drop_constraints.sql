-- Drop Foreign Key Constraints temporarily to allow bulk import
ALTER TABLE "Bill" DROP CONSTRAINT IF EXISTS "Bill_CID_fkey";
ALTER TABLE "Sale" DROP CONSTRAINT IF EXISTS "Sale_BID_fkey";
ALTER TABLE "CShip" DROP CONSTRAINT IF EXISTS "CShip_CID_fkey";
ALTER TABLE "CTax" DROP CONSTRAINT IF EXISTS "CTax_CID_fkey";
ALTER TABLE "Installation_Ship" DROP CONSTRAINT IF EXISTS "Installation_Ship_SID_fkey";