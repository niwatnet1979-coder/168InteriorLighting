'use client';

import { useState, useEffect, useRef } from 'react';
import { X, FileText, User, Package, Save, Edit, Plus, Trash2, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Bill, Customer, Sale, Team, CTax, generateID } from '@/types/schema';
import CustomerModal from '../customer/CustomerModal';
import SaleModal from '../sale/SaleModal';
import TaxInfoModal from '../customer/TaxInfoModal';

interface BillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    bill: Bill | null;
}

export default function BillModal({ isOpen, onClose, onSave, bill }: BillModalProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Bill>>({});

    // Multiple Sale Items (up to 20)
    const [saleItems, setSaleItems] = useState<Sale[]>([]);
    const [initialSaleIds, setInitialSaleIds] = useState<string[]>([]);

    // Dropdown Data
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Search Queries
    const [cidQuery, setCidQuery] = useState('');
    const [sellerQuery, setSellerQuery] = useState('');

    const [activeDropdown, setActiveDropdown] = useState<'cid' | 'seller' | null>(null);

    // Modals for creating new records
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showTaxModal, setShowTaxModal] = useState(false);
    const [editingSaleItem, setEditingSaleItem] = useState<Sale | null>(null);

    // Tax Info State
    const [taxInfos, setTaxInfos] = useState<CTax[]>([]);
    const [selectedTax, setSelectedTax] = useState<CTax | null>(null);

    // Refs for input fields
    const cidInputRef = useRef<HTMLInputElement>(null);
    const sellerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchDropdownData();
            if (bill) {
                // Edit existing bill
                setFormData(bill);
                setIsEditMode(false);
                setCidQuery(bill.CID || '');
                setSellerQuery(bill.Seller || '');

                // Fetch related sales for this bill
                fetchBillSales(bill.BID);
            } else {
                // Create new bill
                const newBID = generateID.bill();
                const today = new Date().toISOString().split('T')[0];
                setFormData({
                    BID: newBID,
                    TimeStamp: new Date().toISOString(),
                    RecBy: 'EID0001',
                    Vat: '7',
                    BillDate: today
                });
                setIsEditMode(true);
                setSaleItems([]);
                setCidQuery('');
                setSellerQuery('');
            }
        }
    }, [isOpen, bill]);

    // Fetch Tax Info when CID changes
    useEffect(() => {
        if (formData.CID) {
            fetchCustomerTaxInfo(formData.CID);
        } else {
            setTaxInfos([]);
            setSelectedTax(null);
        }
    }, [formData.CID]);

    const fetchCustomerTaxInfo = async (cid: string) => {
        try {
            const { data, error } = await supabase
                .from('CTax')
                .select('*')
                .eq('CID', cid);

            if (error) throw error;

            const taxes = data as CTax[];
            setTaxInfos(taxes);

            // Auto-select first tax info if available and none selected
            if (taxes.length > 0 && !selectedTax) {
                setSelectedTax(taxes[0]);
            }
        } catch (error) {
            console.error('Error fetching tax info:', error);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [cidRes, salesRes, teamRes, productRes] = await Promise.all([
                supabase.from('Customer').select('*').order('TimeStamp', { ascending: false }),
                supabase.from('Sale').select('*').order('TimeStamp', { ascending: false }),
                supabase.from('Team').select('EID, NickName, FullName, EndDate').is('EndDate', null),
                supabase.from('PID').select('PID, PDName, PDDetail')
            ]);

            if (cidRes.data) setCustomers(cidRes.data as Customer[]);
            if (salesRes.data) setAllSales(salesRes.data as Sale[]);
            if (teamRes.data) setTeams(teamRes.data as Team[]);
            if (productRes.data) setProducts(productRes.data);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const fetchBillSales = async (bid: string) => {
        try {
            const { data, error } = await supabase
                .from('Sale')
                .select('*')
                .eq('BID', bid);

            if (error) throw error;
            if (error) throw error;
            setSaleItems(data || []);
            setInitialSaleIds(data?.map(s => s.SID) || []);
        } catch (error) {
            console.error('Error fetching bill sales:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Save Bill
            // Clean up formData to match Bill schema exactly
            const billData: Bill = {
                BID: formData.BID!,
                TimeStamp: formData.TimeStamp || new Date().toISOString(),
                RecBy: formData.RecBy || 'Admin', // Ensure RecBy is set
                DelDate: formData.DelDate || null,
                BillDate: formData.BillDate,
                CID: formData.CID!,
                Seller: formData.Seller!,
                SID: formData.SID || null, // Set to null if empty to avoid FK violation (assuming DB allows null)
                Vat: formData.Vat || '7'
            };

            // Remove any undefined/null fields that shouldn't be there if necessary, 
            // but explicitly constructing the object is safer.

            const { error: billError } = await supabase
                .from('Bill')
                .upsert(billData);

            if (billError) throw billError;

            // 2. Update all sale items to link to this bill
            if (saleItems.length > 0) {
                const saleUpdates = saleItems.map(item => ({
                    ...item,
                    BID: formData.BID
                }));

                const { error: saleError } = await supabase
                    .from('Sale')
                    .upsert(saleUpdates);

                if (saleError) throw saleError;
            }

            // 3. Delete removed sale items
            const currentSaleIds = saleItems.map(s => s.SID);
            const salesToDelete = initialSaleIds.filter(id => !currentSaleIds.includes(id));

            if (salesToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from('Sale')
                    .delete()
                    .in('SID', salesToDelete);

                if (deleteError) throw deleteError;
            }

            onSave();
            onClose();
        } catch (error: any) {
            alert('Error saving bill: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const addSaleItem = (sale: Sale) => {
        if (saleItems.length >= 20) {
            alert('สามารถเพิ่มรายการขายได้สูงสุด 20 รายการ');
            return;
        }
        setSaleItems(prev => [...prev, sale]);
    };

    const removeSaleItem = (sid: string) => {
        setSaleItems(prev => prev.filter(item => item.SID !== sid));
    };

    // Calculations
    const subtotal = saleItems.reduce((sum, item) => sum + (parseFloat(String(item.SumPrice || 0))), 0);
    const vatRate = parseFloat(String(formData.Vat || '7')) / 100;
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    // Filtered Lists
    const filteredCustomers = customers.filter(c =>
        (c.CID || '').toLowerCase().includes(cidQuery.toLowerCase()) ||
        (c.ContractName || '').toLowerCase().includes(cidQuery.toLowerCase())
    );

    const filteredTeams = teams.filter(t =>
        (t.EID || '').toLowerCase().includes(sellerQuery.toLowerCase()) ||
        (t.NickName || '').toLowerCase().includes(sellerQuery.toLowerCase())
    );

    // Get selected related data
    const selectedCustomer = customers.find(c => c.CID === formData.CID);
    const selectedTeam = teams.find(t => t.EID === formData.Seller);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <FileText size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {bill ? (isEditMode ? 'แก้ไขบิล' : 'ใบเสนอราคา / ใบสั่งซื้อ') : 'สร้างบิลใหม่'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    เลขที่: {formData.BID} | {formData.BillDate}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {bill && !isEditMode && (
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                                    title="แก้ไขบิล"
                                >
                                    <Edit size={18} /> แก้ไข
                                </button>
                            )}
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors" title="ปิดหน้าต่าง">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                        {/* ========== หัวบิล (Bill Header) ========== */}
                        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-200">
                            <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                                <User size={20} /> ข้อมูลบิล
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* BID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่บิล (BID)</label>
                                    <input
                                        type="text"
                                        value={formData.BID || ''}
                                        readOnly
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-mono"
                                        title="เลขที่บิล"
                                    />
                                </div>

                                {/* BillDate */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เปิดบิล</label>
                                    <input
                                        type="date"
                                        value={formData.BillDate || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, BillDate: e.target.value }))}
                                        readOnly={!isEditMode}
                                        className={`w-full px-4 py-2 border rounded-lg ${!isEditMode ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}
                                        title="วันที่เปิดบิล"
                                    />
                                </div>

                                {/* VAT */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">VAT (%)</label>
                                    <input
                                        type="number"
                                        value={formData.Vat || '7'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, Vat: e.target.value }))}
                                        readOnly={!isEditMode}
                                        className={`w-full px-4 py-2 border rounded-lg ${!isEditMode ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}
                                        title="อัตรา VAT"
                                        placeholder="7"
                                    />
                                </div>

                                {/* Customer */}
                                <div className="relative md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ลูกค้า</label>
                                    {isEditMode ? (
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <input
                                                    ref={cidInputRef}
                                                    type="text"
                                                    value={cidQuery}
                                                    onChange={(e) => {
                                                        setCidQuery(e.target.value);
                                                        setActiveDropdown('cid');
                                                    }}
                                                    onFocus={() => {
                                                        setCidQuery(''); // Clear to show all options
                                                        setActiveDropdown('cid');
                                                    }}
                                                    placeholder="ค้นหาลูกค้า (CID, ชื่อ)..."
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    title="ค้นหาลูกค้า"
                                                />
                                                {activeDropdown === 'cid' && (
                                                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                        {filteredCustomers.map(c => (
                                                            <div
                                                                key={c.CID}
                                                                onClick={() => {
                                                                    setFormData(prev => ({ ...prev, CID: c.CID }));
                                                                    setCidQuery(`${c.CID} - ${c.ContractName}`);
                                                                    setActiveDropdown(null);
                                                                    cidInputRef.current?.blur();
                                                                }}
                                                                className="px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-none"
                                                            >
                                                                <div className="font-medium text-gray-900">{c.ContractName}</div>
                                                                <div className="text-xs text-gray-500">{c.CID} | {c.ContractTel}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setShowCustomerModal(true)}
                                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 whitespace-nowrap"
                                                title="สร้างลูกค้าใหม่"
                                            >
                                                <Plus size={18} /> เพิ่มลูกค้า
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                                            <div className="font-medium text-gray-900">{selectedCustomer?.ContractName || '-'}</div>
                                            <div className="text-xs text-gray-500">{formData.CID || '-'} | {selectedCustomer?.ContractTel}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Tax Info Selection */}
                                <div className="md:col-span-3 bg-white p-4 rounded-lg border border-gray-200 mt-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">ข้อมูลใบกำกับภาษี (Tax Invoice)</label>
                                        {isEditMode && formData.CID && (
                                            <button
                                                onClick={() => setShowTaxModal(true)}
                                                className="text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1"
                                                title="เพิ่มข้อมูลภาษี"
                                            >
                                                <Plus size={14} /> เพิ่มข้อมูลภาษี
                                            </button>
                                        )}
                                    </div>

                                    {taxInfos.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {isEditMode ? (
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    value={selectedTax?.CTaxID || ''}
                                                    onChange={(e) => {
                                                        const tax = taxInfos.find(t => t.CTaxID === e.target.value);
                                                        setSelectedTax(tax || null);
                                                    }}
                                                    title="เลือกข้อมูลภาษี"
                                                >
                                                    {taxInfos.map(tax => (
                                                        <option key={tax.CTaxID} value={tax.CTaxID}>
                                                            {tax.TaxName} ({tax.TaxNumber})
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="font-medium text-gray-900">{selectedTax?.TaxName}</div>
                                            )}

                                            {selectedTax && (
                                                <div className="text-sm text-gray-600 md:col-span-2 bg-gray-50 p-3 rounded border border-gray-100">
                                                    <div><span className="font-semibold">เลขผู้เสียภาษี:</span> {selectedTax.TaxNumber}</div>
                                                    <div><span className="font-semibold">ที่อยู่:</span> {selectedTax.TaxAddress}</div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 italic">
                                            {formData.CID ? 'ไม่พบข้อมูลภาษีสำหรับลูกค้ารายนี้' : 'กรุณาเลือกลูกค้าก่อน'}
                                        </div>
                                    )}
                                </div>

                                {/* Seller */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">พนักงานขาย</label>
                                    {isEditMode ? (
                                        <>
                                            <input
                                                ref={sellerInputRef}
                                                type="text"
                                                value={sellerQuery}
                                                onChange={(e) => {
                                                    setSellerQuery(e.target.value);
                                                    setActiveDropdown('seller');
                                                }}
                                                onFocus={() => {
                                                    setSellerQuery(''); // Clear to show all options
                                                    setActiveDropdown('seller');
                                                }}
                                                placeholder="ค้นหาพนักงาน..."
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                title="ค้นหาพนักงานขาย"
                                            />
                                            {activeDropdown === 'seller' && (
                                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                    {filteredTeams.map(t => (
                                                        <div
                                                            key={t.EID}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, Seller: t.EID }));
                                                                setSellerQuery(`${t.EID} - ${t.NickName}`);
                                                                setActiveDropdown(null);
                                                                sellerInputRef.current?.blur();
                                                            }}
                                                            className="px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-none"
                                                        >
                                                            <div className="font-medium text-gray-900">{t.NickName} ({t.FullName})</div>
                                                            <div className="text-xs text-gray-500">{t.EID}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                                            <div className="font-medium text-gray-900">{selectedTeam?.NickName || '-'}</div>
                                            <div className="text-xs text-gray-500">{formData.Seller || '-'}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ========== รายการสินค้า (Sale Items) ========== */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Package size={20} /> รายการสินค้า ({saleItems.length}/20)
                                </h3>
                                {isEditMode && (
                                    <button
                                        onClick={() => setShowSaleModal(true)}
                                        disabled={saleItems.length >= 20}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="เพิ่มรายการขาย"
                                    >
                                        <Plus size={18} /> เพิ่มรายการ
                                    </button>
                                )}
                            </div>

                            {saleItems.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Package size={48} className="mx-auto mb-3 opacity-30" />
                                    <p>ยังไม่มีรายการสินค้า</p>
                                    {isEditMode && <p className="text-sm mt-1">คลิก "เพิ่มรายการ" เพื่อเริ่มต้น</p>}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">ลำดับ</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">รหัสสินค้า</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">รายละเอียด</th>
                                                <th className="px-4 py-3 text-right font-semibold text-gray-700">จำนวน</th>
                                                <th className="px-4 py-3 text-right font-semibold text-gray-700">ราคา/หน่วย</th>
                                                <th className="px-4 py-3 text-right font-semibold text-gray-700">รวม</th>
                                                {isEditMode && <th className="px-4 py-3 text-center font-semibold text-gray-700">ลบ</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {saleItems.map((item, index) => (
                                                <tr key={item.SID} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                                                    <td className="px-4 py-3 font-mono text-gray-900">{item.PID}</td>
                                                    <td className="px-4 py-3 text-gray-700">
                                                        <div className="font-medium">{products.find(p => p.PID === item.PID)?.PDName || item.PID}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{products.find(p => p.PID === item.PID)?.PDDetail || '-'}</div>
                                                        <div className="text-xs text-gray-400 mt-1">{item.Dimention || ''} {item.ItemColor} / {item.BulbCollor}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-900">{item.Qty || 1}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900">{parseFloat(String(item.Price || 0)).toLocaleString()} ฿</td>
                                                    <td className="px-4 py-3 text-right font-semibold text-teal-600">{parseFloat(String(item.SumPrice || 0)).toLocaleString()} ฿</td>
                                                    {isEditMode && (
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingSaleItem(item);
                                                                        setShowSaleModal(true);
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                                    title="แก้ไขรายการ"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => removeSaleItem(item.SID)}
                                                                    className="text-red-600 hover:text-red-800 p-1"
                                                                    title="ลบรายการ"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* ========== สรุปยอด (Summary) ========== */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <DollarSign size={20} /> สรุปยอดเงิน
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-gray-700">
                                    <span>ยอดรวมก่อน VAT:</span>
                                    <span className="font-semibold text-lg">{subtotal.toLocaleString()} ฿</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-700">
                                    <span>VAT {formData.Vat || 7}%:</span>
                                    <span className="font-semibold text-lg">{vatAmount.toLocaleString()} ฿</span>
                                </div>
                                <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">ยอดรวมทั้งสิ้น:</span>
                                    <span className="text-2xl font-bold text-teal-600">{total.toLocaleString()} ฿</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 sticky bottom-0">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            ปิดหน้าต่าง
                        </button>
                        {isEditMode && (
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                            </button>
                        )}
                        {!isEditMode && (
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2">
                                <FileText size={18} />
                                พิมพ์ใบเสร็จ
                            </button>
                        )}
                    </div>
                </div>

                {/* Click outside to close dropdowns */}
                {activeDropdown && (
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setActiveDropdown(null)}
                    ></div>
                )}
            </div>

            {/* Customer Modal */}
            {showCustomerModal && (
                <CustomerModal
                    isOpen={showCustomerModal}
                    onClose={() => setShowCustomerModal(false)}
                    onSave={async (customerData) => {
                        try {
                            const { error } = await supabase.from('Customer').insert([customerData]);
                            if (error) throw error;

                            await fetchDropdownData();
                            // Auto-select the new customer
                            setFormData(prev => ({ ...prev, CID: customerData.CID }));
                            setCidQuery(`${customerData.CID} - ${customerData.ContractName}`);
                            setShowCustomerModal(false);
                        } catch (error: any) {
                            alert('Error saving customer: ' + error.message);
                        }
                    }}
                    initialData={null}
                    isSaving={false}
                />
            )}

            {/* Sale Modal */}
            {showSaleModal && (
                <SaleModal
                    isOpen={showSaleModal}
                    onClose={() => {
                        setShowSaleModal(false);
                        setEditingSaleItem(null);
                    }}
                    onSave={async (saleData) => {
                        if (editingSaleItem) {
                            // Update existing item
                            setSaleItems(prev => prev.map(item =>
                                item.SID === saleData.SID ? saleData : item
                            ));
                        } else {
                            // Add new item
                            addSaleItem(saleData);
                        }
                        setShowSaleModal(false);
                        setEditingSaleItem(null);
                    }}
                    initialData={editingSaleItem}
                    isSaving={false}
                />
            )}

            {/* Tax Info Modal */}
            {showTaxModal && formData.CID && (
                <TaxInfoModal
                    isOpen={showTaxModal}
                    onClose={() => setShowTaxModal(false)}
                    onSave={async (taxData) => {
                        try {
                            const newTax = {
                                ...taxData,
                                CID: formData.CID!,
                                RecBy: 'Admin', // Should be dynamic
                                TimeStamp: new Date().toISOString()
                            };

                            const { error } = await supabase.from('CTax').insert([newTax]);
                            if (error) throw error;

                            await fetchCustomerTaxInfo(formData.CID!);
                            setShowTaxModal(false);
                        } catch (error: any) {
                            alert('Error saving tax info: ' + error.message);
                        }
                    }}
                    customerCID={formData.CID}
                    isSaving={false}
                />
            )}
        </>
    );
}
