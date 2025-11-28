'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ShippingAddress {
    CShipID?: string;
    CID: string;
    ShipName: string;
    ShipTel: string;
    ShipAddress: string;
    ShipMap?: string;
    RecBy?: string;
    Timestamp?: string;
}

interface ShippingAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ShippingAddress) => Promise<void>;
    initialData?: ShippingAddress | null;
    customerCID: string;
    isSaving: boolean;
}

export default function ShippingAddressModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    customerCID,
    isSaving
}: ShippingAddressModalProps) {
    const [formData, setFormData] = useState<ShippingAddress>({
        CID: customerCID,
        ShipName: '',
        ShipTel: '',
        ShipAddress: '',
        ShipMap: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    CID: customerCID,
                    ShipName: '',
                    ShipTel: '',
                    ShipAddress: '',
                    ShipMap: ''
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
                        {initialData ? 'แก้ไขที่อยู่จัดส่ง' : 'เพิ่มที่อยู่จัดส่งใหม่'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้รับ *</label>
                            <input
                                type="text"
                                name="ShipName"
                                value={formData.ShipName}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ *</label>
                            <input
                                type="text"
                                name="ShipTel"
                                value={formData.ShipTel}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่จัดส่ง *</label>
                            <textarea
                                name="ShipAddress"
                                value={formData.ShipAddress}
                                onChange={handleChange}
                                rows={3}
                                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
                            <input
                                type="text"
                                name="ShipMap"
                                value={formData.ShipMap || ''}
                                onChange={handleChange}
                                placeholder="https://maps.google.com/?q=..."
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
