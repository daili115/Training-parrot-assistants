
import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, X, Plus, Calendar, Clock, Maximize2 } from 'lucide-react';
import { ParrotPhoto } from '../types';

interface ParrotGalleryProps {
    photos: ParrotPhoto[];
    onAddPhoto: (photo: ParrotPhoto) => void;
    onDeletePhoto: (id: string) => void;
}

const ParrotGallery: React.FC<ParrotGalleryProps> = ({ photos, onAddPhoto, onDeletePhoto }) => {
    const [selectedPhoto, setSelectedPhoto] = useState<ParrotPhoto | null>(null);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [currentNote, setCurrentNote] = useState('');
    const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempPhotoUrl(reader.result as string);
                setIsAddingNote(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePhoto = () => {
        if (tempPhotoUrl) {
            onAddPhoto({
                id: crypto.randomUUID(),
                url: tempPhotoUrl,
                timestamp: Date.now(),
                note: currentNote.trim() || undefined
            });
            setTempPhotoUrl(null);
            setCurrentNote('');
            setIsAddingNote(false);
        }
    };

    const handleCancelAdd = () => {
        setTempPhotoUrl(null);
        setCurrentNote('');
        setIsAddingNote(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base md:text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <div className="p-1.5 md:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg md:rounded-xl">
                        <Camera className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                    </div>
                    鹦鹉照片墙 ({photos.length})
                </h2>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    拍一张
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                />
            </div>

            {photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500">还没拍过鹦鹉呢，快去拍一张吧！</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {photos.sort((a, b) => b.timestamp - a.timestamp).map((photo) => (
                        <div
                            key={photo.id}
                            className="group relative aspect-square rounded-[24px] overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <img
                                src={photo.url}
                                alt="Parrot"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] text-white font-bold truncate">
                                    {new Date(photo.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeletePhoto(photo.id);
                                    }}
                                    className="p-1.5 bg-white/20 backdrop-blur-md hover:bg-red-500 text-white rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-1.5 bg-white/20 backdrop-blur-md text-white rounded-lg">
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Adding Note Modal */}
            {isAddingNote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="aspect-video rounded-2xl overflow-hidden mb-4 border border-slate-100 dark:border-slate-700">
                            <img src={tempPhotoUrl!} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">添加描述</h3>
                        <textarea
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            placeholder="写点什么吧 (可选)..."
                            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-700 border-none focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium dark:text-white mb-6 min-h-[100px]"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelAdd}
                                className="flex-1 py-3 text-slate-400 font-black text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSavePhoto}
                                className="flex-1 py-3 bg-purple-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                            >
                                保存到照片墙
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox / Detail Modal */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300">
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
                        <div className="w-full overflow-hidden rounded-[32px] shadow-2xl">
                            <img
                                src={selectedPhoto.url}
                                alt="Parrot Detail"
                                className="w-full h-full object-contain bg-black/20"
                            />
                        </div>

                        <div className="mt-6 w-full max-w-2xl px-4 text-center">
                            {selectedPhoto.note && (
                                <p className="text-white text-lg font-medium mb-4 italic">
                                    "{selectedPhoto.note}"
                                </p>
                            )}
                            <div className="flex items-center justify-center gap-6 text-slate-400 text-xs font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-400" />
                                    {new Date(selectedPhoto.timestamp).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-purple-400" />
                                    {new Date(selectedPhoto.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParrotGallery;
