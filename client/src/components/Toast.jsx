import React, { useEffect } from 'react';
import { LogIn, AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose, onOpenAuth }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isAuth = toast.type === 'auth';
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="glass-modal bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl shadow-amber-500/10 flex items-start gap-3.5 text-slate-100">
        
        {/* Icon */}
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0 mt-0.5">
          {isAuth ? (
            <LogIn className="w-5 h-5 stroke-[2.5]" />
          ) : isSuccess ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-rose-400 stroke-[2.5]" />
          ) : (
            <Info className="w-5 h-5 text-sky-400 stroke-[2.5]" />
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            {isAuth ? 'Ação Requer Login' : isSuccess ? 'Sucesso' : isError ? 'Atenção' : 'Notificação'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-snug">
            {toast.message}
          </p>

          {/* Direct Auth Action Button if requires login */}
          {(isAuth || toast.showAuthBtn) && (
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-lg shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" /> Fazer Login Agora
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
