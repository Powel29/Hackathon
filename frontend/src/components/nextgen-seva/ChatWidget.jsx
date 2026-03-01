import { useState } from 'react';
import { MessageCircle, X, Maximize2, Minimize2, Maximize, Minimize } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import BillingChatbot from './BillingChatbot';

export default function ChatWidget() {
    const { isAuthenticated } = useKioskStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (isFullScreen) setIsFullScreen(false);
    };

    if (!isAuthenticated) return null;

    return (
        <div className={`
            fixed z-[9999] flex flex-col items-end gap-4 transition-all duration-300
            ${isFullScreen ? 'inset-4 sm:inset-10' : 'bottom-20 right-4 sm:bottom-22 sm:right-6'}
        `}>
            {/* Chat Window Overlay */}
            {isOpen && (
                <div
                    className={`
                        bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out
                        ${isMinimized ? 'h-14 w-64' : isFullScreen ? 'h-full w-full' : 'h-[calc(100vh-120px)] sm:h-[600px] w-[calc(100vw-32px)] sm:w-[500px]'}
                    `}
                    style={{
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        maxWidth: '100%',
                        maxHeight: '100%'
                    }}
                >
                    {/* Header */}
                    <div className="bg-slate-800/50 p-3 flex items-center justify-between border-bottom border-slate-700">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-white font-semibold text-sm">NextGen Seva Assistant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Full Screen Toggle */}
                            {!isMinimized && (
                                <button
                                    onClick={() => setIsFullScreen(!isFullScreen)}
                                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                    title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                >
                                    {isFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
                                </button>
                            )}

                            {/* Height Minimize Toggle */}
                            {!isFullScreen && (
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                >
                                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                </button>
                            )}
                            <button
                                onClick={toggleChat}
                                className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Content */}
                    {!isMinimized && (
                        <div className="flex-1 overflow-hidden relative">
                            <BillingChatbot />
                        </div>
                    )}
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={toggleChat}
                className={`
                    w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-90
                    ${isOpen ? 'bg-slate-800 text-white rotate-90 scale-0 opacity-0' : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/20 hover:scale-110'}
                `}
                style={{
                    position: isOpen ? 'absolute' : 'relative',
                }}
            >
                <MessageCircle size={32} />
            </button>

            {/* Close Button replacement when open (if desired, but header X is usually enough) */}
            {isOpen && !isMinimized && (
                <div className="hidden">
                    {/* Optional extra elements */}
                </div>
            )}
        </div>
    );
}
