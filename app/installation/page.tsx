'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Filter, Calendar, User, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Installation {
    IID: string;
    TimeStamp: string;
    InstallationTeam: string;
    Status: string;
    PlanDate: string;
    CompleteDate: string;
    ShipTravelPrice: string;
    InstallationPrice: string;
    Remark: string;
    Sale?: {
        SID: string;
        Bill?: {
            Customer?: {
                ContractName: string;
                ContractTel: string;
            }
        }
    }
}

import InstallationModal from '@/components/installation/InstallationModal';

export default function InstallationPage() {
    const [installations, setInstallations] = useState<Installation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInstallation, setSelectedInstallation] = useState<Installation | undefined>(undefined);

    useEffect(() => {
        fetchInstallations();
    }, []);

    const fetchInstallations = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('Installation_Ship')
                .select(`
                    *,
                    Sale:SID (
                        SID,
                        Bill:BID (
                            Customer:CID (
                                ContractName,
                                ContractTel
                            )
                        )
                    )
                `)
                .order('IID', { ascending: true });

            if (error) throw error;
            setInstallations(data || []);
        } catch (error) {
            console.error('Error fetching installations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedInstallation(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (item: Installation) => {
        setSelectedInstallation(item);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        fetchInstallations(); // Refresh data
        setIsModalOpen(false);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in progress': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'canceled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredInstallations = installations.filter(item =>
        item.IID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.InstallationTeam?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Sale?.Bill?.Customer?.ContractName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">งานติดตั้ง (Installation)</h1>
                        <p className="text-gray-500 mt-1">จัดการตารางงานและสถานะการติดตั้ง</p>
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
                            placeholder="ค้นหา IID, ทีมช่าง, หรือชื่อลูกค้า..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
                            <Filter size={20} />
                            <span>ตัวกรอง</span>
                        </button>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                        >
                            <Plus size={20} />
                            <span>เพิ่มงานใหม่</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                    <th className="p-4">IID</th>
                                    <th className="p-4">ลูกค้า</th>
                                    <th className="p-4">ทีมติดตั้ง</th>
                                    <th className="p-4">วันที่นัดหมาย</th>
                                    <th className="p-4">สถานะ</th>
                                    <th className="p-4 text-right">ค่าติดตั้ง</th>
                                    <th className="p-4 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                                    </tr>
                                ) : filteredInstallations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">ไม่พบข้อมูล</td>
                                    </tr>
                                ) : (
                                    filteredInstallations.map((item) => (
                                        <tr key={item.IID} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-blue-600">{item.IID}</td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{item.Sale?.Bill?.Customer?.ContractName || '-'}</span>
                                                    <span className="text-xs text-gray-500">{item.Sale?.Bill?.Customer?.ContractTel || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-gray-400" />
                                                    <span className="text-gray-700">{item.InstallationTeam}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar size={16} />
                                                    <span>{item.PlanDate || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.Status)}`}>
                                                    {item.Status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-medium text-gray-900">
                                                {Number(item.InstallationPrice).toLocaleString()} ฿
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <span className="sr-only">Edit</span>
                                                    ✏️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                <InstallationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={selectedInstallation}
                />
            </div>
        </div>
    );
}
