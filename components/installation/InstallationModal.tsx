'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Save, Calendar, User, DollarSign, FileText } from 'lucide-react';

interface InstallationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: any;
}

export default function InstallationModal({ isOpen, onClose, onSave, initialData }: InstallationModalProps) {
    const [formData, setFormData] = useState({
        IID: '',
        SID: '',
        InstallationTeam: '',
        Status: 'Pending',
        PlanDate: '',
        CompleteDate: '',
        ShipTravelPrice: '0',
        InstallationPrice: '0',
        Remark: '',
        QCDefect: ''
    });
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSales();
            if (initialData) {
                setFormData({
                    IID: initialData.IID,
                    SID: initialData.SID,
                    InstallationTeam: initialData.InstallationTeam || '',
                    Status: initialData.Status || 'Pending',
                    PlanDate: initialData.PlanDate || '',
                    CompleteDate: initialData.CompleteDate || '',
                    ShipTravelPrice: initialData.ShipTravelPrice || '0',
                    InstallationPrice: initialData.InstallationPrice || '0',
                    Remark: initialData.Remark || '',
                    QCDefect: initialData.QCDefect || ''
                });
            } else {
                // Reset form for new entry
                setFormData({
                    IID: '', // Will be auto-generated or handled by backend if needed, but here we might need manual input or auto-gen logic
                    SID: '',
                    InstallationTeam: '',
                    Status: 'Pending',
                    PlanDate: '',
                    CompleteDate: '',
                    ShipTravelPrice: '0',
                    InstallationPrice: '0',
                    Remark: '',
                    QCDefect: ''
                });
                generateNewIID();
            }
        }
    }, [isOpen, initialData]);

    const fetchSales = async () => {
        const { data } = await supabase
            .from('Sale')
            .select('SID, Bill(Customer(ContractName))')
            .order('SID', { ascending: false })
            .limit(50); // Limit for dropdown
        setSales(data || []);
    };

    const generateNewIID = async () => {
        // Simple auto-gen logic: Get max IID and increment
        const { data } = await supabase
            .from('Installation_Ship')
            .select('IID')
            .order('IID', { ascending: false })
            .limit(1);

        if (data && data.length > 0) {
            const lastId = data[0].IID;
            const num = parseInt(lastId.replace(/\D/g, '')) || 0;
            setFormData(prev => ({ ...prev, IID: `I${String(num + 1).padStart(3, '0')}` }));
        } else {
            setFormData(prev => ({ ...prev, IID: 'I001' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                Timestamp: new Date().toISOString(),
                RecBy: 'Admin' // Hardcoded for now
            };

            if (initialData) {
                // Update
                const { error } = await supabase
                    .from('Installation_Ship')
                    .update(payload)
                    .eq('IID', initialData.IID);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('Installation_Ship')
                    .insert([payload]);
                if (error) throw error;
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving installation:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {initialData ? 'แก้ไขงานติดตั้ง' : 'เพิ่มงานติดตั้งใหม่'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Row 1: IID & Sale Ref */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสงาน (IID)</label>
                            <input
                                type="text"
                                value={formData.IID}
                                disabled
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">อ้างอิงการขาย (SID)</label>
                            <select
                                value={formData.SID}
                                onChange={(e) => setFormData({ ...formData, SID: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">เลือกรายการขาย...</option>
                                {sales.map((sale) => (
                                    <option key={sale.SID} value={sale.SID}>
                                        {sale.SID} - {sale.Bill?.Customer?.ContractName || 'Unknown Customer'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Team & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ทีมติดตั้ง</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={formData.InstallationTeam}
                                    onChange={(e) => setFormData({ ...formData, InstallationTeam: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="ระบุชื่อทีม หรือช่าง"
                                    list="teams"
                                />
                                <datalist id="teams">
                                    <option value="Team A" />
                                    <option value="Team B" />
                                    <option value="ช่างหนึ่ง" />
                                </datalist>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">สถานะงาน</label>
                            <select
                                value={formData.Status}
                                onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Pending">Pending (รอดำเนินการ)</option>
                                <option value="In Progress">In Progress (กำลังติดตั้ง)</option>
                                <option value="Completed">Completed (เสร็จสิ้น)</option>
                                <option value="Canceled">Canceled (ยกเลิก)</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่นัดหมาย (Plan Date)</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    value={formData.PlanDate}
                                    onChange={(e) => setFormData({ ...formData, PlanDate: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เสร็จสิ้น (Complete Date)</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    value={formData.CompleteDate}
                                    onChange={(e) => setFormData({ ...formData, CompleteDate: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Prices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ค่าเดินทาง/ขนส่ง</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    value={formData.ShipTravelPrice}
                                    onChange={(e) => setFormData({ ...formData, ShipTravelPrice: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ค่าติดตั้ง</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    value={formData.InstallationPrice}
                                    onChange={(e) => setFormData({ ...formData, InstallationPrice: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 5: Remark */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ (Remark)</label>
                        <textarea
                            value={formData.Remark}
                            onChange={(e) => setFormData({ ...formData, Remark: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="รายละเอียดเพิ่มเติม..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
