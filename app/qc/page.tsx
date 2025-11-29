'use client';

import { useState, useEffect } from 'react';
import { supabase, subscribeToTable } from '@/lib/supabase';
import { QC } from '@/types/schema';
import QCTable from '@/components/qc/QCTable';
import QCModal from '@/components/qc/QCModal';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function QCPage() {
    const [qcList, setQCList] = useState<QC[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQC, setCurrentQC] = useState<QC | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Fetch Data & Subscribe
    useEffect(() => {
        fetchQC();

        const channel = subscribeToTable('QC', (payload) => {
            console.log('Realtime Update:', payload);
            fetchQC();
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchQC = async () => {
        try {
            const { data, error } = await supabase
                .from('QC')
                .select('*')
                .order('TimeStamp', { ascending: false });

            if (error) throw error;
            setQCList(data || []);
        } catch (error) {
            console.error('Error fetching QC:', error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Save with Optimistic Locking
    const handleSave = async (qcData: QC) => {
        setIsSaving(true);
        try {
            if (currentQC) {
                const { data: latestData } = await supabase
                    .from('QC')
                    .select('TimeStamp')
                    .eq('SN', qcData.SN)
                    .single();

                if (latestData && new Date(latestData.TimeStamp).getTime() > new Date(currentQC.TimeStamp).getTime() + 1000) {
                    alert('ข้อมูลถูกแก้ไขโดยผู้ใช้อื่น กรุณาโหลดหน้าใหม่!');
                    fetchQC();
                    setIsSaving(false);
                    return;
                }
            }

            const dataToSave = { ...qcData, TimeStamp: new Date().toISOString() };

            const { error } = currentQC
                ? await supabase.from('QC').update(dataToSave).eq('SN', qcData.SN)
                : await supabase.from('QC').insert([dataToSave]);

            if (error) throw error;

            setIsModalOpen(false);
            fetchQC();

        } catch (error: any) {
            alert('Error saving QC: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (sn: string) => {
        if (!confirm(`คุณต้องการลบรายการ QC ${sn} ใช่หรือไม่?`)) return;
        try {
            const { error } = await supabase.from('QC').delete().eq('SN', sn);
            if (error) throw error;
            fetchQC();
        } catch (error: any) {
            alert('Error deleting: ' + error.message);
        }
    };

    // Filter Logic
    const filteredQC = qcList.filter(qc =>
        (qc.SN && qc.SN.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (qc.ShopLabel && qc.ShopLabel.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (qc.Staff && qc.Staff.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">จัดการ QC (Quality Control)</h1>
                    </div>
                    <button
                        onClick={() => { setCurrentQC(null); setIsModalOpen(true); }}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                        <Plus size={20} className="mr-2" />
                        เพิ่มรายการ QC
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตาม SN, ร้านค้า, หรือพนักงาน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
                ) : (
                    <QCTable
                        qcList={filteredQC}
                        onEdit={(qc) => { setCurrentQC(qc); setIsModalOpen(true); }}
                        onDelete={handleDelete}
                    />
                )}

                {/* Modal */}
                <QCModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={currentQC}
                    isSaving={isSaving}
                />
            </div>
        </div>
    );
}
