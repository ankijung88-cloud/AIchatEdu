'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Settings, User, Bot, Menu } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import { PERSONAS } from '@/lib/personas';

type Message = {
    role: 'user' | 'model';
    text: string;
};

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('friend');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            // Prepare history for Gemini (excluding the last message we just sent)
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: history,
                    mode: mode
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setMessages(prev => [...prev, { role: 'model', text: data.text }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "Error: Could not connect to the AI. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const currentPersona = PERSONAS[mode];

    return (
        <main className="min-h-screen flex flex-col items-center justify-between p-4 md:p-8 relative overflow-hidden transition-colors duration-500">
            {/* Dynamic Background Overlay based on Persona */}
            <div className={`fixed inset-0 -z-10 opacity-20 bg-gradient-to-br from-gray-900 to-black ${mode === 'friend' ? 'from-blue-900 via-purple-900 to-black' :
                    mode === 'lover' ? 'from-pink-900 via-red-900 to-black' :
                        'from-gray-900 to-black'
                }`} />

            {/* Header */}
            <header className="w-full max-w-2xl glass-panel p-4 flex justify-between items-center mb-4 z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${currentPersona.themeColor} text-white`}>
                        {mode === 'friend' ? <User size={20} /> :
                            mode === 'lover' ? <Settings size={20} /> : <Bot size={20} />}
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-lg">{currentPersona.name}</h1>
                        <p className="text-xs text-gray-300">Secure AI Chat</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
                >
                    <Settings size={24} />
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 w-full max-w-2xl glass-panel p-4 mb-4 overflow-y-auto min-h-[60vh] flex flex-col gap-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-70">
                        <Bot size={48} className="mb-4" />
                        <p>Start a conversation with your {currentPersona.name.toLowerCase()}!</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                ? 'bg-white/20 text-white rounded-tr-none'
                                : 'bg-black/40 text-gray-100 rounded-tl-none border border-white/5'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-black/40 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-2">
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="w-full max-w-2xl glass-panel p-2 flex items-end gap-2 z-10">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 border-none outline-none resize-none p-3 max-h-32 focus:ring-0"
                    rows={1}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className={`p-3 rounded-xl transition-all ${input.trim()
                            ? `${currentPersona.themeColor} text-white shadow-lg`
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <Send size={20} />
                </button>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentMode={mode}
                onSelectMode={setMode}
            />
        </main>
    );
}
