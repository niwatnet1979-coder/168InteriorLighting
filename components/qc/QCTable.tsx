'use client';

import { useState, useRef, useEffect } from 'react';
import { QC } from '@/types/schema';
import { Edit, Trash2, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { QCPrintLabel } from './QCPrintLabel';

interface QCTableProps {
    qcList: QC[];
    onEdit: (qc: QC) => void;
    onDelete: (sn: string) => void;
}

export default function QCTable({ qcList, onEdit, onDelete }: QCTableProps) {
    const [printQC, setPrintQC] = useState<QC | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        onAfterPrint: () => setPrintQC(null),
    });

    useEffect(() => {
        if (printQC) {
            handlePrint();
        }
    }, [printQC, handlePrint]);

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <div style={{ display: 'none' }}>
                {printQC && <QCPrintLabel ref={printRef} data={printQC} />}
            </div>

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SN</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ QC</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ร้านค้า (Shop)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">พนักงาน</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {qcList.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                ไม่พบข้อมูล QC
                            </td>
                        </tr>
                    ) : (
                        qcList.map((qc) => (
                            <tr key={qc.SN} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{qc.SN}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {qc.QCDATE ? new Date(qc.QCDATE).toLocaleDateString('th-TH') : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{qc.ShopLabel}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{qc.ProductType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{qc.Staff}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${qc.QCPass === 'ผ่าน' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {qc.QCPass || 'รอตรวจสอบ'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setPrintQC(qc)}
                                        className="text-gray-600 hover:text-gray-900 mr-3"
                                        title="Print QR Label"
                                    >
                                        <Printer size={18} />
                                    </button>
                                    <button onClick={() => onEdit(qc)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => onDelete(qc.SN)} className="text-red-600 hover:text-red-900">
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
