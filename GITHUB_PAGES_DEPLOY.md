# 🚀 Deploy to GitHub Pages - Auto Deploy

## ✅ วิธีที่ใช้: GitHub Actions (อัตโนมัติ 100%)

Project นี้ใช้ **GitHub Actions** สำหรับ Auto Deploy เหมือนกับ `168InteriorLighting`

---

## 📋 ขั้นตอนการตั้งค่า (แค่ครั้งแรก)

### 1. Push Code ขึ้น GitHub

```bash
# ถ้ายังไม่ได้ init
git init
git add .
git commit -m "Initial commit with GitHub Actions"

# เชื่อมต่อกับ GitHub (เปลี่ยน repo name ถ้าต้องการ)
git remote add origin https://github.com/niwatnet1979-coder/168go.git
git branch -M main
git push -u origin main
```

### 2. เปิดใช้งาน GitHub Pages

1. ไปที่: `https://github.com/niwatnet1979-coder/168go/settings/pages`
2. ที่ **Source** เลือก:
   - **GitHub Actions** (ไม่ใช่ Deploy from a branch)
3. เสร็จ! ไม่ต้องทำอะไรเพิ่ม

---

## 🎉 ใช้งาน (Auto Deploy)

หลังจากตั้งค่าแล้ว:

### เมื่อมีการ Push ไปยัง `main` branch

```bash
git add .
git commit -m "Update features"
git push
```

**GitHub Actions จะทำงานอัตโนมัติ:**

1. ✅ Build Next.js project
2. ✅ สร้าง Static files
3. ✅ Deploy ไปยัง GitHub Pages
4. ✅ ใช้เวลา 2-3 นาที

---

## 🌐 URL ของเว็บไซต์

```
https://niwatnet1979-coder.github.io/168go/
```

---

## 📊 ติดตามสถานะ Deployment

1. ไปที่: `https://github.com/niwatnet1979-coder/168go/actions`
2. ดู workflow "Deploy to GitHub Pages"
3. เช็คสถานะ: ✅ Success หรือ ❌ Failed

---

## 🔧 Configuration

### next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: 'export',        // Static Export
  images: {
    unoptimized: true,     // ไม่ใช้ Image Optimization
  },
  basePath: '/168go',      // ต้องตรงกับชื่อ repo
};
```

**สำคัญ!** ถ้าเปลี่ยนชื่อ repository ต้องเปลี่ยน `basePath` ด้วย!

---

## 🚨 Troubleshooting

### ปัญหา: Actions ไม่รัน

**แก้:**

1. ไปที่ Settings > Actions > General
2. เลือก "Allow all actions and reusable workflows"
3. Save

### ปัญหา: Build Failed

**เช็ค:**

1. ไปดู Actions logs
2. แก้ไข errors
3. Push อีกครั้ง

### ปัญหา: 404 Not Found

**แก้:**

1. ตรวจสอบว่า basePath ตรงกับชื่อ repo
2. รอ 2-3 นาที หลัง deploy
3. Clear cache (Cmd+Shift+R)

### ปัญหา: ข้อมูลจาก Supabase ไม่โหลด

**แก้:**

1. เช็ค Supabase RLS policies
2. เพิ่ม `https://niwatnet1979-coder.github.io` ใน CORS
3. เปิด Network tab ดู errors

---

## ⚡ ความแตกต่างจาก Manual Deploy

| Feature | GitHub Actions | Manual (gh-pages) |
|---------|---------------|-------------------|
| Auto Deploy | ✅ ทุกครั้งที่ push | ❌ ต้องรัน `npm run deploy` |
| Build ใน Cloud | ✅ GitHub Servers | ❌ Local machine |
| History | ✅ ดูได้ใน Actions | ❌ ลบได้ง่าย |
| Rollback | ✅ Re-run old workflow | ❌ ยาก |
| Resource | ✅ ฟรี unlimited | ❌ ใช้ bandwidth local |

---

## 📝 Workflow Details

ไฟล์: `.github/workflows/deploy.yml`

**Triggers:**

- Push to `main` branch
- Manual run (workflow_dispatch)

**Steps:**

1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Build Next.js
5. Upload artifact
6. Deploy to GitHub Pages

---

## 🎯 Best Practices

1. ✅ **Test locally** ก่อน push: `npm run build`
2. ✅ **Commit messages** ชัดเจน
3. ✅ **Check Actions** หลัง push
4. ✅ **Monitor** ใน Actions tab

---

## ✨ เสร็จแล้ว

แค่ `git push` → รอ 2-3 นาที → เว็บอัปเดตอัตโนมัติ! 🚀
