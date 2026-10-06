import { useMemo, useState, type ChangeEvent } from 'react';
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useGlobalLoading } from './loading';
import kashGoLogo from '@assets/file_000000002c188210ae4b70614805037f_1788985542244.png';

export type RegistrationData = {
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
  county: string;
  city: string;
  address: string;
  country: string;
  phone: string;
  securityQuestion: string;
  securityAnswer: string;
  pin: string;
  confirmPin: string;
  photoName: string;
  idPhotoName: string;
};

export const emptyRegistration: RegistrationData = {
  gender: '',
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  identityCountry: 'LIBERIA',
  idType: '',
  idNumber: '',
  issueDate: '',
  expirationDate: '',
  county: '',
  city: '',
  address: '',
  country: 'LIBERIA',
  phone: '',
  securityQuestion: '',
  securityAnswer: '',
  pin: '',
  confirmPin: '',
  photoName: '',
  idPhotoName: '',
};

export const LIBERIA_COUNTIES = [
  'Bomi',
  'Bong',
  'Gbarpolu',
  'Grand Bassa',
  'Grand Cape Mount',
  'Grand Gedeh',
  'Grand Kru',
  'Lofa',
  'Margibi',
  'Maryland',
  'Montserrado',
  'Nimba',
  'River Cess',
  'River Gee',
  'Sinoe',
];

export const CITIES_BY_COUNTY: Record<string, string[]> = {
  Bomi: ['Tubmanburg', 'Klay', 'Senje'],
  Bong: ['Gbarnga', 'Suakoko', 'Salala', 'Salayea'],
  Gbarpolu: ['Bopolu', 'Belle Yalla', 'Kongba'],
  'Grand Bassa': ['Buchanan', 'Edina', 'Owensgrove'],
  'Grand Cape Mount': ['Robertsport', 'Tewor', 'Sinje'],
  'Grand Gedeh': ['Zwedru', 'Tchien', 'Gbarzon'],
  'Grand Kru': ['Barclayville', 'Sasstown', 'Buah'],
  Lofa: ['Voinjama', 'Zorzor', 'Foya', 'Salayea'],
  Margibi: ['Kakata', 'Marshall', 'Mambah-Kaba'],
  Maryland: ['Harper', 'Pleebo', 'Karloken'],
  Montserrado: ['Monrovia', 'Paynesville', 'Bensonville', 'Careysburg'],
  Nimba: ['Sanniquellie', 'Ganta', 'Glenville', 'Tappita'],
  'River Cess': ['Cestos City', 'River Cess', 'Zartlahn'],
  'River Gee': ['Fish Town', 'Potupo', 'Glarro'],
  Sinoe: ['Greenville', 'Jaedae', 'Kpayan'],
};

export const SECURITY_QUESTIONS = [
  'How much money you made from your very first work or business?',
  'What is the name of the community you grew up in?',
  'What is your favorite food?',
  'What is your Ma or Pa middle name?',
  "What's your mother's birth name?",
  'Where did you meet your wife/husband?',
];

export const COUNTRIES = [
  'AFGHANISTAN', 'ALBANIA', 'ALGERIA', 'ANDORRA', 'ANGOLA', 'ANTIGUA AND BARBUDA',
  'ARGENTINA', 'ARMENIA', 'AUSTRALIA', 'AUSTRIA', 'AZERBAIJAN', 'BAHAMAS',
  'BAHRAIN', 'BANGLADESH', 'BARBADOS', 'BELARUS', 'BELGIUM', 'BELIZE',
  'BENIN', 'BHUTAN', 'BOLIVIA', 'BOSNIA AND HERZEGOVINA', 'BOTSWANA', 'BRAZIL',
  'BRUNEI', 'BULGARIA', 'BURKINA FASO', 'BURUNDI', 'CABO VERDE', 'CAMBODIA',
  'CAMEROON', 'CANADA', 'CENTRAL AFRICAN REPUBLIC', 'CHAD', 'CHILE', 'CHINA',
  'COLOMBIA', 'COMOROS', 'CONGO', 'COSTA RICA', 'COTE D IVOIRE', 'CROATIA',
  'CUBA', 'CYPRUS', 'CZECHIA', 'DEMOCRATIC REPUBLIC OF THE CONGO', 'DENMARK',
  'DJIBOUTI', 'DOMINICA', 'DOMINICAN REPUBLIC', 'ECUADOR', 'EGYPT',
  'EL SALVADOR', 'EQUATORIAL GUINEA', 'ERITREA', 'ESTONIA', 'ESWATINI',
  'ETHIOPIA', 'FIJI', 'FINLAND', 'FRANCE', 'GABON', 'GAMBIA', 'GEORGIA',
  'GERMANY', 'GHANA', 'GREECE', 'GRENADA', 'GUATEMALA', 'GUINEA',
  'GUINEA-BISSAU', 'GUYANA', 'HAITI', 'HONDURAS', 'HUNGARY', 'ICELAND',
  'INDIA', 'INDONESIA', 'IRAN', 'IRAQ', 'IRELAND', 'ISRAEL', 'ITALY',
  'JAMAICA', 'JAPAN', 'JORDAN', 'KAZAKHSTAN', 'KENYA', 'KIRIBATI', 'KUWAIT',
  'KYRGYZSTAN', 'LAOS', 'LATVIA', 'LEBANON', 'LESOTHO', 'LIBERIA', 'LIBYA',
  'LIECHTENSTEIN', 'LITHUANIA', 'LUXEMBOURG', 'MADAGASCAR', 'MALAWI',
  'MALAYSIA', 'MALDIVES', 'MALI', 'MALTA', 'MARSHALL ISLANDS', 'MAURITANIA',
  'MAURITIUS', 'MEXICO', 'MICRONESIA', 'MOLDOVA', 'MONACO', 'MONGOLIA',
  'MONTENEGRO', 'MOROCCO', 'MOZAMBIQUE', 'MYANMAR', 'NAMIBIA', 'NAURU',
  'NEPAL', 'NETHERLANDS', 'NEW ZEALAND', 'NICARAGUA', 'NIGER', 'NIGERIA',
  'NORTH KOREA', 'NORTH MACEDONIA', 'NORWAY', 'OMAN', 'PAKISTAN', 'PALAU',
  'PALESTINE', 'PANAMA', 'PAPUA NEW GUINEA', 'PARAGUAY', 'PERU', 'PHILIPPINES',
  'POLAND', 'PORTUGAL', 'QATAR', 'ROMANIA', 'RUSSIA', 'RWANDA',
  'SAINT KITTS AND NEVIS', 'SAINT LUCIA', 'SAINT VINCENT AND THE GRENADINES',
  'SAMOA', 'SAN MARINO', 'SAO TOME AND PRINCIPE', 'SAUDI ARABIA', 'SENEGAL',
  'SERBIA', 'SEYCHELLES', 'SIERRA LEONE', 'SINGAPORE', 'SLOVAKIA', 'SLOVENIA',
  'SOLOMON ISLANDS', 'SOMALIA', 'SOUTH AFRICA', 'SOUTH KOREA', 'SOUTH SUDAN',
  'SPAIN', 'SRI LANKA', 'SUDAN', 'SURINAME', 'SWEDEN', 'SWITZERLAND',
  'SYRIA', 'TAIWAN', 'TAJIKISTAN', 'TANZANIA', 'THAILAND', 'TIMOR-LESTE',
  'TOGO', 'TONGA', 'TRINIDAD AND TOBAGO', 'TUNISIA', 'TURKEY', 'TURKMENISTAN',
  'TUVALU', 'UGANDA', 'UKRAINE', 'UNITED ARAB EMIRATES', 'UNITED KINGDOM',
  'UNITED STATES', 'URUGUAY', 'UZBEKISTAN', 'VANUATU', 'VATICAN CITY',
  'VENEZUELA', 'VIETNAM', 'YEMEN', 'ZAMBIA', 'ZIMBABWE',
];

type PickerProps = {
  title: string;
  label: string;
  value: string;
  options: string[];
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function Picker({ title, label, value, options, required = true, disabled, onChange }: PickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  );
  return (
    <>
      <label className="block">
        <span className="enrollment-label">{label}{required && <b> *</b>}</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => { setQuery(''); setOpen(true); }}
          className="enrollment-select"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className={value ? 'text-white' : 'text-white/70'}>{value || 'Select'}</span>
          <ChevronRight className="rotate-90" size={22} />
        </button>
      </label>
      {open && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-white" role="dialog" aria-label={title}>
          <div className="flex items-center gap-4 bg-[#075541] px-5 py-4 text-white">
            <button type="button" onClick={() => setOpen(false)} aria-label="Back"><ArrowLeft size={28} /></button>
            <h2 className="text-[18px] font-semibold">{title}</h2>
          </div>
          <div className="px-6 pb-3 pt-4">
            <label className="block">
              <span className="mb-2 block text-right text-[13px] text-black">search text (optional)</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
                className="h-14 w-full rounded-full border border-[#d7d7d7] px-5 text-[17px] outline-none focus:border-[#075541]"
                placeholder="Search"
              />
            </label>
          </div>
          <div className="flex-1 overflow-y-auto border-t border-[#ddd]">
            {filtered.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => { onChange(option); setOpen(false); }}
                className={`flex min-h-[64px] w-full items-center border-b border-[#dedede] px-12 text-left text-[17px] text-[#285740] transition hover:bg-[#eff7f3] ${value === option ? 'bg-[#eff7f3] font-bold' : ''}`}
              >
                {value === option && <Check className="mr-3 text-[#b71362]" size={18} />}
                {option}
              </button>
            ))}
            {!filtered.length && <p className="p-8 text-center text-[#666]">No matches found.</p>}
          </div>
          <div className="safe-bottom border-t border-[#ddd] p-4">
            <button type="button" onClick={() => setOpen(false)} className="mx-auto block h-14 w-[170px] rounded-full bg-[#075541] text-white">back</button>
          </div>
        </div>
      )}
    </>
  );
}

function EnrollmentBrand() {
  return (
    <div className="flex items-center justify-center py-2">
      <img src={kashGoLogo} alt="KashGo" className="h-auto w-[154px] object-contain" />
    </div>
  );
}

function EnrollmentHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <header className="shrink-0">
      <div className="flex h-[48px] items-center justify-between bg-[#e5e5e5] px-5">
        <button type="button" onClick={onBack} className="text-black" aria-label="Go back"><ArrowLeft size={29} /></button>
        <h1 className="text-[17px] font-semibold lowercase">enrollment</h1>
        <span className="w-7" />
      </div>
      <div className="bg-[#e5e5e5]"><EnrollmentBrand /></div>
      <div className="flex items-center justify-center px-7 pb-2 pt-0">
        {Array.from({ length: 6 }, (_, index) => {
          const number = index + 1;
          return (
            <div key={number} className="flex items-center">
              <span className={`relative z-10 grid h-10 w-10 place-items-center rounded-full text-[15px] font-semibold ${number <= step ? 'bg-[#b71362] text-white' : 'bg-[#c8c8c8] text-black'}`}>{number}</span>
              {number < 6 && <span className={`h-1 w-3 ${number < step ? 'bg-[#b71362]' : 'bg-[#c8c8c8]'}`} />}
            </div>
          );
        })}
      </div>
    </header>
  );
}

function EnrollmentField({ label, value, onChange, optional = false, type = 'text', placeholder, inputMode }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
}) {
  return (
    <label className="block">
      <span className="enrollment-label">{label}{!optional && <b> *</b>}{optional && <em> (optional)</em>}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        className="enrollment-input"
      />
    </label>
  );
}

function EnrollmentActions({ step, onBack, onNext, nextLabel = 'Next', busy = false }: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  busy?: boolean;
}) {
  return (
    <div className="mt-auto flex shrink-0 gap-4 bg-white px-5 pb-2 pt-2">
      <button type="button" onClick={onBack} className="h-12 flex-1 rounded-full border border-[#d6d6d6] bg-white text-[15px] font-semibold">{step === 1 ? 'cancel' : 'Previous'}</button>
      <button type="button" onClick={onNext} disabled={busy} className="h-12 flex-1 rounded-full bg-[#075541] text-[15px] font-semibold text-white disabled:opacity-60">{busy ? 'Processing...' : nextLabel}</button>
    </div>
  );
}

function UploadBox({ title, name, accept, onChange }: { title: string; name: string; accept: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  const hasFile = Boolean(name);
  return (
    <div className="min-w-0">
      <h2 className="mb-2 text-left text-[16px] font-bold lowercase text-[#92204c]">{title}</h2>
      <div className="flex items-start gap-2">
        <label className="relative flex h-[148px] min-w-0 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-[14px] border-2 border-[#92204c] bg-[#fffafb] text-center">
          {hasFile ? <div className="break-words px-2 text-[11px] font-semibold text-[#075541]"><Check className="mx-auto mb-1" size={20} />{name}</div> : <div className="px-2 text-[11px] text-[#92204c]"><ImagePlus className="mx-auto mb-1" size={28} /><span>Tap to add</span></div>}
          <input type="file" accept={accept} onChange={onChange} className="sr-only" />
        </label>
        <div className="flex w-[42px] flex-col gap-2">
          <label className="grid h-11 place-items-center rounded-[15px] border-2 border-[#92204c] text-[#92204c]">
            <Camera size={19} />
            <input type="file" accept={accept} onChange={onChange} className="sr-only" />
          </label>
          <button type="button" onClick={() => document.querySelector<HTMLInputElement>(`input[data-upload="${title}"]`)?.click()} className="grid h-11 place-items-center rounded-[15px] border-2 border-[#92204c] text-[#92204c]" aria-label={`Upload ${title}`}><Upload size={19} /></button>
          <button type="button" onClick={() => document.querySelector<HTMLInputElement>(`input[data-upload="${title}"]`)?.click()} className="grid h-11 place-items-center rounded-[15px] border-2 border-[#92204c] text-[#92204c]" aria-label={`Retake ${title}`}><RefreshCw size={19} /></button>
        </div>
      </div>
      <input data-upload={title} type="file" accept={accept} onChange={onChange} className="sr-only" />
    </div>
  );
}

function Summary({ data }: { data: RegistrationData }) {
  const rows = [
    ['gender', data.gender],
    ['First name', data.firstName],
    ['Last name', data.lastName],
    ['Country of identity document', data.identityCountry],
    ['ID type', data.idType],
    ['ID number', data.idNumber],
    ['Issue date', data.issueDate],
    ['Expiration date', data.expirationDate],
    ['country', data.country],
    ['county', data.county],
    ['City/town', data.city],
    ['Address', data.address],
    ['phone number', data.phone],
    ['security question', data.securityQuestion],
    ['Answer', data.securityAnswer],
    ['your picture', data.photoName || 'Added'],
  ];
  return <div className="rounded-[12px] bg-[#c7c7c7] px-3 py-2 text-[11px] leading-4 text-[#202020]">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[1fr_auto] gap-2"><span className="truncate text-right">{label} <b className="text-[#b71362]">*</b></span><span className="max-w-[145px] truncate font-medium">{value || '—'}</span></div>)}</div>;
}

export function Enrollment({ onComplete, onCancel, initialPhone = '' }: { onComplete: (data: RegistrationData) => void; onCancel: () => void; initialPhone?: string }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<RegistrationData>({ ...emptyRegistration, phone: initialPhone });
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const { show, hide } = useGlobalLoading();

  const update = <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const validate = () => {
    if (step === 1 && (!data.gender || !data.firstName.trim() || !data.lastName.trim() || (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)))) return 'Complete gender, first name, last name, and a valid email if provided.';
    if (step === 2 && (!data.identityCountry || !data.idType || !data.idNumber || !data.issueDate || !data.expirationDate)) return 'Complete all required identity document fields.';
    if (step === 2 && data.expirationDate <= data.issueDate) return 'Expiration date must be after the issue date.';
    if (step === 3 && (!data.county || !data.city || !data.address.trim() || data.phone.replace(/\D/g, '').length < 8 || !data.securityQuestion || !data.securityAnswer.trim())) return 'Complete your location, phone, security question, and answer.';
    if (step === 4 && !/^\d{5}$/.test(data.pin)) return 'Enter a valid 5-digit PIN.';
    if (step === 4 && data.pin !== data.confirmPin) return 'PIN and confirmation PIN must match.';
    if (step === 4 && data.pin.length !== 5) return 'Your PIN must contain exactly 5 digits.';
    if (step === 5 && (!data.photoName || !data.idPhotoName)) return 'Add both your picture and your identity document picture.';
    if (step === 6 && !/^\d{6}$/.test(otp)) return 'Enter the 6-digit verification code sent to your phone.';
    return '';
  };

  const next = () => {
    const message = validate();
    if (message) { setError(message); return; }
    if (step === 6) { show('Securing your new wallet...'); window.setTimeout(() => { hide(); onComplete(data); }, 300); return; }
    if (step === 5) setOtpSent(true);
    setStep((current) => current + 1);
    show('Loading enrollment step...');
    window.setTimeout(hide, 260);
    setError('');
  };

  const previous = () => {
    if (step === 1) onCancel();
    else { setStep((current) => current - 1); setError(''); }
  };

  const onFile = (key: 'photoName' | 'idPhotoName') => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) update(key, file.name);
  };

  const otpMessage = otpSent ? `A 6-digit verification code was sent to ${data.phone || 'your mobile number'}.` : 'Verify your phone to finish opening your wallet.';

  return (
    <main className="app-shell flex min-h-[100dvh] flex-col bg-white">
      <EnrollmentHeader step={step} onBack={previous} />
      <div className="min-h-0 flex-1 overflow-hidden px-6 pb-1">
        {step === 1 && <div className="enrollment-form"><Picker title="Select gender" label="select gender" value={data.gender} options={['female', 'male', 'prefer not to say']} onChange={(value) => update('gender', value)} /><EnrollmentField label="First name" value={data.firstName} onChange={(value) => update('firstName', value)} /><EnrollmentField label="Middle name" optional value={data.middleName} onChange={(value) => update('middleName', value)} /><EnrollmentField label="Last name" value={data.lastName} onChange={(value) => update('lastName', value)} /><EnrollmentField label="Email" optional type="email" inputMode="email" value={data.email} onChange={(value) => update('email', value)} /></div>}
        {step === 2 && <div className="enrollment-form"><Picker title="Select country of identity document" label="Select country of identity document" value={data.identityCountry} options={COUNTRIES} onChange={(value) => update('identityCountry', value)} /><Picker title="Select ID type" label="ID type" value={data.idType} options={['Passport', 'National ID card', 'Driver license', 'Voter registration card']} onChange={(value) => update('idType', value)} /><EnrollmentField label="ID number" value={data.idNumber} onChange={(value) => update('idNumber', value)} inputMode="text" /><EnrollmentField label="Issue Date" type="date" value={data.issueDate} onChange={(value) => update('issueDate', value)} /><EnrollmentField label="Expiration Date" type="date" value={data.expirationDate} onChange={(value) => update('expirationDate', value)} /></div>}
        {step === 3 && <div className="enrollment-form enrollment-location-form"><Picker title="Select county" label="Select county" value={data.county} options={LIBERIA_COUNTIES} onChange={(value) => { update('county', value); update('city', ''); }} /><Picker title="Select city or town" label="Select city" value={data.city} options={CITIES_BY_COUNTY[data.county] || []} disabled={!data.county} onChange={(value) => update('city', value)} /><EnrollmentField label="Address" value={data.address} onChange={(value) => update('address', value)} /><div className="grid grid-cols-[68px_1fr] items-end gap-3"><div><span className="enrollment-label">country</span><div className="flex h-[48px] items-center justify-center rounded-full border border-[#d6d6d6] bg-[#f8f8f8] text-xl" aria-label="Liberia">🇱🇷</div></div><EnrollmentField label="phone number" type="tel" inputMode="tel" value={data.phone} onChange={(value) => update('phone', value)} placeholder="0776 836 689" /></div><Picker title="Select security question" label="Select security question" value={data.securityQuestion} options={SECURITY_QUESTIONS} onChange={(value) => update('securityQuestion', value)} /><EnrollmentField label="Answer" value={data.securityAnswer} onChange={(value) => update('securityAnswer', value)} /></div>}
        {step === 4 && <div className="enrollment-form enrollment-pin-form"><p className="text-center text-[14px] italic text-[#3f2635]">You must enter a 5-digit PIN code</p><label className="relative block"><EnrollmentField label="PIN code" type={pinVisible ? 'text' : 'password'} inputMode="numeric" value={data.pin} onChange={(value) => update('pin', value.replace(/\D/g, '').slice(0, 5))} /><button type="button" onClick={() => setPinVisible((value) => !value)} className="absolute right-5 top-[34px] text-[#333]" aria-label="Toggle PIN visibility">{pinVisible ? <EyeOff size={22} /> : <Eye size={22} />}</button></label><label className="relative block"><EnrollmentField label="Confirm PIN code" type={confirmVisible ? 'text' : 'password'} inputMode="numeric" value={data.confirmPin} onChange={(value) => update('confirmPin', value.replace(/\D/g, '').slice(0, 5))} /><button type="button" onClick={() => setConfirmVisible((value) => !value)} className="absolute right-5 top-[34px] text-[#333]" aria-label="Toggle confirmation PIN visibility">{confirmVisible ? <EyeOff size={22} /> : <Eye size={22} />}</button></label><div className="flex items-center gap-3 rounded-xl bg-[#eff7f3] p-3 text-[12px] text-[#075541]"><LockKeyhole size={18} /><span>Your PIN protects wallet actions.</span></div></div>}
        {step === 5 && <div className="enrollment-form enrollment-photo-form"><div className="grid grid-cols-2 gap-3 pt-1"><UploadBox title="your picture" name={data.photoName} accept="image/*" onChange={onFile('photoName')} /><UploadBox title="your ID picture" name={data.idPhotoName} accept="image/*" onChange={onFile('idPhotoName')} /></div><p className="text-center text-[11px] text-[#777]">Use clear, well-lit images. Your files stay attached to this enrollment.</p></div>}
        {step === 6 && <div className="enrollment-form enrollment-summary-form"><EnrollmentField label="Otp" value={otp} onChange={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="Enter 6-digit code" /><div className="flex items-center gap-3 rounded-xl bg-[#eff7f3] p-3 text-[12px] leading-4 text-[#075541]"><ShieldCheck size={21} className="shrink-0" /><span>{otpMessage} Never share this code with anyone.</span></div><div><h2 className="mb-1 text-center text-[16px] font-bold">Summary</h2><Summary data={data} /></div><button type="button" onClick={() => setOtpSent(true)} className="mx-auto flex items-center gap-2 text-[12px] font-semibold text-[#92204c]"><RefreshCw size={14} />Resend code</button></div>}
        {error && <p role="alert" className="my-4 rounded-xl bg-[#fff0f4] px-4 py-3 text-center text-[13px] font-semibold text-[#a71958]">{error}</p>}
      </div>
      <EnrollmentActions step={step} onBack={previous} onNext={next} nextLabel={step === 6 ? 'VALIDATE' : 'Next'} />
      <div className="safe-bottom flex justify-center pb-2 pt-1"><EnrollmentBrand /></div>
    </main>
  );
}