'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TaxInfo {
    CTaxID?: string;
    CID: string;
    TaxName: string;
    TaxNumber: string;
    TaxTel?: string;
    TaxAddress: string;
    TaxShip?: string;
    RecBy?: string;
    Timestamp?: string;
}

interface TaxInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: TaxInfo) => Promise<void>;
    initialData?: TaxInfo | null;
    customerCID: string;
    isSaving: boolean;
}

export default function TaxInfoModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    customerCID,
    isSaving
}: TaxInfoModalProps) {
    const [formData, setFormData] = useState<TaxInfo>({
        CID: customerCID,
        TaxName: '',
        TaxNumber: '',
        TaxTel: '',
        TaxAddress: '',
        TaxShip: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    CID: customerCID,
                    TaxName: '',
                    TaxNumber: '',
                    TaxTel: '',
                    TaxAddress: '',
                    TaxShip: ''
                });
            }
        }
    }, [isOpen, initialData, customerCID]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-800">
                        {initialData ? 'แก้ไขข้อมูลภาษี' : 'เพิ่มข้อมูลภาษีใหม่'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท/ผู้เสียภาษี *</label>
                            <input
                                type="text"
                                name="TaxName"
                                value={formData.TaxName}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี *</label>
                            <input
                                type="text"
                                name="TaxNumber"
                                value={formData.TaxNumber}
                                onChange={handleChange}
                                placeholder="0-0000-00000-00-0"
                                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                            <input
                                type="text"
                                name="TaxTel"
                                value={formData.TaxTel || ''}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ตามใบกำกับภาษี *</label>
                            <textarea
                                name="TaxAddress"
                                value={formData.TaxAddress}
                                onChange={handleChange}
                                rows={3}
                                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่จัดส่งเอกสาร</label>
                            <textarea
                                name="TaxShip"
                                value={formData.TaxShip || ''}
                                onChange={handleChange}
                                rows={2}
                                placeholder="ถ้าไม่ระบุ จะใช้ที่อยู่เดียวกับที่อยู่ตามใบกำกับภาษี"
                                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
