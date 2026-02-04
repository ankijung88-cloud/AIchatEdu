'use client';

import { PERSONAS } from '@/lib/personas';
import { X, Check } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentMode: string;
    onSelectMode: (mode: string) => void;
}

export default function SettingsModal({ isOpen, onClose, currentMode, onSelectMode }: SettingsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md p-6 m-4 bg-white/10 text-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Select Persona</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {Object.values(PERSONAS).map((persona) => (
                        <button
                            key={persona.id}
                            onClick={() => {
                                onSelectMode(persona.id);
                                onClose();
                            }}
                            className={`w-full p-4 rounded-xl flex items-center justify-between transition-all duration-200 border border-white/10 ${currentMode === persona.id
                                    ? `${persona.themeColor} border-transparent shadow-lg scale-[1.02]`
                                    : 'hover:bg-white/5 hover:border-white/30'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Placeholder for Icon logic if needed, or just text */}
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-lg">{persona.name}</span>
                                    <span className="text-xs opacity-70">
                                        {persona.id === 'friend' && 'Cheerful & Casual'}
                                        {persona.id === 'lover' && 'Warm & Loving'}
                                        {persona.id === 'assistant' && 'Professional'}
                                    </span>
                                </div>
                            </div>
                            {currentMode === persona.id && <Check size={20} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
