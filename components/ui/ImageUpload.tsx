'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, Camera, Image as ImageIcon, FileText } from 'lucide-react';

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
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (currentImageUrl) {
            if (currentImageUrl.startsWith('http')) {
                setPreviewUrl(currentImageUrl);
            } else {
                const { data } = supabase.storage.from(bucketName).getPublicUrl(currentImageUrl);
                setPreviewUrl(data.publicUrl);
            }
        } else {
            setPreviewUrl(null);
        }
    }, [currentImageUrl, bucketName]);

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            setIsCameraOpen(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบสิทธิ์การเข้าถึง");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
                        await handleUpload(file);
                        stopCamera();
                    }
                }, 'image/jpeg');
            }
        }
    };

    const handleUpload = async (file: File) => {
        try {
            setUploading(true);

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

            if (uploadError) throw uploadError;

            // Get public URL immediately to ensure consistency
            const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            onImageUpload(data.publicUrl);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await handleUpload(file);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onImageUpload('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isPdf = previewUrl?.toLowerCase().endsWith('.pdf') || (previewUrl?.startsWith('blob:') && previewUrl?.includes('application/pdf'));

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            {isCameraOpen ? (
                <div className="relative w-full bg-black rounded-lg overflow-hidden flex flex-col items-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute bottom-4 flex gap-4">
                        <button onClick={takePhoto} type="button" className="bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg hover:bg-gray-200">
                            ถ่ายรูป
                        </button>
                        <button onClick={stopCamera} type="button" className="bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-red-600">
                            ยกเลิก
                        </button>
                    </div>
                </div>
            ) : previewUrl ? (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center group">
                    {isPdf ? (
                        <div className="w-full h-full relative">
                            <object data={previewUrl} type="application/pdf" className="w-full h-full">
                                <div className="flex flex-col items-center justify-center h-full">
                                    <FileText size={48} className="text-red-500 mb-2" />
                                    <p className="text-sm text-gray-500">ไม่สามารถแสดงตัวอย่าง PDF ได้</p>
                                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2">
                                        เปิดดูไฟล์ PDF
                                    </a>
                                </div>
                            </object>
                            {/* Overlay link for mobile where object might not be interactive or render well */}
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 text-xs rounded shadow text-blue-600 hover:text-blue-800 z-10">
                                🔗 เปิด PDF เต็มจอ
                            </a>
                        </div>
                    ) : (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    )}
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm z-20"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-row items-center justify-center gap-4 hover:bg-gray-50 transition-colors p-4">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex flex-col items-center justify-center cursor-pointer h-full"
                    >
                        <ImageIcon size={24} className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 text-center">เลือกรูป/PDF</span>
                    </div>

                    <div className="h-full w-px bg-gray-300"></div>

                    <div
                        onClick={startCamera}
                        className="flex-1 flex flex-col items-center justify-center cursor-pointer h-full"
                    >
                        <Camera size={24} className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 text-center">ถ่ายรูป (กล้อง)</span>
                    </div>
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
            {uploading && <p className="text-xs text-blue-500 mt-1 text-center">กำลังอัปโหลด...</p>}
        </div>
    );
}
