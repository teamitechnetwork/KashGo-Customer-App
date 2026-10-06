import { useEffect, useState, type ChangeEvent, type Dispatch, type SetStateAction, type InputHTMLAttributes } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, ImagePlus, LockKeyhole, RefreshCw, ShieldCheck, Upload, UserRound } from 'lucide-react';
import { useLocation } from 'wouter';
import { useGlobalLoading } from '@/components/global-loader';
import { COUNTRIES, ID_TYPES, LIBERIAN_CITIES, LIBERIAN_COUNTIES, SECURITY_QUESTIONS } from '@/data/locations';
import type { AppState } from '@/App';

type RegistrationDraft = {
  gender: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  identityCountry: string;
  idType: string;
  idNumber: string;
  issueDate: string;
  expirationDate: string;
  residenceCountry: string;
  county: string;
  city: string;
  region: string;
  address: string;
  phoneCountry: string;
  phone: string;
  securityQuestion: string;
  securityAnswer: string;
};

const initialDraft: RegistrationDraft = {
  gender: '',
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  identityCountry: 'Liberia',
  idType: '',
  idNumber: '',
  issueDate: '',
  expirationDate: '',
  residenceCountry: 'Liberia',
  county: '',
  city: '',
  region: '',
  address: '',
  phoneCountry: 'Liberia',
  phone: '',
  securityQuestion: '',
  securityAnswer: '',
};

const stepTitles = ['Personal details', 'Identity document', 'Contact & location', 'Security PIN', 'Photos', 'Verify'];

const wait = (duration: number) => new Promise<void>((resolve) => window.setTimeout(resolve, duration));

function EnrollmentBrand() {
  return (
    <div className="flex items-center justify-center gap-1" aria-label="kashGo">
      <span className="relative inline-grid h-9 w-9 place-items-center rounded-[12px] bg-[#b71362] text-white shadow-[3px_3px_0_#3d7b2d]">
        <span className="text-[23px] font-bold leading-none">k</span>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#3d7b2d]" />
      </span>
      <span className="text-[30px] font-bold tracking-[-2px] text-[#b71362]">kash<span className="text-black">Go</span></span>
    </div>
  );
}

function StepProgress({ step }: { step: number }) {
  return (
    <div className="px-5 pb-5 pt-4">
      <div className="flex items-center justify-between">
        {stepTitles.map((title, index) => {
          const number = index + 1;
          const complete = number < step;
          const current = number === step;
          return (
            <div key={title} className="relative flex min-w-0 flex-1 items-center last:flex-none">
              <div className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-bold transition ${current || complete ? 'bg-[#b71362] text-white shadow-[0_0_0_4px_rgba(183,19,98,.1)]' : 'bg-[#dedede] text-[#2f2f2f]'}`}>
                {complete ? <Check size={17} strokeWidth={3} /> : number}
              </div>
              {number < stepTitles.length && <div className={`h-[3px] flex-1 ${complete ? 'bg-[#b71362]' : 'bg-[#d9d9d9]'}`} />}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[#786c73]">
        <span>Step {step} of {stepTitles.length}</span>
        <span className="truncate pl-4 text-right text-[#8f164a]">{stepTitles[step - 1]}</span>
      </div>
    </div>
  );
}

function EnrollmentHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <>
      <div className="flex h-14 items-center justify-between bg-[#e5e5e5] px-5">
        <button onClick={onBack} className="grid h-10 w-10 place-items-center rounded-full text-black transition hover:bg-black/5" aria-label="Go back">
          <ArrowLeft size={26} />
        </button>
        <h1 className="text-[18px] font-semibold text-black">Enrollment</h1>
        <div className="w-10" />
      </div>
      <div className="bg-[#e5e5e5] px-5 pb-4 pt-2">
        <EnrollmentBrand />
      </div>
      <StepProgress step={step} />
    </>
  );
}

function InputField({
  label,
  required = true,
  error,
  ...props
}: { label: string; required?: boolean; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#383038]">
        {label} {required && <b className="text-[#b71362]">*</b>}
      </span>
      <input
        {...props}
        className={`h-14 w-full rounded-2xl border bg-white px-4 text-[16px] text-[#30242b] outline-none transition placeholder:text-[#aaa1a7] focus:border-[#a71958] focus:ring-4 focus:ring-[#a71958]/10 ${error ? 'border-[#c51b4e]' : 'border-[#d8d2d5]'}`}
      />
      {error && <span className="mt-1 block text-[12px] font-semibold text-[#b71362]">{error}</span>}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  placeholder = 'Select',
  disabled = false,
  error,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#383038]">
        {label} <b className="text-[#b71362]">*</b>
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`h-14 w-full appearance-none rounded-2xl border bg-[#757575] px-4 text-[15px] font-semibold text-white outline-none transition focus:border-[#075541] focus:ring-4 focus:ring-[#075541]/10 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-[#c51b4e]' : 'border-[#757575]'}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {error && <span className="mt-1 block text-[12px] font-semibold text-[#b71362]">{error}</span>}
    </label>
  );
}

function Message({ children }: { children: string }) {
  return <p role="alert" className="rounded-2xl bg-[#fff0f5] px-4 py-3 text-center text-[13px] font-semibold leading-5 text-[#a71958]">{children}</p>;
}

function EnrollmentActions({ step, onBack, onNext, nextLabel = 'Next' }: { step: number; onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-5 mt-10 border-t border-[#eee5e9] bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur">
      <div className="flex gap-4">
        <button onClick={onBack} className="h-14 flex-1 rounded-full border border-[#d5d0d3] text-[15px] font-bold text-[#3f3037] transition hover:bg-[#faf7f8]">
          {step === 1 ? 'Cancel' : 'Previous'}
        </button>
        <button onClick={onNext} className="h-14 flex-1 rounded-full bg-[#075541] text-[15px] font-bold text-white shadow-[0_8px_18px_rgba(7,85,65,.16)] transition hover:-translate-y-0.5">
          {nextLabel} <ArrowRight className="ml-1 inline" size={17} />
        </button>
      </div>
      <div className="pt-4 text-center"><EnrollmentBrand /></div>
    </div>
  );
}

function PersonalStep({ draft, update, error }: { draft: RegistrationDraft; update: <K extends keyof RegistrationDraft>(field: K, value: RegistrationDraft[K]) => void; error: string }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[#f8edf3] px-4 py-3">
        <p className="text-[13px] font-bold uppercase tracking-wide text-[#a71958]">Let’s get to know you</p>
        <p className="mt-1 text-[13px] leading-5 text-[#6f5967]">Use your legal details so future payments and verification stay smooth.</p>
      </div>
      <SelectField label="Gender" value={draft.gender} options={['Female', 'Male', 'Prefer not to say']} onChange={(value) => update('gender', value)} />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="First name" value={draft.firstName} onChange={(event) => update('firstName', event.target.value)} autoComplete="given-name" />
        <InputField label="Middle name" required={false} value={draft.middleName} onChange={(event) => update('middleName', event.target.value)} autoComplete="additional-name" />
      </div>
      <InputField label="Last name" value={draft.lastName} onChange={(event) => update('lastName', event.target.value)} autoComplete="family-name" />
      <InputField label="Email" required={false} type="email" value={draft.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" placeholder="you@example.com" />
      {error && <Message>{error}</Message>}
    </div>
  );
}

function IdentityStep({ draft, update, error }: { draft: RegistrationDraft; update: <K extends keyof RegistrationDraft>(field: K, value: RegistrationDraft[K]) => void; error: string }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[#f8edf3] px-4 py-3">
        <p className="text-[13px] font-bold uppercase tracking-wide text-[#a71958]">Identity document</p>
        <p className="mt-1 text-[13px] leading-5 text-[#6f5967]">Your document details are used only for account verification.</p>
      </div>
      <SelectField label="Country of identity document" value={draft.identityCountry} options={COUNTRIES} onChange={(value) => update('identityCountry', value)} />
      <SelectField label="ID type" value={draft.idType} options={ID_TYPES} onChange={(value) => update('idType', value)} />
      <InputField label="ID number" value={draft.idNumber} onChange={(event) => update('idNumber', event.target.value)} autoComplete="off" />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Issue date" type="date" value={draft.issueDate} onChange={(event) => update('issueDate', event.target.value)} />
        <InputField label="Expiration date" type="date" value={draft.expirationDate} onChange={(event) => update('expirationDate', event.target.value)} />
      </div>
      {error && <Message>{error}</Message>}
    </div>
  );
}

function LocationStep({ draft, update, error }: { draft: RegistrationDraft; update: <K extends keyof RegistrationDraft>(field: K, value: RegistrationDraft[K]) => void; error: string }) {
  const cities = draft.county ? LIBERIAN_CITIES[draft.county as keyof typeof LIBERIAN_CITIES] : [];
  const isLiberia = draft.residenceCountry === 'Liberia';
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[#e9f4ef] px-4 py-3">
        <p className="text-[13px] font-bold uppercase tracking-wide text-[#075541]">Contact and location</p>
        <p className="mt-1 text-[13px] leading-5 text-[#557066]">Choose a country first. Liberia’s county and city choices will stay linked.</p>
      </div>
      <SelectField label="Country" value={draft.residenceCountry} options={COUNTRIES} onChange={(value) => { update('residenceCountry', value); update('county', ''); update('city', ''); }} />
      {isLiberia ? (
        <>
          <SelectField label="County" value={draft.county} options={LIBERIAN_COUNTIES} onChange={(value) => { update('county', value); update('city', ''); }} />
          <SelectField label="City / town" value={draft.city} options={cities} placeholder={draft.county ? 'Select city / town' : 'Select a county first'} disabled={!draft.county} onChange={(value) => update('city', value)} />
        </>
      ) : (
        <>
          <InputField label="State / county / province" value={draft.region} onChange={(event) => update('region', event.target.value)} placeholder="Enter your region" />
          <InputField label="City / town" value={draft.city} onChange={(event) => update('city', event.target.value)} placeholder="Enter your city or town" />
        </>
      )}
      <InputField label="Address" value={draft.address} onChange={(event) => update('address', event.target.value)} autoComplete="street-address" placeholder="Street, community or landmark" />
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-3">
        <SelectField label="Phone country" value={draft.phoneCountry} options={COUNTRIES} onChange={(value) => update('phoneCountry', value)} />
        <InputField label="Phone number" type="tel" value={draft.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" placeholder="0776 836 689" />
      </div>
      <SelectField label="Security question" value={draft.securityQuestion} options={SECURITY_QUESTIONS} onChange={(value) => update('securityQuestion', value)} />
      <InputField label="Answer" value={draft.securityAnswer} onChange={(event) => update('securityAnswer', event.target.value)} autoComplete="off" />
      {error && <Message>{error}</Message>}
    </div>
  );
}

function PinStep({ pin, confirmPin, setPin, setConfirmPin, error }: { pin: string; confirmPin: string; setPin: (value: string) => void; setConfirmPin: (value: string) => void; error: string }) {
  const [showPin, setShowPin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const pinField = (label: string, value: string, setter: (value: string) => void, visible: boolean, setVisible: (value: boolean) => void) => (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#383038]">{label} <b className="text-[#b71362]">*</b></span>
      <span className="relative block">
        <input value={value} onChange={(event) => setter(event.target.value.replace(/\D/g, '').slice(0, 5))} type={visible ? 'text' : 'password'} inputMode="numeric" autoComplete="new-password" className="h-14 w-full rounded-2xl border border-[#d8d2d5] bg-white px-4 pr-14 text-[22px] tracking-[.35em] outline-none focus:border-[#a71958] focus:ring-4 focus:ring-[#a71958]/10" />
        <button type="button" onClick={() => setVisible(!visible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6f5967]" aria-label={visible ? `Hide ${label}` : `Show ${label}`}>{visible ? <EyeOff size={21} /> : <Eye size={21} />}</button>
      </span>
    </label>
  );
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#fff6e5] px-4 py-3">
        <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[#8b5d0a]"><LockKeyhole size={16} /> Create a secure PIN</p>
        <p className="mt-1 text-[13px] leading-5 text-[#786441]">Use five digits that are hard to guess. Never reuse a PIN from another service.</p>
      </div>
      {pinField('PIN code', pin, setPin, showPin, setShowPin)}
      {pinField('Confirm PIN code', confirmPin, setConfirmPin, showConfirm, setShowConfirm)}
      <div className="flex items-start gap-3 rounded-2xl bg-[#f8edf3] px-4 py-3 text-[12px] leading-5 text-[#6f5967]">
        <ShieldCheck className="mt-0.5 shrink-0 text-[#075541]" size={18} />
        <span>Your PIN is only held in memory during enrollment and is never saved in this browser preview.</span>
      </div>
      {error && <Message>{error}</Message>}
    </div>
  );
}

function ImageCard({ label, icon: Icon, preview, onChange }: { label: string; icon: typeof UserRound; preview: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="rounded-[24px] border border-[#e4d9df] bg-[#fffafb] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold text-[#8f164a]">{label}</p>
        <Icon size={21} className="text-[#075541]" />
      </div>
      <div className={`mt-3 flex min-h-[190px] items-center justify-center overflow-hidden rounded-[19px] border-2 border-dashed border-[#b71362]/60 bg-white ${preview ? 'p-1' : 'p-6'}`}>
        {preview ? <img src={preview} alt={`${label} preview`} className="max-h-[230px] w-full rounded-[15px] object-cover" /> : <div className="text-center text-[#8e7b84]"><ImagePlus className="mx-auto" size={34} /><p className="mt-2 text-[12px]">No image selected</p></div>}
      </div>
      <label className="mt-3 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#075541] text-[13px] font-bold text-[#075541] transition hover:bg-[#e9f4ef]">
        <Upload size={17} /> Choose image
        <input type="file" accept="image/*" capture="user" className="sr-only" onChange={onChange} />
      </label>
      {preview && <p className="mt-2 text-center text-[11px] font-semibold text-[#075541]">Image ready for secure submission</p>}
    </div>
  );
}

function PhotosStep({ profilePreview, idPreview, onProfileChange, onIdChange, error }: { profilePreview: string; idPreview: string; onProfileChange: (event: ChangeEvent<HTMLInputElement>) => void; onIdChange: (event: ChangeEvent<HTMLInputElement>) => void; error: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[#f8edf3] px-4 py-3">
        <p className="text-[13px] font-bold uppercase tracking-wide text-[#a71958]">Secure document check</p>
        <p className="mt-1 text-[13px] leading-5 text-[#6f5967]">Take a clear photo in good light. Image previews stay in memory until you finish verification.</p>
      </div>
      <ImageCard label="Profile photo" icon={UserRound} preview={profilePreview} onChange={onProfileChange} />
      <ImageCard label="ID document photo" icon={ImagePlus} preview={idPreview} onChange={onIdChange} />
      {error && <Message>{error}</Message>}
    </div>
  );
}

function VerifyStep({ phone, otp, setOtp, agreed, setAgreed, seconds, onResend, error }: { phone: string; otp: string; setOtp: (value: string) => void; agreed: boolean; setAgreed: (value: boolean) => void; seconds: number; onResend: () => void; error: string }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[25px] bg-[#e9f4ef] px-5 py-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#075541] text-white"><ShieldCheck size={28} /></div>
        <h2 className="mt-4 text-[22px] font-bold text-[#3f2635]">Verify your phone</h2>
        <p className="mt-2 text-[13px] leading-5 text-[#557066]">Enter the six-digit code sent to <strong>{phone || 'your mobile number'}</strong>.</p>
      </div>
      <label className="block">
        <span className="mb-2 block text-[13px] font-semibold text-[#383038]">Verification code <b className="text-[#b71362]">*</b></span>
        <input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" className="h-16 w-full rounded-2xl border border-[#d8d2d5] bg-white text-center text-[27px] font-bold tracking-[.45em] outline-none focus:border-[#a71958] focus:ring-4 focus:ring-[#a71958]/10" />
      </label>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-[#786c73]">{seconds > 0 ? `Code expires in 0:${String(seconds).padStart(2, '0')}` : 'Code expired'}</span>
        <button type="button" onClick={onResend} disabled={seconds > 0} className="flex items-center gap-1 font-bold text-[#a71958] disabled:cursor-not-allowed disabled:opacity-40"><RefreshCw size={15} /> Resend code</button>
      </div>
      <label className="flex items-start gap-3 rounded-2xl border border-[#e4d9df] px-4 py-4 text-[13px] leading-5 text-[#4d3b44]">
        <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 h-4 w-4 accent-[#b71362]" />
        <span>I agree to the kashGo privacy commitment and understand that my details will be used to verify and protect my wallet.</span>
      </label>
      <div className="flex items-start gap-3 rounded-2xl bg-[#fff6e5] px-4 py-3 text-[12px] leading-5 text-[#786441]">
        <ShieldCheck className="mt-0.5 shrink-0 text-[#8b5d0a]" size={17} />
        <span>This preview simulates SMS delivery. A production deployment must verify the OTP on the server and must not store it in the browser.</span>
      </div>
      {error && <Message>{error}</Message>}
    </div>
  );
}

function RegistrationFlow({ setState }: { setState: Dispatch<SetStateAction<AppState>> }) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(initialDraft);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [otp, setOtp] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [profilePreview, setProfilePreview] = useState('');
  const [idPreview, setIdPreview] = useState('');
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(60);
  const { run } = useGlobalLoading();

  useEffect(() => {
    if (step !== 6 || seconds <= 0) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds, step]);

  const update = <K extends keyof RegistrationDraft>(field: K, value: RegistrationDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const validate = () => {
    if (step === 1) {
      if (!draft.gender || draft.firstName.trim().length < 2 || draft.lastName.trim().length < 2) return 'Select your gender and enter your first and last name.';
      if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) return 'Enter a valid email address or leave it blank.';
    }
    if (step === 2) {
      if (!draft.identityCountry || !draft.idType || draft.idNumber.trim().length < 4) return 'Complete the identity document fields.';
      if (!draft.issueDate || !draft.expirationDate || new Date(draft.expirationDate) <= new Date(draft.issueDate)) return 'Choose valid issue and expiration dates.';
    }
    if (step === 3) {
      const locationComplete = draft.residenceCountry === 'Liberia'
        ? Boolean(draft.county && draft.city)
        : Boolean(draft.region.trim() && draft.city.trim());
      if (!locationComplete || draft.address.trim().length < 4) return 'Complete your country, location and address.';
      if (draft.phone.replace(/\D/g, '').length < 8) return 'Enter a valid mobile number.';
      if (!draft.securityQuestion || draft.securityAnswer.trim().length < 2) return 'Choose a security question and provide an answer.';
    }
    if (step === 4) {
      if (!/^\d{5}$/.test(pin) || !/^\d{5}$/.test(confirmPin)) return 'Your PIN must contain exactly five digits.';
      if (pin !== confirmPin) return 'The PIN entries do not match.';
      if (/^(\d)\1{4}$/.test(pin) || '0123456789'.includes(pin) || '9876543210'.includes(pin)) return 'Choose a less predictable five-digit PIN.';
    }
    if (step === 5 && (!profilePreview || !idPreview)) return 'Add both your profile photo and ID document photo.';
    if (step === 6) {
      if (otp.length !== 6) return 'Enter the six-digit verification code.';
      if (!agreed) return 'Accept the privacy commitment to finish enrollment.';
    }
    return '';
  };

  const next = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    void run(step === 6 ? 'Verifying your account…' : step === 4 ? 'Securing your wallet…' : 'Saving your details…', async () => {
      await wait(step === 6 ? 700 : 350);
      if (step === 6) {
        setState((current) => ({
          ...current,
          authenticated: true,
          phone: draft.phone.trim(),
          name: [draft.firstName, draft.middleName, draft.lastName].filter(Boolean).join(' '),
          email: draft.email.trim(),
          country: draft.residenceCountry,
          county: draft.residenceCountry === 'Liberia' ? draft.county : draft.region,
          city: draft.city,
        }));
        setLocation('/home');
        return;
      }
      setError('');
      setStep((value) => value + 1);
      if (step === 5) setSeconds(60);
    });
  };

  const back = () => {
    if (step === 1) {
      setLocation('/welcome');
      return;
    }
    setError('');
    setStep((value) => value - 1);
  };

  const readImage = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file to continue.');
      return;
    }
    setter(URL.createObjectURL(file));
    setError('');
  };

  return (
    <main className="h-[100dvh] overflow-y-auto overscroll-y-contain bg-white">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[461px]">
        <EnrollmentHeader step={step} onBack={back} />
        <div className="px-5 pb-2 pt-1">
          {step === 1 && <PersonalStep draft={draft} update={update} error={error} />}
          {step === 2 && <IdentityStep draft={draft} update={update} error={error} />}
          {step === 3 && <LocationStep draft={draft} update={update} error={error} />}
          {step === 4 && <PinStep pin={pin} confirmPin={confirmPin} setPin={setPin} setConfirmPin={setConfirmPin} error={error} />}
          {step === 5 && <PhotosStep profilePreview={profilePreview} idPreview={idPreview} onProfileChange={readImage(setProfilePreview)} onIdChange={readImage(setIdPreview)} error={error} />}
          {step === 6 && <VerifyStep phone={draft.phone} otp={otp} setOtp={setOtp} agreed={agreed} setAgreed={setAgreed} seconds={seconds} onResend={() => { setOtp(''); setSeconds(60); setError(''); }} error={error} />}
          <EnrollmentActions step={step} onBack={back} onNext={next} nextLabel={step === 6 ? 'Create wallet' : 'Next'} />
        </div>
      </div>
    </main>
  );
}

export function RegisterPage({ setState }: { setState: Dispatch<SetStateAction<AppState>> }) {
  return <RegistrationFlow setState={setState} />;
}