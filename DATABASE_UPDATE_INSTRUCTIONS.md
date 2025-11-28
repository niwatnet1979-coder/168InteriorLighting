# คำแนะนำการอัปเดตตาราง Customer

## ขั้นตอนที่ 1: เข้าสู่ Supabase Dashboard

1. เปิด <https://supabase.com/dashboard>
2. เลือก Project ของคุณ
3. ไปที่ **SQL Editor** (เมนูด้านซ้าย)

## ขั้นตอนที่ 2: รัน SQL Script

คัดลอกและรัน SQL ด้านล่างนี้:

```sql
-- Add new columns to Customer table
ALTER TABLE "Customer" 
ADD COLUMN IF NOT EXISTS "LineID" TEXT,
ADD COLUMN IF NOT EXISTS "Facebook" TEXT,
ADD COLUMN IF NOT EXISTS "Instagram" TEXT,
ADD COLUMN IF NOT EXISTS "Other" TEXT,
ADD COLUMN IF NOT EXISTS "ComeFrom" TEXT;
```

## ขั้นตอนที่ 3: ตรวจสอบผลลัพธ์

- คลิก **Run** (หรือกด Ctrl+Enter / Cmd+Enter)
- ถ้าสำเร็จจะขึ้น "Success. No rows returned"
- ไปที่ **Table Editor** > **Customer** เพื่อดูว่า columns ใหม่ถูกเพิ่มแล้ว

## ขั้นตอนที่ 4: ทดสอบ

1. กลับไปที่แอปพลิเคชัน <http://localhost:3000/customer>
2. คลิกแก้ไขลูกค้าคนใดก็ได้
3. ตอนนี้คุณจะเห็น:
   - ช่องกรอก Line ID, Facebook, Instagram, อื่นๆ
   - Dropdown "ลูกค้ามาจากช่องทางใด"
4. ลองกรอกข้อมูลและบันทึก
5. ข้อมูลจะถูกบันทึกลงฐานข้อมูล

## หมายเหตุ

- ข้อมูลเก่าที่มีอยู่แล้วจะไม่มีค่าใน fields ใหม่ (จะเป็น NULL)
- คุณสามารถแก้ไขและเพิ่มข้อมูลได้ทีละรายการ
