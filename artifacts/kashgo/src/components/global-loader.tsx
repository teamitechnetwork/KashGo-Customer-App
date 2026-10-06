import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type LoadingContextValue = {
  isLoading: boolean;
  label: string;
  run: <T>(label: string, task: () => Promise<T>) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  const [label, setLabel] = useState('Loading securely…');

  const run = useCallback(async <T,>(nextLabel: string, task: () => Promise<T>) => {
    setLabel(nextLabel);
    setActive((count) => count + 1);
    try {
      return await task();
    } finally {
      setActive((count) => Math.max(0, count - 1));
    }
  }, []);

  const value = useMemo(
    () => ({ isLoading: active > 0, label, run }),
    [active, label, run],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {active > 0 && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-[#341426]/35 px-6 backdrop-blur-[3px]"
          role="status"
          aria-live="polite"
          aria-label={label}
        >
          <div className="w-full max-w-[300px] rounded-[28px] bg-white px-7 py-6 text-center shadow-[0_24px_70px_rgba(52,20,38,.24)]">
            <div className="relative mx-auto h-16 w-16">
              <div className="absolute inset-0 animate-spin rounded-full border-[5px] border-[#dcecdf] border-t-[#0b614c]" />
              <div className="absolute inset-[9px] animate-[spin_1.5s_linear_infinite_reverse] rounded-full border-[4px] border-[#f1d0df] border-b-[#b71362]" />
            </div>
            <p className="mt-5 text-[15px] font-bold text-[#3f2635]">{label}</p>
            <p className="mt-1 text-[12px] text-[#786c73]">Please keep this screen open.</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const value = useContext(LoadingContext);
  if (!value) throw new Error('useGlobalLoading must be used inside GlobalLoadingProvider');
  return value;
}