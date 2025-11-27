'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/schema';
import { X, Image as ImageIcon, Box } from 'lucide-react';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => Promise<void>;
    initialData?: Product | null;
    isSaving: boolean;
}

export default function ProductModal({ isOpen, onClose, onSave, initialData, isSaving }: ProductModalProps) {
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [activeTab, setActiveTab] = useState<'basic' | 'images'>('basic');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    PID: '',
                    Timestamp: new Date().toISOString(),
                    RecBy: 'Admin',
                    PDPrice: 0,
                    PIDSub: '1.0'
                });
            }
            setActiveTab('basic');
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData as Product);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b px-6 bg-gray-50 sticky top-[80px] z-10">
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === 'basic' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Box size={18} /> ข้อมูลสินค้า
                    </button>
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === 'images' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <ImageIcon size={18} /> รูปภาพ
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
                    {activeTab === 'basic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">รหัสสินค้า (PID)</label>
                                <input
                                    type="text" name="PID"
                                    value={formData.PID || ''}
                                    onChange={handleChange}
                                    readOnly={!!initialData}
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${initialData ? 'bg-gray-100' : ''}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ชื่อสินค้า</label>
                                <input type="text" name="PDName" value={formData.PDName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ประเภท (Type)</label>
                                <input type="text" name="PDType" value={formData.PDType || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ราคา (Price)</label>
                                <input type="number" name="PDPrice" value={formData.PDPrice || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
                                <textarea name="PDDetrail" value={formData.PDDetrail || ''} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'images' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 mb-4">ใส่ URL ของรูปภาพสินค้า</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['PDPic1', 'PDPic2', 'PDPic3', 'PDPic4', 'PDPic5', 'PDPic6', 'PDPic7', 'PDPic8', 'PDPic9', 'PDPic10'].map((field) => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-gray-700">{field}</label>
                                        <input
                                            type="text"
                                            name={field}
                                            value={(formData as any)[field] || ''}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm"
                                        />
                                    </div>
                                ))}
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
