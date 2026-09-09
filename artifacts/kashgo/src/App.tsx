import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type InputHTMLAttributes, type ReactNode, type SetStateAction } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, Banknote, Bell, Check, ChevronRight, CircleHelp, CreditCard,
  Eye, EyeOff, HandHeart, House, Landmark, LogOut, Menu, MoreHorizontal, Phone,
  Receipt, Search, Send, Settings, ShieldCheck, Smartphone, Sparkles, UserRound,
  WalletCards, Wifi, X, Zap,
  type LucideIcon,
} from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const STORAGE_KEY = 'kashgo-state-v3';

type Currency = 'USD' | 'LRD';
type Activity = {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  currency: Currency;
  direction: 'in' | 'out';
  date: string;
  icon: 'send' | 'airtime' | 'gift' | 'bill' | 'give' | 'in';
};
type AppState = {
  authenticated: boolean;
  phone: string;
  name: string;
  email: string;
  hideBalance: boolean;
  notifications: boolean;
  biometrics: boolean;
  activities: Activity[];
  balances: { usd: number; lrd: number };
};

const emptyState: AppState = {
  authenticated: false,
  phone: '',
  name: '',
  email: '',
  hideBalance: false,
  notifications: true,
  biometrics: false,
  activities: [],
  balances: { usd: 0, lrd: 0 },
};

function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return emptyState;
      const parsed = JSON.parse(saved) as Partial<AppState>;
      return { ...emptyState, ...parsed, balances: { ...emptyState.balances, ...(parsed.balances ?? {}) } };
    } catch {
      return emptyState;
    }
  });
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  return [state, setState] as const;
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? 'scale-90 origin-left' : ''}`} data-testid="brand-kashgo">
      <span className="relative grid h-9 w-9 place-items-center rounded-[12px] bg-[hsl(var(--primary))] text-white shadow-[3px_3px_0_hsl(var(--accent))]">
        <span className="font-display text-[25px] leading-none">k</span>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[hsl(var(--accent))]" />
      </span>
      <span className="text-[25px] font-bold tracking-[-1.8px] text-[hsl(var(--primary))]">kash<span className="text-[hsl(var(--foreground))]">Go</span></span>
    </div>
  );
}

function ExitButton() {
  const [, setLocation] = useLocation();
  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLocation('/welcome');
  };
  return <button onClick={signOut} className="rounded-full p-2 text-[hsl(var(--primary))]" aria-label="Sign out" data-testid="button-sign-out"><LogOut size={19} /></button>;
}

function AppHeader({ title, back = false, onMenu }: { title: string; back?: boolean; onMenu?: () => void }) {
  const [, setLocation] = useLocation();
  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.94)] px-5 backdrop-blur">
      {back ? <button onClick={() => window.history.back()} className="rounded-full p-2 text-[hsl(var(--foreground))]" aria-label="Go back" data-testid="button-go-back"><ArrowLeft size={22} /></button> : <button onClick={onMenu} className="rounded-full p-2 text-[hsl(var(--foreground))]" aria-label="Open menu" data-testid="button-open-menu"><Menu size={23} /></button>}
      <button onClick={() => setLocation('/home')} aria-label="Go home" data-testid="button-header-home"><BrandMark compact /></button>
      <ExitButton />
      <span className="sr-only">{title}</span>
    </header>
  );
}

function BalanceCard({ state }: { state: AppState }) {
  const [visible, setVisible] = useState(!state.hideBalance);
  const money = (value: number, currency: Currency) => visible ? `${currency === 'USD' ? '$' : 'L$'}${value.toFixed(2)}` : '••••';
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-soft)]" data-testid="card-wallet-balances">
      <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full border-[22px] border-[hsl(var(--accent)/.28)]" />
      <div className="relative flex items-start justify-between">
        <div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[hsl(var(--accent))]">KashGo wallet</p><p className="mt-1 text-[13px] opacity-80">Ready when your people need you.</p></div>
        <button onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Hide balances' : 'Show balances'} className="rounded-full p-1" data-testid="button-toggle-balance">{visible ? <Eye size={19} /> : <EyeOff size={19} />}</button>
      </div>
      <div className="relative mt-7 grid grid-cols-2 gap-3">
        {(['USD', 'LRD'] as Currency[]).map((currency) => <div key={currency} className="rounded-[16px] bg-white/10 p-3" data-testid={`balance-${currency.toLowerCase()}`}><p className="text-[11px] font-bold tracking-[.16em] opacity-75">{currency}</p><p className="mt-1 font-mono text-[18px] font-bold">{money(state.balances[currency.toLowerCase() as 'usd' | 'lrd'], currency)}</p></div>)}
      </div>
    </section>
  );
}

function BottomNav({ active }: { active: string }) {
  const links = [{ href: '/home', label: 'Home', icon: House }, { href: '/transfers', label: 'Activity', icon: WalletCards }, { href: '/account', label: 'Wallet', icon: Landmark }, { href: '/options', label: 'More', icon: MoreHorizontal }];
  return <nav className="safe-bottom fixed bottom-0 left-1/2 z-30 flex w-full max-w-[460px] -translate-x-1/2 items-start justify-around border-t border-[hsl(var(--border))] bg-[hsl(var(--card)/.96)] px-2 pt-3 shadow-[0_-10px_30px_rgba(70,46,33,.05)] backdrop-blur" aria-label="Primary navigation">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 pb-2 text-[11px] font-semibold ${active === label ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid={`link-nav-${label.toLowerCase()}`}><Icon size={21} strokeWidth={active === label ? 2.7 : 2} /><span>{label}</span></Link>)}</nav>;
}

function MenuDrawer({ close }: { close: () => void }) {
  const items = [
    { label: 'Home', href: '/home', icon: House }, { label: 'Add money', href: '/fund', icon: Banknote },
    { label: 'Send money home', href: '/send', icon: Send }, { label: 'Pay services', href: '/services', icon: Zap },
    { label: 'Fees & rates', href: '/fees', icon: Receipt }, { label: 'Help centre', href: '/faqs', icon: CircleHelp },
  ];
  return <div className="fixed inset-0 z-50 bg-[hsl(var(--foreground)/.38)]" onClick={close}><aside className="flex h-full w-[86%] max-w-[360px] flex-col bg-[hsl(var(--background))] px-6 pb-5 pt-8 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><BrandMark /><button onClick={close} aria-label="Close menu" className="rounded-full p-2" data-testid="button-close-menu"><X size={22} /></button></div><p className="mt-12 text-[11px] font-bold uppercase tracking-[.17em] text-[hsl(var(--muted-foreground))]">Your KashGo shortcuts</p><div className="mt-4 space-y-1">{items.map(({ label, href, icon: Icon }) => <Link key={label} href={href} onClick={close} className="flex items-center gap-4 rounded-[14px] px-3 py-3 text-[16px] font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]" data-testid={`link-drawer-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={20} className="text-[hsl(var(--primary))]" /><span>{label}</span><ChevronRight size={17} className="ml-auto text-[hsl(var(--muted-foreground))]" /></Link>)}</div><div className="mt-auto rounded-[18px] bg-[hsl(var(--secondary))] p-4 text-[hsl(var(--secondary-foreground))]"><ShieldCheck size={22} /><p className="mt-3 text-[14px] font-semibold">Your wallet, with clarity.</p><p className="mt-1 text-[12px] leading-5 opacity-80">We show fees and payment status before you take the next step.</p></div></aside></div>;
}

function Shell({ children, title, active, back = false, balance = false, menu = false }: { children: ReactNode; title: string; active: string; back?: boolean; balance?: boolean; menu?: boolean }) {
  const [drawer, setDrawer] = useState(false);
  const [state] = useAppState();
  return <div className="app-grain min-h-[100dvh] bg-[hsl(var(--background))] pb-[92px]"><AppHeader title={title} back={back} onMenu={() => setDrawer(true)} />{balance && <div className="px-5 pb-5 pt-4"><BalanceCard state={state} /></div>}{children}<BottomNav active={active} />{menu && drawer && <MenuDrawer close={() => setDrawer(false)} />}</div>;
}

function Splash() {
  const [, setLocation] = useLocation();
  useEffect(() => { const timer = window.setTimeout(() => setLocation('/welcome'), 700); return () => window.clearTimeout(timer); }, [setLocation]);
  return <main className="flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--background))]"><div className="animate-rise text-center"><BrandMark /><p className="mt-8 font-mono text-[11px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">A clearer way home</p></div></main>;
}

function Welcome() {
  return <main className="app-grain min-h-[100dvh] overflow-hidden bg-[hsl(var(--background))]"><div className="mx-auto flex min-h-[100dvh] w-full max-w-[460px] flex-col px-6 pb-7 pt-8"><BrandMark /><div className="animate-rise mt-14"><div className="relative overflow-hidden rounded-[30px] bg-[hsl(var(--secondary))] px-6 pb-7 pt-7 text-[hsl(var(--secondary-foreground))]"><div className="absolute -right-20 -top-16 h-56 w-56 rounded-full border-[28px] border-[hsl(var(--accent)/.24)]" /><div className="relative"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">For Liberia, wherever you are</p><h1 className="font-display mt-10 max-w-[300px] text-[42px] leading-[.99] tracking-[-1.5px]">A calm bridge to home.</h1><p className="mt-5 max-w-[285px] text-[15px] leading-6 opacity-85">Send support to loved ones, hold USD and LRD, and take care of everyday Liberia from one trusted wallet.</p><div className="mt-8 flex items-center gap-2 text-[12px] font-semibold"><span className="grid h-7 w-7 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"><HeartGlyph /></span><span>Made for family, by design.</span></div></div></div></div><div className="animate-rise delay-1 mt-5 grid grid-cols-3 gap-2 text-center"><Feature label="Hold USD + LRD" icon={WalletCards} /><Feature label="Top up safely" icon={CreditCard} /><Feature label="Pay local services" icon={Zap} /></div><div className="animate-rise delay-2 mt-auto space-y-3 pt-8"><Link href="/login" className="flex h-[58px] items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[16px] font-bold text-white shadow-[0_10px_20px_hsl(var(--primary)/.18)]" data-testid="link-welcome-sign-in">Sign in</Link><Link href="/register" className="flex h-[58px] items-center justify-center rounded-full border border-[hsl(var(--primary))] text-[16px] font-bold text-[hsl(var(--primary))]" data-testid="link-welcome-create-account">Create an account</Link><p className="pt-2 text-center text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">Your balance stays clear. Every fee is shown. Payments that need a connection are marked before you continue.</p></div></div></main>;
}

function HeartGlyph() {
  return <span className="text-[15px] leading-none">+</span>;
}

function Feature({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return <div className="rounded-[16px] bg-[hsl(var(--card))] px-2 py-3 shadow-[0_5px_16px_rgba(70,46,33,.05)]"><Icon size={19} className="mx-auto text-[hsl(var(--primary))]" /><p className="mt-2 text-[11px] font-semibold leading-4">{label}</p></div>;
}

function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-left"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">{label}</span><input className="h-12 w-full rounded-[13px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-[16px] text-[hsl(var(--foreground))] outline-none transition focus:border-[hsl(var(--primary))]" {...props} /></label>;
}

function AuthLogo() {
  return <div className="flex justify-center"><BrandMark /></div>;
}

function Login({ setState, create = false }: { setState: Dispatch<SetStateAction<AppState>>; create?: boolean }) {
  const [, setLocation] = useLocation();
  const creating = create || new URLSearchParams(window.location.search).get('create') === '1';
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!phone.trim() || (creating && !name.trim())) return; setState((current) => ({ ...current, phone: phone.trim(), name: name.trim() || current.name })); setLocation(`/pin${creating ? '?create=1' : ''}`); };
  return <main className="app-grain min-h-[100dvh] bg-[hsl(var(--background))]"><div className="mx-auto flex min-h-[100dvh] max-w-[460px] flex-col px-6 pb-7 pt-7"><button onClick={() => setLocation('/welcome')} className="mb-10 self-start rounded-full p-2 text-[hsl(var(--primary))]" aria-label="Back to welcome" data-testid="button-auth-back"><ArrowLeft size={22} /></button><AuthLogo /><div className="mt-12"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">{creating ? 'New wallet' : 'Welcome back'}</p><h1 className="font-display mt-3 text-[36px] leading-none">{creating ? 'Start with the people who matter.' : 'Good to see you again.'}</h1><p className="mt-4 text-[14px] leading-6 text-[hsl(var(--muted-foreground))]">{creating ? 'Create your KashGo profile to send, hold, and pay with clarity.' : 'Sign in with your Liberia mobile number to pick up where you left off.'}</p></div><form onSubmit={submit} className="mt-9 space-y-5">{creating && <Field label="Your name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" autoComplete="name" required data-testid="input-name" />}<Field label="Mobile number" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0776 836 689" inputMode="tel" autoComplete="tel" required data-testid="input-phone" /><button type="button" onClick={() => setRemember((value) => !value)} className="flex items-center gap-3 text-[13px] text-[hsl(var(--muted-foreground))]" data-testid="button-remember-me"><span className={`grid h-5 w-5 place-items-center rounded-[6px] border ${remember ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white' : 'border-[hsl(var(--input))]'}`}>{remember && <Check size={14} />}</span>Remember this device</button><button type="submit" className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] text-[16px] font-bold text-white" data-testid="button-auth-next">Continue <ArrowRight size={18} /></button></form><div className="mt-auto border-t border-[hsl(var(--border))] pt-5 text-center"><p className="text-[12px] leading-5 text-[hsl(var(--muted-foreground))]"><ShieldCheck className="mr-1 inline-block" size={14} /> We will never ask for your PIN in a message.</p>{!creating && <Link href="/register" className="mt-5 block text-[13px] font-bold text-[hsl(var(--primary))]" data-testid="link-auth-register">New to KashGo? Create an account</Link>}</div></div></main>;
}

function PinPage({ setState }: { setState: Dispatch<SetStateAction<AppState>> }) {
  const [, setLocation] = useLocation();
  const [pin, setPin] = useState('');
  const keys = ['1', '8', '5', '3', '0', '6', '4', '2', '9', '7'];
  const submit = (value: string) => { if (value.length === 5) { setState((current) => ({ ...current, authenticated: true })); setLocation('/home'); } };
  return <main className="app-grain min-h-[100dvh] bg-[hsl(var(--background))]"><div className="mx-auto flex min-h-[100dvh] max-w-[460px] flex-col px-6 pb-5 pt-7"><button onClick={() => setLocation('/login')} className="self-start rounded-full p-2 text-[hsl(var(--primary))]" aria-label="Back to sign in" data-testid="button-pin-back"><ArrowLeft size={22} /></button><div className="mt-7"><AuthLogo /><p className="mt-9 text-center font-display text-[27px]">Enter your five-digit PIN</p><p className="mt-2 text-center text-[13px] text-[hsl(var(--muted-foreground))]">This is a demo sign-in. Your payment PIN is not connected yet.</p></div><div className="mt-7 flex justify-center gap-3">{[0, 1, 2, 3, 4].map((index) => <span key={index} className={`h-3 w-3 rounded-full ${index < pin.length ? 'bg-[hsl(var(--primary))]' : 'border border-[hsl(var(--primary))]'}`} />)}</div><div className="mx-auto mt-10 grid w-full max-w-[310px] grid-cols-3 gap-3">{keys.slice(0, 9).map((key) => <PinKey key={key} label={key} onClick={() => { const value = pin.length < 5 ? pin + key : pin; setPin(value); submit(value); }} testId={`button-pin-${key}`} />)}<span /><PinKey label="7" onClick={() => { const value = pin.length < 5 ? pin + '7' : pin; setPin(value); submit(value); }} testId="button-pin-7" /><button onClick={() => setPin(pin.slice(0, -1))} className="aspect-square rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]" aria-label="Delete last PIN digit" data-testid="button-pin-delete"><ArrowLeft size={23} className="mx-auto" /></button></div><button onClick={() => setLocation('/login')} className="mt-auto text-center text-[13px] font-bold text-[hsl(var(--primary))]" data-testid="button-pin-help">Forgot your PIN?</button></div></main>;
}

function PinKey({ label, onClick, testId }: { label: string; onClick: () => void; testId: string }) {
  return <button onClick={onClick} className="aspect-square rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] font-mono text-[21px] text-[hsl(var(--foreground))] shadow-[0_4px_10px_rgba(70,46,33,.04)]" data-testid={testId}>{label}</button>;
}

function ActionTile({ label, detail, icon: Icon, href, tone = 'light' }: { label: string; detail: string; icon: LucideIcon; href: string; tone?: 'light' | 'dark' }) {
  return <Link href={href} className={`group rounded-[20px] p-4 transition hover:-translate-y-0.5 ${tone === 'dark' ? 'bg-[hsl(var(--secondary))] text-white' : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-[0_8px_20px_rgba(70,46,33,.05)]'}`} data-testid={`link-action-${label.toLowerCase().replaceAll(' ', '-')}`}><span className={`grid h-9 w-9 place-items-center rounded-full ${tone === 'dark' ? 'bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--primary))]'}`}><Icon size={19} /></span><p className="mt-5 text-[15px] font-bold">{label}</p><p className={`mt-1 text-[11px] leading-4 ${tone === 'dark' ? 'text-white/70' : 'text-[hsl(var(--muted-foreground))]'}`}>{detail}</p></Link>;
}

function Home({ state }: { state: AppState }) {
  return <Shell title="Home" active="Home" menu><main className="px-5 pb-6 pt-4"><div className="animate-rise flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.17em] text-[hsl(var(--muted-foreground))]">Good day</p><h1 className="font-display mt-1 text-[30px] leading-none">{state.name ? state.name.split(' ')[0] : 'Friend'}.</h1></div><span className="rounded-full bg-[hsl(var(--accent)/.28)] px-3 py-1.5 text-[11px] font-bold text-[hsl(var(--accent-foreground))]">Liberia + diaspora</span></div><div className="animate-rise delay-1 mt-5"><BalanceCard state={state} /></div><div className="animate-rise delay-2 mt-6 grid grid-cols-3 gap-2"><ActionTile label="Add money" detail="Fund your wallet" icon={Banknote} href="/fund" tone="dark" /><ActionTile label="Send home" detail="Support someone" icon={Send} href="/send" /><ActionTile label="Pay services" detail="Airtime, LEC, bills" icon={Zap} href="/services" /></div><section className="animate-rise delay-3 mt-8"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Everyday Liberia</p><h2 className="font-display mt-1 text-[24px]">Take care of today.</h2></div><Link href="/services" className="text-[12px] font-bold text-[hsl(var(--primary))]" data-testid="link-see-all-services">See all</Link></div><div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2"><ServiceChip label="Airtime" detail="Top up a line" icon={Phone} href="/airtime" /><ServiceChip label="Data" detail="Stay connected" icon={Wifi} href="/data" /><ServiceChip label="LEC" detail="Pay electricity" icon={Zap} href="/lec" /><ServiceChip label="Merchant" detail="Pay in person" icon={Receipt} href="/merchant" /></div></section><section className="animate-rise delay-4 mt-8"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Recent activity</p><h2 className="font-display mt-1 text-[24px]">Your money trail.</h2></div>{state.activities.length > 0 && <Link href="/transfers" className="text-[12px] font-bold text-[hsl(var(--primary))]" data-testid="link-see-all-activity">See all</Link>}</div>{state.activities.length === 0 ? <EmptyActivity /> : <div className="mt-3 space-y-2">{state.activities.slice(0, 4).map((activity) => <ActivityRow key={activity.id} activity={activity} />)}</div>}</section></main></Shell>;
}

function ServiceChip({ label, detail, icon: Icon, href }: { label: string; detail: string; icon: LucideIcon; href: string }) {
  return <Link href={href} className="min-w-[126px] rounded-[17px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3" data-testid={`link-service-${label.toLowerCase()}`}><span className="grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--primary))]"><Icon size={17} /></span><p className="mt-3 text-[13px] font-bold">{label}</p><p className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">{detail}</p></Link>;
}

function EmptyActivity() {
  return <div className="mt-3 rounded-[20px] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)] p-5" data-testid="empty-recent-activity"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent)/.35)] text-[hsl(var(--accent-foreground))]"><Sparkles size={17} /></span><div><p className="text-[14px] font-bold">Your first move starts here.</p><p className="mt-1 text-[12px] leading-5 text-[hsl(var(--muted-foreground))]">Add money, send support, or pay a local service. We’ll keep the trail clear as you go.</p></div></div></div>;
}

function ActivityRow({ activity }: { activity: Activity }) {
  const Icon = activity.icon === 'send' ? Send : activity.icon === 'airtime' ? Phone : activity.icon === 'bill' ? Receipt : activity.icon === 'in' ? Banknote : HandHeart;
  return <div className="flex items-center gap-3 rounded-[17px] bg-[hsl(var(--card))] p-3" data-testid={`activity-row-${activity.id}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--primary))]"><Icon size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-bold">{activity.title}</p><p className="text-[11px] text-[hsl(var(--muted-foreground))]">{activity.subtitle} · {activity.date}</p></div><p className={`font-mono text-[12px] font-bold ${activity.direction === 'out' ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--secondary))]'}`}>{activity.direction === 'out' ? '−' : '+'}{activity.currency === 'USD' ? '$' : 'L$'}{activity.amount}</p></div>;
}

function BalanceAndSection({ state, title, children }: { state: AppState; title: string; children: ReactNode }) {
  return <><div className="px-5 pb-5 pt-4"><BalanceCard state={state} /></div><main className="px-5 pt-1"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{title}</p>{children}</main></>;
}

function TransferPage({ state }: { state: AppState }) {
  return <Shell title="Activity" active="Activity" menu><BalanceAndSection state={state} title="Your money trail"><div className="mt-4 space-y-2">{state.activities.length ? state.activities.map((activity) => <ActivityRow key={activity.id} activity={activity} />) : <EmptyActivity />}</div><div className="mt-7 rounded-[18px] bg-[hsl(var(--secondary))] p-4 text-white"><p className="text-[14px] font-bold">Want to make a move?</p><p className="mt-1 text-[12px] text-white/75">Transfers are prepared safely, then held for payment connection.</p><Link href="/send" className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--accent))]" data-testid="link-activity-send">Send money home <ArrowRight size={15} /></Link></div></BalanceAndSection></Shell>;
}

function CurrencyToggle({ currency, setCurrency }: { currency: Currency; setCurrency: (currency: Currency) => void }) {
  return <div className="grid grid-cols-2 gap-2 rounded-[15px] bg-[hsl(var(--muted))] p-1" role="group" aria-label="Choose currency">{(['USD', 'LRD'] as Currency[]).map((value) => <button key={value} type="button" onClick={() => setCurrency(value)} className={`h-11 rounded-[11px] text-[13px] font-bold ${currency === value ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-currency-${value.toLowerCase()}`}>{value} <span className="ml-1 font-normal opacity-70">{value === 'USD' ? '$' : 'L$'}</span></button>)}</div>;
}

function StatusNotice({ title = 'Payments connection pending', children }: { title?: string; children: ReactNode }) {
  return <div className="rounded-[17px] border border-[hsl(var(--accent)/.72)] bg-[hsl(var(--accent)/.18)] p-4" data-testid="status-payments-pending"><div className="flex items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent))]"><ShieldCheck size={16} /></span><div><p className="text-[13px] font-bold">{title}</p><p className="mt-1 text-[12px] leading-5 text-[hsl(var(--foreground)/.72)]">{children}</p></div></div></div>;
}

function FundPage({ state }: { state: AppState }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'mobile' | 'card'>('mobile');
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState('');
  const submit = (event: FormEvent) => { event.preventDefault(); if (!amount || Number(amount) <= 0) { setMessage('Enter an amount greater than zero to prepare your request.'); return; } setMessage(''); setReview(true); };
  return <Shell title="Add money" active="Wallet" back><main className="px-5 pb-8 pt-5"><div className="animate-rise"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Fund your wallet</p><h1 className="font-display mt-2 text-[32px] leading-none">Put money where it matters.</h1><p className="mt-3 text-[13px] leading-5 text-[hsl(var(--muted-foreground))]">Choose a balance and prepare a secure handoff. Nothing is charged in this demo.</p></div>{!review ? <form onSubmit={submit} className="animate-rise delay-1 mt-7 space-y-6"><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Wallet currency</p><CurrencyToggle currency={currency} setCurrency={setCurrency} /></div><Field label={`Amount in ${currency}`} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={currency === 'USD' ? '0.00' : '0'} inputMode="decimal" type="number" min="0" step="0.01" data-testid="input-fund-amount" /><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Funding method</p><div className="grid grid-cols-2 gap-2"><MethodButton active={method === 'mobile'} icon={Smartphone} label="Mobile money" onClick={() => setMethod('mobile')} testId="button-method-mobile" /><MethodButton active={method === 'card'} icon={CreditCard} label="Debit / credit card" onClick={() => setMethod('card')} testId="button-method-card" /></div></div><StatusNotice>We can show your choices, but the payment handoff is not connected yet. Your balance will not change.</StatusNotice>{message && <p className="text-[12px] font-semibold text-[hsl(var(--destructive))]" data-testid="status-fund-error">{message}</p>}<button type="submit" className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] text-[15px] font-bold text-white" data-testid="button-review-funding">Review funding request <ArrowRight size={17} /></button></form> : <FundingReview currency={currency} amount={amount} method={method} onBack={() => setReview(false)} onSubmit={() => setMessage('Request noted locally. Payments connection is still pending; no charge was made.')} message={message} state={state} />}</main></Shell>;
}

function MethodButton({ active, icon: Icon, label, onClick, testId }: { active: boolean; icon: LucideIcon; label: string; onClick: () => void; testId: string }) {
  return <button type="button" onClick={onClick} className={`flex min-h-[92px] flex-col items-start justify-between rounded-[16px] border p-3 text-left ${active ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`} data-testid={testId}><Icon size={20} /><span className="text-[12px] font-bold leading-4">{label}</span>{active && <Check className="absolute" size={1} aria-hidden="true" />}</button>;
}

function FundingReview({ currency, amount, method, onBack, onSubmit, message, state }: { currency: Currency; amount: string; method: string; onBack: () => void; onSubmit: () => void; message: string; state: AppState }) {
  return <div className="animate-rise mt-7 space-y-4"><div className="rounded-[22px] bg-[hsl(var(--secondary))] p-5 text-white"><p className="text-[11px] uppercase tracking-[.15em] text-[hsl(var(--accent))]">Review, not a charge</p><p className="mt-5 font-mono text-[34px] font-bold">{currency === 'USD' ? '$' : 'L$'}{Number(amount || 0).toFixed(2)}</p><p className="mt-1 text-[12px] text-white/70">To your {currency} balance</p></div><div className="divide-y divide-[hsl(var(--border))] rounded-[18px] bg-[hsl(var(--card))] px-4"><SummaryRow label="Method" value={method === 'mobile' ? 'Mobile money' : 'Credit / debit card'} /><SummaryRow label="Current balance" value={`${currency === 'USD' ? '$' : 'L$'}${state.balances[currency === 'USD' ? 'usd' : 'lrd'].toFixed(2)}`} /><SummaryRow label="Payment fee" value="Shown when connected" /></div><StatusNotice>Your request is ready to hand off when payments are connected. We do not charge cards or mobile money from this screen.</StatusNotice>{message && <p className="rounded-[14px] bg-[hsl(var(--muted))] p-3 text-[12px] font-semibold" data-testid="status-funding-request">{message}</p>}<div className="flex gap-2"><button onClick={onBack} className="h-14 flex-1 rounded-full border border-[hsl(var(--border))] text-[14px] font-bold" data-testid="button-edit-funding">Edit</button><button onClick={onSubmit} className="h-14 flex-[1.5] rounded-full bg-[hsl(var(--primary))] text-[14px] font-bold text-white" data-testid="button-submit-funding">Save handoff status</button></div></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 py-3 text-[12px]"><span className="text-[hsl(var(--muted-foreground))]">{label}</span><span className="text-right font-semibold">{value}</span></div>;
}

function SendPage() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState('');
  const submit = (event: FormEvent) => { event.preventDefault(); if (!recipientName.trim() || !phone.trim() || !amount || Number(amount) <= 0) { setMessage('Add the recipient, phone number, and an amount to continue.'); return; } setMessage(''); setReview(true); };
  return <Shell title="Send money home" active="Activity" back><main className="px-5 pb-8 pt-5"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Liberia transfer</p><h1 className="font-display mt-2 text-[32px] leading-none">Support, with clarity.</h1><p className="mt-3 text-[13px] leading-5 text-[hsl(var(--muted-foreground))]">Prepare a transfer to a Liberia number. You will see the fee before anything can move.</p>{!review ? <form onSubmit={submit} className="mt-7 space-y-5"><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Send in</p><CurrencyToggle currency={currency} setCurrency={setCurrency} /></div><div className="grid grid-cols-2 gap-3"><Field label="Recipient name" value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder="Full name" data-testid="input-recipient-name" /><Field label="Liberia phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0776..." inputMode="tel" data-testid="input-recipient-phone" /></div><Field label={`Amount in ${currency}`} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={currency === 'USD' ? '0.00' : '0'} type="number" inputMode="decimal" min="0" step="0.01" data-testid="input-send-amount" /><label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Note <span className="font-normal normal-case tracking-normal">(optional)</span></span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="A little message for them" rows={3} className="w-full resize-none rounded-[13px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-[14px] outline-none focus:border-[hsl(var(--primary))]" data-testid="input-send-note" /></label><StatusNotice>Review is demo-ready. Payment confirmation and balance updates wait for the payments API.</StatusNotice>{message && <p className="text-[12px] font-semibold text-[hsl(var(--destructive))]" data-testid="status-send-error">{message}</p>}<button type="submit" className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] text-[15px] font-bold text-white" data-testid="button-review-send">Review transfer <ArrowRight size={17} /></button></form> : <SendReview currency={currency} name={recipientName} phone={phone} amount={amount} note={note} onBack={() => setReview(false)} onSubmit={() => setMessage('Transfer prepared locally. It is not sent and no balance was changed until payments are connected.')} message={message} />}</main></Shell>;
}

function SendReview({ currency, name, phone, amount, note, onBack, onSubmit, message }: { currency: Currency; name: string; phone: string; amount: string; note: string; onBack: () => void; onSubmit: () => void; message: string }) {
  const fee = currency === 'USD' ? '1.75' : '120';
  return <div className="animate-rise mt-7 space-y-4"><div className="rounded-[22px] bg-[hsl(var(--secondary))] p-5 text-white"><p className="text-[11px] uppercase tracking-[.15em] text-[hsl(var(--accent))]">Transfer review</p><div className="mt-5 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"><UserRound size={20} /></span><div><p className="text-[15px] font-bold">{name}</p><p className="text-[12px] text-white/70">{phone}</p></div></div><p className="mt-5 font-mono text-[30px] font-bold">{currency === 'USD' ? '$' : 'L$'}{Number(amount).toFixed(2)}</p>{note && <p className="mt-1 text-[12px] text-white/70">“{note}”</p>}</div><div className="divide-y divide-[hsl(var(--border))] rounded-[18px] bg-[hsl(var(--card))] px-4"><SummaryRow label="Transfer fee" value={`${currency === 'USD' ? '$' : 'L$'}${fee}`} /><SummaryRow label="Exchange rate" value={currency === 'USD' ? 'Shown at confirmation' : 'Not applicable'} /><SummaryRow label="Total debit" value={`${currency === 'USD' ? '$' : 'L$'}${(Number(amount) + Number(fee)).toFixed(2)}`} /></div><StatusNotice>Your transfer is pending payments connection. Save this review as a handoff status; funds have not been sent.</StatusNotice>{message && <p className="rounded-[14px] bg-[hsl(var(--muted))] p-3 text-[12px] font-semibold" data-testid="status-send-pending">{message}</p>}<div className="flex gap-2"><button onClick={onBack} className="h-14 flex-1 rounded-full border border-[hsl(var(--border))] text-[14px] font-bold" data-testid="button-edit-send">Edit</button><button onClick={onSubmit} className="h-14 flex-[1.5] rounded-full bg-[hsl(var(--primary))] text-[14px] font-bold text-white" data-testid="button-submit-send">Save pending review</button></div></div>;
}

function ServicesPage() {
  const services = [{ label: 'Airtime', detail: 'Top up any Liberia number', href: '/airtime', icon: Phone }, { label: 'Data', detail: 'Keep a line connected', href: '/data', icon: Wifi }, { label: 'LEC', detail: 'Electricity and meter payments', href: '/lec', icon: Zap }, { label: 'Merchant payments', detail: 'Pay a shop or local business', href: '/merchant', icon: Receipt }, { label: 'Bill payments', detail: 'Explore connected billers', href: '/pay', icon: Landmark }];
  return <Shell title="Pay services" active="Home" back><main className="px-5 pb-8 pt-5"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Everyday Liberia</p><h1 className="font-display mt-2 text-[34px] leading-none">The small things, handled.</h1><p className="mt-3 max-w-[330px] text-[13px] leading-5 text-[hsl(var(--muted-foreground))]">Choose a service to prepare a payment. Each destination tells you when the connection is still pending.</p><div className="mt-7 space-y-2">{services.map(({ label, detail, href, icon: Icon }, index) => <Link key={label} href={href} className="animate-rise flex items-center gap-4 rounded-[19px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[0_5px_14px_rgba(70,46,33,.04)]" style={{ animationDelay: `${index * 70}ms` }} data-testid={`link-services-${label.toLowerCase().replaceAll(' ', '-')}`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[hsl(var(--muted))] text-[hsl(var(--primary))]"><Icon size={21} /></span><span className="min-w-0 flex-1"><span className="block text-[14px] font-bold">{label}</span><span className="mt-1 block text-[12px] text-[hsl(var(--muted-foreground))]">{detail}</span></span><ChevronRight size={18} className="text-[hsl(var(--muted-foreground))]" /></Link>)}</div><div className="mt-7"><StatusNotice>Service payments are ready for you to explore. Validation and charging stay paused until the payment API is connected.</StatusNotice></div></main></Shell>;
}

function AccountPage({ state }: { state: AppState }) {
  return <Shell title="Wallet" active="Wallet" menu><BalanceAndSection state={state} title="Balances"><div className="mt-4 space-y-2"><WalletRow currency="USD" value={state.balances.usd} note="United States dollar balance" /><WalletRow currency="LRD" value={state.balances.lrd} note="Liberian dollar balance" /></div><Link href="/fund" className="mt-5 flex h-14 items-center justify-center gap-2 rounded-full bg-[hsl(var(--secondary))] text-[14px] font-bold text-white" data-testid="link-wallet-fund">Add money <ArrowRight size={17} /></Link><StatusNotice>Balances are local demo data. Funding and transfers will update them only after a connected payment service confirms.</StatusNotice></BalanceAndSection></Shell>;
}

function WalletRow({ currency, value, note }: { currency: Currency; value: number; note: string }) {
  return <div className="flex items-center gap-3 rounded-[18px] bg-[hsl(var(--card))] p-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--muted))] font-mono text-[12px] font-bold text-[hsl(var(--primary))]">{currency}</span><div className="flex-1"><p className="font-mono text-[17px] font-bold">{currency === 'USD' ? '$' : 'L$'}{value.toFixed(2)}</p><p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">{note}</p></div><ChevronRight size={17} className="text-[hsl(var(--muted-foreground))]" /></div>;
}

function OptionsPage({ state, setState }: { state: AppState; setState: Dispatch<SetStateAction<AppState>> }) {
  const [, setLocation] = useLocation();
  const rows = [{ title: 'Security', label: 'Change PIN', icon: ShieldCheck, action: () => setLocation('/pin') }, { title: 'Biometrics', label: state.biometrics ? 'Enabled on this device' : 'Not enabled', icon: ShieldCheck, action: () => setState((current) => ({ ...current, biometrics: !current.biometrics })) }, { title: 'Notifications', label: state.notifications ? 'Payment updates on' : 'Payment updates off', icon: Bell, action: () => setState((current) => ({ ...current, notifications: !current.notifications })) }];
  return <Shell title="More" active="More" menu><main className="px-5 pb-8 pt-5"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Preferences</p><h1 className="font-display mt-2 text-[32px]">Make it yours.</h1><div className="mt-6 space-y-2">{rows.map(({ title, label, icon: Icon, action }) => <button key={title} onClick={action} className="flex w-full items-center gap-4 rounded-[18px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left" data-testid={`button-option-${title.toLowerCase()}`}><span className="grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--primary))]"><Icon size={19} /></span><span className="flex-1"><span className="block text-[14px] font-bold">{title}</span><span className="mt-1 block text-[12px] text-[hsl(var(--muted-foreground))]">{label}</span></span><ChevronRight size={17} /></button>)}</div><div className="mt-6 grid grid-cols-2 gap-2"><Link href="/profile" className="rounded-[17px] bg-[hsl(var(--secondary))] p-4 text-[13px] font-bold text-white" data-testid="link-options-profile">My profile <UserRound size={18} className="mt-5" /></Link><Link href="/fees" className="rounded-[17px] bg-[hsl(var(--card))] p-4 text-[13px] font-bold" data-testid="link-options-fees">Fees & rates <Receipt size={18} className="mt-5 text-[hsl(var(--primary))]" /></Link></div></main></Shell>;
}

function FeesPage() {
  const rows = [['Send money home', 'Shown before review'], ['Mobile money funding', 'Shown at handoff'], ['Card funding', 'Shown at handoff'], ['Merchant payments', 'Shown before review'], ['Bill and utility payments', 'Shown before review']];
  return <Shell title="Fees & rates" active="More" back><main className="px-5 pb-8 pt-5"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">No surprises</p><h1 className="font-display mt-2 text-[34px]">See the cost first.</h1><p className="mt-3 text-[13px] leading-5 text-[hsl(var(--muted-foreground))]">Final fees and exchange rates belong to the connected payment service. KashGo will show them before confirmation.</p><div className="mt-7 overflow-hidden rounded-[18px] border border-[hsl(var(--border))] bg-[hsl(var(--card))]">{rows.map(([service, fee]) => <div key={service} className="flex items-center gap-4 border-b border-[hsl(var(--border))] p-4 last:border-0"><span className="flex-1 text-[13px] font-semibold">{service}</span><span className="text-right text-[11px] font-bold text-[hsl(var(--primary))]">{fee}</span></div>)}</div><StatusNotice>We will never quietly deduct a fee. Review screens are designed to make the total visible.</StatusNotice></main></Shell>;
}

function NotificationsPage() {
  return <Shell title="Notifications" active="More" back><main className="flex min-h-[650px] flex-col items-center justify-center px-7 text-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-[hsl(var(--accent)/.3)] text-[hsl(var(--accent-foreground))]"><Bell size={27} /></span><h1 className="font-display mt-6 text-[30px]">Nothing new.</h1><p className="mt-2 max-w-[270px] text-[13px] leading-5 text-[hsl(var(--muted-foreground))]">Payment updates and wallet notices will show here when activity begins.</p></main></Shell>;
}

function ProfilePage({ state }: { state: AppState }) {
  return <Shell title="Profile" active="More" back><main className="px-5 pb-8 pt-6"><div className="flex items-center gap-4 rounded-[21px] bg-[hsl(var(--secondary))] p-5 text-white"><span className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"><UserRound size={25} /></span><div><p className="text-[18px] font-bold">{state.name || 'KashGo customer'}</p><p className="mt-1 text-[12px] text-white/70">{state.phone || 'Mobile number not added'}</p></div></div><div className="mt-6 rounded-[18px] bg-[hsl(var(--card))] px-4"><SummaryRow label="Account type" value="Customer wallet" /><SummaryRow label="Country focus" value="Liberia" /><SummaryRow label="Verification" value="Not connected" /></div><StatusNotice>Profile verification and account editing will be connected in a later release.</StatusNotice></main></Shell>;
}

function SimplePage({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return <Shell title={title} active="More" back><main className="flex min-h-[650px] flex-col items-center justify-center px-7 text-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-[hsl(var(--accent)/.3)] text-[hsl(var(--accent-foreground))]"><Icon size={28} /></span><h1 className="font-display mt-6 text-[31px]">{title}</h1><p className="mt-2 max-w-[300px] text-[13px] leading-5 text-[hsl(var(--muted-foreground))]">{children}</p><StatusNotice>Connection pending. This destination is safe to explore, but no payment will be completed.</StatusNotice></main></Shell>;
}

function ServiceShell({ title, state, children }: { title: string; state: AppState; children: ReactNode }) {
  return <Shell title={title} active="Home" back><div className="px-5 pb-4 pt-4"><BalanceCard state={state} /></div>{children}</Shell>;
}

function RoundedInput({ label, placeholder = '', type = 'text', value, onChange }: { label: string; placeholder?: string; type?: string; value: string; onChange: (value: string) => void }) {
  return <Field label={label} placeholder={placeholder} type={type} value={value} onChange={(event) => onChange(event.target.value)} data-testid={`input-${label.toLowerCase().replaceAll(' ', '-')}`} />;
}

function PendingService({ state, title, description, fields }: { state: AppState; title: string; description: string; fields: string[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  return <ServiceShell title={title} state={state}><main className="px-5 pb-8 pt-3"><p className="text-[13px] leading-5 text-[hsl(var(--muted-foreground))]">{description}</p><div className="mt-6 space-y-4">{fields.map((field) => <RoundedInput key={field} label={field} value={values[field] ?? ''} onChange={(value) => setValues((current) => ({ ...current, [field]: value }))} placeholder={field === 'Amount' ? '0.00' : 'Enter details'} type={field === 'Amount' ? 'number' : 'text'} />)}</div><div className="mt-6"><StatusNotice>Payments connection pending. We can collect a review, but we will not validate, charge, or change your balance.</StatusNotice></div>{message && <p className="mt-4 rounded-[14px] bg-[hsl(var(--muted))] p-3 text-[12px] font-semibold" data-testid="status-service-pending">{message}</p>}<button onClick={() => setMessage('Request saved as a local handoff note. No payment was completed.')} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] text-[15px] font-bold text-white" data-testid={`button-review-${title.toLowerCase().replaceAll(' ', '-')}`}>Review request <ArrowRight size={17} /></button></main></ServiceShell>;
}

function AppRoutes() {
  const [state, setState] = useAppState();
  const auth = (page: ReactNode) => state.authenticated ? page : <Login setState={setState} />;
  return <QueryClientProvider client={queryClient}><TooltipProvider><Switch>
    <Route path="/" component={Splash} /><Route path="/welcome" component={Welcome} />
    <Route path="/login">{() => <Login setState={setState} />}</Route><Route path="/register">{() => <Login setState={setState} create />}</Route><Route path="/pin">{() => <PinPage setState={setState} />}</Route>
    <Route path="/home">{() => auth(<Home state={state} />)}</Route><Route path="/transfers">{() => auth(<TransferPage state={state} />)}</Route><Route path="/send">{() => auth(<SendPage />)}</Route><Route path="/fund">{() => auth(<FundPage state={state} />)}</Route><Route path="/services">{() => auth(<ServicesPage />)}</Route>
    <Route path="/account">{() => auth(<AccountPage state={state} />)}</Route><Route path="/options">{() => auth(<OptionsPage state={state} setState={setState} />)}</Route><Route path="/fees" component={FeesPage} /><Route path="/notifications" component={NotificationsPage} /><Route path="/profile">{() => auth(<ProfilePage state={state} />)}</Route>
    <Route path="/faqs" component={() => <SimplePage title="Help centre" icon={CircleHelp}>Common questions and guidance will live here as support connections are added.</SimplePage>} /><Route path="/agents" component={() => <SimplePage title="Agent locations" icon={Search}>Agent locations will appear here when location services are connected.</SimplePage>} /><Route path="/merchants" component={() => <SimplePage title="Merchant locations" icon={Search}>Merchant locations will appear here when location services are connected.</SimplePage>} />
    <Route path="/kash">{() => auth(<ServicesPage />)}</Route><Route path="/kgo-pay">{() => auth(<ServicesPage />)}</Route><Route path="/lec">{() => auth(<PendingService state={state} title="LEC payment" description="Pay an electricity meter when the LEC connection is ready." fields={['Meter number', 'Amount']} />)}</Route><Route path="/data">{() => auth(<PendingService state={state} title="Data purchase" description="Choose a line and prepare a data top-up." fields={['Phone number', 'Amount']} />)}</Route><Route path="/airtime">{() => auth(<PendingService state={state} title="Airtime purchase" description="Top up a Liberia mobile line for yourself or someone you care about." fields={['Phone number', 'Amount']} />)}</Route><Route path="/merchant" component={() => <SimplePage title="Merchant payment" icon={Receipt}>Merchant payment will be available when the payments connection is ready.</SimplePage>} /><Route path="/pay" component={() => <SimplePage title="Bill payments" icon={Receipt}>Bill payment services will appear here when connected.</SimplePage>} />
    <Route path="/gift-cards">{() => auth(<SimplePage title="Gift cards" icon={HandHeart}>Gift cards are not connected yet, but the destination is ready for a future release.</SimplePage>)}</Route><Route path="/vouchers">{() => auth(<SimplePage title="Vouchers" icon={Receipt}>Vouchers are not connected yet, but the destination is ready for a future release.</SimplePage>)}</Route><Route path="/donations">{() => auth(<SimplePage title="Donations" icon={HandHeart}>Donation payments will appear here when connected.</SimplePage>)}</Route>
    <Route component={NotFound} />
  </Switch><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default function AppWithBoundary() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedBoundary /></WouterRouter>;
}

function RoutedBoundary() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><AppRoutes /></ErrorBoundary>;
}