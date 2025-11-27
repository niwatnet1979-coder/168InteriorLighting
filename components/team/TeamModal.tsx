'use client';

import { useState, useEffect } from 'react';
import { Team, generateID } from '@/types/schema';
import { X } from 'lucide-react';

interface TeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (team: Team) => Promise<void>;
    initialData?: Team | null;
    isSaving: boolean;
    latestEID?: string;
    uniqueTeamNames?: string[];
    uniqueTeamTypes?: string[];
    uniqueJobs?: string[];
}

export default function TeamModal({ isOpen, onClose, onSave, initialData, isSaving, latestEID, uniqueTeamNames = [], uniqueTeamTypes = [], uniqueJobs = [] }: TeamModalProps) {
    const [formData, setFormData] = useState<Partial<Team>>({});
    const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'work' | 'personal'>('general');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    EID: generateID.team(latestEID),
                    Timestamp: new Date().toISOString(),
                    RecBy: 'Admin',
                    TeamType: 'SALE',
                    UserType: 'user'
                });
            }
            setActiveTab('general');
        }
    }, [isOpen, initialData, latestEID]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData as Team);
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'ข้อมูลทั่วไป' },
        { id: 'contact', label: 'ข้อมูลติดต่อ' },
        { id: 'work', label: 'ข้อมูลการทำงาน' },
        { id: 'personal', label: 'ข้อมูลส่วนตัว' }
    ] as const;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="ปิด">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b bg-gray-50 sticky top-[73px] z-10">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Tab 1: General Info */}
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">รหัสพนักงาน (EID) *</label>
                                <input type="text" name="EID" value={formData.EID || ''} onChange={handleChange} readOnly={!!initialData} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border ${initialData ? 'bg-gray-100' : ''}`} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ชื่อเล่น *</label>
                                <input type="text" name="NickName" value={formData.NickName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ชื่อจริง</label>
                                <input type="text" name="FullName" value={formData.FullName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
                                <input type="text" name="LastName" value={formData.LastName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>

                            {/* TeamName with datalist */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ชื่อทีม</label>
                                <input
                                    type="text"
                                    name="TeamName"
                                    value={formData.TeamName || ''}
                                    onChange={handleChange}
                                    list="teamNameList"
                                    placeholder="เลือกหรือพิมพ์ชื่อทีม"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                />
                                <datalist id="teamNameList">
                                    {uniqueTeamNames.map((name, idx) => (
                                        <option key={idx} value={name} />
                                    ))}
                                </datalist>
                            </div>

                            {/* TeamType with datalist */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ประเภททีม</label>
                                <input
                                    type="text"
                                    name="TeamType"
                                    value={formData.TeamType || ''}
                                    onChange={handleChange}
                                    list="teamTypeList"
                                    placeholder="เลือกหรือพิมพ์ประเภททีม"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                />
                                <datalist id="teamTypeList">
                                    {uniqueTeamTypes.map((type, idx) => (
                                        <option key={idx} value={type} />
                                    ))}
                                </datalist>
                            </div>

                            {/* Job with datalist */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ตำแหน่ง (Job)</label>
                                <input
                                    type="text"
                                    name="Job"
                                    value={formData.Job || ''}
                                    onChange={handleChange}
                                    list="jobList"
                                    placeholder="เลือกหรือพิมพ์ตำแหน่ง"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                />
                                <datalist id="jobList">
                                    {uniqueJobs.map((job, idx) => (
                                        <option key={idx} value={job} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ระดับ (Level)</label>
                                <select name="Level" value={formData.Level || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" aria-label="ระดับ">
                                    <option value="">-- เลือก --</option>
                                    <option value="CEO">CEO</option>
                                    <option value="CTO">CTO</option>
                                    <option value="Junior">Junior</option>
                                    <option value="Senior">Senior</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">User Type</label>
                                <select name="UserType" value={formData.UserType || 'user'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" aria-label="User Type">
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Contact Info */}
                    {activeTab === 'contact' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="Email" value={formData.Email || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">เบอร์โทร 1</label>
                                <input type="tel" name="Tel1" value={formData.Tel1 || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">เบอร์โทร 2</label>
                                <input type="tel" name="Tel2" value={formData.Tel2 || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">ที่อยู่</label>
                                <textarea name="Address" value={formData.Address || ''} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Work Info */}
                    {activeTab === 'work' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">วันเริ่มงาน (StartDate)</label>
                                <input type="text" name="StartDate" value={formData.StartDate || ''} onChange={handleChange} placeholder="DD/MM/YYYY" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">วันสิ้นสุด (EndDate)</label>
                                <input type="text" name="EndDate" value={formData.EndDate || ''} onChange={handleChange} placeholder="DD/MM/YYYY" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ประเภทการทำงาน (WorkType)</label>
                                <select name="WorkType" value={formData.WorkType || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" aria-label="ประเภทการทำงาน">
                                    <option value="">-- เลือก --</option>
                                    <option value="ประจำ">ประจำ</option>
                                    <option value="ทดลองงาน 3 เดือน">ทดลองงาน 3 เดือน</option>
                                    <option value="พาร์ทไทม์">พาร์ทไทม์</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ประเภทการจ่าย (PayType)</label>
                                <select name="PayType" value={formData.PayType || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" aria-label="ประเภทการจ่าย">
                                    <option value="">-- เลือก --</option>
                                    <option value="monthly">รายเดือน (Monthly)</option>
                                    <option value="Daily">รายวัน (Daily)</option>
                                    <option value="Hourly">รายชั่วโมง (Hourly)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">อัตราค่าจ้าง (PayRate)</label>
                                <input type="text" name="PayRate" value={formData.PayRate || ''} onChange={handleChange} placeholder="เช่น 30000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">อัตราค่าคอมมิชชั่น (IncentiveRate)</label>
                                <input type="text" name="IncentiveRate" value={formData.IncentiveRate || ''} onChange={handleChange} placeholder="เช่น 1000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Personal Info */}
                    {activeTab === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">เลขบัตรประชาชน (CitizenID)</label>
                                <input type="text" name="CitizenID" value={formData.CitizenID || ''} onChange={handleChange} maxLength={13} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">วันเกิด (BirthDay)</label>
                                <input type="text" name="BirthDay" value={formData.BirthDay || ''} onChange={handleChange} placeholder="DD/MM/YYYY" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ธนาคาร (Bank)</label>
                                <select name="Bank" value={formData.Bank || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" aria-label="ธนาคาร">
                                    <option value="">-- เลือก --</option>
                                    <option value="TTB">ทีเอ็มบีธนชาต (TTB)</option>
                                    <option value="SCB">ไทยพาณิชย์ (SCB)</option>
                                    <option value="KBANK">กสิกรไทย (KBANK)</option>
                                    <option value="KTB">กรุงไทย (KTB)</option>
                                    <option value="BBL">กรุงเทพ (BBL)</option>
                                    <option value="BAY">กรุงศรีอยุธยา (BAY)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">เลขบัญชี (ACNumber)</label>
                                <input type="text" name="ACNumber" value={formData.ACNumber || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">รูปถ่าย (Pic URL)</label>
                                <input type="text" name="Pic" value={formData.Pic || ''} onChange={handleChange} placeholder="URL ของรูปถ่าย" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">รูปบัตรประชาชน (CitizenIDPic URL)</label>
                                <input type="text" name="CitizenIDPic" value={formData.CitizenIDPic || ''} onChange={handleChange} placeholder="URL ของรูปบัตรประชาชน" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">รูปทะเบียนบ้าน (HouseRegPic URL)</label>
                                <input type="text" name="HouseRegPic" value={formData.HouseRegPic || ''} onChange={handleChange} placeholder="URL ของรูปทะเบียนบ้าน" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            ยกเลิก
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
