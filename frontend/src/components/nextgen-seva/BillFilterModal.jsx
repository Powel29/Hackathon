import { useState, useEffect } from 'react';
import { X, Calendar, Filter, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TouchButton } from './TouchButton';

export function BillFilterModal({ isOpen, onClose, onApply, activeFilter }) {
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (activeFilter) {
            setStartDate(activeFilter.startDate || '');
            setEndDate(activeFilter.endDate || '');
        } else {
            setStartDate('');
            setEndDate('');
        }
    }, [activeFilter, isOpen]);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply({
            startDate,
            endDate
        });
        onClose();
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        onApply(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-[#0066CC] p-6 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <Filter className="w-6 h-6" />
                        <h3 className="text-xl font-bold">{t('bills.filterBills', 'Filter Bills')}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            {t('bills.dateRange', 'Date Range')}
                        </h4>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">
                                    {t('bills.startDate', 'Start Date')}
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">
                                    {t('bills.endDate', 'End Date')}
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <TouchButton
                            variant="secondary"
                            className="flex-1"
                            onClick={handleReset}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <RotateCcw className="w-4 h-4" />
                                <span>{t('common.reset', 'Reset')}</span>
                            </div>
                        </TouchButton>
                        <TouchButton
                            variant="primary"
                            className="flex-1"
                            onClick={handleApply}
                        >
                            {t('common.apply', 'Apply')}
                        </TouchButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
