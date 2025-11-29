# 🔧 คำแนะนำแก้ไข Table Bill

## 📋 ปัญหา

Table `Bill` ในฐานข้อมูลขาด column `SID` (Sale ID)

ตาม CSV ควรมี columns:

- Timestamp
- RecBy
- DelDate
- **BID** (Primary Key)
- CID (Foreign Key → Customer)
- Seller
- **SID** (Foreign Key → Sale) ← **ขาดอันนี้!**
- Vat

---

## ✅ วิธีแก้ไข (รันใน Supabase Dashboard)

### 1. เข้า Supabase Dashboard

```
https://supabase.com/dashboard/project/ulytebnddgcpoyoogigq/editor
```

### 2. ไปที่ SQL Editor (เมนูด้านซ้าย)

### 3. วาง SQL นี้แล้วกด RUN

```sql
-- เพิ่ม column SID
ALTER TABLE "Bill" 
ADD COLUMN IF NOT EXISTS "SID" TEXT;

-- (Optional) เพิ่ม Foreign Key constraint
-- ALTER TABLE "Bill" 
-- ADD CONSTRAINT fk_bill_sale 
-- FOREIGN KEY ("SID") REFERENCES "Sale"("SID");
```

### 4. ตรวจสอบว่าสำเร็จ

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Bill'
ORDER BY ordinal_position;
```

ควรเห็น column `SID` ในรายการ!

---

## 📊 โครงสร้างที่ถูกต้อง

```
Bill Table:
├── BID (TEXT, Primary Key)
├── Timestamp (TEXT)
├── RecBy (TEXT)
├── DelDate (TEXT)
├── CID (TEXT, FK → Customer)
├── Seller (TEXT)
├── SID (TEXT, FK → Sale) ← เพิ่มใหม่
└── Vat (TEXT)
```

---

## 🔄 หลังจากแก้ไขแล้ว

อัปเดต TypeScript type ใน `types/schema.ts`:

```typescript
export interface Bill {
  BID: string;           // Primary Key
  Timestamp?: string;
  RecBy?: string;
  DelDate?: string | null;
  CID?: string;          // FK → Customer
  Seller?: string;
  SID?: string;          // FK → Sale (เพิ่มใหม่)
  Vat?: string;
}
```

---

## ⚠️ หมายเหตุ

- **ต้องรันใน Supabase Dashboard เท่านั้น** (ไม่สามารถรันผ่าน Supabase JS Client ได้)
- หลังเพิ่ม column แล้ว สามารถ import ข้อมูลจาก CSV ได้
- Foreign Key constraint เป็น optional (ถ้าต้องการความสัมพันธ์ที่เข้มงวด)

---

## 📁 ไฟล์ที่เกี่ยวข้อง

- `alter_bill_table.sql` - SQL script สำหรับแก้ไข
- `168APP - Bill.csv` - ข้อมูลตัวอย่าง
- `types/schema.ts` - TypeScript type definitions
