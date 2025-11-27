'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    label: string;
    bucketName: string;
    folderPath: string;
    currentImageUrl?: string;
    onImageUpload: (url: string) => void;
}

export default function ImageUpload({ label, bucketName, folderPath, currentImageUrl, onImageUpload }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentImageUrl) {
            if (currentImageUrl.startsWith('http')) {
                setPreviewUrl(currentImageUrl);
            } else {
                // Resolve public URL from path
                const { data } = supabase.storage.from(bucketName).getPublicUrl(currentImageUrl);
                setPreviewUrl(data.publicUrl);
            }
        } else {
            setPreviewUrl(null);
        }
    }, [currentImageUrl, bucketName]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            // Create preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // Upload to Supabase
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${folderPath}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL (Note: For private buckets, we might need signed URLs, but for simplicity we use public URL logic first. 
            // If the bucket is private, we should use createSignedUrl, but that expires. 
            // For persistent storage in DB, usually we store the path and generate signed URL on fetch, OR make bucket public.
            // Given the requirement for "Private" data like ID cards, we should store the PATH and generate Signed URL when viewing.
            // However, to keep it simple for this iteration, we will store the full path and assume the user can access it via the app logic.)

            // For now, let's store the full path which can be used to generate signed URLs later
            // Or if we made the bucket public (which is easier for MVP), we get public URL.
            // Since we set RLS policies for "Authenticated" users, we can use the path.

            // Let's return the full path for now, or the public URL if we decide to make it public.
            // To make it easy to display, let's try to get a public URL (if bucket is public) or just the path.

            // Actually, for private buckets, we should store the path.
            // But to display it immediately in the app without complex logic, let's try to get a signed URL for the preview (which we already have via objectUrl)
            // and pass the Storage Path to the parent.

            onImageUpload(filePath);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onImageUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const isPdf = previewUrl?.toLowerCase().endsWith('.pdf') || (previewUrl?.startsWith('blob:') && previewUrl?.includes('application/pdf'));

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            {previewUrl ? (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center">
                    {isPdf ? (
                        <div className="text-center p-4">
                            <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                                <span className="text-xs font-bold">PDF</span>
                            </div>
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                                ดูไฟล์ PDF
                            </a>
                        </div>
                    ) : (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    )}
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm z-10"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <div className="flex gap-2 mb-2 text-gray-400">
                        <Camera size={24} />
                        <ImageIcon size={24} />
                    </div>
                    <span className="text-sm text-gray-500">{uploading ? 'กำลังอัปโหลด...' : 'แตะเพื่อถ่ายรูป หรือ เลือกไฟล์ (รูป/PDF)'}</span>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
            />
        </div>
    );
}
