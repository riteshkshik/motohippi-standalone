import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldCheck, Car, Bike, Phone, User, Mail, Clock, Calendar,
  Gauge, MapPin, Building2, CheckCircle2, Lock, Headphones, Award,
  Check, MessageSquare, Sparkles, AlertCircle, HeartHandshake, CheckCircle, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// ─── Config ───────────────────────────────────────────────────────────────────
const WA_NUMBER = '918150025108';

const insuranceRequirements = [
  'New Insurance',
  'Renew Insurance',
];

// ─── Car Dataset (Manufacturer -> Models) ────────────────────────────────────
const carDataset: Record<string, string[]> = {
  'Maruti Suzuki': ['Alto 800', 'Alto K10', 'S-Presso', 'Celerio', 'Wagon R', 'Swift', 'Dzire', 'Baleno', 'Fronx', 'Brezza', 'Ertiga', 'XL6', 'Grand Vitara', 'Jimny', 'Ignis', 'Ciaz', 'Invicto', 'Eeco', 'S-Cross'],
  'Hyundai': ['Santro', 'Grand i10 Nios', 'i20', 'i20 N Line', 'Aura', 'Exter', 'Venue', 'Venue N Line', 'Creta', 'Creta Electric', 'Alcazar', 'Tucson', 'Ioniq 5', 'Verna', 'Kona Electric', 'Elantra'],
  'Tata': ['Tiago', 'Tiago EV', 'Tigor', 'Tigor EV', 'Altroz', 'Altroz Racer', 'Punch', 'Punch EV', 'Nexon', 'Nexon EV', 'Curvv', 'Curvv EV', 'Harrier', 'Harrier EV', 'Safari', 'Sierra'],
  'Mahindra': ['Bolero', 'Bolero Neo', 'Thar', 'Thar Roxx', 'Scorpio', 'Scorpio N', 'XUV 3XO', 'XUV400', 'XUV700', 'XUV 500', 'Marazzo', 'BE 6', 'XEV 9e', 'XEV 9S', 'e2o', 'eVerito'],
  'Toyota': ['Glanza', 'Urban Cruiser Taisor', 'Urban Cruiser Hyryder', 'Rumion', 'Innova Crysta', 'Innova Hycross', 'Fortuner', 'Fortuner Legender', 'Hilux', 'Camry', 'Vellfire', 'Land Cruiser 300'],
  'Kia': ['Sonet', 'Seltos', 'Carens', 'Carens Clavis', 'Carnival', 'EV6', 'EV9', 'Sorento'],
  'Honda': ['Brio', 'Amaze', 'Jazz', 'City', 'City e:HEV', 'WR-V', 'Elevate', 'Civic', 'CR-V'],
  'MG': ['Comet EV', 'Windsor EV', 'Astor', 'Hector', 'Hector Plus', 'Gloster', 'ZS EV', 'M9', 'Majestor'],
  'Renault': ['Kwid', 'Triber', 'Kiger', 'Duster', 'Captur', 'Lodgy'],
  'Nissan': ['Magnite', 'Kicks', 'Terrano', 'Sunny', 'Micra', 'X-Trail'],
  'Volkswagen': ['Polo', 'Virtus', 'Taigun', 'T-Roc', 'Tiguan', 'Vento', 'Ameo'],
  'Skoda': ['Kylaq', 'Kushaq', 'Slavia', 'Kodiaq', 'Superb', 'Rapid', 'Octavia', 'Karoq'],
  'Jeep': ['Compass', 'Meridian', 'Wrangler', 'Grand Cherokee', 'Avenger'],
  'Citroen': ['C3', 'C3 Aircross', 'C3 Aircross X', 'Basalt', 'eC3', 'C5 Aircross'],
  'Isuzu': ['D-Max', 'V-Cross', 'MU-X', 'Hi-Lander'],
  'Force Motors': ['Gurkha', 'Gurkha 5 Door', 'Trax Cruiser', 'Urbania'],
  'BYD': ['Atto 3', 'e6', 'Seal', 'Seal U', 'Sealion 7', 'Sealion 6'],
  'VinFast': ['VF 6', 'VF 7', 'VF 8', 'VF 9'],
  'Maruti Suzuki (Nexa)': ['Ignis', 'Baleno', 'Fronx', 'Grand Vitara', 'XL6', 'Invicto', 'S-Cross'],
  'BMW': ['2 Series Gran Coupe', '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM', 'i4', 'i5', 'i7', 'iX', 'iX1', 'iX3'],
  'Mercedes-Benz': ['A-Class Limousine', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'EQS', 'EQE', 'AMG GT', 'Maybach GLS', 'Maybach S-Class'],
  'Audi': ['A4', 'A6', 'A8 L', 'Q3', 'Q5', 'Q7', 'Q8', 'Q3 Sportback', 'Q8 e-tron', 'e-tron GT', 'RS5', 'RS Q8'],
  'Volvo': ['XC40', 'XC40 Recharge', 'XC60', 'XC90', 'S90', 'C40 Recharge', 'EX30', 'EX40', 'EC40', 'EX90'],
  'Lexus': ['ES', 'NX', 'RX', 'LX', 'LM', 'LC 500h', 'LS'],
  'Jaguar': ['XE', 'XF', 'F-Pace', 'F-Type', 'I-Pace', 'F-Pace SVR'],
  'Land Rover': ['Range Rover Evoque', 'Discovery Sport', 'Defender', 'Discovery', 'Range Rover Velar', 'Range Rover Sport', 'Range Rover'],
  'Porsche': ['Macan', 'Macan Electric', 'Cayenne', 'Cayenne Coupe', 'Panamera', 'Taycan', '911', '718 Cayman', '718 Boxster'],
  'Mini': ['Cooper 3 Door', 'Cooper 5 Door', 'Cooper S', 'Countryman', 'Countryman Electric', 'Clubman', 'Convertible'],
  'Fiat': ['Punto', 'Linea', 'Avventura', 'Urban Cross'],
  'Ford': ['Figo', 'Aspire', 'Freestyle', 'EcoSport', 'Endeavour', 'Ikon', 'Fiesta', 'Mustang'],
  'Chevrolet': ['Beat', 'Spark', 'Sail', 'Sail U-VA', 'Cruze', 'Enjoy', 'Captiva', 'Trailblazer'],
  'Mitsubishi': ['Pajero Sport', 'Outlander', 'Pajero'],
  'Hindustan Motors': ['Ambassador', 'Contessa'],
  'Premier': ['Padmini', 'Rio'],
  'Daewoo': ['Matiz', 'Cielo'],
  'Opel': ['Astra', 'Corsa', 'Vectra'],
};

// ─── Bike Dataset (Manufacturer -> Models) ────────────────────────────────────
const bikeDataset: Record<string, string[]> = {
  'Hero MotoCorp': ['Splendor Plus', 'Splendor Plus XTEC', 'HF Deluxe', 'HF 100', 'Passion XTEC', 'Glamour', 'Glamour Xtec', 'Super Splendor', 'Super Splendor XTEC', 'Xtreme 125R', 'Xtreme 160R', 'Xtreme 250R', 'Xpulse 200', 'Xpulse 210', 'Xpulse 200 4V', 'Karizma XMR', 'Mavrick 440', 'Destini 125', 'Destini Prime', 'Pleasure Plus', 'Pleasure Plus XTEC', 'Xoom', 'Maestro Edge', 'Vida VX2', 'Vida V2'],
  'Honda': ['Shine 100', 'Shine 125', 'SP 125', 'SP 160', 'Unicorn', 'Livo', 'Hornet 2.0', 'CB200X', 'NX500', 'CB350', 'Hness CB350', 'CB350RS', 'CB300F', 'CB300R', 'Rebel 300', 'ADV 160', 'Activa 6G', 'Activa 125', 'Activa 110', 'Dio', 'Dio 125', 'Grazia', 'Activa e', 'QC1', 'Gold Wing'],
  'TVS': ['Sport', 'Radeon', 'Star City Plus', 'Raider', 'Apache RTR 160', 'Apache RTR 160 4V', 'Apache RTR 180', 'Apache RTR 200 4V', 'Apache RR 310', 'Ronin', 'Racing RTR 310', 'Jupiter', 'Jupiter 125', 'Jupiter 110', 'Ntorq 125', 'NTorq 150', 'iQube', 'iQube S', 'iQube ST', 'XL100'],
  'Bajaj': ['Platina 100', 'Platina 110', 'CT 100', 'CT 110', 'Pulsar 125', 'Pulsar 150', 'Pulsar N150', 'Pulsar N160', 'Pulsar NS160', 'Pulsar NS200', 'Pulsar NS400Z', 'Pulsar RS200', 'Pulsar 220F', 'Dominar 250', 'Dominar 400', 'Avenger 160 Street', 'Avenger 220 Cruise', 'Chetak', 'Chetak Premium', 'Chetak 3501', 'Chetak 3502'],
  'Royal Enfield': ['Hunter 350', 'Classic 350', 'Bullet 350', 'Meteor 350', 'Goan Classic 350', 'Guerrilla 450', 'Himalayan 450', 'Scram 411', 'Scram 440', 'Interceptor 650', 'Continental GT 650', 'Super Meteor 650', 'Shotgun 650', 'Classic 650', 'Bullet 650', 'Himalayan 440', 'Thunderbird 350', 'Thunderbird 500', 'Classic 500', 'Electra 350', 'Continental GT 535'],
  'Yamaha': ['FZ-FI', 'FZS-FI', 'FZ-X', 'MT-15', 'R15 V4', 'R15S', 'R3', 'R7', 'YZF-R2', 'Aerox 155', 'Fascino 125', 'RayZR 125', 'RayZR 125 Fi Hybrid', 'NMax 155'],
  'Suzuki': ['Access 125', 'Avenis 125', 'Burgman Street', 'Burgman Street EX', 'Gixxer', 'Gixxer SF', 'Gixxer 250', 'Gixxer SF 250', 'V-Strom SX', 'Hayabusa', 'GSX-8R', 'e-Access'],
  'KTM': ['125 Duke', '200 Duke', '250 Duke', '390 Duke', '790 Duke', '890 Duke R', '250 Adventure', '390 Adventure', '390 Adventure X', '1290 Super Adventure', 'RC 125', 'RC 200', 'RC 390'],
  'Husqvarna': ['Svartpilen 125', 'Svartpilen 250', 'Vitpilen 250', 'Svartpilen 401', 'Vitpilen 401'],
  'BMW Motorrad': ['G 310 R', 'G 310 GS', 'G 310 RR', 'F 310 GS', 'F 900 GS', 'F 900 XR', 'R 1300 GS', 'R 1300 GS Adventure', 'R 12', 'R 18', 'S 1000 RR', 'S 1000 R', 'M 1000 RR', 'M 1000 R'],
  'Triumph': ['Speed 400', 'Scrambler 400 X', 'Scrambler 400 XC', 'Speed T4', 'Speed Twin 900', 'Trident 660', 'Tiger Sport 660', 'Tiger 900', 'Tiger 1200', 'Street Triple', 'Daytona 660', 'Rocket 3'],
  'Kawasaki': ['Ninja 300', 'Ninja 400', 'Ninja 500', 'Ninja 650', 'Ninja ZX-4R', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Ninja H2', 'Z650', 'Z900', 'Z H2', 'Versys 650', 'Versys 1000', 'W175', 'Eliminator 450'],
  'Harley-Davidson': ['X440', 'Sportster S', 'Nightster', 'Fat Bob', 'Fat Boy', 'Low Rider S', 'Street Glide', 'Road Glide', 'Pan America 1250', 'Iron 883', 'Forty Eight'],
  'Jawa': ['Jawa 42', '42 Bobber', 'Perak', 'Jawa 350', '42 FJ', 'Jawa Standard'],
  'Yezdi': ['Roadster', 'Scrambler', 'Adventure', 'Roadster 334', 'Scrambler 334'],
  'Aprilia': ['SR 125', 'SR 160', 'SXR 125', 'SXR 160', 'SXR 175', 'RS 457', 'Tuono 457', 'RS 660', 'Tuareg 660'],
  'Ducati': ['Panigale V2', 'Panigale V4', 'Monster', 'Multistrada V2', 'Multistrada V4', 'Streetfighter V2', 'Streetfighter V4', 'Diavel V4', 'Scrambler Icon', 'Scrambler 1100'],
  'Indian Motorcycle': ['Scout', 'Scout Bobber', 'Chief', 'Chief Bobber Dark Horse', 'Super Chief', 'FTR', 'Pursuit', 'Challenger'],
  'Benelli': ['Leoncino 250', 'Leoncino 500', 'TRK 251', 'TRK 502', 'TRK 502X', '302S', '502C'],
  'Keeway': ['K-Light 250V', 'V302C', 'Vieste 300', 'Sixties 300', 'SR250'],
  'QJ Motor': ['SRC 250', 'SRK 400', 'SRV 300', 'SRV 550', 'SRT 550'],
  'Zontes': ['350R', '350T', '350X', 'GK350', '350D', 'ZT125'],
  'Revolt': ['RV400', 'RV1', 'RV1+'],
  'Ola Electric': ['S1 Pro', 'S1 Air', 'S1 X', 'S1 X+', 'S1 Z', 'Roadster X'],
  'Ather': ['450X', '450S', '450 Apex', 'Rizta', 'Rizta S', '450 Plus'],
  'Vida': ['V1 Pro', 'V1 Plus', 'VX2'],
  'Ultraviolette': ['F77', 'F77 Mach 2', 'F77 SuperStreet', 'Tesseract'],
  'Oben Electric': ['Rorr', 'Rorr EZ'],
  'Pure EV': ['Epluto 7G', 'Etryst 350', 'Epluto', 'Etrance Neo'],
  'Okinawa': ['PraisePro', 'Ridge+', 'R30', 'Okhi90', 'iPraise+', 'Lite'],
  'Komaki': ['Ranger', 'Flare', 'XGT VP', 'SE'],
  'Ampere': ['Magnus EX', 'Nexus', 'Primus', 'Zeal EX', 'Reo'],
  'BGauss': ['RUV 350', 'RUV 400', 'D15', 'C12'],
  'Bounce Infinity': ['E1', 'E1+'],
  'Joy e-bike': ['Wolf', 'Gen Next Nanu', 'Glob', 'Monster'],
  'Odysse': ['Racer', 'Vader', 'Evoqis', 'Hawk'],
  'Simple Energy': ['One', 'Dot One', 'Wave'],
  'Matter': ['Aera'],
  'Hop Electric': ['Leo', 'OxO', 'Pli'],
  'Vespa / Piaggio': ['VXL 125', 'VXL 150', 'S 125', 'S 150', 'ZX 125', 'SXL 125', 'SXL 150'],
};

const defaultModels = ['Select Model', 'Standard Variant', 'Top Variant', 'Base Variant'];

const kmsOptions = [
  '< 5,000 km',
  '5,000 - 10,000 km',
  '10,000 - 20,000 km',
  '20,000 - 40,000 km',
  '40,000+ km',
];

const preferredTimeOptions = [
  'Morning (9:00 AM - 12:00 PM)',
  'Afternoon (12:00 PM - 4:00 PM)',
  'Evening (4:00 PM - 8:00 PM)',
  'Anytime',
];

const currentYear = new Date().getFullYear();
const purchaseYears = Array.from({ length: 20 }, (_, i) => String(currentYear - i));

// ─── Component Root ───────────────────────────────────────────────────────────
export default function Insurance() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'car' | 'bike'>('car');

  const [form, setForm] = useState({
    insuranceReq: 'New Insurance',
    manufacturer: '',
    model: '',
    yearOfPurchase: '',
    kmsDriven: '',
    city: '',
    fullName: '',
    mobileNumber: '',
    email: '',
    preferredTime: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleTabChange = (tab: 'car' | 'bike') => {
    setActiveTab(tab);
    setForm((prev) => ({
      ...prev,
      manufacturer: '',
      model: '',
    }));
  };

  const updateForm = (key: string, val: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: val,
      ...(key === 'manufacturer' ? { model: '' } : {}),
    }));
  };

  const handleCallRequest = () => {
    const text = encodeURIComponent(
      `Hello MotoHippi Insurance Team, I would like to request a callback from an insurance expert to help me find the best ${activeTab === 'car' ? 'Car' : 'Bike'} insurance plan.`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.mobileNumber) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please enter your Full Name and Mobile Number.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast({
        title: '🎉 Request Submitted Successfully!',
        description: 'Our insurance expert will call you within 30 minutes.',
      });
    }, 600);
  };

  const activeDataset = activeTab === 'car' ? carDataset : bikeDataset;
  const currentManufacturers = Object.keys(activeDataset);
  const availableModels = form.manufacturer ? (activeDataset[form.manufacturer] || defaultModels) : defaultModels;

  return (
    <div className="min-h-screen bg-[#070A0F] text-foreground font-sans selection:bg-primary selection:text-black pb-24 overflow-x-hidden">
      
      {/* ─── 1. Hero Banner ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[520px] md:min-h-[580px] flex items-center justify-center pt-8 pb-12 overflow-hidden border-b border-white/5">
        {/* Background Image & Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_bg.png"
            alt="Motorcycle rider background"
            className="w-full h-full object-cover object-center opacity-30 scale-105 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070A0F] via-[#070A0F]/85 to-[#070A0F]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-transparent" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <Shield size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Insurance</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-none uppercase tracking-tight">
                Get The Right <br />
                <span className="text-primary tracking-normal">INSURANCE.</span> <br />
                We Will Assist You.
              </h1>

              {/* Subheadline */}
              <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
                Share your vehicle details and our expert will contact you to help you find the best insurance as per your needs.
              </p>

              {/* Trust Badges Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-white/80">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <span>Certified Partner of Policybazaar</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Headphones size={16} className="text-primary shrink-0" />
                  <span>Expert Assistance Over Call</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Award size={16} className="text-primary shrink-0" />
                  <span>Best Plans for You</span>
                </div>
              </div>
            </div>

            {/* Right Side Card — Policybazaar Partner */}
            <div className="lg:col-span-4 flex lg:justify-end">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                
                <span className="text-xs text-white/50 font-medium mb-3 uppercase tracking-wider">
                  In Partnership with
                </span>
                
                {/* PB Badge / Image */}
                <div className="bg-white p-3 rounded-xl border border-white/20 shadow-md mb-4 flex items-center justify-center w-full max-w-[220px]">
                  <img
                    src="/pb-partner-new.png"
                    alt="Policybazaar Logo"
                    className="h-10 object-contain"
                  />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                  <CheckCircle size={13} />
                  <span>Trusted by Millions</span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. Quick Call Banner ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-[#0B1018] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white leading-tight">Prefer to talk?</h4>
              <p className="text-xs sm:text-sm text-white/60">
                Our insurance expert will call you and assist with the best plans.
              </p>
            </div>
          </div>

          <Button
            onClick={handleCallRequest}
            variant="outline"
            className="w-full sm:w-auto h-11 px-6 border-primary/50 text-primary hover:bg-primary hover:text-black font-bold text-xs sm:text-sm rounded-xl transition-all shrink-0 flex items-center gap-2"
          >
            <Phone size={15} />
            Request a Call
          </Button>
        </div>
      </section>

      {/* ─── 3. Main Form Card ("Tell Us About Your Vehicle") ───────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-[#0D131E] border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative">
          
          {/* Insurance Type Tabs: Car Insurance vs Bike Insurance */}
          <div className="flex items-center gap-2 p-1.5 bg-[#131A26] border border-white/10 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => handleTabChange('car')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'car'
                  ? 'bg-primary text-black shadow-lg shadow-primary/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Car size={18} />
              <span>Car Insurance</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('bike')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'bike'
                  ? 'bg-primary text-black shadow-lg shadow-primary/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bike size={18} />
              <span>Bike Insurance</span>
            </button>
          </div>

          {/* Form Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Tell Us About Your {activeTab === 'car' ? 'Car' : 'Bike'}
              </h2>
              <p className="text-xs sm:text-sm text-white/50 mt-1">
                Fill in the details below and our expert will connect with you shortly.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-white/60 bg-white/5 px-3 py-1.5 rounded-full border border-white/8 self-start sm:self-auto">
              <Lock size={13} className="text-primary" />
              <span>Your information is 100% secure</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 px-4 space-y-5"
              >
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto border border-primary/40">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">Thank You, {form.fullName}!</h3>
                <p className="text-white/70 max-w-md mx-auto text-sm sm:text-base">
                  Your vehicle details have been submitted to our Policybazaar Certified Insurance Expert. We will contact you at <span className="text-primary font-bold">{form.mobileNumber}</span> within 30 minutes.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-xl px-6 py-2.5 text-xs font-bold mt-4"
                >
                  Submit Another Request
                </Button>
              </motion.div>
            ) : (
              /* Actual Form */
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* ── Section A: Vehicle Specification ── */}
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    
                    {/* Insurance Requirement */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                        <span>Insurance Requirement*</span>
                      </label>
                      <Select value={form.insuranceReq} onValueChange={(v) => updateForm('insuranceReq', v)}>
                        <SelectTrigger className="bg-[#131A26] border-white/10 text-white rounded-xl h-12 focus:border-primary/50 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-white/40" />
                            <SelectValue placeholder="Select Requirement" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#131A26] border-white/10 text-white text-xs sm:text-sm">
                          {insuranceRequirements.map((req) => (
                            <SelectItem key={req} value={req}>
                              {req}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Manufacturer */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                        <span>Manufacturer*</span>
                      </label>
                      <Select value={form.manufacturer} onValueChange={(v) => updateForm('manufacturer', v)}>
                        <SelectTrigger className="bg-[#131A26] border-white/10 text-white rounded-xl h-12 focus:border-primary/50 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-white/40" />
                            <SelectValue placeholder="Select Manufacturer" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#131A26] border-white/10 text-white text-xs sm:text-sm max-h-60 overflow-y-auto">
                          {currentManufacturers.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Model */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                        <span>Model*</span>
                      </label>
                      <Select value={form.model} onValueChange={(v) => updateForm('model', v)}>
                        <SelectTrigger className="bg-[#131A26] border-white/10 text-white rounded-xl h-12 focus:border-primary/50 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            {activeTab === 'car' ? <Car size={16} className="text-white/40" /> : <Bike size={16} className="text-white/40" />}
                            <SelectValue placeholder="Select Model" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#131A26] border-white/10 text-white text-xs sm:text-sm max-h-60 overflow-y-auto">
                          {availableModels.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Year of Purchase */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                        <span>Year of Purchase*</span>
                      </label>
                      <Select value={form.yearOfPurchase} onValueChange={(v) => updateForm('yearOfPurchase', v)}>
                        <SelectTrigger className="bg-[#131A26] border-white/10 text-white rounded-xl h-12 focus:border-primary/50 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-white/40" />
                            <SelectValue placeholder="Select Year" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#131A26] border-white/10 text-white text-xs sm:text-sm max-h-60 overflow-y-auto">
                          {purchaseYears.map((yr) => (
                            <SelectItem key={yr} value={yr}>
                              {yr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Kilometers Driven */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                        <span>Kilometers Driven*</span>
                      </label>
                      <Select value={form.kmsDriven} onValueChange={(v) => updateForm('kmsDriven', v)}>
                        <SelectTrigger className="bg-[#131A26] border-white/10 text-white rounded-xl h-12 focus:border-primary/50 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Gauge size={16} className="text-white/40" />
                            <SelectValue placeholder="Select KMs Driven" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#131A26] border-white/10 text-white text-xs sm:text-sm">
                          {kmsOptions.map((km) => (
                            <SelectItem key={km} value={km}>
                              {km}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                        <span>City*</span>
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                          value={form.city}
                          onChange={(e) => updateForm('city', e.target.value)}
                          placeholder="Select Your City"
                          className="pl-10 bg-[#131A26] border-white/10 text-white rounded-xl h-12 focus:border-primary/50 text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* ── Section B: Contact Details ── */}
                <div className="pt-4 space-y-5 border-t border-white/8">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Your Contact Details
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70">
                        Full Name*
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                          required
                          value={form.fullName}
                          onChange={(e) => updateForm('fullName', e.target.value)}
                          placeholder="Enter your full name"
                          className="pl-10 bg-[#131A26] border-white/10 text-white rounded-xl h-12 focus:border-primary/50 text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70">
                        Mobile Number*
                      </label>
                      <div className="relative flex items-center">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                          required
                          type="tel"
                          value={form.mobileNumber}
                          onChange={(e) => updateForm('mobileNumber', e.target.value)}
                          placeholder="Enter your mobile number"
                          className="pl-10 pr-10 bg-[#131A26] border-white/10 text-white rounded-xl h-12 focus:border-primary/50 text-xs sm:text-sm"
                        />
                        {/* WhatsApp Icon */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Email (Optional) */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70">
                        Email <span className="text-white/40 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => updateForm('email', e.target.value)}
                          placeholder="Enter your email ID"
                          className="pl-10 bg-[#131A26] border-white/10 text-white rounded-xl h-12 focus:border-primary/50 text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Preferred Time to Call */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/70">
                        Preferred Time to Call
                      </label>
                      <Select value={form.preferredTime} onValueChange={(v) => updateForm('preferredTime', v)}>
                        <SelectTrigger className="bg-[#131A26] border-white/10 text-white rounded-xl h-12 focus:border-primary/50 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-white/40" />
                            <SelectValue placeholder="Select Preferred Time" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#131A26] border-white/10 text-white text-xs sm:text-sm">
                          {preferredTimeOptions.map((pt) => (
                            <SelectItem key={pt} value={pt}>
                              {pt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 space-y-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 bg-primary text-black font-black text-sm sm:text-base rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 flex flex-col items-center justify-center uppercase tracking-wider"
                  >
                    <span>{submitting ? 'SUBMITTING...' : 'SUBMIT DETAILS'}</span>
                    <span className="text-[10px] sm:text-xs font-semibold normal-case tracking-normal opacity-90">
                      Our expert will call you within 30 minutes
                    </span>
                  </Button>

                  {/* Trust Badges Under Submit */}
                  <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-white/60">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-primary" />
                      <span>No Spam Calls</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HeartHandshake size={14} className="text-primary" />
                      <span>No Obligation</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock size={14} className="text-primary" />
                      <span>100% Confidential</span>
                    </div>
                  </div>
                </div>

              </form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── 4. How It Works Section ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center mb-12">
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            How It Works
          </h3>
          <div className="w-12 h-1 bg-primary mx-auto mt-2 rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Step 1 */}
          <div className="bg-[#0D131E] border border-white/8 rounded-2xl p-6 flex flex-col items-center text-center relative z-10">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 shadow-lg">
              <FileText size={24} className="text-primary" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold mb-2">
              1
            </div>
            <h4 className="text-base font-bold text-white mb-1">Share Details</h4>
            <p className="text-xs text-white/50 leading-relaxed">
              Fill in your vehicle and contact details.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0D131E] border border-white/8 rounded-2xl p-6 flex flex-col items-center text-center relative z-10">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 shadow-lg">
              <Headphones size={24} className="text-primary" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold mb-2">
              2
            </div>
            <h4 className="text-base font-bold text-white mb-1">Expert Connects</h4>
            <p className="text-xs text-white/50 leading-relaxed">
              Our insurance expert will contact you over call.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0D131E] border border-white/8 rounded-2xl p-6 flex flex-col items-center text-center relative z-10">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 shadow-lg">
              <ShieldCheck size={24} className="text-primary" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold mb-2">
              3
            </div>
            <h4 className="text-base font-bold text-white mb-1">Get Best Options</h4>
            <p className="text-xs text-white/50 leading-relaxed">
              Compare and choose from the best insurance plans.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#0D131E] border border-white/8 rounded-2xl p-6 flex flex-col items-center text-center relative z-10">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 shadow-lg">
              <CheckCircle2 size={24} className="text-primary" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold mb-2">
              4
            </div>
            <h4 className="text-base font-bold text-white mb-1">Buy & Stay Protected</h4>
            <p className="text-xs text-white/50 leading-relaxed">
              Buy the plan and get expert assistance.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
