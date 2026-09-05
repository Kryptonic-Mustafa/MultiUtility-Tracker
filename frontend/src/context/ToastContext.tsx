'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, LogOut, Trash2, HelpCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: 'logout' | 'delete' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  confirmAction: (options: ConfirmModalOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalOptions | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, message, type, title };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirmAction = useCallback((options: ConfirmModalOptions) => {
    setConfirmModal(options);
  }, []);

  const handleModalConfirm = async () => {
    if (!confirmModal) return;
    setIsConfirmLoading(true);
    try {
      await confirmModal.onConfirm();
    } catch (error) {
      console.error("Modal confirmation action failed:", error);
    } finally {
      setIsConfirmLoading(false);
      setConfirmModal(null);
    }
  };

  const renderModalIcon = () => {
    if (!confirmModal) return null;
    const iconType = confirmModal.icon || (confirmModal.type === 'danger' ? 'delete' : 'warning');

    switch (iconType) {
      case 'logout':
        return (
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/20">
            <LogOut className="w-7 h-7" />
          </div>
        );
      case 'delete':
        return (
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/20">
            <Trash2 className="w-7 h-7" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
            <AlertTriangle className="w-7 h-7" />
          </div>
        );
      default:
        return (
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20">
            <HelpCircle className="w-7 h-7" />
          </div>
        );
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, confirmAction }}>
      {children}

      {/* DOM Portal directly mounted to document.body */}
      {mounted && createPortal(
        <>
          {/* Toast Stack - Positioned Below Top Header Nav Bar (top: 88px, right: 24px) */}
          <div
            style={{
              position: 'fixed',
              top: '88px',
              right: '24px',
              zIndex: 99999999,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxWidth: '380px',
              width: '100%',
              pointerEvents: 'none'
            }}
          >
            <AnimatePresence>
              {toasts.map((toast) => {
                const isSuccess = toast.type === 'success';
                const isError = toast.type === 'error';
                const isWarning = toast.type === 'warning';

                // Solid 100% Opaque Colors (SweetAlert Style)
                const cardBg = isSuccess
                  ? '#059669' // Solid Vivid Emerald Green
                  : isError
                  ? '#dc2626' // Solid Vivid Red
                  : isWarning
                  ? '#d97706' // Solid Vivid Amber Yellow
                  : '#4f46e5'; // Solid Vivid Indigo Blue

                const cardBorder = isSuccess
                  ? '#34d399'
                  : isError
                  ? '#f87171'
                  : isWarning
                  ? '#fbbf24'
                  : '#818cf8';

                return (
                  <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      color: '#ffffff',
                      pointerEvents: 'auto',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ paddingTop: '2px', flexShrink: 0 }}>
                      {isSuccess && <CheckCircle2 className="w-6 h-6 text-white" />}
                      {isError && <AlertCircle className="w-6 h-6 text-white" />}
                      {isWarning && <AlertTriangle className="w-6 h-6 text-white" />}
                      {!isSuccess && !isError && !isWarning && <Info className="w-6 h-6 text-white" />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                      {toast.title && (
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', marginBottom: '2px', letterSpacing: '0.025em' }}>
                          {toast.title}
                        </h4>
                      )}
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', lineHeight: 1.4, margin: 0, wordBreak: 'break-word' }}>
                        {toast.message}
                      </p>
                    </div>

                    <button
                      onClick={() => removeToast(toast.id)}
                      style={{
                        padding: '4px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Modern Confirmation Modal - Fixed Fullscreen Centered Overlay */}
          <AnimatePresence>
            {confirmModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 99999999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px'
                }}
              >
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !isConfirmLoading && setConfirmModal(null)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)'
                  }}
                />

                {/* Dialog Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative z-10 w-full max-w-md bg-[#0f172a] border border-slate-700/90 rounded-3xl p-6 shadow-2xl shadow-black/90 text-gray-100 flex flex-col items-center text-center gap-4"
                >
                  {renderModalIcon()}

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-wide text-white">
                      {confirmModal.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed max-w-sm">
                      {confirmModal.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full mt-2">
                    <button
                      disabled={isConfirmLoading}
                      onClick={() => setConfirmModal(null)}
                      className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-gray-300 font-semibold text-sm transition-all disabled:opacity-50"
                    >
                      {confirmModal.cancelText || 'Cancel'}
                    </button>
                    <button
                      disabled={isConfirmLoading}
                      onClick={handleModalConfirm}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                        confirmModal.type === 'danger' || confirmModal.icon === 'logout' || confirmModal.icon === 'delete'
                          ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-950/60'
                          : confirmModal.type === 'warning'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-950/60'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-950/60'
                      }`}
                    >
                      {isConfirmLoading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        confirmModal.confirmText || 'Confirm'
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
