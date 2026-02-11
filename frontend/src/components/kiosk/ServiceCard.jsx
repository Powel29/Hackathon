export function ServiceCard({ icon, title, onClick, color }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <button
            onClick={onClick}
            onKeyDown={handleKeyDown}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center gap-4 hover:shadow-md hover:border-gray-300 active:scale-98 transition-all focus:ring-2 focus:ring-[#0066CC] focus:outline-none"
            style={{ touchAction: 'manipulation' }}
        >
            <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: color + '20' }}
            >
                <div style={{ color }} className="w-8 h-8">
                    {icon}
                </div>
            </div>
            <span className="text-base font-semibold text-[#212529] text-center">
                {title}
            </span>
        </button>
    );
}
