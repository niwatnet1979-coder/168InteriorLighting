# 🚀 คู่มือ Deploy เว็บไซต์ไปยัง Vercel

## ✅ เตรียมการก่อน Deploy

Project ของคุณพร้อม Deploy แล้ว! เนื่องจาก:

- ✅ Build สำเร็จ (`npm run build` ผ่าน)
- ✅ ใช้ Next.js 16.0.4
- ✅ เชื่อมต่อ Supabase แล้ว

---

## 📋 ขั้นตอนการ Deploy

### วิธีที่ 1: Deploy ผ่าน Vercel Dashboard (แนะนำ - ง่ายที่สุด)

#### 1. Push Code ขึ้น GitHub (ถ้ายังไม่ได้ทำ)

```bash
# ถ้ายังไม่ได้ init git
git init
git add .
git commit -m "Ready to deploy"

# สร้าง repo ใหม่บน GitHub แล้ว push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### 2. เข้าสู่ Vercel

1. ไปที่ [https://vercel.com](https://vercel.com)
2. คลิก **"Sign Up"** หรือ **"Log In"**
3. เลือก **"Continue with GitHub"**

#### 3. Import Project

1. คลิก **"Add New Project"**
2. เลือก Repository ที่คุณ push ขึ้นไป (`168go`)
3. คลิก **"Import"**

#### 4. Configure Project

Vercel จะ detect Next.js อัตโนมัติ แต่คุณต้อง:

**Build & Development Settings:**

- Framework Preset: `Next.js` (auto-detected)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Environment Variables:**
คลิก **"Add Environment Variable"** และเพิ่ม:

```
NEXT_PUBLIC_SUPABASE_URL = https://ulytebnddgcpoyoogigq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXRlYm5kZGdjcG95b29naWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjg2MjQsImV4cCI6MjA3OTY0NDYyNH0.AbmyjWPJaF3v46DVKeWdmHjua5Qn2jCUNu-NBE4O2BI
```

#### 5. Deploy

1. คลิก **"Deploy"**
2. รอ 2-3 นาที
3. เสร็จแล้ว! 🎉

คุณจะได้ URL แบบนี้: `https://your-project-name.vercel.app`

---

### วิธีที่ 2: Deploy ผ่าน Vercel CLI (สำหรับ Terminal)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy (ครั้งแรก)
vercel

# ตอบคำถาม:
# - Set up and deploy? Yes
# - Which scope? (เลือก account คุณ)
# - Link to existing project? No
# - What's your project's name? 168go
# - In which directory is your code located? ./
# - Want to override settings? No

# 4. Deploy to Production
vercel --prod
```

---

## 🔄 Auto Deploy

หลังจาก Deploy ครั้งแรกแล้ว:

- ทุกครั้งที่ `git push` ไป GitHub → Vercel จะ Deploy อัตโนมัติ!
- Branch `main` → Production
- Branch อื่นๆ → Preview Deployment

---

## 🔧 หลัง Deploy แล้ว

### ตรวจสอบ Supabase RLS (Row Level Security)

ถ้าเว็บ public แล้วข้อมูลไม่แสดง อาจเป็นเพราะ RLS:

1. เข้า Supabase Dashboard
2. ไปที่ **Authentication** > **Policies**
3. สำหรับ Development: ปิด RLS หรือสร้าง Policy ที่อนุญาตให้อ่านข้อมูลได้

**ตัวอย่าง Policy สำหรับเปิดให้อ่านได้ทุกคน:**

```sql
-- Customer table
CREATE POLICY "Enable read access for all users" ON "Customer"
FOR SELECT
USING (true);

-- CShip table
CREATE POLICY "Enable read access for all users" ON "CShip"
FOR SELECT
USING (true);

-- CTax table
CREATE POLICY "Enable read access for all users" ON "CTax"
FOR SELECT
USING (true);
```

---

## 🎯 Custom Domain (Optional)

หลัง Deploy แล้ว คุณสามารถเพิ่ม Custom Domain:

1. ไปที่ Project Settings > **Domains**
2. คลิก **"Add"**
3. ใส่ domain ของคุณ (เช่น `168app.com`)
4. ตั้งค่า DNS ตามที่ Vercel บอก
5. เสร็จ!

---

## 📊 ติดตาม Deployment

- Dashboard: <https://vercel.com/dashboard>
- Logs: คลิกที่ Deployment แล้วดู Logs
- Analytics: ดูสถิติการใช้งานได้ฟรี

---

## ⚡ Performance Tips

เว็บของคุณ Deploy แล้วจะเร็วมากเพราะ:

- ✅ Vercel Edge Network (CDN Global)
- ✅ Next.js Automatic Optimization
- ✅ Image Optimization
- ✅ Static Site Generation (SSG)

---

## 🆓 Free Plan

Vercel Free Plan ให้:

- ✅ Unlimited Deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ 100GB Bandwidth/month
- ✅ Serverless Functions
- ✅ Custom Domains

**เพียงพอสำหรับ Production ทั่วไป! 🚀**
