import { useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * TouchButton — Phase 1: Touch UX Hardening (FR-UX-001, FR-UX-002)
 *
 * KIOSK-GRADE interactive button with:
 * - 80px minimum touch target (kiosk sizes)
 * - Double-submit prevention via debounce lock
 * - touchAction: manipulation (no zoom/scroll on tap)
 * - aria-busy for loading state
 * - Keyboard Enter/Space support
 *
 * Variants: primary | secondary | success | danger | warning | ghost | outline
 * Sizes:    large (kiosk default) | medium | small | icon
 */

const DEBOUNCE_MS = 600; // Prevent double-tap within 600ms

export function TouchButton({
    children,
    variant = 'primary',
    size = 'large',
    loading = false,
    icon,
    className = '',
    disabled,
    onClick,
    type = 'button',
    ariaLabel,
    id,
    ...props
}) {
    const lastClickRef = useRef(0);

    // Double-submit guard (FR-UX-002)
    const handleClick = useCallback((e) => {
        if (loading || disabled) return;
        const now = Date.now();
        if (now - lastClickRef.current < DEBOUNCE_MS) {
            e.preventDefault();
            return;
        }
        lastClickRef.current = now;
        onClick?.(e);
    }, [onClick, loading, disabled]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
        }
    };

    const baseClasses = [
        'font-semibold rounded-xl transition-all',
        'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center justify-center gap-3',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066CC]',
        'select-none',
    ].join(' ');

    const variantClasses = {
        primary: 'bg-[#0066CC] text-white hover:bg-[#0052A3] active:bg-[#004080]',
        secondary: 'bg-gray-100 text-[#212529] hover:bg-gray-200 active:bg-gray-300 border border-gray-300',
        success: 'bg-[#28A745] text-white hover:bg-[#218838] active:bg-[#1e7e34]',
        danger: 'bg-[#DC3545] text-white hover:bg-[#c82333] active:bg-[#bd2130]',
        warning: 'bg-[#FF9800] text-white hover:bg-[#e68900] active:bg-[#cc7a00]',
        ghost: 'bg-transparent text-[#0066CC] hover:bg-blue-50 active:bg-blue-100',
        outline: 'bg-transparent text-[#0066CC] border-2 border-[#0066CC] hover:bg-blue-50 active:bg-blue-100',
    };

    // Size classes enforce FR-UX-001 (80px min for kiosk targets)
    const sizeClasses = {
        large: 'px-8 py-4 text-lg min-h-[80px] min-w-[80px]',      // Kiosk default
        medium: 'px-6 py-3 text-base min-h-[56px] min-w-[56px]',    // Secondary actions
        small: 'px-4 py-2 text-sm min-h-[44px] min-w-[44px]',      // Non-kiosk, admin UI
        icon: 'p-4 min-h-[56px] min-w-[56px]',                    // Icon-only buttons
    };

    const isDisabledOrLoading = disabled || loading;

    return (
        <button
            id={id}
            type={type}
            className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.large} ${className}`}
            disabled={isDisabledOrLoading}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-label={ariaLabel}
            aria-busy={loading}
            aria-disabled={isDisabledOrLoading}
            style={{ touchAction: 'manipulation' }}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span className="sr-only">Loading...</span>
                </>
            ) : (
                <>
                    {icon && <span aria-hidden="true">{icon}</span>}
                    {children && <span>{children}</span>}
                </>
            )}
        </button>
    );
}
