'use client';

import { useState, useEffect } from 'react';
import { supabase, subscribeToTable } from '@/lib/supabase';
import { Customer } from '@/types/schema';
import CustomerTable from '@/components/customer/CustomerTable';
import CustomerModal from '@/components/customer/CustomerModal';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CustomerPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCustomers();
        const channel = subscribeToTable('Customer', (payload) => {
            console.log('Realtime Update:', payload);
            fetchCustomers();
        });
        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data, error } = await supabase
                .from('Customer')
                .select('*')
                .order('Timestamp', { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (customerData: Customer) => {
        setIsSaving(true);
        try {
            if (currentCustomer) {
                const { data: latestData } = await supabase
                    .from('Customer')
                    .select('Timestamp')
                    .eq('CID', customerData.CID)
                    .single();

                if (latestData && new Date(latestData.Timestamp).getTime() > new Date(currentCustomer.Timestamp).getTime() + 1000) {
                    alert('ข้อมูลถูกแก้ไขโดยผู้ใช้อื่น กรุณาโหลดหน้าใหม่!');
                    fetchCustomers();
                    setIsSaving(false);
                    return;
                }
            }

            const dataToSave = { ...customerData, Timestamp: new Date().toISOString() };

            const { error } = currentCustomer
                ? await supabase.from('Customer').update(dataToSave).eq('CID', customerData.CID)
                : await supabase.from('Customer').insert([dataToSave]);

            if (error) throw error;

            setIsModalOpen(false);
            fetchCustomers();

        } catch (error: any) {
            alert('Error saving customer: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (cid: string) => {
        if (!confirm(`คุณต้องการลบลูกค้า ${cid} ใช่หรือไม่?`)) return;
        try {
            const { error } = await supabase.from('Customer').delete().eq('CID', cid);
            if (error) throw error;
            fetchCustomers();
        } catch (error: any) {
            alert('Error deleting: ' + error.message);
        }
    };

    const filteredCustomers = customers.filter(c =>
        (c.CID && c.CID.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.Contract && c.Contract.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.ContractCompany && c.ContractCompany.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">จัดการลูกค้า (Customer)</h1>
                    </div>
                    <button
                        onClick={() => { setCurrentCustomer(null); setIsModalOpen(true); }}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                        <Plus size={20} className="mr-2" />
                        เพิ่มลูกค้าใหม่
                    </button>
                </div>

                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตาม CID, ชื่อ, บริษัท..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
                ) : (
                    <CustomerTable
                        customers={filteredCustomers}
                        onEdit={(c) => { setCurrentCustomer(c); setIsModalOpen(true); }}
                        onDelete={handleDelete}
                    />
                )}

                <CustomerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={currentCustomer}
                    isSaving={isSaving}
                />
            </div>
        </div>
    );
}
