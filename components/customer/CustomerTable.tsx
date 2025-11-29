'use client';

import { Customer } from '@/types/schema';
import { Edit, Trash2 } from 'lucide-react';

interface CustomerWithLatestBill extends Customer {
    LatestBillDate?: string | null;
}

interface CustomerTableProps {
    customers: CustomerWithLatestBill[];
    onEdit: (customer: Customer) => void;
    onDelete: (cid: string) => void;
}

export default function CustomerTable({ customers, onEdit, onDelete }: CustomerTableProps) {
    const handleRowClick = (customer: Customer, e: React.MouseEvent) => {
        // Don't trigger row click if clicking on action buttons
        const target = e.target as HTMLElement;
        if (target.closest('button')) {
            return;
        }
        onEdit(customer);
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผู้ติดต่อ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">บริษัท</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เบอร์โทร</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ช่องทาง</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ทำรายการซื้อล่าสุด</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {customers.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                ไม่พบข้อมูลลูกค้า
                            </td>
                        </tr>
                    ) : (
                        customers.map((customer) => (
                            <tr
                                key={customer.CID}
                                onClick={(e) => handleRowClick(customer, e)}
                                className="hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.CID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.ContractName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.ContractCompany}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.ContractTel}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {customer.ComeFrom || 'ไม่ระบุ'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(customer.LatestBillDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(customer); }}
                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        title="แก้ไข"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(customer.CID); }}
                                        className="text-red-600 hover:text-red-900"
                                        title="ลบ"
                                    >
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
