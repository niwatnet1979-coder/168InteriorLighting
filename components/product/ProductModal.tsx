'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, generateID } from '@/types/schema';
import { X, Image as ImageIcon, Box, Upload, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => Promise<void>;
    initialData?: Product | null;
    isSaving: boolean;
}

export default function ProductModal({ isOpen, onClose, onSave, initialData, isSaving }: ProductModalProps) {
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [activeTab, setActiveTab] = useState<'basic' | 'images'>('basic');

    // Autocomplete data
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [productNames, setProductNames] = useState<string[]>([]);
    const [productTypes, setProductTypes] = useState<string[]>([]);

    // Autocomplete states
    const [nameQuery, setNameQuery] = useState('');
    const [typeQuery, setTypeQuery] = useState('');
    const [showNameDropdown, setShowNameDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    // PID validation
    const [pidError, setPidError] = useState('');

    // Image upload states
    const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            if (initialData) {
                setFormData(initialData);
                setNameQuery(initialData.PDName || '');
                setTypeQuery(initialData.PDType || '');
            } else {
                setFormData({
                    PID: generateID.product(), // Auto-generate PID with PN prefix
                    TimeStamp: new Date().toISOString(),
                    RecBy: 'Admin',
                    PDPrice: 0,
                    PIDSub: '1.0'
                });
                setNameQuery('');
                setTypeQuery('');
            }
            setActiveTab('basic');
            setPidError('');
        }
    }, [isOpen, initialData]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('PID')
                .select('*')
                .order('TimeStamp', { ascending: false });

            if (error) throw error;

            if (data) {
                setAllProducts(data as Product[]);

                // Extract unique names and types
                const names = [...new Set(data.map(p => p.PDName).filter(Boolean))];
                const types = [...new Set(data.map(p => p.PDType).filter(Boolean))];

                setProductNames(names as string[]);
                setProductTypes(types as string[]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const validatePID = async (pid: string) => {
        if (!pid) {
            setPidError('กรุณากรอกรหัสสินค้า');
            return false;
        }

        // Skip validation if editing existing product
        if (initialData && initialData.PID === pid) {
            setPidError('');
            return true;
        }

        // Check for duplicates
        const exists = allProducts.some(p => p.PID === pid);
        if (exists) {
            setPidError('รหัสสินค้านี้มีอยู่แล้ว กรุณาใช้รหัสอื่น');
            return false;
        }

        setPidError('');
        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'PID') {
            validatePID(value);
        }
    };

    const handleImageUpload = async (field: string, file: File) => {
        try {
            setUploadingImages(prev => ({ ...prev, [field]: true }));

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, [field]: publicUrl }));
        } catch (error: any) {
            alert('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ: ' + error.message);
        } finally {
            setUploadingImages(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate PID
        const isValid = await validatePID(formData.PID || '');
        if (!isValid) {
            return;
        }

        await onSave(formData as Product);
    };

    // Filtered autocomplete lists
    const filteredNames = productNames.filter(name =>
        name.toLowerCase().includes(nameQuery.toLowerCase())
    );

    const filteredTypes = productTypes.filter(type =>
        type.toLowerCase().includes(typeQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" title="ปิดหน้าต่าง">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b px-6 bg-gray-50 sticky top-[80px] z-10">
                    <button
                        type="button"
                        onClick={() => setActiveTab('basic')}
                        className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === 'basic' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Box size={18} /> ข้อมูลสินค้า
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('images')}
                        className={`py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === 'images' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <ImageIcon size={18} /> รูปภาพ
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
                    {activeTab === 'basic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* PID with validation */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">รหัสสินค้า (PID) *</label>
                                <input
                                    type="text"
                                    name="PID"
                                    value={formData.PID || ''}
                                    readOnly
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 bg-gray-100 text-gray-900 font-medium"
                                    required
                                    title="รหัสสินค้า (สร้างอัตโนมัติ)"
                                    placeholder="เช่น PN251128183406"
                                />
                                {pidError && (
                                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{pidError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Name with autocomplete */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">ชื่อสินค้า *</label>
                                <input
                                    type="text"
                                    value={nameQuery}
                                    onChange={(e) => {
                                        setNameQuery(e.target.value);
                                        setFormData(prev => ({ ...prev, PDName: e.target.value }));
                                        setShowNameDropdown(true);
                                    }}
                                    onFocus={() => setShowNameDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowNameDropdown(false), 200)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                    required
                                    title="ชื่อสินค้า"
                                    placeholder="พิมพ์ชื่อสินค้า..."
                                />
                                {showNameDropdown && filteredNames.length > 0 && (
                                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {filteredNames.map((name, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setNameQuery(name);
                                                    setFormData(prev => ({ ...prev, PDName: name }));
                                                    setShowNameDropdown(false);
                                                }}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-none"
                                            >
                                                {name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Type with autocomplete */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">ประเภท (Type)</label>
                                <input
                                    type="text"
                                    value={typeQuery}
                                    onChange={(e) => {
                                        setTypeQuery(e.target.value);
                                        setFormData(prev => ({ ...prev, PDType: e.target.value }));
                                        setShowTypeDropdown(true);
                                    }}
                                    onFocus={() => setShowTypeDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowTypeDropdown(false), 200)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                    title="ประเภทสินค้า"
                                    placeholder="พิมพ์ประเภทสินค้า..."
                                />
                                {showTypeDropdown && filteredTypes.length > 0 && (
                                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {filteredTypes.map((type, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setTypeQuery(type);
                                                    setFormData(prev => ({ ...prev, PDType: type }));
                                                    setShowTypeDropdown(false);
                                                }}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-none"
                                            >
                                                {type}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">ราคา (Price)</label>
                                <input
                                    type="number"
                                    name="PDPrice"
                                    value={formData.PDPrice ?? ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                                    title="ราคาสินค้า"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
                                <textarea
                                    name="PDDetail"
                                    value={formData.PDDetail || ''}
                                    onChange={handleChange}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                                    title="รายละเอียดสินค้า"
                                    placeholder="รายละเอียดเพิ่มเติม..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'images' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 mb-4">อัพโหลดรูปภาพสินค้า (สูงสุด 10 รูป)</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['PDPic1', 'PDPic2', 'PDPic3', 'PDPic4', 'PDPic5', 'PDPic6', 'PDPic7', 'PDPic8', 'PDPic9', 'PDPic10'].map((field) => (
                                    <div key={field} className="border border-gray-200 rounded-lg p-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{field}</label>

                                        {/* Image Preview */}
                                        {(formData as any)[field] && (
                                            <div className="mb-3 relative">
                                                <img
                                                    src={(formData as any)[field]}
                                                    alt={field}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, [field]: '' }))}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    title="ลบรูปภาพ"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        <input
                                            type="file"
                                            ref={(el) => { fileInputRefs.current[field] = el; }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageUpload(field, file);
                                            }}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRefs.current[field]?.click()}
                                            disabled={uploadingImages[field]}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-blue-300"
                                        >
                                            <Upload size={18} />
                                            {uploadingImages[field] ? 'กำลังอัพโหลด...' : 'อัพโหลดรูปภาพ'}
                                        </button>

                                        {/* URL Input (Alternative) */}
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                name={field}
                                                value={(formData as any)[field] || ''}
                                                onChange={handleChange}
                                                placeholder="หรือใส่ URL รูปภาพ"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                title={`URL รูปภาพ ${field}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !!pidError}
                            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
