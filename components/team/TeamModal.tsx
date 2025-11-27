'use client';

import { useState, useEffect } from 'react';
import { Team } from '@/types/schema';
import { X } from 'lucide-react';

interface TeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (team: Team) => Promise<void>;
    initialData?: Team | null;
    isSaving: boolean;
}

export default function TeamModal({ isOpen, onClose, onSave, initialData, isSaving }: TeamModalProps) {
    const [formData, setFormData] = useState<Partial<Team>>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    TID: '',
                    Timestamp: new Date().toISOString(),
                    RecBy: 'Admin',
                    TStatus: 'Active',
                    TStartWork: new Date().toISOString().split('T')[0]
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData as Team);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'แก้ไขข้อมูลทีมงาน' : 'เพิ่มทีมงานใหม่'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">รหัสพนักงาน (TID)</label>
                        <input type="text" name="TID" value={formData.TID || ''} onChange={handleChange} readOnly={!!initialData} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${initialData ? 'bg-gray-100' : ''}`} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                        <input type="text" name="TName" value={formData.TName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ชื่อเล่น</label>
                        <input type="text" name="TNickName" value={formData.TNickName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ตำแหน่ง</label>
                        <input type="text" name="TPosition" value={formData.TPosition || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                        <input type="text" name="TTel" value={formData.TTel || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Line ID</label>
                        <input type="text" name="TLine" value={formData.TLine || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">วันที่เริ่มงาน</label>
                        <input type="date" name="TStartWork" value={formData.TStartWork || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">สถานะ</label>
                        <select name="TStatus" value={formData.TStatus || 'Active'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">หมายเหตุ</label>
                        <textarea name="TRemark" value={formData.TRemark || ''} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 mt-6 pt-4 border-t">
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
