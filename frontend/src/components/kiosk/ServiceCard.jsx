/**
 * ServiceCard — Phase 1: Touch UX Hardening (FR-UX-001)
 *
 * KIOSK-GRADE service selection card with:
 * - 80px minimum dimensions enforced
 * - touchAction: manipulation
 * - Focus ring + keyboard support
 * - Color-safe background computation
 */

function hexToRgba(hex, alpha = 0.125) {
    const h = hex.replace('#', '').trim();
    if (h.length === 3) {
        const r = parseInt(h[0] + h[0], 16);
        const g = parseInt(h[1] + h[1], 16);
        const b = parseInt(h[2] + h[2], 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (h.length === 6 || h.length === 8) {
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        if (h.length === 8) {
            const a = parseInt(h.substring(6, 8), 16) / 255;
            return `rgba(${r}, ${g}, ${b}, ${a * alpha})`;
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return null;
}

export function ServiceCard({ icon, title, onClick, color, description }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };

    const bgColor = (() => {
        if (!color) return undefined;
        const value = String(color).trim();
        if (value.startsWith('#')) return hexToRgba(value, 0.125);
        return `color-mix(in srgb, ${value} 12.5%, transparent)`;
    })();

    return (
        <button
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role="button"
            aria-label={title}
            className={[
                'bg-white rounded-xl shadow-sm border-2 border-gray-200',
                'p-6 flex flex-col items-center justify-center gap-4',
                'hover:shadow-lg hover:border-gray-300 active:scale-[0.97]',
                'transition-all duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066CC]',
                'select-none',
                // FR-UX-001: minimum touch target
                'min-h-[120px] min-w-[120px]',
            ].join(' ')}
            style={{ touchAction: 'manipulation' }}
        >
            <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
            >
                <div style={{ color }} className="w-8 h-8" aria-hidden="true">
                    {icon}
                </div>
            </div>
            <span className="text-base font-semibold text-[#212529] text-center leading-snug">
                {title}
            </span>
            {description && (
                <span className="text-xs text-gray-500 text-center easy-mode-hide">
                    {description}
                </span>
            )}
        </button>
    );
}
