import { useEffect, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Bell, Check, ChevronRight, CircleHelp, Eye,
  EyeOff, Gift, HandHeart, Heart, House, Landmark, LogOut, Menu, Phone, Receipt,
  Search, Send, Settings, Share2, ShieldCheck, Smartphone, UserRound, WalletCards,
  Globe2,
  Wifi, X, Zap,
} from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const STORAGE_KEY = 'kashgo-state-v3';

type Activity = {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  currency: 'USD' | 'LRD';
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

function BrandMark({ footer = false }: { footer?: boolean }) {
  return (
    <div className={`flex items-center justify-center gap-1 ${footer ? 'scale-[.72]' : ''}`} data-testid="brand-kashgo">
      <span className="relative inline-grid h-8 w-8 place-items-center rounded-[11px] bg-[#b71362] text-white shadow-[3px_3px_0_#3d7b2d]">
        <span className="text-[21px] font-bold leading-none">k</span>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#3d7b2d]" />
      </span>
      <span className="text-[29px] font-bold tracking-[-2px] text-[#b71362]">kash<span className="text-black">Go</span></span>
    </div>
  );
}

function ExitButton() {
  const [, setLocation] = useLocation();
  return <button onClick={() => setLocation('/')} className="text-[#e21b23]" aria-label="Sign out"><LogOut size={27} strokeWidth={2.2} /></button>;
}

function AppHeader({ title, back = false, onMenu }: { title: string; back?: boolean; onMenu?: () => void }) {
  const [, setLocation] = useLocation();
  return <><div className="flex h-[58px] items-center justify-between bg-[#e5e5e5] px-6"><button onClick={() => back ? window.history.back() : onMenu?.()} className="text-black" aria-label={back ? 'Go back' : 'Open menu'}>{back ? <ArrowLeft size={28} /> : <Menu size={29} />}</button><h1 className="text-[19px] font-medium text-black">{title}</h1><ExitButton /></div><div className="flex h-[65px] items-center justify-center bg-[#e5e5e5]"><button onClick={() => setLocation('/home')} aria-label="Go home"><BrandMark /></button></div></>;
}

function BalanceCard({ state }: { state: AppState }) {
  const [visible, setVisible] = useState(!state.hideBalance);
  return <section className="relative mx-6 overflow-hidden rounded-[19px] bg-[#79083f] px-7 py-4 text-white shadow-[0_12px_22px_rgba(121,8,63,.12)]"><div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rotate-[-30deg] rounded-[36%] bg-[#941252]/55" /><div className="relative flex items-start justify-between"><button onClick={() => setVisible((current) => !current)} aria-label="Toggle balances" className="pt-1">{visible ? <Eye size={22} /> : <EyeOff size={22} />}</button><div className="text-right"><p className="text-[13px] font-semibold uppercase tracking-wide">{state.name || 'CUSTOMER'}</p><p className="mt-5 text-[12px] font-bold uppercase">Balance</p></div></div><div className="relative mt-2 grid grid-cols-2 gap-10 text-center"><div><p className="text-[14px] font-semibold">LRD</p><p className="mt-1 text-[15px] font-bold">{visible ? state.balances.lrd.toFixed(2) : '••••'}</p></div><div><p className="text-[14px] font-semibold">USD</p><p className="mt-1 text-[15px] font-bold">{visible ? state.balances.usd.toFixed(2) : '••••'}</p></div></div></section>;
}

function BottomNav({ active }: { active: string }) {
  const links = [{ href: '/home', label: 'Home', icon: House }, { href: '/transfers', label: 'Transfers', icon: WalletCards }, { href: '/account', label: 'My Account', icon: UserRound }, { href: '/options', label: 'Options', icon: Settings }];
  return <nav className="fixed bottom-0 left-1/2 z-30 flex h-[88px] w-full max-w-[461px] -translate-x-1/2 items-start justify-around bg-white px-4 pt-4">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex flex-col items-center gap-2 text-[13px] ${active === label ? 'font-semibold text-[#8f1649]' : 'text-black'}`}><Icon size={25} strokeWidth={active === label ? 2.8 : 2.5} /><span>{label}</span></Link>)}</nav>;
}

function MenuDrawer({ close }: { close: () => void }) {
  const items = [
    { label: 'Home', href: '/home', icon: House }, { label: 'My Account', href: '/account', icon: WalletCards },
    { label: 'Options', href: '/options', icon: Settings }, { label: 'Faqs', href: '/faqs', icon: CircleHelp },
    { label: 'Fees', href: '/fees', icon: WalletCards }, { label: 'Agent location', href: '/agents', icon: Search },
    { label: 'Merchant location', href: '/merchants', icon: Search }, { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'profile', href: '/profile', icon: UserRound },
  ];
  return <div className="fixed inset-0 z-50 bg-black/35" onClick={close}><aside className="flex h-full w-[86%] max-w-[390px] flex-col bg-white px-10 pb-4 pt-16 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="space-y-7">{items.map(({ label, href, icon: Icon }) => <Link key={label} href={href} onClick={close} className="flex items-center gap-6 text-[17px] text-[#8e274e]"><Icon size={25} fill={label === 'Home' || label === 'My Account' || label === 'Options' || label === 'Notifications' ? 'currentColor' : 'none'} /><span>{label}</span></Link>)}</div><div className="mt-auto text-center"><BrandMark footer /></div></aside></div>;
}

function Shell({ children, title, active, back = false, balance = false, menu = false }: { children: ReactNode; title: string; active: string; back?: boolean; balance?: boolean; menu?: boolean }) {
  const [drawer, setDrawer] = useState(false);
  const [state] = useAppState();
  return <div className="min-h-[100dvh] bg-white pb-[88px]"><AppHeader title={title} back={back} onMenu={() => setDrawer(true)} />{balance && <div className="bg-[#e5e5e5] pb-0 pt-0"><BalanceCard state={state} /></div>}{children}<BottomNav active={active}/>{menu && drawer && <MenuDrawer close={() => setDrawer(false)} />}</div>;
}

function Splash() {
  const [, setLocation] = useLocation();
  useEffect(() => { const timer = window.setTimeout(() => setLocation('/welcome'), 1100); return () => window.clearTimeout(timer); }, [setLocation]);
  return <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-white"><BrandMark /><div className="mt-28 text-center text-[#9b2456]"><p className="text-[20px] font-semibold">0%</p><p className="mt-12 text-[18px]">Loading application data...</p></div></main>;
}

function Welcome() {
  return <main className="min-h-[100dvh] bg-[#e8e8e8]"><div className="mx-auto flex min-h-[100dvh] w-full max-w-[461px] flex-col items-center px-7 pt-12 text-center"><BrandMark /><h1 className="mt-9 text-[38px] font-medium tracking-[-2px] text-black">Customer</h1><p className="mt-7 max-w-[180px] text-[17px] font-semibold leading-5 text-black">Improving the way you...<br/>receive<br/>send<br/>pay<br/>save</p><div className="mt-auto w-full space-y-5 pb-8"><Link href="/login" className="flex h-[76px] w-full items-center justify-center rounded-full bg-white text-[20px] font-bold text-[#aa1d5e] shadow-sm">Sign in</Link><p className="text-[14px] text-black">don't have an account? lets get started!</p><Link href="/login?create=1" className="flex h-[76px] w-full items-center justify-center rounded-full bg-[#075541] text-[20px] font-bold text-white">New account</Link><p className="pt-24 text-[14px] font-semibold text-[#075541]">our privacy commitment to you</p><p className="pt-5 text-[14px] text-[#a3285a]">kashGo customer</p></div></div></main>;
}

function AuthLogo() {
  return <div className="flex justify-center pt-5"><BrandMark /></div>;
}

function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-left"><span className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-[#5d5d5d]">{label}</span><input className="h-14 w-full rounded-2xl border border-[#d6cbd1] bg-white/80 px-4 text-[18px] font-semibold outline-none transition focus:border-[#a71958] focus:ring-4 focus:ring-[#a71958]/10" {...props}/></label>;
}

function Login({ setState }: { setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [, setLocation] = useLocation();
  const creating = new URLSearchParams(window.location.search).get('create') === '1';
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setError('Enter a valid mobile number to continue.');
      return;
    }
    if (creating && name.trim().length < 2) {
      setError('Add your name so we can personalize your wallet.');
      return;
    }
    setError('');
    setState((current) => ({ ...current, phone: phone.trim(), name: name.trim() || current.name }));
    setLocation(`/pin${creating ? '?create=1' : ''}`);
  };
  return <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#fff_0%,#f4e9ee_45%,#e8e8e8_100%)]"><div className="mx-auto flex min-h-[100dvh] max-w-[461px] flex-col px-7 pb-8 pt-5"><button onClick={() => setLocation('/welcome')} className="grid h-11 w-11 place-items-center rounded-full bg-white/80 text-[#aa1d5e] shadow-sm" aria-label="Back"><ArrowLeft size={25}/></button><AuthLogo/><div className="mt-12 rounded-[28px] bg-white/75 px-6 py-7 shadow-[0_18px_45px_rgba(57,32,52,.08)]"><p className="text-center text-[12px] font-bold uppercase tracking-[.2em] text-[#075541]">{creating ? 'Create your wallet' : 'Secure sign in'}</p><h1 className="mt-3 text-center text-[25px] font-bold tracking-[-.5px] text-[#3f2635]">{creating ? 'Welcome to kashGo' : 'Good to see you again'}</h1><p className="mt-2 text-center text-[14px] leading-5 text-[#746871]">{creating ? 'Set up your customer profile in under a minute.' : 'Use your mobile number to continue to your wallet.'}</p><form onSubmit={submit} className="mt-8 space-y-5">{creating && <Field label="Your name" value={name} onChange={(event) => { setName(event.target.value); setError(''); }} placeholder="Full name" autoComplete="name" required/>}<Field label="Mobile number" value={phone} onChange={(event) => { setPhone(event.target.value); setError(''); }} placeholder="0776 836 689" inputMode="tel" autoComplete="tel" required/><button type="button" onClick={() => setRemember((value) => !value)} className="flex items-center gap-3 text-[15px] font-semibold text-[#4a4a4a]"><span className={`grid h-6 w-6 place-items-center rounded-lg border-2 ${remember ? 'border-[#aa1d5e] bg-[#aa1d5e] text-white' : 'border-[#b891a6] bg-transparent'}`}>{remember && <Check size={16}/>}</span>Remember me on this device</button>{error && <p role="alert" className="rounded-xl bg-[#fff0f4] px-4 py-3 text-center text-[13px] font-semibold text-[#a71958]">{error}</p>}<button type="submit" className="h-14 w-full rounded-full bg-[#a71958] text-[17px] font-bold text-white shadow-[0_10px_20px_rgba(167,25,88,.2)] transition hover:-translate-y-0.5 disabled:opacity-50">{creating ? 'Continue to PIN' : 'Continue to PIN'} <ArrowRight className="ml-2 inline" size={18}/></button></form></div><div className="mt-auto pt-6 text-center"><p className="text-[13px] text-[#646464]">Your PIN protects every payment and transfer.</p><button onClick={() => setLocation(creating ? '/login' : '/login?create=1')} className="mt-4 text-[15px] font-bold text-[#075541]">{creating ? 'Already have an account? Sign in' : 'New to kashGo? Create an account'}</button></div></div></main>;
}

function PinPage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [, setLocation] = useLocation();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const keys = ['1', '8', '5', '3', '0', '6', '4', '2', '9', '7'];
  const submit = (value: string) => {
    if (value.length === 5 && !busy) {
      setBusy(true);
      window.setTimeout(() => {
        setState((current) => ({ ...current, authenticated: true }));
        setLocation('/home');
      }, 260);
    }
  };
  const press = (key: string) => {
    if (busy || pin.length >= 5) return;
    const value = pin + key;
    setPin(value);
    submit(value);
  };
  return <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#fff_0%,#f4e9ee_45%,#e8e8e8_100%)]"><div className="mx-auto flex min-h-[100dvh] max-w-[461px] flex-col px-7 pb-6 pt-5"><button onClick={() => setLocation('/login')} className="grid h-11 w-11 place-items-center rounded-full bg-white/80 text-[#aa1d5e] shadow-sm" aria-label="Back"><ArrowLeft size={25}/></button><AuthLogo/><div className="mt-8 text-center"><p className="text-[12px] font-bold uppercase tracking-[.2em] text-[#075541]">Welcome back{state.name ? `, ${state.name.split(' ')[0]}` : ''}</p><h1 className="mt-3 text-[25px] font-bold tracking-[-.5px] text-[#3f2635]">Enter your 5-digit PIN</h1><p className="mt-2 text-[14px] text-[#746871]">Your PIN keeps your balance and payments private.</p></div><div className="mt-7 flex justify-center gap-3" aria-label={`${pin.length} of 5 digits entered`}>{[0,1,2,3,4].map((index) => <span key={index} className={`h-4 w-4 rounded-full border-2 transition ${index < pin.length ? 'border-[#a71958] bg-[#a71958] shadow-[0_0_0_5px_rgba(167,25,88,.1)]' : 'border-[#c4aebb] bg-transparent'}`} />)}</div><div className="mx-auto mt-8 grid w-full max-w-[330px] grid-cols-3 gap-3">{keys.slice(0,9).map((key) => <button key={key} onClick={() => press(key)} className="aspect-square rounded-full border border-[#decfd7] bg-white/80 text-[25px] font-semibold text-[#3f2635] shadow-sm transition hover:-translate-y-0.5 hover:border-[#a71958] active:scale-95">{key}</button>)}<span/><button onClick={() => press('7')} className="aspect-square rounded-full border border-[#decfd7] bg-white/80 text-[25px] font-semibold text-[#3f2635] shadow-sm transition hover:-translate-y-0.5 hover:border-[#a71958] active:scale-95">7</button><button onClick={() => setPin(pin.slice(0, -1))} disabled={!pin.length || busy} className="aspect-square rounded-full bg-[#eadfe5] text-[34px] text-[#7b5368] disabled:opacity-40" aria-label="Delete last PIN digit"><ArrowLeft size={29} className="mx-auto"/></button></div><div className="mt-auto flex flex-col items-center gap-4 pt-5"><p className="text-[13px] text-[#777]">{busy ? 'Opening your wallet...' : 'PIN protected access'}</p><button onClick={() => setLocation('/login')} className="text-[15px] font-bold text-[#8e164a]">Forgot your PIN?</button></div></div></main>;
}

function Home({ state }: { state: AppState }) {
  const [, setLocation] = useLocation();
  return <Shell title="Home" active="Home" balance menu><main className="bg-white px-7 pt-4 text-center"><h2 className="text-[20px] font-bold text-[#a51d5a]">welcome to kashGo</h2><div className="mt-3 grid grid-cols-2 gap-3">{[{ label: 'Kash', icon: WalletCards, href: '/kash' }, { label: 'Gift Card', icon: Gift, href: '/gift-cards' }, { label: 'Vouchers', icon: Receipt, href: '/vouchers' }, { label: 'KGO Pay', icon: Smartphone, href: '/kgo-pay' }, { label: 'donation', icon: HandHeart, href: '/donations' }].map(({ label, icon: Icon, href }) => <Link key={label} href={href} className="flex h-[102px] flex-col items-center justify-center gap-2 rounded-[14px] border border-[#555] text-[14px] font-bold text-[#4d4d4d]"><Icon size={42} strokeWidth={2.1}/><span>{label}</span></Link>)}</div><div className="no-scrollbar mt-9 flex gap-3 overflow-x-auto pb-4 text-[#8f164a]">{[{ label: 'LEC', href: '/lec' }, { label: 'Data', href: '/data' }, { label: 'Airtime', href: '/airtime' }, { label: 'Merchant', href: '/merchant' }].map(({ label, href }) => <button key={label} onClick={() => setLocation(href)} className="flex min-w-[108px] flex-col items-center justify-center gap-2 rounded-[14px] border border-[#8f164a] py-4 text-[14px] font-bold"><Zap size={24}/><span>{label}</span></button>)}</div>{state.activities.length === 0 && <p className="mt-3 text-[13px] text-[#777]">Your recent activity will appear here.</p>}</main></Shell>;
}

function BalanceAndSection({ state, title, children }: { state: AppState; title: string; children: ReactNode }) {
  return <><div className="bg-[#e5e5e5] pb-0"><BalanceCard state={state}/></div><main className="bg-white px-7 pt-4"><h2 className="mb-4 text-center text-[21px] font-bold text-[#a51d5a]">{title}</h2>{children}</main></>;
}

function TransferPage({ state }: { state: AppState }) {
  const [, setLocation] = useLocation();
  return <Shell title="Transfers" active="Transfers" menu><BalanceAndSection state={state} title="Transfers"><div className="space-y-4"><button onClick={() => setLocation('/send')} className="w-full overflow-hidden rounded-[14px] border border-[#666] text-left"><span className="block bg-[#7b7b7b] px-4 py-4 text-[15px] font-bold text-white">To kashGo member</span><span className="flex items-center gap-6 px-5 py-6 text-[16px] font-bold text-[#9b1b59]"><WalletCards size={38}/>Send money to kashGo member</span></button><button onClick={() => setLocation('/send')} className="w-full overflow-hidden rounded-[14px] border border-[#666] text-left"><span className="block bg-[#7b7b7b] px-4 py-4 text-[15px] font-bold text-white">To Non-kashGo</span><span className="flex items-center gap-6 px-5 py-6 text-[16px] font-bold text-[#9b1b59]"><ArrowUpRight size={38}/>Send money to peer</span></button></div></BalanceAndSection></Shell>;
}

function SendPage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const submit = (event: FormEvent) => { event.preventDefault(); const value = Number(amount); if (!recipient.trim() || !value) { setMessage('Enter a recipient and amount.'); return; } if (value > state.balances.usd) { setMessage('Insufficient USD balance.'); return; } setState((current) => ({ ...current, balances: { ...current.balances, usd: current.balances.usd - value }, activities: [{ id: String(Date.now()), title: `Sent to ${recipient}`, subtitle: 'Transfer', amount: value.toFixed(2), currency: 'USD', direction: 'out', date: 'Now', icon: 'send' }, ...current.activities] })); setMessage('Transfer complete.'); };
  return <Shell title="Send money" active="Transfers" back><main className="px-7 pt-6"><form onSubmit={submit} className="space-y-5"><Field label="Recipient" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="Name or phone number" required/><Field label="Amount (USD)" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" type="number" min="1" step=".01" required/><button className="h-16 w-full rounded-full bg-[#a71958] text-[18px] font-bold text-white">Send money <ArrowRight className="ml-2 inline" size={18}/></button>{message && <p className="text-center font-semibold text-[#a71958]">{message}</p>}</form></main></Shell>;
}

function AccountPage({ state }: { state: AppState }) {
  return <Shell title="My Account" active="My Account" menu><BalanceAndSection state={state} title="balances and statements"><div className="space-y-7"><div className="overflow-hidden rounded-[15px] border border-[#9b1b59]"><div className="bg-[#b71963] px-2 py-3 text-[17px] font-bold text-white">Wallet</div><p className="px-3 py-4 text-[19px] font-bold text-[#9b1b59]">{state.balances.lrd.toFixed(2)} LRD</p></div><div className="overflow-hidden rounded-[15px] border border-[#9b1b59]"><div className="bg-[#b71963] px-2 py-3 text-[17px] font-bold text-white">Wallet</div><p className="px-3 py-4 text-[19px] font-bold text-[#9b1b59]">{state.balances.usd.toFixed(2)} USD</p></div></div></BalanceAndSection></Shell>;
}

function OptionsPage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [, setLocation] = useLocation();
  const rows = [{ title: 'Change password', label: 'Change password', icon: ShieldCheck, action: () => setLocation('/pin') }, { title: 'Fingerprint Manager', label: 'Fingerprint Manager', icon: ShieldCheck, action: () => setState((current) => ({ ...current, biometrics: !current.biometrics })) }, { title: 'Notifications Settings', label: 'Notifications Settings', icon: Bell, action: () => setState((current) => ({ ...current, notifications: !current.notifications })) }, { title: 'REFERRAL LINK', label: 'Share link', icon: Share2, action: () => navigator.clipboard?.writeText(window.location.origin) }];
  return <Shell title="Options" active="Options" balance menu><main className="bg-white px-7 pt-4"><h2 className="mb-4 text-center text-[21px] font-bold text-[#a51d5a]">Options</h2><div className="space-y-4">{rows.map(({ title, label, icon: Icon, action }) => <button key={title} onClick={action} className="w-full overflow-hidden rounded-[14px] border border-[#666] text-left"><span className="block bg-[#7b7b7b] px-4 py-4 text-[15px] font-bold text-white">{title}</span><span className="flex items-center gap-6 px-5 py-6 text-[16px] font-bold text-[#9b1b59]"><Icon size={38}/>{label}</span></button>)}</div></main></Shell>;
}

function FeesPage() {
  const rows = [['Cash Out', '2%', '2%'], ['NK2NK (Non-kash 2 Non-kash) (Local Remittance)', '3.50%', '3.50%'], ['K2NK (kash 2 Non-kash)', '3%', '3%'], ['Merchant Payments', '.75%', '.75%'], ['Gift Card Creation (In App)', '2%', '2%'], ['Gift Card Creation (By Agent)', '2%', '2%'], ['Gift Card Transfer', '.5%', '.5%'], ['Donation (In App)', '3%', '3%'], ['Donation (By Agent)', '4%', '4%']];
  return <Shell title="Fees" active="" back><main className="px-7 pt-5"><h2 className="text-center text-[21px] font-bold">Fees (LRD / USD)</h2><table className="mt-6 w-full border-collapse text-center text-[16px]"><thead><tr className="border-b-2 border-black"><th className="pb-3">Service</th><th className="pb-3">Fee (LRD)</th><th className="pb-3">Fee (USD)</th></tr></thead><tbody>{rows.map(([service, lrd, usd]) => <tr key={service} className="border-b border-[#ddd]"><td className="py-3">{service}</td><td className="py-3">{lrd}</td><td className="py-3">{usd}</td></tr>)}</tbody></table><p className="mt-6 text-[16px] font-bold leading-6">Fees and applicable taxes are shown before you confirm a transaction.</p></main></Shell>;
}

function NotificationsPage() {
  return <Shell title="Notifications" active="" back><main className="px-7 pt-1 text-center"><h2 className="text-[21px] font-bold text-[#a51d5a]">Notifications</h2><div className="flex min-h-[650px] flex-col items-center justify-center"><Search className="text-[#e21b23]" size={68} strokeWidth={2.8}/><p className="mt-7 text-[19px] font-bold text-[#e21b23]">No notifications found</p><button onClick={() => window.history.back()} className="mt-72 h-16 w-[170px] rounded-full border border-[#ddd] text-[16px]">back</button><BrandMark footer/></div></main></Shell>;
}

function ProfilePage({ state }: { state: AppState }) {
  const [, setLocation] = useLocation();
  const fields = [['phone number', state.phone || 'Not added'], ['country', 'Not added'], ['county', 'Not added'], ['City/town', 'Not added'], ['ID type', 'Not added'], ['ID number', 'Not added']];
  return <Shell title="profile" active="" back><main className="px-7 pt-3"><div className="flex items-center gap-5"><div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-2 border-[#8f164a] bg-black text-white"><UserRound size={47}/></div><div className="text-left"><p className="text-[20px] font-bold text-[#075541]">{state.phone || 'Not added'}</p><p className="text-[17px] font-bold text-[#8f164a]">{state.name || 'Customer'}</p><p className="text-[18px]">Customer</p></div></div><div className="mt-8 border-t border-black">{fields.map(([label, value]) => <div key={label} className="flex justify-center gap-3 border-b border-[#777] py-2 text-[16px]"><span>{label} :</span><span>{value}</span></div>)}</div><button onClick={() => setLocation('/account')} className="mt-7 w-full text-center text-[#456d63]">Delete account</button><button onClick={() => setLocation('/account')} className="mx-auto mt-5 block h-14 w-[170px] rounded-full bg-[#075541] text-white">edit</button><BrandMark footer/></main></Shell>;
}

function SimplePage({ title, icon: Icon, children }: { title: string; icon: typeof Phone; children: ReactNode }) {
  return <Shell title={title} active="" back><main className="flex min-h-[700px] flex-col items-center justify-center px-7 text-center"><Icon className="text-[#a71958]" size={60}/><h2 className="mt-5 text-2xl font-bold text-[#a71958]">{title}</h2><p className="mt-3 max-w-[300px] text-[#666]">{children}</p></main></Shell>;
}

function useLoadingState(duration = 500) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), duration);
    return () => window.clearTimeout(timer);
  }, [duration]);
  return loading;
}

function LoadingPanel({ label = 'Loading...' }: { label?: string }) {
  return <div className="flex flex-col items-center justify-center gap-4 text-[#a71958]"><div className="h-12 w-12 animate-spin rounded-full border-4 border-[#e7c1d3] border-t-[#a71958]" /><p className="text-[16px] font-semibold">{label}</p></div>;
}

function ServiceFooter() {
  return <div className="mt-auto flex flex-col items-center gap-3 pb-3 pt-8"><BrandMark footer /></div>;
}

function ServiceShell({ title, state, children }: { title: string; state: AppState; children: ReactNode }) {
  return <div className="flex min-h-[100dvh] flex-col bg-white"><AppHeader title={title} back /><div className="bg-[#e5e5e5]"><BalanceCard state={state} /></div>{children}</div>;
}

function RoundedInput({ label, placeholder, type = 'text', value, onChange }: { label: string; placeholder?: string; type?: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-right"><span className="mb-2 block text-[14px] text-black">{label} <b className="text-[#a71958]">*</b></span><input value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} className="h-[54px] w-full rounded-full border border-[#d6d6d6] bg-white px-5 text-[18px] outline-none focus:border-[#a71958]" /></label>;
}

function SelectPill({ label, value = 'Select', options = ['Select'], onChange, disabled = false }: { label: string; value?: string; options?: string[]; onChange?: (value: string) => void; disabled?: boolean }) {
  return <label className="block text-right"><span className="mb-2 block text-[14px] text-black">{label} <b className="text-[#a71958]">*</b></span><span className="relative block"><select value={value} onChange={(event) => onChange?.(event.target.value)} disabled={disabled} className="h-[54px] w-full appearance-none rounded-full border border-[#d6d6d6] bg-[#7c7c7c] px-5 text-[16px] text-white outline-none transition focus:border-[#a71958] disabled:cursor-not-allowed disabled:opacity-80">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronRight className="pointer-events-none absolute right-4 top-1/2 rotate-90 text-white" size={23}/></span></label>;
}

function ServiceActions({ primary, onPrimary, primaryDisabled = false }: { primary: string; onPrimary?: () => void; primaryDisabled?: boolean }) {
  const [, setLocation] = useLocation();
  return <div className="flex items-center justify-between gap-5"><button onClick={() => window.history.back()} className="h-14 flex-1 rounded-full border border-[#d6d6d6] text-[16px] font-semibold">cancel</button><button onClick={onPrimary} disabled={primaryDisabled} className="h-14 flex-1 rounded-full bg-[#075541] text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{primary}</button></div>;
}

function LECPage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [meter, setMeter] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = () => {
    const value = Number(amount);
    if (!meter.trim() || !value) { setMessage('Enter your meter number and amount.'); return; }
    if (value > state.balances.usd) { setMessage('Insufficient USD balance for this payment.'); return; }
    setBusy(true);
    window.setTimeout(() => {
      setState((current) => ({ ...current, balances: { ...current.balances, usd: current.balances.usd - value }, activities: [{ id: String(Date.now()), title: 'LEC payment', subtitle: `Meter ${meter}`, amount: value.toFixed(2), currency: 'USD', direction: 'out', date: 'Now', icon: 'bill' }, ...current.activities] }));
      setBusy(false);
      setMessage('Payment successful. Your electricity credit is on the way.');
    }, 450);
  };
  return <ServiceShell title="LEC - purchase" state={state}><main className="flex flex-1 flex-col px-8 pt-5"><div className="rounded-2xl bg-[#f8edf3] px-4 py-3 text-left"><p className="text-[13px] font-bold uppercase tracking-wide text-[#a71958]">Pay electricity</p><p className="mt-1 text-[13px] leading-5 text-[#6f5967]">Enter your meter number and the amount you want to pay.</p></div><div className="mt-7 space-y-7"><RoundedInput label="meter number" value={meter} onChange={setMeter} placeholder="e.g. 123456789"/><RoundedInput label="Amount (USD)" type="number" value={amount} onChange={setAmount} placeholder="0.00"/><SelectPill label="from account" value="USD wallet" options={['USD wallet']} disabled/></div><div className="mt-auto space-y-4 pb-4 pt-10"><ServiceActions primary={busy ? 'processing...' : 'pay now'} onPrimary={submit} primaryDisabled={busy}/>{message && <p role="status" className={`text-center text-[13px] font-semibold ${message.startsWith('Payment successful') ? 'text-[#075541]' : 'text-[#a71958]'}`}>{message}</p>}<ServiceFooter/></div></main></ServiceShell>;
}

function TopUpPage({ state, setState, title, airtime = false }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>>; title: string; airtime?: boolean }) {
  const [, setLocation] = useLocation();
  const [audience, setAudience] = useState<'Me' | 'Other'>('Me');
  const [recipient, setRecipient] = useState('');
  const [provider, setProvider] = useState('Select');
  const [option, setOption] = useState('Select');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const providers = ['Select', 'Lonestar Cell MTN', 'Orange Liberia'];
  const options = airtime ? ['Select', '1.00', '5.00', '10.00', '20.00'] : ['Select', '500 MB · 1 day · $1', '1 GB · 3 days · $2', '3 GB · 7 days · $5'];
  const chooseOption = (value: string) => {
    setOption(value);
    if (airtime && value !== 'Select') setAmount(value);
    if (!airtime && value !== 'Select') setAmount(value.includes('$5') ? '5' : value.includes('$2') ? '2' : '1');
    setMessage('');
  };
  const submit = () => {
    const value = Number(amount);
    if (provider === 'Select' || option === 'Select') { setMessage('Choose a provider and package first.'); return; }
    if (audience === 'Other' && recipient.replace(/\D/g, '').length < 8) { setMessage('Enter a valid recipient number.'); return; }
    if (!value || (airtime && (value < 1 || value > 100))) { setMessage(airtime ? 'Enter an airtime amount between $1 and $100.' : 'Choose a data package to continue.'); return; }
    if (value > state.balances.usd) { setMessage('Insufficient USD balance for this top up.'); return; }
    setBusy(true);
    window.setTimeout(() => {
      const target = audience === 'Me' ? 'my number' : recipient;
      setState((current) => ({ ...current, balances: { ...current.balances, usd: current.balances.usd - value }, activities: [{ id: String(Date.now()), title: `${airtime ? 'Airtime' : 'Data'} top up`, subtitle: `${provider} · ${target}`, amount: value.toFixed(2), currency: 'USD', direction: 'out', date: 'Now', icon: airtime ? 'airtime' : 'bill' }, ...current.activities] }));
      setBusy(false);
      setMessage(`${airtime ? 'Airtime' : 'Data'} top up successful.`);
    }, 450);
  };
  return <ServiceShell title={title} state={state}><main className="flex flex-1 flex-col px-7 pt-4"><div className="flex gap-3 rounded-2xl bg-[#f8edf3] p-1"><button onClick={() => { setAudience('Me'); setMessage(''); }} className={`h-12 flex-1 rounded-xl text-[15px] font-bold transition ${audience === 'Me' ? 'bg-[#bc1c66] text-white shadow-sm' : 'text-[#777]'}`}>Me</button><button onClick={() => { setAudience('Other'); setMessage(''); }} className={`h-12 flex-1 rounded-xl text-[15px] font-bold transition ${audience === 'Other' ? 'bg-[#bc1c66] text-white shadow-sm' : 'text-[#777]'}`}>Someone else</button></div><div className="mt-5 space-y-5"><SelectPill label="select provider" value={provider} options={providers} onChange={(value) => { setProvider(value); setMessage(''); }}/><SelectPill label={airtime ? 'select amount' : 'select data package'} value={option} options={options} onChange={chooseOption}/>{audience === 'Other' && <RoundedInput label="recipient mobile number" value={recipient} onChange={setRecipient} placeholder="0776 836 689" type="tel"/>}<RoundedInput label="Amount (USD)" type="number" value={amount} onChange={setAmount} placeholder="0.00"/><div className="rounded-2xl bg-[#f8f5f6] px-4 py-3 text-[13px] leading-5 text-[#6f5967]"><p className="font-bold text-[#3f2635]">From your USD wallet</p><p>{amount ? `$${Number(amount).toFixed(2)} will be charged after you confirm.` : 'Choose a package to see the amount.'}</p></div><SelectPill label="from account" value="USD wallet" options={['USD wallet']} disabled/></div><div className="mt-auto pb-4 pt-5"><ServiceActions primary={busy ? 'processing...' : 'top up now'} onPrimary={submit} primaryDisabled={busy}/>{message && <p role="status" className={`mt-4 text-center text-[13px] font-semibold ${message.endsWith('successful.') ? 'text-[#075541]' : 'text-[#a71958]'}`}>{message}</p>}<button onClick={() => setLocation('/home')} className="mx-auto mt-3 block text-[13px] font-semibold text-[#777]">Back to home</button><ServiceFooter/></div></main></ServiceShell>;
}

function BillPaymentPage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [provider, setProvider] = useState('Select');
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = () => {
    const value = Number(amount);
    if (provider === 'Select' || !account.trim() || !value) { setMessage('Choose a biller and enter your account and amount.'); return; }
    if (value > state.balances.usd) { setMessage('Insufficient USD balance for this bill.'); return; }
    setBusy(true);
    window.setTimeout(() => {
      setState((current) => ({ ...current, balances: { ...current.balances, usd: current.balances.usd - value }, activities: [{ id: String(Date.now()), title: `${provider} bill payment`, subtitle: `Account ${account}`, amount: value.toFixed(2), currency: 'USD', direction: 'out', date: 'Now', icon: 'bill' }, ...current.activities] }));
      setBusy(false);
      setMessage('Bill payment successful.');
    }, 450);
  };
  return <ServiceShell title="Bill payment" state={state}><main className="flex flex-1 flex-col px-8 pt-5"><div className="rounded-2xl bg-[#f8edf3] px-4 py-3 text-left"><p className="text-[13px] font-bold uppercase tracking-wide text-[#a71958]">Pay a bill</p><p className="mt-1 text-[13px] leading-5 text-[#6f5967]">Pay a supported service directly from your USD wallet.</p></div><div className="mt-7 space-y-6"><SelectPill label="select biller" value={provider} options={['Select', 'Internet', 'Water', 'Cable TV']} onChange={(value) => { setProvider(value); setMessage(''); }}/><RoundedInput label="account or customer number" value={account} onChange={setAccount} placeholder="Enter account number"/><RoundedInput label="Amount (USD)" type="number" value={amount} onChange={setAmount} placeholder="0.00"/><SelectPill label="from account" value="USD wallet" options={['USD wallet']} disabled/></div><div className="mt-auto space-y-4 pb-4 pt-10"><ServiceActions primary={busy ? 'processing...' : 'pay now'} onPrimary={submit} primaryDisabled={busy}/>{message && <p role="status" className={`text-center text-[13px] font-semibold ${message.endsWith('successful.') ? 'text-[#075541]' : 'text-[#a71958]'}`}>{message}</p>}<ServiceFooter/></div></main></ServiceShell>;
}

function KashPage({ state }: { state: AppState }) {
  const [, setLocation] = useLocation();
  return <ServiceShell title="Kash" state={state}><main className="flex flex-1 flex-col px-8 pt-4"><h2 className="text-center text-[22px] font-bold text-[#a71958]">Kash</h2><div className="mt-2 grid grid-cols-2 gap-3"><button onClick={() => setLocation('/transfers')} className="flex h-[100px] flex-col items-center justify-center gap-2 rounded-[14px] border border-[#555] text-[14px] font-bold text-[#4b4b4b]"><ArrowUpRight size={43}/><span>Transfers</span></button><button onClick={() => setLocation('/merchant')} className="flex h-[100px] flex-col items-center justify-center gap-2 rounded-[14px] border border-[#555] text-[14px] font-bold text-[#4b4b4b]"><UserRound size={43}/><span>Merchant Payment</span></button></div><div className="mt-auto pb-4"><button onClick={() => window.history.back()} className="mx-auto block h-16 w-[170px] rounded-full border border-[#d6d6d6] text-[16px]">back</button><ServiceFooter/></div></main></ServiceShell>;
}

function KgoPayPage({ state }: { state: AppState }) {
  const [, setLocation] = useLocation();
  return <ServiceShell title="KGO Pay" state={state}><main className="flex flex-1 flex-col px-8 pt-4"><h2 className="text-center text-[22px] font-bold text-[#a71958]">KGO Pay</h2><div className="mt-2 grid grid-cols-2 gap-3"><button onClick={() => setLocation('/pay')} className="flex h-[104px] flex-col items-center justify-center gap-2 rounded-[14px] border border-[#555] text-[14px] font-bold text-[#4b4b4b]"><Globe2 size={43}/><span>Bill payment</span></button><button onClick={() => setLocation('/lec')} className="flex h-[104px] flex-col items-center justify-center gap-2 rounded-[14px] border border-[#555] text-[14px] font-bold text-[#4b4b4b]"><Zap size={43}/><span>LEC</span></button></div><div className="mt-auto pb-4"><button onClick={() => window.history.back()} className="mx-auto block h-16 w-[170px] rounded-full border border-[#d6d6d6] text-[16px]">back</button><ServiceFooter/></div></main></ServiceShell>;
}

function EmptyCollectionPage({ state, title, heading, emptyText, action }: { state: AppState; title: string; heading: string; emptyText: string; action: string }) {
  const loading = useLoadingState();
  return <ServiceShell title={title} state={state}><main className="flex flex-1 flex-col px-7 pt-4"><h2 className="text-center text-[22px] font-bold text-[#a71958]">{heading}</h2><div className="flex flex-1 items-center justify-center">{loading ? <LoadingPanel label="Fetching data..." /> : <div className="flex flex-col items-center text-center"><Search className="text-[#e21b23]" size={68} strokeWidth={2.8}/><p className="mt-7 text-[19px] font-bold text-[#e21b23]">{emptyText}</p></div>}</div><div className="flex items-center justify-between gap-5 pb-4"><button onClick={() => window.history.back()} className="h-14 flex-1 rounded-full border border-[#aaa] text-[14px] font-semibold">cancel</button><button disabled={loading} className="h-14 flex-1 rounded-full bg-[#bc1c66] text-[14px] font-bold text-white disabled:opacity-50">{action}</button></div><ServiceFooter/></main></ServiceShell>;
}

function AppRoutes() {
  const [state, setState] = useAppState();
  return <QueryClientProvider client={queryClient}><TooltipProvider><Switch><Route path="/" component={Splash}/><Route path="/welcome" component={Welcome}/><Route path="/login">{() => <Login setState={setState}/>}</Route><Route path="/pin">{() => <PinPage state={state} setState={setState}/>}</Route><Route path="/home">{() => state.authenticated ? <Home state={state}/> : <Login setState={setState}/>}</Route><Route path="/transfers">{() => state.authenticated ? <TransferPage state={state}/> : <Login setState={setState}/>}</Route><Route path="/send">{() => state.authenticated ? <SendPage state={state} setState={setState}/> : <Login setState={setState}/>}</Route><Route path="/account">{() => state.authenticated ? <AccountPage state={state}/> : <Login setState={setState}/>}</Route><Route path="/options">{() => state.authenticated ? <OptionsPage state={state} setState={setState}/> : <Login setState={setState}/>}</Route><Route path="/fees" component={() => <FeesPage/>}/><Route path="/notifications" component={NotificationsPage}/><Route path="/profile">{() => state.authenticated ? <ProfilePage state={state}/> : <Login setState={setState}/>}</Route><Route path="/faqs" component={() => <SimplePage title="Faqs" icon={CircleHelp}>Frequently asked questions will appear here.</SimplePage>}/><Route path="/agents" component={() => <SimplePage title="Agent location" icon={Search}>Agent locations will appear here when location services are connected.</SimplePage>}/><Route path="/merchants" component={() => <SimplePage title="Merchant location" icon={Search}>Merchant locations will appear here when location services are connected.</SimplePage>}/><Route path="/kash">{() => state.authenticated ? <KashPage state={state}/> : <Login setState={setState}/>}</Route><Route path="/kgo-pay">{() => state.authenticated ? <KgoPayPage state={state}/> : <Login setState={setState}/>}</Route><Route path="/lec">{() => state.authenticated ? <LECPage state={state} setState={setState}/> : <Login setState={setState}/>}</Route><Route path="/data">{() => state.authenticated ? <TopUpPage state={state} setState={setState} title="data purchase"/> : <Login setState={setState}/>}</Route><Route path="/airtime">{() => state.authenticated ? <TopUpPage state={state} setState={setState} title="airtime purchase" airtime/> : <Login setState={setState}/>}</Route><Route path="/gift-cards">{() => state.authenticated ? <EmptyCollectionPage state={state} title="Gift Kard" heading="Gift Kard" emptyText="No gift card found" action="Create Gift Kard"/> : <Login setState={setState}/>}</Route><Route path="/vouchers">{() => state.authenticated ? <EmptyCollectionPage state={state} title="Kola Voucher" heading="Kola Voucher" emptyText="No voucher found" action="REGISTER A VOUCHER"/> : <Login setState={setState}/>}</Route><Route path="/donations">{() => state.authenticated ? <EmptyCollectionPage state={state} title="donation" heading="My Donations" emptyText="No donations found" action="DONATE"/> : <Login setState={setState}/>}</Route><Route path="/merchant" component={() => <SimplePage title="Merchant Payment" icon={Receipt}>Merchant payment services will appear here when connected.</SimplePage>}/><Route path="/pay">{() => state.authenticated ? <BillPaymentPage state={state} setState={setState}/> : <Login setState={setState}/>}</Route><Route component={NotFound}/></Switch><Toaster/></TooltipProvider></QueryClientProvider>;
}

export default function AppWithBoundary() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedBoundary/></WouterRouter>;
}

function RoutedBoundary() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><AppRoutes/></ErrorBoundary>;
}