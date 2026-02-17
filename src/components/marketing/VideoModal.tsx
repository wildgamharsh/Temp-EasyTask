"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Play } from "lucide-react";
import Image from "next/image";

interface VideoModalProps {
    thumbnail: string;
    title: string;
    description: string;
    videoId: string;
}

export default function VideoModal({ thumbnail, title, description, videoId }: VideoModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="group relative rounded-3xl overflow-hidden cursor-pointer bg-white border border-slate-100 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300">
                    <div className="relative aspect-video w-full overflow-hidden">
                        {/* Thumbnail Image */}
                         <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors z-10"></div>
                        <Image 
                            src={thumbnail}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                                <Play className="w-6 h-6 text-brand-600 fill-brand-600 ml-1" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                            {title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-none">
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>
                <div className="relative aspect-video w-full">
                    <iframe 
                        className="w-full h-full absolute inset-0"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} 
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
            </DialogContent>
        </Dialog>
    );
}
