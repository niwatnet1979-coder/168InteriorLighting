'use client';

import { Sale, Team } from '@/types/schema';
import { Edit, Trash2 } from 'lucide-react';

interface SaleTableProps {
    sales: Sale[];
    teams: Team[];
    onEdit: (sale: Sale) => void;
    onDelete: (sid: string) => void;
}

export default function SaleTable({ sales, teams, onEdit, onDelete }: SaleTableProps) {
    const getStaffName = (eid: string) => {
        if (!eid) return '-';
        const team = teams.find(t => t.EID === eid);
        return team?.NickName || eid;
    };

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่บิล (BID)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">พนักงาน</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวม</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sales.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                ไม่พบข้อมูลงานขาย
                            </td>
                        </tr>
                    ) : (
                        sales.map((sale) => (
                            <tr key={sale.SID} className={`transition-colors ${!sale.BID ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.SID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(sale.TimeStamp).toLocaleDateString('th-TH')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {sale.BID ? (
                                        <span className="text-teal-600 font-medium">{sale.BID}</span>
                                    ) : (
                                        <span className="text-red-500 font-semibold flex items-center gap-1">
                                            ⚠️ รอออกบิล
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getStaffName(sale.RecBy)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                    {sale.SumPrice?.toLocaleString()} ฿
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(sale)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => onDelete(sale.SID)} className="text-red-600 hover:text-red-900">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
