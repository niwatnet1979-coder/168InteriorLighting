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
                    EID: '',
                    Timestamp: new Date().toISOString(),
                    RecBy: 'Admin',
                    TeamType: 'SALE',
                    UserType: 'user'
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="ปิด">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">รหัสพนักงาน (EID)</label>
                        <input type="text" name="EID" value={formData.EID || ''} onChange={handleChange} readOnly={!!initialData} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${initialData ? 'bg-gray-100' : ''}`} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ชื่อเล่น</label>
                        <input type="text" name="NickName" value={formData.NickName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ชื่อจริง</label>
                        <input type="text" name="FullName" value={formData.FullName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
                        <input type="text" name="LastName" value={formData.LastName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ชื่อทีม</label>
                        <input type="text" name="TeamName" value={formData.TeamName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ประเภททีม</label>
                        <select name="TeamType" value={formData.TeamType || 'SALE'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" aria-label="ประเภททีม">
                            <option value="บริหาร">บริหาร</option>
                            <option value="SALE">SALE</option>
                            <option value="QC">QC</option>
                            <option value="ช่าง">ช่าง</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="Email" value={formData.Email || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User Type</label>
                        <select name="UserType" value={formData.UserType || 'user'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" aria-label="User Type">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">เบอร์โทร 1</label>
                        <input type="tel" name="Tel1" value={formData.Tel1 || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">เบอร์โทร 2</label>
                        <input type="tel" name="Tel2" value={formData.Tel2 || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
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
