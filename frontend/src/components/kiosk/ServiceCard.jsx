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

function parseRgbString(rgb) {
    // rgb(a) formats: rgb(r,g,b) or rgba(r,g,b,a)
    const m = rgb.match(/rgba?\(([^)]+)\)/i);
    if (!m) return null;
    const parts = m[1].split(',').map(p => p.trim());
    const r = parseFloat(parts[0]);
    const g = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    return `rgba(${r}, ${g}, ${b}, 0.125)`;
}

function parseHslString(hsl) {
    // hsl(a) formats: hsl(h, s%, l%) or hsla(h, s%, l%, a)
    const m = hsl.match(/hsla?\(([^)]+)\)/i);
    if (!m) return null;
    const parts = m[1].split(',').map(p => p.trim());
    const h = parts[0];
    const s = parts[1];
    const l = parts[2];
    return `hsla(${h}, ${s}, ${l}, 0.125)`;
}

export function ServiceCard({ icon, title, onClick, color }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };

    const bgColor = (() => {
        if (!color) return undefined;
        const value = String(color).trim();
        if (value.startsWith('#')) {
            const rgba = hexToRgba(value, 0.125);
            if (rgba) return rgba;
        }
        if (/^rgb/i.test(value)) {
            const rgba = parseRgbString(value);
            if (rgba) return rgba;
        }
        if (/^hsl/i.test(value)) {
            const hsla = parseHslString(value);
            if (hsla) return hsla;
        }
        // Fallback to color-mix for named or CSS variable colors
        return `color-mix(in srgb, ${value} 12.5%, transparent)`;
    })();

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
