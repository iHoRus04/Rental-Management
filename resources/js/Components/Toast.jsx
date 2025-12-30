import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

// Global toast function that can be called from anywhere
let globalAddToast = null;

export function showToast(type, message) {
    if (globalAddToast) {
        globalAddToast(type, message);
    }
}

export default function Toast() {
    const { flash } = usePage().props;
    const [toasts, setToasts] = useState([]);
    const [lastFlash, setLastFlash] = useState({});

    const addToast = (type, message) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, type, message }]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    // Make addToast available globally
    useEffect(() => {
        globalAddToast = addToast;
        return () => {
            globalAddToast = null;
        };
    }, []);

    useEffect(() => {
        // Only show toast if flash message is different from last one
        if (flash?.success && flash.success !== lastFlash.success) {
            addToast('success', flash.success);
            setLastFlash(prev => ({ ...prev, success: flash.success }));
        }
        if (flash?.error && flash.error !== lastFlash.error) {
            addToast('error', flash.error);
            setLastFlash(prev => ({ ...prev, error: flash.error }));
        }
        if (flash?.info && flash.info !== lastFlash.info) {
            addToast('info', flash.info);
            setLastFlash(prev => ({ ...prev, info: flash.info }));
        }
        if (flash?.warning && flash.warning !== lastFlash.warning) {
            addToast('warning', flash.warning);
            setLastFlash(prev => ({ ...prev, warning: flash.warning }));
        }
    }, [flash]);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const getToastStyles = (type) => {
        const styles = {
            success: {
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                text: 'text-emerald-800',
                icon: (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            },
            error: {
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-800',
                icon: (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            },
            info: {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-800',
                icon: (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            },
            warning: {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                text: 'text-yellow-800',
                icon: (
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                )
            }
        };
        return styles[type] || styles.info;
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-3">
            {toasts.map(toast => {
                const style = getToastStyles(toast.type);
                return (
                    <div
                        key={toast.id}
                        className={`${style.bg} ${style.border} ${style.text} border-2 rounded-[16px] shadow-lg p-4 min-w-[320px] max-w-md animate-slideIn`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                {style.icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm leading-relaxed">
                                    {toast.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
