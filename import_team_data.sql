
DROP TABLE IF EXISTS "Team";

CREATE TABLE "Team" (
    "Timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "RecBy" TEXT,
    "DelDate" TIMESTAMP WITH TIME ZONE,
    "EID" TEXT PRIMARY KEY,
    "TeamName" TEXT,
    "TeamType" TEXT,
    "UserType" TEXT,
    "Email" TEXT,
    "NickName" TEXT,
    "FullName" TEXT,
    "LastName" TEXT,
    "CitizenID" TEXT,
    "Bank" TEXT,
    "ACNumber" TEXT,
    "BirthDay" DATE,
    "StartDate" DATE,
    "Address" TEXT,
    "Tel1" TEXT,
    "Tel2" TEXT,
    "Job" TEXT,
    "Level" TEXT,
    "WorkType" TEXT,
    "PayType" TEXT,
    "PayRate" NUMERIC,
    "IncentiveRate" NUMERIC,
    "Pic" TEXT,
    "CitizenIDPic" TEXT,
    "HouseRegPic" TEXT,
    "EndDate" DATE
);

INSERT INTO "Team" VALUES ('2025-07-05 10:37:25', 'ST0001', NULL, 'EID0000', 'ทีมบริหาร', 'บริหาร', 'admin', 'saseng1981@gmail.com', 'สาเส็ง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Team" VALUES ('2025-07-02 17:00:00', 'ST0001', NULL, 'EID0001', 'ทีมบริหาร', 'บริหาร', 'admin', 'katoon2444@gmail.com', 'สา', 'วันวิสาข์', 'สุขสอาด', '3229700052764', 'TTB', NULL, '1981-05-22', '2023-01-01', '168/166 หมู่1 หมู่บ้านเซนโทร พหลฯ-วิภาวดี2 ต.คลองหนึ่งอ.คลองหลวง จ.ปทุมธานี 12120', '0922464144', NULL, 'ผู้บริหาร', 'CEO', 'ประจำ', 'monthly', 70000, 1000, NULL, NULL, NULL, NULL);
INSERT INTO "Team" VALUES ('2025-07-04 08:46:50', 'ST0001', NULL, 'EID0002', 'ทีมบริหาร', 'บริหาร', 'admin', 'niwatnet1979@gmail.com', 'เส็ง', 'นิวัฒน์', 'รุ่งฤทธิเดช', '3759900299611', 'TTB', '4472393638', '1979-03-21', '2024-01-01', '168/166 หมู่1 หมู่บ้านเซนโทร พหลฯ-วิภาวดี2 ต.คลองหนึ่งอ.คลองหลวง จ.ปทุมธานี 12120', '0864193595', '864193595', 'ผู้บริหาร', 'CTO', 'ประจำ', 'monthly', 30000, 1000, NULL, NULL, NULL, NULL);
INSERT INTO "Team" VALUES ('2025-07-05 10:37:25', 'ST0001', NULL, 'EID0003', 'ทีมQC', 'QC', 'user', 'dongwitthawatrkc@gmail.com', 'โด่ง', 'วิทวัช', 'เรืองขจร', '1139600129263', 'SCB', '3897199554', '2001-07-06', '2025-01-28', '68 หมู่5 ต.บางพลับ อ.สองพี่น้อง จ.สุพรรณบุรี', '0634849709', NULL, 'QC', 'Junior', 'ประจำ', 'Daily', 400, 1000, NULL, NULL, NULL, '2025-01-28');
INSERT INTO "Team" VALUES ('2025-07-08 13:53:34', 'ST0001', NULL, 'EID0004', 'ทีมQC', 'QC', 'user', 'aekkalak.phraithai@gmail.com', 'ภูมิ', 'เอกลักษณ์', 'พรายไทย', '2309900039983', 'KBANK', '0471251054', '1994-07-17', '2025-05-02', '61/219 หมู่5 หมู่บ้านเจษฎา 9 กรีนโซน ต.ลาดสวาย อ.ลำลูกกา จ.ปทุมธานี', NULL, NULL, 'QC', 'Junior', 'ทดลองงาน 3 เดือน', 'monthly', 500, 1000, NULL, NULL, NULL, '2025-05-02');
INSERT INTO "Team" VALUES ('2025-07-12 20:58:21', 'ST0001', NULL, 'EID0005', 'ทีมQC', 'QC', 'user', 'sabloveball1@gmail.com', 'แสบ', 'อนุพร', 'มีหิรัญ', '1100501360686', 'KTB', '7540433035', '1996-11-08', '2025-05-11', '90/154 หมู่บ้านแก้วขวัญ ต.คูคต อ.ลำลูกกา จ.ปทุมธานี', '0645707586', '0869702785', 'QC', 'Junior', 'ทดลองงาน 3 เดือน', 'monthly', 500, 1000, NULL, NULL, NULL, '2025-05-11');
INSERT INTO "Team" VALUES ('2025-07-14 17:33:46', 'ST0001', NULL, 'EID0006', 'ทีมSALE', 'SALE', 'user', 'subsideiklaingklao@gmail.com', 'ดี้', 'ทรัพย์สิดี', 'เกลี้ยงเกลา', '3140400153746', 'SCB', '4100894816', '1983-09-05', '2025-04-17', '159/26 หมู่7 ต.เชียงรากน้อย อ.บางประอิน จ.พระนครศรีอยุธยา', '0625103383', NULL, 'Sale', 'Junior', 'ทดลองงาน 3 เดือน', 'monthly', 500, 1000, NULL, NULL, NULL, NULL);
INSERT INTO "Team" VALUES ('2025-07-19 12:16:34', 'ST0001', NULL, 'EID0007', 'ทีมQC', 'QC', 'user', 'peetod2019@gmail.com', 'โต้ด', 'ศุภเสกข์', 'เกิดปั้น', '1139700007887', 'SCB', '3682475768', '1998-03-27', '2025-06-25', '43/41 หมู่2 ต.บึงยี่โถ อ.ธัญบุรี จ.ปทุมธานี 12130', '0826549886', '0817217754', 'QC', 'Junior', 'ทดลองงาน 3 เดือน', 'monthly', 500, 1000, NULL, 'ข้อมูลพนักงาน_Files_/peetod2019@gmail.com.สำเนาบัตรประชาน.041142.pdf', 'ข้อมูลพนักงาน_Files_/peetod2019@gmail.com.สำเนาทะเบียนบ้าน.041142.pdf', NULL);
INSERT INTO "Team" VALUES ('2025-07-29 12:54:29', 'ST0001', NULL, 'EID0008', 'ทีมQC', 'QC', 'user', 'flukjaba04@gmail.com', 'ฟลุ้ค', 'ธนดล', 'เกิดปั้น', '1139600138661', 'SCB', '3682449440', '2001-10-22', '2025-08-02', '43/27 หมู่2 ต.บึงยี่โถ อ.ธัญบุรี จ.ปทุมธานี 12130', '0956192230', NULL, 'QC', 'Junior', 'ทดลองงาน 3 เดือน', 'monthly', 500, 1000, NULL, 'ข้อมูลพนักงาน_Files_/flukjaba04@gmail.com.สำเนาบัตรประชาน.032019.pdf', 'ข้อมูลพนักงาน_Files_/flukjaba04@gmail.com.สำเนาทะเบียนบ้าน.032140.pdf', NULL);
INSERT INTO "Team" VALUES ('2025-08-03 15:08:30', 'ST0001', NULL, 'EID0009', 'ทีมช่างชัย', 'ช่าง', 'user', 'Cxxxxxxxxxxxxxx@gmail.com', 'ช่างชัย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Team" VALUES ('2025-08-06 10:16:32', 'ST0001', NULL, 'EID0010', 'ทีมช่างกี', 'ช่าง', 'user', 'thwisakdihadi3@gmail.com', 'ช่างกี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Team" VALUES ('2025-08-07 10:16:32', 'ST0002', NULL, 'EID0011', 'ทีมช่างกี', 'ช่าง', 'user', 'Kammeeja@gmail.com', 'ช่างโป้ป', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);