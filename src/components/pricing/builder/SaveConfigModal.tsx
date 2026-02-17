import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Service } from '../../../types/pricing';

interface Props {
    service: Service;
    onSave: (name: string) => void;
    onClose: () => void;
}

export const SaveConfigModal: React.FC<Props> = ({ service, onSave, onClose }) => {
    const [name, setName] = useState(service.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <Save size={18} />
                        </div>
                        <h3 className="font-bold text-slate-800">Save Configuration</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 tracking-wide uppercase">
                            Configuration Name
                        </label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                            placeholder="e.g., Summer Event 2026"
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                        >
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
