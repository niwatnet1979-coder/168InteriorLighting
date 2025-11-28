'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Truck, MapPin, Phone, User } from 'lucide-react';
import Link from 'next/link';

interface CShip {
    CShipID: string;
    CID: string;
    ShipName: string;
    ShipTel: string;
    ShipAddress: string;
    ShipMap: string;
    Customer?: {
        ContractName: string;
    };
}

export default function CShipPage() {
    const [ships, setShips] = useState<CShip[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchShips();
    }, []);

    const fetchShips = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('CShip')
                .select(`
                    *,
                    Customer (
                        ContractName
                    )
                `)
                .order('CShipID', { ascending: true });

            if (error) throw error;
            setShips(data || []);
        } catch (err: any) {
            console.error('Error fetching shipping addresses:', err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const filteredShips = ships.filter(item =>
        item.ShipName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Customer?.ContractName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ShipAddress?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ที่อยู่จัดส่ง (Shipping Addresses)</h1>
                        <p className="text-gray-500 mt-1">จัดการข้อมูลที่อยู่สำหรับจัดส่งสินค้าและติดตั้ง</p>
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
                            placeholder="ค้นหาชื่อผู้รับ, ลูกค้า, หรือที่อยู่..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
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

                {/* Grid Layout for Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-gray-500">กำลังโหลดข้อมูล...</div>
                    ) : filteredShips.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">ไม่พบข้อมูล</div>
                    ) : (
                        filteredShips.map((item) => (
                            <div key={item.CShipID} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
                                            <Truck size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{item.ShipName}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <User size={12} /> {item.Customer?.ContractName || 'Unknown Customer'}
                                            </p>
                                        </div>
                                    </div>
                                    {item.ShipMap && (
                                        <a
                                            href={item.ShipMap}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50"
                                            title="ดูแผนที่"
                                        >
                                            <MapPin size={20} />
                                        </a>
                                    )}
                                </div>

                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="mt-1 text-gray-400 shrink-0" />
                                        <p>
                                            {item.ShipAddress}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-gray-400" />
                                        <span>{item.ShipTel}</span>
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
