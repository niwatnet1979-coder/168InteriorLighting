'use client';

import { useState, useEffect } from 'react';
import { Customer, generateID } from '@/types/schema';
import { X, User, Truck, FileText, MapPin, Phone, Building2, Plus, Edit, Trash2, Save, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ShippingAddressModal from './ShippingAddressModal';
import TaxInfoModal from './TaxInfoModal';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Customer) => Promise<void>;
    initialData?: Customer | null;
    isSaving: boolean;
}

export default function CustomerModal({ isOpen, onClose, onSave, initialData, isSaving }: CustomerModalProps) {
    const [formData, setFormData] = useState<Partial<Customer>>({});
    const [activeTab, setActiveTab] = useState<'contact' | 'shipping' | 'tax'>('contact');
    const [isEditMode, setIsEditMode] = useState(false); // New: Edit mode state

    // Related Data State
    const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
    const [taxInfos, setTaxInfos] = useState<any[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(false);

    // Sub-Modal State
    const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
    const [currentShipping, setCurrentShipping] = useState<any>(null);
    const [currentTax, setCurrentTax] = useState<any>(null);
    const [isSavingRelated, setIsSavingRelated] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
                fetchRelatedData(initialData.CID);
                setIsEditMode(false); // Start in view mode for existing customers
            } else {
                setFormData({
                    CID: generateID.customer(), // Auto-generate CID
                    Timestamp: new Date().toISOString(),
                    RecBy: 'Admin',
                    CIDSub: '1.0'
                });
                setShippingAddresses([]);
                setTaxInfos([]);
                setIsEditMode(true); // Start in edit mode for new customers
            }
            setActiveTab('contact');
        }
    }, [isOpen, initialData]);

    const fetchRelatedData = async (cid: string) => {
        setLoadingRelated(true);
        try {
            // Fetch CShip
            const { data: ships } = await supabase
                .from('CShip')
                .select('*')
                .eq('CID', cid);
            setShippingAddresses(ships || []);

            // Fetch CTax
            const { data: taxes } = await supabase
                .from('CTax')
                .select('*')
                .eq('CID', cid);
            setTaxInfos(taxes || []);
        } catch (error) {
            console.error('Error fetching related data:', error);
        } finally {
            setLoadingRelated(false);
        }
    };

    // Shipping CRUD Handlers
    const handleSaveShipping = async (data: any) => {
        setIsSavingRelated(true);
        try {
            const dataToSave = { ...data, RecBy: 'Admin', Timestamp: new Date().toISOString() };

            if (currentShipping) {
                // Update
                const { error } = await supabase
                    .from('CShip')
                    .update(dataToSave)
                    .eq('CShipID', currentShipping.CShipID);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('CShip')
                    .insert([dataToSave]);
                if (error) throw error;
            }

            setIsShippingModalOpen(false);
            setCurrentShipping(null);
            if (initialData) fetchRelatedData(initialData.CID);
        } catch (error: any) {
            alert('Error saving shipping address: ' + error.message);
        } finally {
            setIsSavingRelated(false);
        }
    };

    const handleDeleteShipping = async (id: string) => {
        if (!confirm('คุณต้องการลบที่อยู่จัดส่งนี้ใช่หรือไม่?')) return;
        try {
            const { error } = await supabase.from('CShip').delete().eq('CShipID', id);
            if (error) throw error;
            if (initialData) fetchRelatedData(initialData.CID);
        } catch (error: any) {
            alert('Error deleting: ' + error.message);
        }
    };

    // Tax CRUD Handlers
    const handleSaveTax = async (data: any) => {
        setIsSavingRelated(true);
        try {
            const dataToSave = { ...data, RecBy: 'Admin', Timestamp: new Date().toISOString() };

            if (currentTax) {
                // Update
                const { error } = await supabase
                    .from('CTax')
                    .update(dataToSave)
                    .eq('CTaxID', currentTax.CTaxID);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('CTax')
                    .insert([dataToSave]);
                if (error) throw error;
            }

            setIsTaxModalOpen(false);
            setCurrentTax(null);
            if (initialData) fetchRelatedData(initialData.CID);
        } catch (error: any) {
            alert('Error saving tax info: ' + error.message);
        } finally {
            setIsSavingRelated(false);
        }
    };

    const handleDeleteTax = async (id: string) => {
        if (!confirm('คุณต้องการลบข้อมูลภาษีนี้ใช่หรือไม่?')) return;
        try {
            const { error } = await supabase.from('CTax').delete().eq('CTaxID', id);
            if (error) throw error;
            if (initialData) fetchRelatedData(initialData.CID);
        } catch (error: any) {
            alert('Error deleting: ' + error.message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData as Customer);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-800">
                            {initialData ? (isEditMode ? 'แก้ไขข้อมูลลูกค้า' : 'ข้อมูลลูกค้า') : 'เพิ่มลูกค้าใหม่'}
                        </h2>
                        {initialData && !isEditMode && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                โหมดดูข้อมูล
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {initialData && (
                            <>
                                {!isEditMode ? (
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Edit size={18} /> แก้ไข
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsEditMode(false);
                                            setFormData(initialData); // Reset to original data
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <XCircle size={18} /> ยกเลิกการแก้ไข
                                    </button>
                                )}
                            </>
                        )}
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700" title="ปิด">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex border-b px-6 bg-gray-50 sticky top-[80px] z-10">
                    <button onClick={() => setActiveTab('contact')} className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === 'contact' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <User size={18} /> ข้อมูลติดต่อ
                    </button>
                    <button onClick={() => setActiveTab('shipping')} className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === 'shipping' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <Truck size={18} /> ข้อมูลจัดส่ง ({shippingAddresses.length})
                    </button>
                    <button onClick={() => setActiveTab('tax')} className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === 'tax' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <FileText size={18} /> ข้อมูลใบกำกับภาษี ({taxInfos.length})
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {activeTab === 'contact' && (
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">รหัสลูกค้า (CID)</label>
                                    <input
                                        type="text"
                                        name="CID"
                                        value={formData.CID || ''}
                                        onChange={handleChange}
                                        readOnly
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ชื่อผู้ติดต่อ *</label>
                                    <input
                                        type="text"
                                        name="ContractName"
                                        value={formData.ContractName || ''}
                                        onChange={handleChange}
                                        readOnly={!isEditMode}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border ${!isEditMode ? 'bg-gray-50' : ''}`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                                    <input
                                        type="text"
                                        name="ContractTel"
                                        value={formData.ContractTel || ''}
                                        onChange={handleChange}
                                        readOnly={!isEditMode}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border ${!isEditMode ? 'bg-gray-50' : ''}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">บริษัท</label>
                                    <input
                                        type="text"
                                        name="ContractCompany"
                                        value={formData.ContractCompany || ''}
                                        onChange={handleChange}
                                        readOnly={!isEditMode}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border ${!isEditMode ? 'bg-gray-50' : ''}`}
                                    />
                                </div>

                                {/* Social Media Section */}
                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
                                        ช่องทางการติดต่อ Social Media
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Line ID</label>
                                            <input
                                                type="text"
                                                name="LineID"
                                                value={formData.LineID || ''}
                                                onChange={handleChange}
                                                readOnly={!isEditMode}
                                                placeholder={isEditMode ? "@example หรือ line.me/ti/p/~xxxxx" : ""}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border ${!isEditMode ? 'bg-gray-50' : ''}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Facebook</label>
                                            <input
                                                type="text"
                                                name="Facebook"
                                                value={formData.Facebook || ''}
                                                onChange={handleChange}
                                                readOnly={!isEditMode}
                                                placeholder={isEditMode ? "facebook.com/xxxxx" : ""}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border ${!isEditMode ? 'bg-gray-50' : ''}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Instagram</label>
                                            <input
                                                type="text"
                                                name="Instagram"
                                                value={formData.Instagram || ''}
                                                onChange={handleChange}
                                                readOnly={!isEditMode}
                                                placeholder={isEditMode ? "@username" : ""}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border ${!isEditMode ? 'bg-gray-50' : ''}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">อื่นๆ</label>
                                            <input
                                                type="text"
                                                name="Other"
                                                value={formData.Other || ''}
                                                onChange={handleChange}
                                                readOnly={!isEditMode}
                                                placeholder={isEditMode ? "Twitter, TikTok, etc." : ""}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border ${!isEditMode ? 'bg-gray-50' : ''}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Source */}
                                <div className="md:col-span-2 mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ลูกค้ามาจากช่องทางใด</label>
                                    <select
                                        name="ComeFrom"
                                        value={formData.ComeFrom || ''}
                                        onChange={handleChange}
                                        disabled={!isEditMode}
                                        className={`block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? 'bg-gray-50' : ''}`}
                                    >
                                        <option value="">-- เลือกช่องทาง --</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="LineOA">Line OA</option>
                                        <option value="Google">Google</option>
                                        <option value="Walkin">Walk-in</option>
                                        <option value="Friend">แนะนำจากเพื่อน</option>
                                        <option value="Other">อื่นๆ</option>
                                    </select>
                                </div>
                            </div>
                            {isEditMode && (
                                <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (initialData) {
                                                setIsEditMode(false);
                                                setFormData(initialData);
                                            } else {
                                                onClose();
                                            }
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
                                    >
                                        {isSaving ? 'กำลังบันทึก...' : (
                                            <>
                                                <Save size={18} /> บันทึกข้อมูล
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium text-gray-700">รายการที่อยู่จัดส่ง</h3>
                                {initialData && (
                                    <button
                                        onClick={() => { setCurrentShipping(null); setIsShippingModalOpen(true); }}
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                        <Plus size={16} /> เพิ่มที่อยู่
                                    </button>
                                )}
                            </div>
                            {loadingRelated ? (
                                <div className="text-center text-gray-500 py-4">กำลังโหลดข้อมูล...</div>
                            ) : shippingAddresses.length === 0 ? (
                                <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                    ยังไม่มีข้อมูลที่อยู่จัดส่ง
                                    {initialData && <p className="text-xs mt-2">คลิกปุ่ม "เพิ่มที่อยู่" เพื่อเพิ่มข้อมูล</p>}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {shippingAddresses.map((ship) => (
                                        <div key={ship.CShipID} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <Truck size={18} className="text-blue-600" />
                                                    <span className="font-semibold text-gray-800">{ship.ShipName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {ship.ShipMap && (
                                                        <a href={ship.ShipMap} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1">
                                                            <MapPin size={14} /> แผนที่
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => { setCurrentShipping(ship); setIsShippingModalOpen(true); }}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1"
                                                        title="แก้ไข"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteShipping(ship.CShipID)}
                                                        className="text-red-600 hover:text-red-900 p-1"
                                                        title="ลบ"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-600 ml-6">
                                                <p>{ship.ShipAddress}</p>
                                                <div className="flex items-center gap-2 mt-1 text-gray-500">
                                                    <Phone size={14} />
                                                    <span>{ship.ShipTel}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'tax' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium text-gray-700">รายการข้อมูลภาษี</h3>
                                {initialData && (
                                    <button
                                        onClick={() => { setCurrentTax(null); setIsTaxModalOpen(true); }}
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                        <Plus size={16} /> เพิ่มข้อมูลภาษี
                                    </button>
                                )}
                            </div>
                            {loadingRelated ? (
                                <div className="text-center text-gray-500 py-4">กำลังโหลดข้อมูล...</div>
                            ) : taxInfos.length === 0 ? (
                                <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                    ยังไม่มีข้อมูลใบกำกับภาษี
                                    {initialData && <p className="text-xs mt-2">คลิกปุ่ม "เพิ่มข้อมูลภาษี" เพื่อเพิ่มข้อมูล</p>}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {taxInfos.map((tax) => (
                                        <div key={tax.CTaxID} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm bg-yellow-50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={18} className="text-yellow-600" />
                                                    <span className="font-semibold text-gray-800">{tax.TaxName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => { setCurrentTax(tax); setIsTaxModalOpen(true); }}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1"
                                                        title="แก้ไข"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTax(tax.CTaxID)}
                                                        className="text-red-600 hover:text-red-900 p-1"
                                                        title="ลบ"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="ml-6 text-sm text-gray-600 space-y-1">
                                                <p><span className="font-medium">เลขผู้เสียภาษี:</span> {tax.TaxNumber}</p>
                                                <p><span className="font-medium">ที่อยู่:</span> {tax.TaxAddress}</p>
                                                <p><span className="font-medium">จัดส่งเอกสาร:</span> {tax.TaxShip || 'ใช้ที่อยู่เดียวกับบริษัท'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sub-Modals */}
                {initialData && (
                    <>
                        <ShippingAddressModal
                            isOpen={isShippingModalOpen}
                            onClose={() => { setIsShippingModalOpen(false); setCurrentShipping(null); }}
                            onSave={handleSaveShipping}
                            initialData={currentShipping}
                            customerCID={initialData.CID}
                            isSaving={isSavingRelated}
                        />
                        <TaxInfoModal
                            isOpen={isTaxModalOpen}
                            onClose={() => { setIsTaxModalOpen(false); setCurrentTax(null); }}
                            onSave={handleSaveTax}
                            initialData={currentTax}
                            customerCID={initialData.CID}
                            isSaving={isSavingRelated}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
