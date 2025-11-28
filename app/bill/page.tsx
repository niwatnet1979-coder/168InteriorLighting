'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, FileText, User, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

import BillModal from '@/components/bill/BillModal';

interface Bill {
    BID: string;
    Timestamp: string;
    DelDate: string;
    Seller: string;
    Vat: string;
    Customer?: {
        ContractName: string;
        ContractTel: string;
    };
    Sale?: {
        SID: string;
        PID: string;
        Price: string;
        Qty: string;
        SumPrice: string;
        ItemColor: string;
        BulbCollor: string;
    }[];
}

export default function BillPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('Bill')
                .select(`
                    *,
                    Customer:CID (
                        ContractName,
                        ContractTel
                    ),
                    Sale:BID (
                        SID,
                        PID,
                        Price,
                        Qty,
                        SumPrice,
                        ItemColor,
                        BulbCollor
                    )
                `)
                .order('BID', { ascending: true });

            if (error) throw error;
            setBills(data || []);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (sales: any[] | undefined) => {
        if (!sales) return 0;
        return sales.reduce((acc, curr) => acc + (parseFloat(curr.SumPrice) || 0), 0);
    };

    const handleViewDetails = (bill: Bill) => {
        setSelectedBill(bill);
        setIsModalOpen(true);
    };

    const filteredBills = bills.filter(item =>
        item.BID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Customer?.ContractName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Seller?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">จัดการบิล (Bill)</h1>
                        <p className="text-gray-500 mt-1">รายการบิลและยอดขายรวม</p>
                    </div>
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                        &larr; กลับหน้าหลัก
                    </Link>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหา BID, ชื่อลูกค้า, หรือพนักงานขาย..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
                            <Filter size={20} />
                            <span>ตัวกรอง</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                    <th className="p-4">BID</th>
                                    <th className="p-4">ลูกค้า</th>
                                    <th className="p-4">วันที่ส่งของ</th>
                                    <th className="p-4">พนักงานขาย</th>
                                    <th className="p-4">VAT</th>
                                    <th className="p-4 text-right">ยอดรวม (บาท)</th>
                                    <th className="p-4 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                                    </tr>
                                ) : filteredBills.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">ไม่พบข้อมูล</td>
                                    </tr>
                                ) : (
                                    filteredBills.map((item) => (
                                        <tr key={item.BID} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-teal-600 flex items-center gap-2">
                                                <FileText size={16} />
                                                {item.BID}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{item.Customer?.ContractName || '-'}</span>
                                                    <span className="text-xs text-gray-500">{item.Customer?.ContractTel || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar size={16} />
                                                    <span>{item.DelDate || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-gray-400" />
                                                    <span className="text-gray-700">{item.Seller}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                                    {item.Vat}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-gray-900">
                                                {calculateTotal(item.Sale).toLocaleString()} ฿
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleViewDetails(item)}
                                                    className="text-gray-400 hover:text-teal-600 transition-colors flex items-center gap-1 mx-auto"
                                                >
                                                    🔍 ดูรายละเอียด
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                <BillModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    bill={selectedBill}
                />
            </div>
        </div>
    );
}
