import { Loader2 } from 'lucide-react';

export function TouchButton({
    children,
    variant = 'primary',
    size = 'medium',
    loading = false,
    icon,
    className = '',
    disabled,
    ...props
}) {
    const baseClasses = 'font-semibold rounded-lg transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

    const variantClasses = {
        primary: 'bg-[#0066CC] text-white hover:bg-[#0052A3] active:bg-[#004080]',
        secondary: 'bg-gray-100 text-[#212529] hover:bg-gray-200 active:bg-gray-300 border border-gray-300',
        success: 'bg-[#28A745] text-white hover:bg-[#218838] active:bg-[#1e7e34]',
        danger: 'bg-[#DC3545] text-white hover:bg-[#c82333] active:bg-[#bd2130]',
        warning: 'bg-[#FF9800] text-white hover:bg-[#e68900] active:bg-[#cc7a00]'
    };

    const sizeClasses = {
        large: 'px-6 py-3 text-base',
        medium: 'px-4 py-2 text-sm',
        small: 'px-3 py-1.5 text-sm'
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled && !loading && props.onClick) {
                props.onClick(e);
            }
        }
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled || loading}
            onKeyDown={handleKeyDown}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    {icon}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
}
