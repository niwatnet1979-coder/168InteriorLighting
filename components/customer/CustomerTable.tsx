'use client';

import { Customer } from '@/types/schema';
import { Edit, Trash2 } from 'lucide-react';

interface CustomerTableProps {
    customers: Customer[];
    onEdit: (customer: Customer) => void;
    onDelete: (cid: string) => void;
}

export default function CustomerTable({ customers, onEdit, onDelete }: CustomerTableProps) {
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
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {customers.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                ไม่พบข้อมูลลูกค้า
                            </td>
                        </tr>
                    ) : (
                        customers.map((customer) => (
                            <tr key={customer.CID} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.CID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.Contract}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.ContractCompany}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.ContractTel}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.ContractCh}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(customer)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => onDelete(customer.CID)} className="text-red-600 hover:text-red-900">
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
