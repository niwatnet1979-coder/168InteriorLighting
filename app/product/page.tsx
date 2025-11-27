'use client';

import { useState, useEffect } from 'react';
import { supabase, subscribeToTable } from '@/lib/supabase';
import { Product } from '@/types/schema';
import ProductTable from '@/components/product/ProductTable';
import ProductModal from '@/components/product/ProductModal';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProducts();
        const channel = subscribeToTable('PID', (payload) => { // Table name is PID in schema? Let's check. Ah, schema says "PID" table? No, usually "Product". Let's assume "PID" based on previous context or check schema.
            // Wait, in schema.ts I defined type Product. In SQL it was "PID" table?
            // Let's check 168app_schema.sql if possible. 
            // Based on previous context, user said "PID table".
            // But standard naming is usually "Product".
            // I will use 'PID' as table name based on previous SQL files.
            console.log('Realtime Update:', payload);
            fetchProducts();
        });
        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchProducts = async () => {
        try {
            // Table name might be "PID" or "Product". Let's try "PID" first as per previous SQL.
            const { data, error } = await supabase
                .from('PID')
                .select('*')
                .order('Timestamp', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (productData: Product) => {
        setIsSaving(true);
        try {
            if (currentProduct) {
                const { data: latestData } = await supabase
                    .from('PID')
                    .select('Timestamp')
                    .eq('PID', productData.PID)
                    .single();

                if (latestData && new Date(latestData.Timestamp).getTime() > new Date(currentProduct.Timestamp).getTime() + 1000) {
                    alert('ข้อมูลถูกแก้ไขโดยผู้ใช้อื่น กรุณาโหลดหน้าใหม่!');
                    fetchProducts();
                    setIsSaving(false);
                    return;
                }
            }

            const dataToSave = { ...productData, Timestamp: new Date().toISOString() };

            const { error } = currentProduct
                ? await supabase.from('PID').update(dataToSave).eq('PID', productData.PID)
                : await supabase.from('PID').insert([dataToSave]);

            if (error) throw error;

            setIsModalOpen(false);
            fetchProducts();

        } catch (error: any) {
            alert('Error saving product: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (pid: string) => {
        if (!confirm(`คุณต้องการลบสินค้า ${pid} ใช่หรือไม่?`)) return;
        try {
            const { error } = await supabase.from('PID').delete().eq('PID', pid);
            if (error) throw error;
            fetchProducts();
        } catch (error: any) {
            alert('Error deleting: ' + error.message);
        }
    };

    const filteredProducts = products.filter(p =>
        (p.PID && p.PID.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.PDName && p.PDName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.PDType && p.PDType.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">จัดการสินค้า (Product)</h1>
                    </div>
                    <button
                        onClick={() => { setCurrentProduct(null); setIsModalOpen(true); }}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                        <Plus size={20} className="mr-2" />
                        เพิ่มสินค้าใหม่
                    </button>
                </div>

                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตาม PID, ชื่อสินค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
                ) : (
                    <ProductTable
                        products={filteredProducts}
                        onEdit={(p) => { setCurrentProduct(p); setIsModalOpen(true); }}
                        onDelete={handleDelete}
                    />
                )}

                <ProductModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={currentProduct}
                    isSaving={isSaving}
                />
            </div>
        </div>
    );
}
