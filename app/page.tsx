import Link from 'next/link';
import { Users, ShoppingCart, ClipboardCheck, Package, BarChart3, FileText, Truck, Building2 } from 'lucide-react';

export default function Home() {
  const menus = [
    { name: 'จัดการงานขาย (Sale)', icon: ShoppingCart, href: '/sale', color: 'bg-blue-500' },
    { name: 'จัดการ QC (Quality Control)', icon: ClipboardCheck, href: '/qc', color: 'bg-green-500' },
    { name: 'จัดการสินค้า (Product)', icon: Package, href: '/product', color: 'bg-purple-500' },
    { name: 'จัดการลูกค้า (Customer)', icon: Users, href: '/customer', color: 'bg-orange-500' },
    { name: 'จัดการทีม (Team)', icon: BarChart3, href: '/team', color: 'bg-indigo-500' },
    { name: 'งานติดตั้ง (Installation)', icon: ClipboardCheck, href: '/installation', color: 'bg-red-500' },
    { name: 'จัดการบิล (Bill)', icon: FileText, href: '/bill', color: 'bg-teal-500' },
    { name: 'ที่อยู่จัดส่ง (Shipping)', icon: Truck, href: '/cship', color: 'bg-pink-500' },
    { name: 'ข้อมูลภาษี (Tax Info)', icon: Building2, href: '/ctax', color: 'bg-yellow-500' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">168APP Admin Dashboard</h1>
          <p className="text-gray-500">ระบบจัดการร้านค้าครบวงจร (Next.js Version)</p>
          <p className="text-xs text-gray-400 mt-2 font-mono">V0.01_2025-11-29 07:59</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <Link key={menu.name} href={menu.href}
              className="group block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200">
              <div className={`w-12 h-12 ${menu.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <menu.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{menu.name}</h3>
              <p className="text-gray-400 text-sm">คลิกเพื่อเข้าสู่เมนูจัดการ</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
