/**
 * KioskCard — Phase 1: Touch UX Hardening (UI-DES-010)
 *
 * Generic card container for kiosk screens.
 * Enforces consistent spacing, border radius, and padding.
 * Use for content sections, info blocks, and form wrappers.
 *
 * @example
 * <KioskCard title="Your Bills">
 *   <BillList ... />
 * </KioskCard>
 */

export function KioskCard({
    children,
    title,
    subtitle,
    icon,
    className = '',
    noPadding = false,
    id,
}) {
    return (
        <div
            id={id}
            className={[
                'bg-white rounded-2xl shadow-sm border border-gray-200',
                noPadding ? '' : 'p-6',
                className,
            ].join(' ')}
        >
            {(title || subtitle || icon) && (
                <div className="flex items-center gap-3 mb-4">
                    {icon && (
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                            {icon}
                        </div>
                    )}
                    <div>
                        {title && (
                            <h3 className="text-lg font-bold text-[#212529]">{title}</h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-gray-500">{subtitle}</p>
                        )}
                    </div>
                </div>
            )}
            {children}
        </div>
    );
}
