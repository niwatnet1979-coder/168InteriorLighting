'use client';

import { Product } from '@/types/schema';
import { Edit, Trash2 } from 'lucide-react';

interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (pid: string) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสินค้า</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                ไม่พบข้อมูลสินค้า
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product.PID} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.PID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.PDName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.PDType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                    {product.PDPrice?.toLocaleString()} ฿
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => onDelete(product.PID)} className="text-red-600 hover:text-red-900">
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
