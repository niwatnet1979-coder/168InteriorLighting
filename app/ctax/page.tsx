'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Building2, FileText, User, MapPin } from 'lucide-react';
import Link from 'next/link';

interface CTax {
    CTaxID: string;
    CID: string;
    TaxName: string;
    TaxNumber: string;
    TaxTel: string;
    TaxAddress: string;
    TaxShip: string;
    Customer?: {
        ContractName: string;
    };
}

export default function CTaxPage() {
    const [taxes, setTaxes] = useState<CTax[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTaxes();
    }, []);

    const fetchTaxes = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('CTax')
                .select(`
                    *,
                    Customer (
                        ContractName
                    )
                `)
                .order('CTaxID', { ascending: true });

            if (error) throw error;
            setTaxes(data || []);
        } catch (err: any) {
            console.error('Error fetching tax info:', err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const filteredTaxes = taxes.filter(item =>
        item.TaxName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Customer?.ContractName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.TaxNumber?.includes(searchTerm)
    );

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ข้อมูลใบกำกับภาษี (Tax Info)</h1>
                        <p className="text-gray-500 mt-1">จัดการข้อมูลบริษัทและที่อยู่สำหรับออกใบกำกับภาษี</p>
                    </div>
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                        &larr; กลับหน้าหลัก
                    </Link>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อบริษัท, เลขผู้เสียภาษี, หรือลูกค้า..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
                            <Filter size={20} />
                            <span>ตัวกรอง</span>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* List Layout */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">กำลังโหลดข้อมูล...</div>
                    ) : filteredTaxes.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">ไม่พบข้อมูล</div>
                    ) : (
                        filteredTaxes.map((item) => (
                            <div key={item.CTaxID} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Company Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{item.TaxName}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <User size={14} /> {item.Customer?.ContractName || 'Unknown Customer'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase">เลขประจำตัวผู้เสียภาษี</p>
                                                <p className="font-medium text-gray-900">{item.TaxNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase">เบอร์โทรศัพท์</p>
                                                <p className="font-medium text-gray-900">{item.TaxTel || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="hidden md:block w-px bg-gray-100"></div>

                                    {/* Addresses */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase mb-1 flex items-center gap-1">
                                                <MapPin size={12} /> ที่อยู่บริษัท (Tax Address)
                                            </p>
                                            <p className="text-sm text-gray-700">{item.TaxAddress}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase mb-1 flex items-center gap-1">
                                                <FileText size={12} /> ที่อยู่จัดส่งเอกสาร (Invoice Delivery)
                                            </p>
                                            <p className="text-sm text-gray-700">{item.TaxShip || 'ใช้ที่อยู่เดียวกับบริษัท'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
