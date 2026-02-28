"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Upload, Link, Search, Check, Image as ImageIcon } from 'lucide-react';

interface ServiceImagePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
    currentValue?: string;
}

const SERVICE_LIBRARY_IMAGES = [
    {
        id: 'w1',
        url: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0',
        name: 'wedding_flowers.jpg'
    },
    {
        id: 'w2',
        url: 'https://media.gettyimages.com/id/1445272650/video/luxury-dinner-table-in-a-wedding-invitation-wedding-decoration-wedding-dinner-table-wedding.jpg?s=640x640&k=20&c=n85Uphj0dw3xDDoKkthbSqoejb3Gbc-R3pqsw6_P3yc=',
        name: 'luxury_dinner_table.jpg'
    },
    {
        id: 'w3',
        url: 'https://media.gettyimages.com/id/1223909090/video/indian-or-hindu-traditional-ceremony-venue-decoration.jpg?s=640x640&k=20&c=Y32M4JB-gbnsZ936iv_xaTvT9viDFjYKOAZoxd1aIKw=',
        name: 'indian_ceremony_venue.jpg'
    },
    {
        id: 'w4',
        url: 'https://img.pikbest.com/photo/20241215/luxury-wedding-stage-decor-with-pink-flowers-and-red-carpet_11258184.jpg!sw800',
        name: 'pink_wedding_stage.jpg'
    },
    {
        id: 'w5',
        url: 'https://static.vecteezy.com/system/resources/thumbnails/053/808/762/small_2x/wedding-party-decoration-scene-background-free-photo.jpeg',
        name: 'wedding_party_decor.jpeg'
    },
    {
        id: 'w6',
        url: 'https://static.vecteezy.com/system/resources/previews/018/740/503/non_2x/beautiful-wedding-stage-for-groom-and-bride-photo.jpg',
        name: 'wedding_stage_bride.jpg'
    },
    {
        id: 'w7',
        url: 'https://assets.architecturaldigest.in/photos/6698dff393565db77b9beb8d/4:3/w_1424,h_1068,c_limit/DSC00522.jpg.jpg',
        name: 'architectural_venue.jpg'
    },
    {
        id: 'w8',
        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS61yPWFSqa2dt4N9VHNjWXilVmtLFSvTwrA&s',
        name: 'wedding_decor_1.jpg'
    },
    {
        id: 'w9',
        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ466bR2u3tqQijUuBoAMIgAozxpbp_8XVroA&s',
        name: 'wedding_decor_2.jpg'
    },
];

export const ServiceImagePickerModal: React.FC<ServiceImagePickerModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentValue,
}) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'library'>('library');
    const [urlInput, setUrlInput] = useState(currentValue || '');
    const [previewUrl, setPreviewUrl] = useState(currentValue || '');
    const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setUrlInput(currentValue || '');
            setPreviewUrl(currentValue || '');
            setActiveTab('library');
            setSelectedLibraryId(null);
            setSearchQuery('');
        }
    }, [isOpen, currentValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    const handleUrlLoad = () => {
        if (urlInput) setPreviewUrl(urlInput);
    };

    const handleFileSelect = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setPreviewUrl(result);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleFileSelect(file);
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleLibrarySelect = (image: (typeof SERVICE_LIBRARY_IMAGES)[0]) => {
        setSelectedLibraryId(image.id);
        setPreviewUrl(image.url);
    };

    const handleSetImage = () => {
        if (previewUrl) {
            onSelect(previewUrl);
            onClose();
        }
    };

    const filteredLibrary = SERVICE_LIBRARY_IMAGES.filter(img =>
        img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <h3 className="text-lg font-bold text-slate-900">Add Image</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 px-6 pt-2">
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${activeTab === 'library'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-slate-500 hover:text-slate-700 hover:border-slate-300 border-transparent'
                                }`}
                        >
                            Library
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${activeTab === 'upload'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-slate-500 hover:text-slate-700 hover:border-slate-300 border-transparent'
                                }`}
                        >
                            Upload / URL
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                        {activeTab === 'library' ? (
                            <div className="flex flex-col h-full">
                                {/* Search */}
                                <div className="flex gap-3 mb-5 shrink-0">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm outline-none"
                                            placeholder="Search images..."
                                            type="text"
                                        />
                                    </div>
                                </div>

                                {/* Image Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-1 pb-2">
                                    {filteredLibrary.map((image) => {
                                        const isSelected = selectedLibraryId === image.id || previewUrl === image.url;
                                        return (
                                            <div
                                                key={image.id}
                                                onClick={() => handleLibrarySelect(image)}
                                                className={`group relative bg-white rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${isSelected
                                                        ? 'border-blue-600 shadow-md shadow-blue-600/10'
                                                        : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="aspect-video overflow-hidden bg-slate-100">
                                                    <img
                                                        alt={image.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        src={image.url}
                                                    />
                                                </div>
                                                <div className="px-2 py-1.5">
                                                    <p className={`text-[11px] truncate font-semibold ${isSelected ? 'text-blue-600' : 'text-slate-600'}`}>
                                                        {image.name}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-sm flex items-center justify-center">
                                                        <Check size={12} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {filteredLibrary.length === 0 && (
                                        <div className="col-span-3 py-16 flex flex-col items-center text-slate-400">
                                            <ImageIcon size={40} className="mb-3" />
                                            <p className="text-sm">No images match your search</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                {/* File Upload */}
                                <div className="flex flex-col h-full">
                                    <label className="text-sm font-bold text-slate-700 mb-3">Upload File</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all ${isDragging
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-blue-300 bg-white hover:bg-blue-50/30'
                                            }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileInputChange}
                                            className="hidden"
                                        />
                                        <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-transform ${isDragging ? 'scale-110 bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-600'}`}>
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-slate-900 font-bold text-base mb-1">Drag & Drop your file here</p>
                                        <p className="text-slate-500 text-sm">or <span className="text-blue-600 hover:underline">browse files</span></p>
                                        <div className="mt-6 flex gap-2 justify-center text-xs text-slate-400">
                                            <span className="bg-slate-100 px-2 py-1 rounded">JPG</span>
                                            <span className="bg-slate-100 px-2 py-1 rounded">PNG</span>
                                            <span className="bg-slate-100 px-2 py-1 rounded">SVG</span>
                                            <span className="bg-slate-100 px-2 py-1 rounded">WEBP</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">Max size: 5MB</p>
                                    </div>
                                </div>

                                {/* URL + Preview */}
                                <div className="flex flex-col h-full">
                                    <div className="mb-5">
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Import from URL</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    value={urlInput}
                                                    onChange={(e) => setUrlInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none"
                                                    placeholder="https://example.com/image.png"
                                                    type="text"
                                                />
                                            </div>
                                            <button
                                                onClick={handleUrlLoad}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors border border-slate-200"
                                            >
                                                Load
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <label className="text-sm font-bold text-slate-700 mb-3">Preview</label>
                                        <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative shadow-sm min-h-[200px]">
                                            <div className="absolute inset-0 z-0 opacity-40"
                                                style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px' }}
                                            />
                                            {previewUrl ? (
                                                <img
                                                    alt="Preview"
                                                    className="relative z-10 max-w-full max-h-[240px] object-contain shadow-lg rounded-lg"
                                                    src={previewUrl}
                                                />
                                            ) : (
                                                <div className="relative z-10 flex flex-col items-center text-slate-400">
                                                    <ImageIcon size={40} className="mb-2" />
                                                    <p className="text-sm">No image selected</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                        {previewUrl ? '1 image selected' : 'Select an image to continue'}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSetImage}
                            disabled={!previewUrl}
                            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            Add Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
