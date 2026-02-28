import { useEffect, useState } from 'react';
import { MessageCircle, X, Maximize2, Minimize2, Maximize, Minimize, Bot } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import BillingChatbot from './BillingChatbot';

export default function ChatWidget() {
    const { isAuthenticated } = useKioskStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showHelperMessage, setShowHelperMessage] = useState(false);
    const [isHelperExiting, setIsHelperExiting] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (isFullScreen) setIsFullScreen(false);
    };

    const chatWindowStyle = isMinimized
        ? { width: '64px', height: '64px' }
        : isFullScreen
            ? { width: '100%', height: '100%' }
            : {
                width: 'min(500px, calc(100vw - 32px))',
                height: 'min(600px, calc(100dvh - 120px))'
            };

    useEffect(() => {
        if (isOpen) {
            setIsHelperExiting(false);
            setShowHelperMessage(false);
            return;
        }

        let hideStartTimer;
        let hideEndTimer;

        const runHelperCycle = () => {
            setIsHelperExiting(false);
            setShowHelperMessage(true);

            hideStartTimer = setTimeout(() => {
                setIsHelperExiting(true);

                hideEndTimer = setTimeout(() => {
                    setShowHelperMessage(false);
                    setIsHelperExiting(false);
                }, 280);
            }, 5200);
        };

        const intervalId = setInterval(runHelperCycle, 300000);
        const initialTimer = setTimeout(runHelperCycle, 300000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(initialTimer);
            clearTimeout(hideStartTimer);
            clearTimeout(hideEndTimer);
        };
    }, [isOpen]);

    if (!isAuthenticated) return null;

    return (
        <div className={`
            fixed z-[9999] flex flex-col items-end gap-4 transition-all duration-300
            ${isFullScreen ? 'inset-4 sm:inset-10' : 'bottom-20 right-4 sm:bottom-22 sm:right-6'}
        `}>
            <style>{`
                .chat-helper-popout {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: #ffffff;
                    border: 1px solid rgba(255,255,255,0.18);
                    box-shadow: 0 12px 28px rgba(29, 78, 216, 0.35);
                    transform-origin: right center;
                }

                .chat-helper-popout.helper-enter {
                    animation: chatbotPopIn 320ms ease-out both;
                }

                .chat-helper-popout.helper-exit {
                    animation: chatbotPopOut 280ms ease-in both;
                }

                .chat-helper-popout::after {
                    content: '';
                    position: absolute;
                    right: -6px;
                    top: 50%;
                    width: 12px;
                    height: 12px;
                    transform: translateY(-50%) rotate(45deg);
                    background: #1d4ed8;
                    border-top: 1px solid rgba(255,255,255,0.18);
                    border-right: 1px solid rgba(255,255,255,0.18);
                }

                @keyframes chatbotPopIn {
                    0% { opacity: 0; transform: translateX(16px) scale(0.92); }
                    100% { opacity: 1; transform: translateX(0) scale(1); }
                }

                @keyframes chatbotPopOut {
                    0% { opacity: 1; transform: translateX(0) scale(1); }
                    100% { opacity: 0; transform: translateX(16px) scale(0.92); }
                }
            `}</style>

            {/* Chat Window Overlay */}
            {isOpen && (
                <div
                    className={`
                        bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out
                        ${isMinimized ? 'rounded-full' : 'rounded-2xl'}
                        ${isFullScreen ? 'h-full w-full' : ''}
                    `}
                    style={{
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        ...chatWindowStyle
                    }}
                >
                    {isMinimized ? (
                        <button
                            onClick={() => setIsMinimized(false)}
                            className="w-full h-full flex items-center justify-center bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                            title="Open chat"
                            style={{ border: 'none' }}
                        >
                            <MessageCircle size={26} />
                        </button>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="bg-slate-800/50 p-3 flex items-center justify-between border-bottom border-slate-700">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-white font-semibold text-sm">Billing Assistant</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsFullScreen(!isFullScreen)}
                                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                        title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                    >
                                        {isFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
                                    </button>

                                    {!isFullScreen && (
                                        <button
                                            onClick={() => setIsMinimized(true)}
                                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                        >
                                            <Minimize2 size={16} />
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
                        <div className="flex-1 overflow-hidden relative">
                            <BillingChatbot />
                        </div>
                        </>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3">
                {!isOpen && showHelperMessage && (
                    <div className={`chat-helper-popout ${isHelperExiting ? 'helper-exit' : 'helper-enter'} relative rounded-xl px-3 py-2 text-sm font-semibold flex items-center gap-2`}>
                        <Bot size={16} className="text-white shrink-0" />
                        <span>Hi, If you need help I am there</span>
                    </div>
                )}

                {/* Floating Toggle Button */}
                <button
                    onClick={toggleChat}
                    className={`
                        w-16 h-16 min-w-16 min-h-16 max-w-16 max-h-16 aspect-square shrink-0 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-90
                        ${isOpen ? 'bg-slate-800 text-white rotate-90 scale-0 opacity-0' : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/20 hover:scale-110'}
                    `}
                    style={{
                        position: isOpen ? 'absolute' : 'relative',
                        width: '64px',
                        height: '64px',
                        minWidth: '64px',
                        minHeight: '64px',
                        maxWidth: '64px',
                        maxHeight: '64px',
                        borderRadius: '9999px',
                        padding: 0,
                        lineHeight: 0,
                        border: 'none',
                    }}
                >
                    <MessageCircle size={32} />
                </button>
            </div>

            {/* Close Button replacement when open (if desired, but header X is usually enough) */}
            {isOpen && !isMinimized && (
                <div className="hidden">
                    {/* Optional extra elements */}
                </div>
            )}
        </div>
    );
}
