'use client';

import { useState, useEffect, useRef } from 'react';
import { Sale, generateID, Product } from '@/types/schema';
import { supabase } from '@/lib/supabase';
import { X, Search, ChevronDown } from 'lucide-react';

interface SaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sale: Sale) => Promise<void>;
    initialData?: Sale | null;
    isSaving: boolean;
}

export default function SaleModal({ isOpen, onClose, onSave, initialData, isSaving }: SaleModalProps) {
    const [formData, setFormData] = useState<Partial<Sale>>({});
    const [products, setProducts] = useState<Product[]>([]);

    // Searchable Dropdown States
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase.from('PID').select('PID, PDName, PDPrice');
            if (data) setProducts(data as Product[]);
        };
        if (isOpen) fetchProducts();
    }, [isOpen]);

    // Reset form & Search Query when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
                // Set initial search query if editing
                setSearchQuery(initialData.PID || '');
            } else {
                setFormData({
                    SID: generateID.sale(),
                    Timestamp: new Date().toISOString(),
                    RecBy: 'Admin',
                    Price: 0,
                    Qty: 1,
                    Discount: 0,
                    ShipPrice: 0,
                    InstallationPrice: 0,
                    SumPrice: 0
                });
                setSearchQuery('');
            }
            setIsDropdownOpen(false);
        }
    }, [isOpen, initialData]);

    // Sync Search Query with PID if products loaded (for displaying Name)
    useEffect(() => {
        if (formData.PID && products.length > 0 && !isDropdownOpen) {
            const p = products.find(prod => prod.PID === formData.PID);
            if (p) {
                setSearchQuery(`${p.PID} - ${p.PDName}`);
            }
        }
    }, [formData.PID, products, isDropdownOpen]);

    // Calculate Total Price
    useEffect(() => {
        const price = Number(formData.Price) || 0;
        const qty = Number(formData.Qty) || 1;
        const discount = Number(formData.Discount) || 0;
        const ship = Number(formData.ShipPrice) || 0;
        const install = Number(formData.InstallationPrice) || 0;

        const sum = (price * qty) - discount + ship + install;
        setFormData(prev => ({ ...prev, SumPrice: sum }));
    }, [formData.Price, formData.Qty, formData.Discount, formData.ShipPrice, formData.InstallationPrice]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectProduct = (product: Product) => {
        setFormData(prev => ({
            ...prev,
            PID: product.PID,
            Price: product.PDPrice
        }));
        setSearchQuery(`${product.PID} - ${product.PDName}`);
        setIsDropdownOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData as Sale);
    };

    // Filter products based on search query
    const filteredProducts = products.filter(p =>
        p.PID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.PDName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'แก้ไขงานขาย' : 'เพิ่มงานขายใหม่'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700 border-b pb-2">ข้อมูลทั่วไป</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sale ID (Auto)</label>
                            <input type="text" name="SID" value={formData.SID || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ลูกค้า (CID)</label>
                            <input type="text" name="CID" value={formData.CID || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">พนักงานขาย</label>
                            <input type="text" name="Staff" value={formData.Staff || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2" />
                        </div>
                    </div>

                    {/* Product & Price */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700 border-b pb-2">สินค้าและราคา</h3>

                        {/* Searchable Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <label className="block text-sm font-medium text-gray-700">ค้นหาสินค้า (PID / ชื่อ)</label>
                            <div className="relative mt-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder="พิมพ์เพื่อค้นหา..."
                                    className="block w-full rounded-md border border-gray-300 shadow-sm p-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                    {isDropdownOpen ? <Search size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>

                            {/* Dropdown List */}
                            {isDropdownOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                    {filteredProducts.length === 0 ? (
                                        <div className="cursor-default select-none relative py-2 px-4 text-gray-700">
                                            ไม่พบสินค้า
                                        </div>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <div
                                                key={product.PID}
                                                onClick={() => handleSelectProduct(product)}
                                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900 border-b border-gray-50 last:border-0"
                                            >
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{product.PID}</span>
                                                    <span className="text-gray-500">{product.PDPrice?.toLocaleString()} ฿</span>
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">{product.PDName}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ราคาต่อหน่วย</label>
                                <input type="number" name="Price" value={formData.Price || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">จำนวน</label>
                                <input type="number" name="Qty" value={formData.Qty || 1} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ส่วนลด</label>
                                <input type="number" name="Discount" value={formData.Discount || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-red-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ค่าส่ง + ติดตั้ง</label>
                                <div className="flex gap-2">
                                    <input type="number" name="ShipPrice" placeholder="ส่ง" value={formData.ShipPrice || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2" />
                                    <input type="number" name="InstallationPrice" placeholder="ติดตั้ง" value={formData.InstallationPrice || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ยอดรวมสุทธิ</label>
                            <input type="number" name="SumPrice" value={formData.SumPrice || 0} readOnly className="mt-1 block w-full rounded-md border-gray-300 bg-green-50 text-green-700 font-bold shadow-sm p-2 text-lg" />
                        </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">ยกเลิก</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
