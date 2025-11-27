'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/types/schema';
import { X, User, Truck, FileText } from 'lucide-react';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Customer) => Promise<void>;
    initialData?: Customer | null;
    isSaving: boolean;
}

export default function CustomerModal({ isOpen, onClose, onSave, initialData, isSaving }: CustomerModalProps) {
    const [formData, setFormData] = useState<Partial<Customer>>({});
    const [activeTab, setActiveTab] = useState<'contact' | 'shipping' | 'tax'>('contact');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    CID: '',
                    Timestamp: new Date().toISOString(),
                    RecBy: 'Admin',
                    CIDSub: '1.0'
                });
            }
            setActiveTab('contact');
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData as Customer);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex border-b px-6 bg-gray-50 sticky top-[80px] z-10">
                    <button onClick={() => setActiveTab('contact')} className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === 'contact' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <User size={18} /> ข้อมูลติดต่อ
                    </button>
                    <button onClick={() => setActiveTab('shipping')} className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === 'shipping' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <Truck size={18} /> ข้อมูลจัดส่ง
                    </button>
                    <button onClick={() => setActiveTab('tax')} className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === 'tax' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <FileText size={18} /> ข้อมูลใบกำกับภาษี
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
                    {activeTab === 'contact' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">รหัสลูกค้า (CID)</label>
                                <input type="text" name="CID" value={formData.CID || ''} onChange={handleChange} readOnly={!!initialData} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${initialData ? 'bg-gray-100' : ''}`} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ชื่อผู้ติดต่อ</label>
                                <input type="text" name="Contract" value={formData.Contract || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                                <input type="text" name="ContractTel" value={formData.ContractTel || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">บริษัท</label>
                                <input type="text" name="ContractCompany" value={formData.ContractCompany || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ช่องทางติดต่อ (Line/FB)</label>
                                <input type="text" name="ContractCh" value={formData.ContractCh || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ชื่อผู้รับ</label>
                                <input type="text" name="ShipName" value={formData.ShipName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">เบอร์โทรผู้รับ</label>
                                <input type="text" name="ShipTel" value={formData.ShipTel || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">ที่อยู่จัดส่ง</label>
                                <textarea name="ShipAddress" value={formData.ShipAddress || ''} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Google Maps Link</label>
                                <input type="text" name="ShipMap" value={formData.ShipMap || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'tax' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ชื่อผู้เสียภาษี</label>
                                <input type="text" name="TaxName" value={formData.TaxName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">เลขประจำตัวผู้เสียภาษี</label>
                                <input type="text" name="TaxNumber" value={formData.TaxNumber || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">ที่อยู่ตามใบกำกับภาษี</label>
                                <textarea name="TaxAddress" value={formData.TaxAddress || ''} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">ยกเลิก</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
