'use client';

import { useState, useEffect } from 'react';
import { supabase, subscribeToTable } from '@/lib/supabase';
import { Sale } from '@/types/schema';
import SaleTable from '@/components/sale/SaleTable';
import SaleModal from '@/components/sale/SaleModal';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SalePage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSale, setCurrentSale] = useState<Sale | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Fetch Data & Subscribe to Realtime
    useEffect(() => {
        fetchSales();

        // Realtime Subscription
        const channel = subscribeToTable('Sale', (payload) => {
            console.log('Realtime Update:', payload);
            // Refresh data when any change happens
            fetchSales();

            // Optional: Show toast notification
            // toast.info('ข้อมูลมีการเปลี่ยนแปลง');
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchSales = async () => {
        try {
            const { data, error } = await supabase
                .from('Sale')
                .select('*')
                .order('Timestamp', { ascending: false });

            if (error) throw error;
            setSales(data || []);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Save with Optimistic Locking
    const handleSave = async (saleData: Sale) => {
        setIsSaving(true);
        try {
            // Check for Optimistic Lock (if updating)
            if (currentSale) {
                const { data: latestData } = await supabase
                    .from('Sale')
                    .select('Timestamp')
                    .eq('SID', saleData.SID)
                    .single();

                // Compare Timestamps (Allow 1s difference)
                if (latestData && new Date(latestData.Timestamp).getTime() > new Date(currentSale.Timestamp).getTime() + 1000) {
                    alert('ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นกรุณาโหลดหน้าใหม่!');
                    fetchSales(); // Refresh to get latest data
                    setIsSaving(false);
                    return;
                }
            }

            // Update Timestamp
            const dataToSave = { ...saleData, Timestamp: new Date().toISOString() };

            const { error } = currentSale
                ? await supabase.from('Sale').update(dataToSave).eq('SID', saleData.SID)
                : await supabase.from('Sale').insert([dataToSave]);

            if (error) throw error;

            setIsModalOpen(false);
            fetchSales(); // Refresh list

        } catch (error: any) {
            alert('Error saving data: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (sid: string) => {
        if (!confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) return;
        try {
            const { error } = await supabase.from('Sale').delete().eq('SID', sid);
            if (error) throw error;
            fetchSales();
        } catch (error: any) {
            alert('Error deleting: ' + error.message);
        }
    };

    // Filter Logic
    const filteredSales = sales.filter(s =>
        s.SID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.CID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.Staff?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <h1 className="text-2xl font-bold text-gray-800">จัดการงานขาย (Sale)</h1>
                    </div>
                    <button
                        onClick={() => { setCurrentSale(null); setIsModalOpen(true); }}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                        <Plus size={20} className="mr-2" />
                        เพิ่มงานขายใหม่
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตาม SID, ลูกค้า, หรือพนักงาน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
                ) : (
                    <SaleTable
                        sales={filteredSales}
                        onEdit={(sale) => { setCurrentSale(sale); setIsModalOpen(true); }}
                        onDelete={handleDelete}
                    />
                )}

                {/* Modal */}
                <SaleModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={currentSale}
                    isSaving={isSaving}
                />
            </div>
        </div>
    );
}
