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
    const baseClasses = 'font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-center transition-colors shadow-sm';

    const variantClasses = {
        primary: 'bg-[#0066CC] text-white hover:bg-[#0052A3] active:bg-[#004080] shadow-blue-200',
        secondary: 'bg-white text-[#212529] hover:bg-gray-50 active:bg-gray-100 border-2 border-gray-300 shadow-gray-100',
        success: 'bg-[#28A745] text-white hover:bg-[#218838] active:bg-[#1e7e34] shadow-green-200',
        danger: 'bg-[#DC3545] text-white hover:bg-[#c82333] active:bg-[#bd2130] shadow-red-200',
        warning: 'bg-[#FF9800] text-white hover:bg-[#e68900] active:bg-[#cc7a00] shadow-orange-200'
    };

    const sizeClasses = {
        large: 'px-8 py-5 text-xl min-h-[64px]',
        medium: 'px-6 py-4 text-lg min-h-[56px]',
        small: 'px-4 py-2 text-base min-h-[44px]'
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
