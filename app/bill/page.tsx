'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, FileText, User, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import BillModal from '@/components/bill/BillModal';
import { Bill, Team } from '@/types/schema';

export default function BillPage() {
    const [bills, setBills] = useState<any[]>([]); // Use any for joined data
    const [billItemCounts, setBillItemCounts] = useState<Record<string, number>>({});
    const [teams, setTeams] = useState<Team[]>([]);
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
            const [billsRes, teamsRes, salesRes] = await Promise.all([
                supabase
                    .from('Bill')
                    .select(`
                        *,
                        Customer:CID (
                            ContractName,
                            ContractTel
                        ),
                        Sale:SID (
                            SID,
                            PID,
                            SumPrice
                        )
                    `)
                    .order('BID', { ascending: true }),
                supabase.from('Team').select('EID, NickName'),
                supabase.from('Sale').select('BID')
            ]);

            if (billsRes.error) throw billsRes.error;
            if (teamsRes.error) console.error('Error fetching teams:', teamsRes.error);

            // Count items per bill
            const counts: Record<string, number> = {};
            if (salesRes.data) {
                salesRes.data.forEach((sale: any) => {
                    if (sale.BID) {
                        counts[sale.BID] = (counts[sale.BID] || 0) + 1;
                    }
                });
            }

            setBills(billsRes.data || []);
            setTeams(teamsRes.data as Team[] || []);
            setBillItemCounts(counts);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSellerName = (eid: string) => {
        if (!eid) return '-';
        const team = teams.find(t => t.EID === eid);
        return team?.NickName || eid;
    };

    const handleViewDetails = (bill: any) => {
        setSelectedBill(bill);
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        setSelectedBill(null); // Null means create new
        setIsModalOpen(true);
    };

    const filteredBills = bills.filter(item =>
        (item.BID || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.Customer?.ContractName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.Seller || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCancelBill = async (bill: any) => {
        if (!confirm(`คุณต้องการยกเลิกบิล ${bill.BID} ใช่หรือไม่?\nรายการขายที่เกี่ยวข้องจะถูกปลดการเชื่อมโยง แต่จะไม่ถูกลบ`)) {
            return;
        }

        setLoading(true);
        try {
            // 1. Unlink Sales (Set BID to NULL)
            const { error: unlinkError } = await supabase
                .from('Sale')
                .update({ BID: null })
                .eq('BID', bill.BID);

            if (unlinkError) throw unlinkError;

            // 2. Delete Bill
            const { error: deleteError } = await supabase
                .from('Bill')
                .delete()
                .eq('BID', bill.BID);

            if (deleteError) throw deleteError;

            // 3. Refresh List
            await fetchBills();
        } catch (error: any) {
            console.error('Error cancelling bill:', error);
            alert('เกิดข้อผิดพลาดในการยกเลิกบิล: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">จัดการบิล (Bill)</h1>
                        <p className="text-gray-500 mt-1">รายการบิลและยอดขายรวม</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/" className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                            &larr; กลับหน้าหลัก
                        </Link>
                        <button
                            onClick={handleCreateNew}
                            className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm flex items-center gap-2"
                        >
                            <Plus size={18} />
                            สร้างบิลใหม่
                        </button>
                    </div>
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
                                    <th className="p-4">วันที่เปิดบิล</th>
                                    <th className="p-4">จำนวนรายการ</th>
                                    <th className="p-4">พนักงานขาย</th>
                                    <th className="p-4">VAT</th>
                                    <th className="p-4 text-right">ยอดรวม (บาท)</th>
                                    <th className="p-4 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                                    </tr>
                                ) : filteredBills.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-gray-500">ไม่พบข้อมูล</td>
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
                                                    <span>{item.BillDate || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                    {billItemCounts[item.BID] || 0} รายการ
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-gray-400" />
                                                    <span className="text-gray-700">{getSellerName(item.Seller)}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                                    {item.Vat}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-gray-900">
                                                {item.Sale?.SumPrice ? Number(item.Sale.SumPrice).toLocaleString() : '0'} ฿
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(item)}
                                                        className="text-gray-400 hover:text-teal-600 transition-colors flex items-center gap-1"
                                                        title="ดูรายละเอียด"
                                                    >
                                                        🔍
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelBill(item)}
                                                        className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                                                        title="ยกเลิกบิล (ปลดรายการขาย)"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
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
                    onSave={fetchBills}
                    bill={selectedBill}
                />
            </div>
        </div>
    );
}
