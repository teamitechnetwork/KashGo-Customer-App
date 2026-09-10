import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  History,
  Languages,
  Mail,
  MessageCircle,
  Palette,
  Phone,
  UserCheck,
  WalletCards,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

export type AccountFeatureState = {
  name: string;
  phone: string;
  email: string;
  biometrics: boolean;
  screenLock: boolean;
  notifications: boolean;
  theme: 'System' | 'Light' | 'Dark';
  language: 'English' | 'French';
  emailVerified: boolean;
  identityVerified: boolean;
  balances: { usd: number; lrd: number };
};

export type FeatureProps = {
  state: AccountFeatureState;
  updateState: (patch: Partial<AccountFeatureState>) => void;
  onLogout: () => void;
};

function FeatureShell({ children, title, onBack, close = false }: { children: ReactNode; title?: string; onBack?: () => void; close?: boolean }) {
  const [, setLocation] = useLocation();
  return (
    <main className="app-shell min-h-[100dvh] overflow-x-hidden bg-[#151319] text-white">
      <header className="flex items-center justify-between px-5 pb-4 pt-5">
        <button type="button" onClick={onBack ?? (() => setLocation('/home'))} className="grid h-10 w-10 place-items-center text-white" aria-label={close ? 'Close' : 'Go back'}>
          {close ? <X size={30} strokeWidth={1.4} /> : <ArrowLeft size={30} strokeWidth={1.7} />}
        </button>
        {title && <h1 className="text-[20px] font-semibold">{title}</h1>}
        <span className="w-10" />
      </header>
      {children}
    </main>
  );
}

function ProfileHero({ state }: { state: AccountFeatureState }) {
  const initials = (state.name || 'WK').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-4 px-5 pb-7 pt-4">
      <div className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full bg-[#e91e2b] text-[26px] font-medium text-white">
        {initials || 'WK'}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[19px] font-semibold">{state.name || 'KashGo customer'}</p>
        <p className="mt-1 text-[16px] text-[#c0bcc5]">{state.phone || 'Mobile number not added'}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="bg-[#252329] px-5 py-3 text-[17px] font-semibold text-[#c9c6cc]">{children}</h2>;
}

function MenuRow({ label, value, badge, onClick, danger = false }: { label: string; value?: string; badge?: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[68px] w-full items-center justify-between gap-3 border-b border-[#514d55] px-5 text-left transition hover:bg-white/[.04]">
      <span className={danger ? 'text-[#e53b46]' : 'text-[17px]'}>{label}</span>
      <span className="flex items-center gap-3 text-[#bdb9c2]">
        {badge && <span className={`rounded-full px-3 py-1 text-[13px] ${badge === 'Not verified' ? 'bg-[#f4edf0] text-[#a13d4b]' : 'bg-[#142b4f] text-[#4188e8]'}`}>{badge}</span>}
        {value && <span className="text-[16px]">{value}</span>}
        <ChevronRight size={23} strokeWidth={1.6} />
      </span>
    </button>
  );
}

function ToggleRow({ label, detail, value, onChange }: { label: string; detail: string; value: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className="flex min-h-[76px] w-full items-center justify-between border-b border-[#514d55] px-5 text-left">
      <span>
        <span className="block text-[17px]">{label}</span>
        <span className="mt-1 block text-[14px] text-[#aaa6af]">{detail}</span>
      </span>
      <span className={`relative h-7 w-12 rounded-full transition ${value ? 'bg-[#b71362]' : 'bg-[#3e3c44]'}`} aria-label={`${label} ${value ? 'on' : 'off'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${value ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  );
}

export function AccountMenuContent({ state, updateState, onLogout }: FeatureProps) {
  const [, setLocation] = useLocation();
  const [notice, setNotice] = useState('');
  const share = async () => {
    const shareData = { title: 'KashGo', text: 'Manage money simply with KashGo.', url: window.location.origin };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard?.writeText(window.location.origin);
      setNotice('KashGo link copied.');
    } catch {
      setNotice('Sharing was cancelled.');
    }
  };
  return (
    <div className="pb-8">
      <ProfileHero state={state} />
      <SectionTitle>Account</SectionTitle>
      <MenuRow label="View Profile" onClick={() => setLocation('/profile')} />
      <MenuRow label="Verify your email" badge={state.emailVerified ? 'Verified' : 'Not verified'} onClick={() => setLocation('/verify-email')} />
      <MenuRow label="Account Verification" badge={state.identityVerified ? 'Verified' : 'Not verified'} onClick={() => setLocation('/account-verification')} />
      <MenuRow label="Change Password" onClick={() => setLocation('/change-password')} />
      <SectionTitle>Transactions</SectionTitle>
      <MenuRow label="Transaction Limits" onClick={() => setLocation('/transaction-limits')} />
      <MenuRow label="Linked Accounts" onClick={() => setLocation('/linked-accounts')} />
      <MenuRow label="Balance History" onClick={() => setLocation('/balance-history')} />
      <SectionTitle>Preferences</SectionTitle>
      <MenuRow label="Choose a theme" value={state.theme} onClick={() => setLocation('/theme')} />
      <ToggleRow label="Activate TouchID / FaceID" detail="Use biometrics for transaction approval." value={state.biometrics} onChange={() => updateState({ biometrics: !state.biometrics })} />
      <ToggleRow label="Screen Lock" detail="Secure the app with your PIN." value={state.screenLock} onChange={() => updateState({ screenLock: !state.screenLock })} />
      <MenuRow label="Language" value={state.language} onClick={() => updateState({ language: state.language === 'English' ? 'French' : 'English' })} />
      <SectionTitle>About The App</SectionTitle>
      <MenuRow label="Privacy Policy" onClick={() => setLocation('/privacy-policy')} />
      <MenuRow label="Customer Support" onClick={() => setLocation('/customer-support')} />
      <MenuRow label="Share App" onClick={share} />
      <MenuRow label="Log Out" danger onClick={onLogout} />
      {notice && <p role="status" className="mx-5 mt-4 rounded-xl bg-[#252329] px-4 py-3 text-center text-[13px] text-[#d8d4dc]">{notice}</p>}
      <p className="mt-7 text-center text-[13px] text-[#9b98a1]">KashGo customer</p>
    </div>
  );
}

export function AccountMenuPage(props: FeatureProps) {
  return <FeatureShell close><AccountMenuContent {...props} /></FeatureShell>;
}

export function PreferencesPage({ state, updateState, onLogout }: FeatureProps) {
  const [, setLocation] = useLocation();
  return (
    <FeatureShell close>
      <ProfileHero state={state} />
      <SectionTitle>Preferences</SectionTitle>
      <MenuRow label="Choose a theme" value={state.theme} onClick={() => setLocation('/theme')} />
      <ToggleRow label="Activate TouchID / FaceID" detail="Use biometrics for transaction approval." value={state.biometrics} onChange={() => updateState({ biometrics: !state.biometrics })} />
      <ToggleRow label="Screen Lock" detail="Secure the app with your PIN." value={state.screenLock} onChange={() => updateState({ screenLock: !state.screenLock })} />
      <MenuRow label="Language" value={state.language} onClick={() => updateState({ language: state.language === 'English' ? 'French' : 'English' })} />
      <SectionTitle>About The App</SectionTitle>
      <MenuRow label="Privacy Policy" onClick={() => setLocation('/privacy-policy')} />
      <MenuRow label="Customer Support" onClick={() => setLocation('/customer-support')} />
      <MenuRow label="Share App" onClick={() => navigator.clipboard?.writeText(window.location.origin)} />
      <MenuRow label="Log Out" danger onClick={onLogout} />
      <p className="mt-7 text-center text-[13px] text-[#9b98a1]">KashGo customer</p>
    </FeatureShell>
  );
}

export function TransactionLimitsPage() {
  const [tab, setTab] = useState('Sending');
  const tabs = ['Sending', 'Receiving', 'Withdrawal'];
  const limits = tab === 'Receiving' ? { max: '5,000.00 USD', daily: '10,000.00 USD', weekly: '30,000.00 USD', monthly: '60,000.00 USD' } : tab === 'Withdrawal' ? { max: '1,000.00 USD', daily: '3,000.00 USD', weekly: '10,000.00 USD', monthly: '25,000.00 USD' } : { max: '2,000.00 USD', daily: '5,000.00 USD', weekly: '20,000.00 USD', monthly: '30,000.00 USD' };
  return (
    <FeatureShell title="Transaction Limits">
      <div className="flex min-h-[calc(100dvh-78px)] items-end bg-black/20">
        <div className="w-full rounded-t-[30px] bg-[#f2f0f1] px-6 pb-10 pt-7 text-[#242127]">
          <div className="flex rounded-xl border border-[#c5c1c6] bg-white p-1">
            {tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`h-11 flex-1 rounded-lg text-[14px] ${tab === item ? 'bg-[#343139] text-white' : 'text-[#77727c]'}`}>{item}</button>)}
          </div>
          <div className="mt-12 space-y-8">
            <div className="flex items-center justify-between gap-4 text-[17px]"><span>Max transaction amount</span><span>{limits.max}</span></div>
            {[['Number of daily transactions', '0 sent', '5 transactions'], ['Daily amount', '0.00 sent', limits.daily], ['Weekly amount', '0.00 sent', limits.weekly], ['Monthly amount', '0.00 sent', limits.monthly]].map(([label, current, maximum]) => <div key={label}><p className="text-[17px]">{label}</p><div className="mt-5 h-3 rounded-full bg-[#c9c8cb]" /><p className="mt-3 text-right text-[16px]"><span className="text-[#e02737]">{current}</span><span className="text-[#8a858e]"> / {maximum}</span></p></div>)}
          </div>
        </div>
      </div>
    </FeatureShell>
  );
}

export function ChangePasswordPage() {
  const [values, setValues] = useState({ oldPassword: '', password: '', confirmation: '' });
  const [message, setMessage] = useState('');
  const submit = () => {
    if (values.password.length < 6) return setMessage('Use at least 6 characters for your new password.');
    if (values.password !== values.confirmation) return setMessage('The new passwords do not match.');
    setMessage('Password change is ready for the secure account API.');
  };
  return (
    <FeatureShell title="Change Password">
      <div className="flex min-h-[calc(100dvh-78px)] items-end bg-black/20">
        <div className="w-full rounded-t-[30px] bg-[#f2f0f1] px-6 pb-8 pt-8 text-[#242127]">
          <div className="space-y-6">
            {[['Old password', 'oldPassword', 'Old password'], ['New password', 'password', 'Password'], ['Confirm new password', 'confirmation', 'Confirm new password']].map(([label, key, placeholder]) => <label key={key} className="block"><span className="mb-2 block text-[17px]">{label} <b className="text-[#e02737]">*</b></span><input type="password" value={values[key as keyof typeof values]} onChange={(event) => { setValues((current) => ({ ...current, [key]: event.target.value })); setMessage(''); }} placeholder={placeholder} className="h-16 w-full rounded-2xl border border-[#cbc7ca] bg-white px-5 text-[17px] outline-none focus:border-[#e02737]" /></label>)}
          </div>
          {message && <p role="status" className="mt-5 rounded-xl bg-white px-4 py-3 text-center text-[13px] text-[#514b55]">{message}</p>}
          <button type="button" onClick={submit} className="mt-8 h-16 w-full rounded-full bg-[#e21c2b] text-[18px] font-bold text-white">Change Password</button>
          <button type="button" onClick={() => setMessage('Password reset link request is ready for the account API.')} className="mt-5 w-full text-right text-[15px] text-[#e43a48]">Forgot password?</button>
        </div>
      </div>
    </FeatureShell>
  );
}

export function CustomerSupportPage() {
  return (
    <FeatureShell title="Customer Support">
      <div className="px-6 pb-10 pt-4">
        <div className="rounded-[18px] border border-[#6661a9] bg-[#1b1c47] px-5 py-4">
          <div className="flex items-center gap-4 text-[#c9c8f4]"><Clock3 size={28} /><span className="text-[16px] font-semibold">Working Hours</span></div>
          <div className="mt-4 flex justify-between text-[17px] font-semibold"><span>Monday - Friday</span><span>09:00 – 17:00</span></div>
          <p className="mt-3 text-[13px] text-[#c9c8f4]">All times shown in GMT.</p>
        </div>
        <div className="mt-5 rounded-[20px] border border-[#403d46] p-4">
          <a href="tel:+23177333330" className="flex items-center gap-4 rounded-2xl bg-[#252329] p-4"><Phone size={28} /><span><b className="block text-[16px]">Call us</b><span className="text-[#aaa6af]">+231 77 333 330</span></span><ChevronRight className="ml-auto" /></a>
          <a href="https://wa.me/23177333330" target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-4 rounded-2xl bg-[#252329] p-4"><MessageCircle size={28} /><span><b className="block text-[16px]">Let's chat on WhatsApp</b><span className="text-[#aaa6af]">+231 77 333 330</span></span><ChevronRight className="ml-auto" /></a>
          <a href="mailto:support@kashgo.com" className="mt-3 flex items-center gap-4 rounded-2xl bg-[#252329] p-4"><Mail size={28} /><span><b className="block text-[16px]">Email us</b><span className="text-[#aaa6af]">support@kashgo.com</span></span><ChevronRight className="ml-auto" /></a>
          <div className="my-4 border-t border-[#5a5660]" />
          <Link href="/terms" className="flex items-center gap-4 rounded-2xl bg-[#252329] p-4"><FileText size={28} /><b className="text-[16px]">Terms & Conditions</b><ChevronRight className="ml-auto" /></Link>
        </div>
      </div>
    </FeatureShell>
  );
}

export function WalletTopUpPage() {
  const [method, setMethod] = useState<'mobile' | 'card'>('mobile');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('Select mobile money network');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [message, setMessage] = useState('');
  const submit = () => {
    if (!Number(amount) || Number(amount) <= 0) return setMessage('Enter a valid top-up amount.');
    if (method === 'mobile' && (network.startsWith('Select') || phone.replace(/\D/g, '').length < 8)) return setMessage('Choose a mobile money network and enter a valid number.');
    if (method === 'card' && (cardNumber.replace(/\D/g, '').length < 12 || !expiry || cvv.length < 3)) return setMessage('Complete the card details to continue.');
    setMessage(`${method === 'mobile' ? 'Mobile money' : 'Credit card'} top up is ready. Connect the payment API to complete it.`);
  };
  return (
    <FeatureShell title="Top up account">
      <div className="bg-white px-6 pb-10 pt-5 text-[#202020]">
        <div className="rounded-2xl bg-[#f7edf3] p-4"><p className="text-[13px] font-bold uppercase tracking-wide text-[#a71958]">Add money</p><p className="mt-1 text-[13px] text-[#6f5967]">Choose how you want to add funds to your KashGo wallet.</p></div>
        <label className="mt-6 block"><span className="mb-2 block text-[14px]">Amount</span><input type="number" min="1" value={amount} onChange={(event) => { setAmount(event.target.value); setMessage(''); }} placeholder="0.00" className="h-14 w-full rounded-full border border-[#d6d6d6] px-5 outline-none focus:border-[#075541]" /></label>
        <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => setMethod('mobile')} className={`rounded-2xl border p-4 text-left ${method === 'mobile' ? 'border-[#075541] bg-[#eff7f3]' : 'border-[#d6d6d6]'}`}><WalletCards className="text-[#075541]" /><b className="mt-3 block text-[14px]">Mobile money</b><span className="mt-1 block text-[12px] text-[#777]">Use your local wallet</span></button><button type="button" onClick={() => setMethod('card')} className={`rounded-2xl border p-4 text-left ${method === 'card' ? 'border-[#a71958] bg-[#fff0f6]' : 'border-[#d6d6d6]'}`}><WalletCards className="text-[#a71958]" /><b className="mt-3 block text-[14px]">Credit card</b><span className="mt-1 block text-[12px] text-[#777]">Visa or Mastercard</span></button></div>
        {method === 'mobile' ? <div className="mt-6 space-y-4"><label className="block"><span className="mb-2 block text-[14px]">Mobile money network</span><select value={network} onChange={(event) => setNetwork(event.target.value)} className="h-14 w-full rounded-full border border-[#d6d6d6] bg-white px-5 outline-none"><option>Select mobile money network</option><option>Lonestar Cell MTN</option><option>Orange Money</option></select></label><label className="block"><span className="mb-2 block text-[14px]">Mobile money number</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0776 836 689" className="h-14 w-full rounded-full border border-[#d6d6d6] px-5 outline-none" /></label></div> : <div className="mt-6 space-y-4"><label className="block"><span className="mb-2 block text-[14px]">Card number</span><input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="0000 0000 0000 0000" className="h-14 w-full rounded-full border border-[#d6d6d6] px-5 outline-none" /></label><div className="grid grid-cols-2 gap-3"><label className="block"><span className="mb-2 block text-[14px]">Expiry</span><input value={expiry} onChange={(event) => setExpiry(event.target.value)} placeholder="MM / YY" className="h-14 w-full rounded-full border border-[#d6d6d6] px-5 outline-none" /></label><label className="block"><span className="mb-2 block text-[14px]">CVV</span><input type="password" value={cvv} onChange={(event) => setCvv(event.target.value)} placeholder="123" className="h-14 w-full rounded-full border border-[#d6d6d6] px-5 outline-none" /></label></div></div>}
        {message && <p role="status" className="mt-5 rounded-xl bg-[#f8edf3] px-4 py-3 text-center text-[13px] font-semibold text-[#a71958]">{message}</p>}
        <button type="button" onClick={submit} className="mt-7 h-14 w-full rounded-full bg-[#075541] text-[16px] font-bold text-white">Continue to top up <ArrowRight className="ml-2 inline" size={18} /></button>
        <p className="mt-4 text-center text-[12px] text-[#777]">Payment processing will activate when the mobile money or card API is connected.</p>
      </div>
    </FeatureShell>
  );
}

export function VerifyEmailPage({ state, updateState }: FeatureProps) {
  const [email, setEmail] = useState(state.email);
  const [message, setMessage] = useState('');
  return <FeatureShell title="Verify your email"><div className="px-6 pt-8"><Mail className="mx-auto text-[#e21c2b]" size={62} /><h2 className="mt-6 text-center text-[23px] font-semibold">Verify your email</h2><p className="mt-3 text-center text-[#aaa6af]">Add an email address to receive account notices and recovery links.</p><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" className="mt-8 h-14 w-full rounded-2xl border border-[#817e87] bg-transparent px-5 text-white outline-none" /><button type="button" onClick={() => { if (!email.includes('@')) return setMessage('Enter a valid email address.'); updateState({ email, emailVerified: true }); setMessage('Verification request is ready.'); }} className="mt-5 h-14 w-full rounded-full bg-[#e21c2b] font-bold">Send verification email</button>{message && <p className="mt-5 text-center text-[13px] text-[#c9c6cc]">{message}</p>}</div></FeatureShell>;
}

export function AccountVerificationPage({ state, updateState }: FeatureProps) {
  return <FeatureShell title="Account Verification"><div className="px-6 pt-8 text-center"><UserCheck className="mx-auto text-[#3b87ec]" size={66} /><h2 className="mt-6 text-[23px] font-semibold">Verify your account</h2><p className="mt-3 text-[#aaa6af]">Complete identity verification to unlock higher transaction limits.</p><button type="button" onClick={() => updateState({ identityVerified: true })} disabled={state.identityVerified} className="mt-8 h-14 w-full rounded-full bg-[#075541] font-bold disabled:opacity-60">{state.identityVerified ? 'Account verified' : 'Start verification'}</button></div></FeatureShell>;
}

export function ThemePage({ state, updateState }: FeatureProps) {
  const options: AccountFeatureState['theme'][] = ['System', 'Light', 'Dark'];
  return <FeatureShell title="Choose a theme"><div className="px-5 pt-6">{options.map((option) => <button key={option} type="button" onClick={() => updateState({ theme: option })} className="flex w-full items-center justify-between border-b border-[#514d55] py-5 text-left text-[17px]">{option}<span className={`grid h-6 w-6 place-items-center rounded-full border ${state.theme === option ? 'border-[#b71362] bg-[#b71362]' : 'border-[#817e87]'}`}>{state.theme === option && <Check size={15} />}</span></button>)}</div></FeatureShell>;
}

export function PlaceholderFeaturePage({ title, icon: Icon, children }: { title: string; icon: typeof History; children: ReactNode }) {
  return <FeatureShell title={title}><div className="px-6 pt-12 text-center"><Icon className="mx-auto text-[#b71362]" size={64} /><h2 className="mt-6 text-[24px] font-semibold">{title}</h2><p className="mt-3 text-[#aaa6af]">{children}</p></div></FeatureShell>;
}