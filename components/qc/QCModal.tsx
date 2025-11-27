'use client';

import { useState, useEffect } from 'react';
import { QC } from '@/types/schema';
import { X, Image as ImageIcon, Box, FileText } from 'lucide-react';

interface QCModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (qc: QC) => Promise<void>;
    initialData?: QC | null;
    isSaving: boolean;
}

export default function QCModal({ isOpen, onClose, onSave, initialData, isSaving }: QCModalProps) {
    const [formData, setFormData] = useState<Partial<QC>>({});
    const [activeTab, setActiveTab] = useState<'basic' | 'product' | 'images'>('basic');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    SN: '',
                    Timestamp: new Date().toISOString(),
                    RecBy: 'Admin',
                    QCDATE: new Date().toISOString().split('T')[0], // Today YYYY-MM-DD
                    QCPass: 'ผ่าน',
                    QCQty: 1
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
        await onSave(formData as QC);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'แก้ไขข้อมูล QC' : 'เพิ่มรายการ QC ใหม่'}
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
                        <FileText size={18} /> ข้อมูลทั่วไป
                    </button>
                    <button
                        onClick={() => setActiveTab('product')}
                        className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === 'product' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Box size={18} /> รายละเอียดสินค้า
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
                    {/* Tab: Basic */}
                    {activeTab === 'basic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Serial Number (SN)</label>
                                <input
                                    type="text" name="SN"
                                    value={formData.SN || ''}
                                    onChange={handleChange}
                                    readOnly={!!initialData} // Read-only if editing
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${initialData ? 'bg-gray-100' : ''}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">วันที่ QC</label>
                                <input type="date" name="QCDATE" value={formData.QCDATE || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">พนักงาน QC</label>
                                <input type="text" name="Staff" value={formData.Staff || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ร้านค้า (Shop Label)</label>
                                <input type="text" name="ShopLabel" value={formData.ShopLabel || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ผลการตรวจสอบ</label>
                                <select name="QCPass" value={formData.QCPass || 'ผ่าน'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                                    <option value="ผ่าน">ผ่าน</option>
                                    <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                                    <option value="รอตรวจสอบ">รอตรวจสอบ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">จำนวน (QC Qty)</label>
                                <input type="number" name="QCQty" value={formData.QCQty || 1} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                        </div>
                    )}

                    {/* Tab: Product */}
                    {activeTab === 'product' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ประเภทสินค้า</label>
                                <input type="text" name="ProductType" value={formData.ProductType || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">สีตัวถัง (Body Color)</label>
                                <input type="text" name="BodyColor" value={formData.BodyColor || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ประเภทหลอดไฟ</label>
                                <input type="text" name="BulbType" value={formData.BulbType || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">สีหลอดไฟ</label>
                                <input type="text" name="BulbColor" value={formData.BulbColor || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ขนาด (Dimension)</label>
                                <input type="text" name="Dimention" value={formData.Dimention || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">หมายเหตุ (Remark)</label>
                                <textarea name="QCRemark" value={formData.QCRemark || ''} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                            </div>
                        </div>
                    )}

                    {/* Tab: Images */}
                    {activeTab === 'images' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 mb-4">ใส่ URL ของรูปภาพ (เช่น Google Drive, Cloudinary)</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['PicLabel1', 'PicLabel2', 'PicManual1', 'PicDriver', 'PicRemote', 'PicQC1', 'PicQC2', 'PicQC3', 'PicQC4'].map((field) => (
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

                    {/* Footer Actions */}
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
