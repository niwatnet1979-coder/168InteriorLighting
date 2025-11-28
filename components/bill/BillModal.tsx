'use client';

import { X, FileText, User, Calendar, DollarSign, Package } from 'lucide-react';

interface BillModalProps {
    isOpen: boolean;
    onClose: () => void;
    bill: any;
}

export default function BillModal({ isOpen, onClose, bill }: BillModalProps) {
    if (!isOpen || !bill) return null;

    const totalAmount = bill.Sale?.reduce((acc: number, curr: any) => acc + (parseFloat(curr.SumPrice) || 0), 0) || 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">รายละเอียดบิล {bill.BID}</h2>
                            <p className="text-sm text-gray-500">{bill.Timestamp ? new Date(bill.Timestamp).toLocaleString('th-TH') : '-'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Customer Info */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <User size={16} /> ข้อมูลลูกค้า
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400">ชื่อลูกค้า</p>
                                <p className="font-medium text-gray-900">{bill.Customer?.ContractName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">เบอร์โทรศัพท์</p>
                                <p className="font-medium text-gray-900">{bill.Customer?.ContractTel || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">วันที่ส่งของ</p>
                                <p className="font-medium text-gray-900">{bill.DelDate || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">พนักงานขาย</p>
                                <p className="font-medium text-gray-900">{bill.Seller || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sale Items Table */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <Package size={16} /> รายการสินค้า (Sale Items)
                        </h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-3 font-medium text-gray-600">SID</th>
                                        <th className="p-3 font-medium text-gray-600">สินค้า (PID)</th>
                                        <th className="p-3 font-medium text-gray-600">รายละเอียด</th>
                                        <th className="p-3 text-right font-medium text-gray-600">ราคา</th>
                                        <th className="p-3 text-right font-medium text-gray-600">จำนวน</th>
                                        <th className="p-3 text-right font-medium text-gray-600">รวม</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bill.Sale?.length > 0 ? (
                                        bill.Sale.map((item: any) => (
                                            <tr key={item.SID} className="hover:bg-gray-50">
                                                <td className="p-3 text-gray-500">{item.SID}</td>
                                                <td className="p-3 font-medium text-gray-900">{item.PID}</td>
                                                <td className="p-3 text-gray-600">
                                                    {item.ItemColor} / {item.BulbCollor}
                                                </td>
                                                <td className="p-3 text-right">{Number(item.Price).toLocaleString()}</td>
                                                <td className="p-3 text-right">{item.Qty}</td>
                                                <td className="p-3 text-right font-medium text-gray-900">{Number(item.SumPrice).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-gray-400">ไม่มีรายการสินค้า</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                    <tr>
                                        <td colSpan={5} className="p-3 text-right font-bold text-gray-700">ยอดรวมทั้งสิ้น</td>
                                        <td className="p-3 text-right font-bold text-teal-600 text-lg">
                                            {totalAmount.toLocaleString()} ฿
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                    >
                        ปิดหน้าต่าง
                    </button>
                    <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md flex items-center gap-2">
                        <FileText size={18} />
                        พิมพ์ใบเสร็จ
                    </button>
                </div>
            </div>
        </div>
    );
}
