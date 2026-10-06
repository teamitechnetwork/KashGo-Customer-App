import { createContext, useContext, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type LoadingContextValue = {
  show: (message?: string) => void;
  hide: () => void;
  loading: boolean;
  message: string;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function useGlobalLoading() {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useGlobalLoading must be used inside GlobalLoadingProvider');
  return context;
}

export function LoadingPanel({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-[#a71958]" role="status" aria-live="polite">
      <div className="relative grid h-14 w-14 place-items-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#d8efdf] border-t-[#a71958] border-r-[#075541]" />
        <Loader2 size={22} className="text-[#075541]" />
      </div>
      <p className="text-[14px] font-semibold">{label}</p>
    </div>
  );
}

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ loading: false, message: 'Loading...' });
  const value: LoadingContextValue = {
    ...state,
    show: (message = 'Loading...') => setState({ loading: true, message }),
    hide: () => setState((current) => ({ ...current, loading: false })),
  };
  return (
    <LoadingContext.Provider value={value}>
      {children}
      {state.loading && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-white/70 px-6 backdrop-blur-[2px]">
          <div className="rounded-[22px] bg-white px-8 py-7 shadow-[0_20px_50px_rgba(57,32,52,.18)]">
            <LoadingPanel label={state.message} />
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}