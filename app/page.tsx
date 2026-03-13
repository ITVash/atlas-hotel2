'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, ChevronRight, MapPin, Phone, Mail, 
  Instagram, Facebook, Calendar, Users, ArrowRight,
  Clock, Check,
  ArrowUp
} from 'lucide-react';
import Lenis from 'lenis';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { h3 } from 'motion/react-client';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const FadeIn = ({ children, delay = 0, className, direction = 'up' }: { children: React.ReactNode, delay?: number, className?: string, direction?: 'up' | 'down' | 'left' | 'right' | 'none' }) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    animate={{ y: [0, -15, 0] }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
  >
    {children}
  </motion.div>
);

const NoiseOverlay = () => <div className="noise-overlay" />;

const LiveTime = ({ className }: { className?: string }) => {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Europe/Moscow',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTime(new Intl.DateTimeFormat('ru-RU', options).format(now));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className={cn("h-4 w-32 bg-atlas-ink/5 animate-pulse", className)} />;

  return (
    <div className={cn("flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase", className)}>
      <Clock size={12} strokeWidth={1.5} />
      <span>Donetsk {time}</span>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
      >
        <div className="absolute inset-0 bg-atlas-ink/40 backdrop-blur-md" onClick={onClose} />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-atlas-bg p-6 sm:p-8 md:p-16 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:rotate-90 transition-transform duration-500"
          >
            <X size={24} strokeWidth={1} />
          </button>
          <h3 className="font-serif text-3xl sm:text-4xl md:text-6xl mb-8 tracking-tight break-words">{title}</h3>
          <div className="font-sans text-sm leading-relaxed text-atlas-ink/80">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const RoomCard = ({ room, onOpenModal, onBook }: { room: any, onOpenModal: (room: any) => void, onBook: () => void }) => {
  return (
    <div className="room-card w-full group">
      <div className="relative aspect-[4/5] overflow-hidden mb-6">
        <Image 
          src={room.image} 
          alt={room.name}
          onClick={() => onOpenModal(room)}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "";
          }}
        />
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 font-sans text-[10px] tracking-widest uppercase shadow-sm">
          от {room.price} ₽
        </div>
      </div>
      <h3 className="font-serif text-2xl md:text-3xl mb-4 leading-tight">{room.name}</h3>
      <div className="flex gap-6">
        <button 
          onClick={() => onOpenModal(room)}
          className="font-sans text-[10px] tracking-[0.2em] uppercase border-b border-atlas-ink/20 pb-1 hover:border-atlas-ink transition-colors"
        >
          Подробнее
        </button>
        <button 
          onClick={onBook}
          className="font-sans text-[10px] tracking-[0.2em] uppercase text-atlas-red border-b border-atlas-red/20 pb-1 hover:border-atlas-red transition-colors"
        >
          Забронировать
        </button>
      </div>
    </div>
  );
};

// --- Main Page ---

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeModal, setActiveModal] = useState<any>(null);
  const [infraModal, setInfraModal] = useState<any>(null);
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [fzConsent, setFzConsent] = useState(false);
  const [footerFzConsent, setFooterFzConsent] = useState(false);

  useEffect(() => {
    const lenis = new Lenis();
    
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      lenis.destroy();
    };
  }, []);

  const rooms = [
    {
      name: 'Стандарт Улучшенный',
      price: '6000',
      image: '/room-standart.jpg',
      details: (
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p className="mb-6">Идеальный баланс комфорта и функциональности. Номер выполнен в спокойных тонах, способствующих отдыху после насыщенного дня.</p>
            <ul className="space-y-3">
              <li>• Площадь: 16 м²</li>
              <li>• Вместимость: 2 гостя</li>
              <li>• Кровать: King Size (160x200)</li>
              <li>• Кондиционер, сейф, ТВ, Wi-Fi</li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-xl mb-4">Ванная комната</h4>
            <p>Ванна с душем, премиальная мини-парфюмерия, фен, мягкие тапочки.</p>
            <div className="mt-8 p-6 bg-atlas-ink/5 border border-atlas-ink/10">
              <p className="font-sans text-[10px] tracking-widest uppercase mb-2">Сервис</p>
              <p>Минеральная вода и чайный набор обновляются ежедневно.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'Премиум',
      price: '6500',
      image: '/room-premium.jpg',
      details: (
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p className="mb-6">Улучшенная комплектация для тех, кто ценит детали. Дополнительное оборудование и расширенный сервис.</p>
            <ul className="space-y-3">
              <li>• Площадь: 16 м²</li>
              <li>• Кровать: 160x200</li>
              <li>• Холодильник, рабочий стол, сейф</li>
              <li>• Чайный набор, минеральная вода</li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-xl mb-4">Особенности</h4>
            <p>Панорамный вид на город или реку Кальмиус. Улучшенная звукоизоляция.</p>
          </div>
        </div>
      )
    },
    {
      name: 'Полулюкс',
      price: '8800',
      image: '/room-junior.jpg',
      details: (
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p className="mb-6">Просторный двухкомнатный номер. Разделение на зону отдыха и спальню обеспечивает максимальный комфорт.</p>
            <ul className="space-y-3">
              <li>• Площадь: 30 м²</li>
              <li>• 2 комнаты: Гостиная и Спальня</li>
              <li>• Кровать: Super King Size (180x200)</li>
              <li>• Мягкая мебель, журнальный столик</li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-xl mb-4">Комплектация</h4>
            <p>Два телевизора, расширенный чайный набор, халаты и тапочки.</p>
          </div>
        </div>
      )
    },
    {
      name: 'Люкс',
      price: '12000',
      image: '/room-suite.jpg',
      details: (
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p className="mb-6">Вершина роскоши в отеле Атлас. Двухуровневый комфорт или просторные апартаменты с двумя санузлами.</p>
            <ul className="space-y-3">
              <li>• Площадь: 60 м²</li>
              <li>• 2 санузла, теплый пол</li>
              <li>• Кофемашина, мини-бар</li>
              <li>• DVD-система, прямая телефонная линия</li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-xl mb-4">Эксклюзивно</h4>
            <p>Украшение номера по запросу, услуги консьержа 24/7, приоритетное бронирование в ресторане.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <main className="relative overflow-x-hidden">
      <NoiseOverlay />

      <motion.div className="flex fixed hover:bg-gray-200 justify-center items-center h-[35px] w-[35px] rounded-[40px] z-100 bottom-2 right-5 border-gray-500 border text-gray-500 cursor-pointer" onClick={() => {window.scrollTo({ top: 0, behavior: 'smooth' })}}><ArrowUp /></motion.div>
      
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-1000 px-6 md:px-12 py-6 flex items-center justify-between",
        scrolled ? "bg-atlas-bg/95 backdrop-blur-2xl py-4 border-b border-atlas-ink/5 shadow-sm" : "bg-transparent"
      )}>
        {/* Left Side */}
        <div className="flex items-center gap-4 xl:gap-8 flex-1 justify-start">
          <div className="flex items-center gap-4 xl:gap-6">
            <LiveTime className={cn(
              "transition-colors duration-500",
              scrolled ? "text-atlas-ink/60" : "text-white drop-shadow-sm"
            )} />
            <div className={cn(
              "hidden sm:flex gap-2 xl:gap-4 font-sans text-[10px] tracking-widest uppercase transition-colors duration-500",
              scrolled ? "text-atlas-ink/60" : "text-white drop-shadow-sm"
            )}>
              <button className="hover:text-atlas-red transition-colors">RU</button>
              <span className="opacity-20">|</span>
              <button className="hover:text-atlas-red transition-colors">EN</button>
            </div>
          </div>
        </div>

        {/* Center Logo */}
        <div className="flex justify-center flex-shrink-0 px-4">
          <Image src="/hotel-logo-notxt.png" alt="Atlas Logo" width={120} height={56} className={cn(
            "h-10 md:h-14 w-auto object-contain transition-all duration-700",
            !scrolled && "brightness-0 invert drop-shadow-md",
            scrolled && "scale-90"
          )} priority />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 md:gap-8 flex-1 justify-end">
          <button 
            onClick={() => {
              setIsBookingOpen(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={cn(
              "hidden sm:block px-6 md:px-8 py-3 font-sans text-[10px] tracking-[0.2em] uppercase transition-all duration-700 shadow-lg whitespace-nowrap",
              scrolled ? "bg-atlas-ink text-atlas-bg hover:bg-atlas-red" : "bg-white text-atlas-ink hover:bg-atlas-red hover:text-white"
            )}
          >
            Забронировать
          </button>
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className={cn(
              "flex items-center gap-3 p-2 transition-all group",
              scrolled ? "text-atlas-ink hover:text-atlas-red" : "text-white hover:text-atlas-red drop-shadow-sm"
            )}
          >
            <span className="hidden md:block font-sans text-[10px] tracking-[0.3em] uppercase opacity-80 group-hover:opacity-100">Меню</span>
            <Menu size={24} strokeWidth={1} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-atlas-bg flex flex-col p-12"
          >
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 p-2">
              <X size={32} strokeWidth={1} />
            </button>
            <nav className="mt-24 space-y-8">
              {['О нас', 'Номера', 'Инфраструктура', 'Мероприятия', 'Новости', 'Контакты'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item}`} 
                  onClick={() => setIsMenuOpen(false)}
                  className="block font-serif text-4xl sm:text-5xl hover:italic hover:pl-4 transition-all duration-500 break-words"
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="mt-auto pt-12 border-t border-atlas-ink/10">
              <p className="font-sans text-[10px] tracking-widest uppercase opacity-40 mb-4">Связаться с нами</p>
              <p className="font-serif text-2xl">+7 (856) 338-20-20</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <video 
            src="/hotel-hero.webm" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="object-cover w-full h-full brightness-[0.65]"
          />
        </motion.div>
        <div className="relative z-10 text-center text-white px-6">
          <FloatingElement>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              className="font-sans text-[10px] sm:text-[12px] md:text-[16px] tracking-[0.3em] sm:tracking-[0.6em] md:tracking-[0.8em] uppercase font-light drop-shadow-xl max-w-full px-4 break-words"
            >
              Искусство тихой роскоши
            </motion.div>
          </FloatingElement>
        </div>

        {/* Booking Bar */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 z-20 flex justify-center">
          <FloatingElement delay={0.5}>
            <AnimatePresence mode="wait">
              {!isBookingOpen ? (
                <motion.button 
                  key="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  onClick={() => setIsBookingOpen(true)}
                  className="bg-white/10 backdrop-blur-2xl border border-white/20 text-white px-6 sm:px-12 py-5 rounded-full font-sans text-[10px] tracking-[0.2em] uppercase hover:bg-white hover:text-atlas-ink transition-all duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
                >
                  Забронировать номер
                </motion.button>
              ) : (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white/10 backdrop-blur-2xl p-6 md:p-12 flex flex-col lg:flex-row items-stretch lg:items-end gap-6 md:gap-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/20 rounded-2xl overflow-hidden relative group w-full max-w-5xl mx-auto"
                >
                  <button 
                    onClick={() => setIsBookingOpen(false)}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-20"
                  >
                    <X size={24} />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full relative z-10">
                    <div className="space-y-3 group/input cursor-pointer p-4 -m-4 rounded-xl hover:bg-white/5 transition-colors">
                      <label className="font-sans text-[9px] md:text-[10px] tracking-widest uppercase text-white/60 group-hover/input:text-white/80 transition-colors">Заезд — Выезд</label>
                      <div className="flex items-center justify-between border-b border-white/20 pb-2 group-hover/input:border-atlas-red transition-colors text-white">
                        <span className="font-serif text-lg md:text-xl">12 Мар — 15 Мар</span>
                        <Calendar size={16} strokeWidth={1} className="text-atlas-red group-hover/input:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="space-y-3 group/input cursor-pointer p-4 -m-4 rounded-xl hover:bg-white/5 transition-colors">
                      <label className="font-sans text-[9px] md:text-[10px] tracking-widest uppercase text-white/60 group-hover/input:text-white/80 transition-colors">Гости</label>
                      <div className="flex items-center justify-between border-b border-white/20 pb-2 group-hover/input:border-atlas-red transition-colors text-white">
                        <span className="font-serif text-lg md:text-xl">2 Взрослых</span>
                        <Users size={16} strokeWidth={1} className="text-atlas-red group-hover/input:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-end gap-4">
                      <button 
                        disabled={!fzConsent}
                        className="w-full bg-white text-atlas-ink py-4 font-sans text-[9px] md:text-[10px] tracking-[0.2em] uppercase hover:bg-atlas-red hover:text-white transition-all duration-500 shadow-xl active:scale-[0.98] rounded-sm disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-atlas-ink disabled:cursor-not-allowed"
                      >
                        Найти номер
                      </button>
                    </div>
                  </div>
                  <div className="lg:w-64 flex items-start gap-3 text-[8px] md:text-[9px] leading-relaxed text-white/60 uppercase tracking-wider relative z-10 mt-4 lg:mt-0">
                    <button 
                      onClick={() => setFzConsent(!fzConsent)}
                      className={cn(
                        "w-4 h-4 shrink-0 rounded-sm border flex items-center justify-center transition-colors mt-0.5",
                        fzConsent ? "bg-atlas-red border-atlas-red" : "border-white/40 hover:border-white/80"
                      )}
                    >
                      {fzConsent && <Check size={12} className="text-white" />}
                    </button>
                    <span className="text-left">
                      Я даю согласие на обработку персональных данных в соответствии с <a href="#" className="underline hover:text-atlas-red transition-colors">ФЗ-152</a>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </FloatingElement>
        </div>
      </section>

      {/* About Section */}
      <section id="О нас" className="py-[100px] md:py-[150px] px-6 md:px-12 bg-atlas-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 lg:gap-8 items-center parallax-container">
          <div className="lg:col-span-5 relative">
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 origin-center hidden lg:block z-10">
              <span className="font-sans text-[10px] tracking-[0.4em] uppercase opacity-40 whitespace-nowrap">Искусство гостеприимства</span>
            </div>
            <div className="relative aspect-[3/4] overflow-hidden shadow-2xl rounded-2xl">
              <Image 
                src="/heritage.jpg" 
                alt="Heritage"
                fill
                className="object-cover parallax-img scale-110 origin-top"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-white p-8 shadow-xl rounded-xl hidden md:block reveal-text z-20">
              <p className="font-serif text-6xl text-atlas-red leading-none mb-2">10+</p>
              <p className="font-sans text-[10px] tracking-widest uppercase opacity-60">Лет безупречного<br/>сервиса</p>
            </div>
          </div>
          
          <div className="lg:col-span-6 lg:col-start-7 space-y-12">
            <FadeIn>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl leading-tight relative break-words">
                <span className="absolute -top-16 -left-8 text-[120px] font-serif text-atlas-ink/5 select-none z-0 hidden md:block">2013</span>
                <span className="relative z-10">Наследие <br /> <i className="font-light text-atlas-red">гостеприимства</i></span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1} className="font-sans text-sm md:text-base leading-relaxed text-atlas-ink/80 space-y-6">
              <p>
                Атлас Донецк – отель, который соответствует всем международным стандартам и предлагающий полный набор услуг для полноценного отдыха и эффективной работы: 164 комфортабельных номера, рестораны, в том числе открытая терраса, лаунж бар, спа и фитнес комплекс с бассейном, салон красоты, комната переговоров, конференц и банкетные залы.
              </p>
              <p>
                Отель находится на живописной набережной р. Кальмиус, в центральной части города, вблизи от стадиона &quot;Донбасс Арена&quot;, ледовой арены &quot;Дружба&quot;, офисов крупнейших компаний Донецка, а также развитой сети городского транспорта. Не все отели Донецка имеют такое удобное расположение как Атлас, которое идеально подходит для отдыха и деловых встреч.
              </p>
              <p>
                Наши номера оборудованы согласно всем современным требованиям. Выдержанные тона интерьера, комфортабельная кровать, удобное рабочее место, бесплатный Wi-Fi, превосходный душ обеспечат Вам максимально комфортное проживание в Донецке.
              </p>
            </FadeIn>
            <FadeIn delay={0.2} className="flex flex-wrap gap-8 md:gap-12 pt-8 border-t border-atlas-ink/10">
              <div>
                <p className="font-serif text-3xl md:text-4xl mb-1">164</p>
                <p className="font-sans text-[9px] md:text-[10px] tracking-widest uppercase opacity-40">Номера</p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl mb-1">4*</p>
                <p className="font-sans text-[9px] md:text-[10px] tracking-widest uppercase opacity-40">Звезды</p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl mb-1">2013</p>
                <p className="font-sans text-[9px] md:text-[10px] tracking-widest uppercase opacity-40">Год открытия</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Infrastructure Grid */}
      <section id="Инфраструктура" className="bg-atlas-ink text-atlas-bg py-[100px] md:py-[150px] px-6 md:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <FadeIn className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <h2 className="font-serif text-4xl sm:text-6xl md:text-8xl break-words">Мир <i className="font-light">Атласа</i></h2>
            <p className="font-sans text-[10px] tracking-widest sm:tracking-[0.3em] uppercase opacity-40 max-w-xs text-left md:text-right">
              Единый комплекс для отдыха, работы и вдохновения в самом сердце города.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* SPA */}
            <FadeIn delay={0.1} className="md:col-span-7 group relative aspect-video overflow-hidden cursor-pointer">
              <Image 
                src="/fitness.jpg" 
                alt="SPA"
                
                fill
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-atlas-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between z-10" onClick={() => setInfraModal({                  
                  name: 'Фитнес и spa',
                  details: (
                    <div>
                      <p className="mb-3">Атлас Фитнес и Спа - трехэтажный фитнес и спа комплекс класса «люкс» в центре Донецка, в котором сочетаются качество, современные технологии и необыкновенный комфорт.</p>
                      <p className="mb-3">Комплекс предлагает Вам воспользоваться полным набором услуг для поддержания здоровья и красоты. Atlas Fitness&Spa отличает уютная, расслабляющая атмосфера и непревзойденный комфорт. К Вашим услугам плавательный бассейн, тренажерный зал, зал единоборств, массажные кабинеты. Великолепный интерьер, лучшее оборудование и европейский сервис позволят Вам и Вашим близким в полной мере отдохнуть от городской суеты и окунутся в мир гармонии и здоровья.</p>
                      <hr className="text-gray-200 mb-4" />
                      <div className="flex justify-between gap-4">
                        <Image src='/bas.jpg' alt='Бассейн' height={150} width={230} className="relative" />
                        <div className="flex flex-col flex-1">
                          <h4 className="text-atlas-red">Первый этаж</h4>
                          <p>На первом этаже нашего комплекса расположена аква-зона, где кроме, великолепного бассейна Вас ждет классическая римская парная, бутик Atlas Home&Spa с товарами от всемирно известных брендов и уютный фреш-бар с фитнес-коктейлями. Для самых маленьких мы с удовольствием предложим развивающую детскую комнату. Atlas Fitness&Spa - это увлекательный и здоровый семейный досуг.</p>
                        </div>
                      </div>
                      <hr className="text-gray-200 mb-4 mt-4" />
                      
                      <div className="flex justify-between gap-4">
                        <Image src='/fitness.jpg' alt='Бассейн' height={150} width={230} className="relative" />
                        <div className="flex flex-col flex-1">
                          <h4 className="text-atlas-red">Второй этаж</h4>
                          <p>Второй этаж комплекса Atlas Fitness&Spa представляет для Вас возможность воспользоваться просторным тренажерным залом, оборудованным современными силовыми и кардио-тренажерами, залом единоборств и кабинетом фитнес-диагностики. В зале единоборств Вы сможете посетить увлекательные тренировки по айкидо, джиу-джитсу и боксу. Уникальный прибор TANITA в кабинете фитнес-диагностики поможет Вам определить состояние своего здоровья.</p>
                        </div>
                      </div>
                      <hr className="text-gray-200 mb-4 mt-4" />

                       <div className="flex justify-between gap-4">
                        <Image src='/13.jpg' alt='Бассейн' height={150} width={230} className="relative" />
                        <div className="flex flex-col flex-1">
                          <h4 className="text-atlas-red">Третий этаж</h4>
                          <p>Зона красоты и релаксации, расположенная на третьем этаже комплекса. Предлагает Вам целый комплекс услуг массажных кабинетов. Здесь для Вас представлены эксклюзивные спа-дуэты для парных процедур, единственный в Донецке коллагенарий - аппарат для омоложения кожи лица и тела, залы аэробики и пилатес, банный комплекс и студия красоты. Специально разработанные эффективные индивидуальные программы оздоровления и омоложения организма помогут Вам получить незабываемое удовольствие от посещения зоны красоты и здоровья.</p>
                        </div>
                      </div>
                      <hr className="text-gray-200 mb-4 mt-4" />

                    </div>
                  )
                })}>
                <div className="bg-atlas-ink/40 backdrop-blur-md p-4 w-fit rounded-sm border border-white/10">
                  <Image src="/fitness-logo.png" alt="SPA Logo" width={100} height={48} className="h-10 md:h-12 w-auto object-contain brightness-0 invert" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-serif text-3xl md:text-4xl mb-4">Atlas Fitness & SPA</h3>
                    <p className="font-sans text-[9px] md:text-[10px] tracking-widest uppercase opacity-60 max-w-sm">
                      Тренажерный зал, бассейн, римская парная и эксклюзивные СПА-ритуалы.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 bg-white/5 backdrop-blur-sm">
                    <ArrowRight size={20} className="text-white" onClick={() => setInfraModal({                  
                  name: 'spa',
                  details: (
                    <div>
                      <p className="mb-3">Атлас Фитнес и Спа - трехэтажный фитнес и спа комплекс класса «люкс» в центре Донецка, в котором сочетаются качество, современные технологии и необыкновенный комфорт.</p>
                      <p className="mb-3">Комплекс предлагает Вам воспользоваться полным набором услуг для поддержания здоровья и красоты. Atlas Fitness&Spa отличает уютная, расслабляющая атмосфера и непревзойденный комфорт. К Вашим услугам плавательный бассейн, тренажерный зал, зал единоборств, массажные кабинеты. Великолепный интерьер, лучшее оборудование и европейский сервис позволят Вам и Вашим близким в полной мере отдохнуть от городской суеты и окунутся в мир гармонии и здоровья.</p>
                      <hr className="text-gray-200 mb-4" />
                      <div className="flex justify-between gap-4">
                        <Image src='/bas.jpg' alt='Бассейн' height={150} width={230} className="relative" />
                        <div className="flex flex-col flex-1">
                          <h4 className="text-atlas-red">Первый этаж</h4>
                          <p>На первом этаже нашего комплекса расположена аква-зона, где кроме, великолепного бассейна Вас ждет классическая римская парная, бутик Atlas Home&Spa с товарами от всемирно известных брендов и уютный фреш-бар с фитнес-коктейлями. Для самых маленьких мы с удовольствием предложим развивающую детскую комнату. Atlas Fitness&Spa - это увлекательный и здоровый семейный досуг.</p>
                        </div>
                      </div>
                      <hr className="text-gray-200 mb-4 mt-4" />
                      
                      <div className="flex justify-between gap-4">
                        <Image src='/fitness.jpg' alt='Бассейн' height={150} width={230} className="relative" />
                        <div className="flex flex-col flex-1">
                          <h4 className="text-atlas-red">Второй этаж</h4>
                          <p>Второй этаж комплекса Atlas Fitness&Spa представляет для Вас возможность воспользоваться просторным тренажерным залом, оборудованным современными силовыми и кардио-тренажерами, залом единоборств и кабинетом фитнес-диагностики. В зале единоборств Вы сможете посетить увлекательные тренировки по айкидо, джиу-джитсу и боксу. Уникальный прибор TANITA в кабинете фитнес-диагностики поможет Вам определить состояние своего здоровья.</p>
                        </div>
                      </div>
                      <hr className="text-gray-200 mb-4 mt-4" />

                       <div className="flex justify-between gap-4">
                        <Image src='/13.jpg' alt='Бассейн' height={150} width={230} className="relative" />
                        <div className="flex flex-col flex-1">
                          <h4 className="text-atlas-red">Третий этаж</h4>
                          <p>Зона красоты и релаксации, расположенная на третьем этаже комплекса. Предлагает Вам целый комплекс услуг массажных кабинетов. Здесь для Вас представлены эксклюзивные спа-дуэты для парных процедур, единственный в Донецке коллагенарий - аппарат для омоложения кожи лица и тела, залы аэробики и пилатес, банный комплекс и студия красоты. Специально разработанные эффективные индивидуальные программы оздоровления и омоложения организма помогут Вам получить незабываемое удовольствие от посещения зоны красоты и здоровья.</p>
                        </div>
                      </div>
                      <hr className="text-gray-200 mb-4 mt-4" />

                    </div>
                  )
                })} />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Restaurant */}
            <FadeIn delay={0.2} className="md:col-span-5 group relative aspect-[4/5] overflow-hidden cursor-pointer">
              <Image 
                src="/restaurant.jpg" 
                alt="Restaurant"
                fill
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-atlas-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between z-10" onClick={() => setInfraModal({
                name: 'Ресторан Атлас',
                  details: (
                    <div>
                      <p className="mb-3">Ресторанный комплекс «Атлас» в Донецке - это прекрасная возможность провести деловые переговоры, приятно совмещая их с вкусным обедом, а после работы отлично провести вечер и забыть о будничной городской суете.</p>
                      <hr className="text-gray-200 mb-4" />
                      <div className="flex justify-between gap-4">
                        <Image src='/restaurant.jpg' alt='Бассейн' height={150} width={230} className="relative max-h-[150px]" />
                        <div className="flex flex-col flex-1">
                          <h4 className="text-atlas-red">«Ресторан Атлас»</h4>
                          <p className="mb-5">Насладитесь легкой и непринужденной атмосферой двух залов ресторана, а также оригинальным интерьером банкетной комнаты «Библиотека». Отведайте европейскую и турецкую кухни. Порадуйте себя отличной винной картой, разнообразием коктейлей. Добро пожаловать в ресторан «Атлас»!</p>
                          <b className="mb-5">Кухня разных стран, отличная винная карта, располагающая атмосфера.</b>
                          <p className="mb-5">Каждое утро ресторан «Атлас» сервирует вкусные и разнообразные завтраки для своих гостей: ароматный кофе и чай, горячие блюда, свежие фрукты и овощи, каши, а также выпечка и кондитерские изделия собственного приготовления. Гостям подается два вида завтрака: завтрак «Шведский стол» и «Континентальный».</p>
                          <p className="mb-5"><b>«Континентальный» завтрак</b>  -  классический европейский завтрак, который включает блюдо из яиц, бекон, ветчину или сосиски, гарниры на выбор, сыр, тосты, соки, а также чай или кофе.</p>
                          <p className="mb-5"><b>Завтрак «Шведский стол»</b>состоит из широкого выбора блюд и напитков: свежие фрукты и овощи, сырное ассорти и мясная гастрономия, сезонные салаты, творог, йогурты, блюда из яиц на Ваш выбор, приготовленные тут же на горячей станции, горячие овощные, рыбные и мясные блюда, свежая выпечка и фирменные  кондитерские изделия, различные виды кофе и чая.
                            Для детей до 7 лет – завтрак бесплатный, с 7-го летнего возраста стоимость завтрака оплачивается в полном размере. </p>
                          <p className="mb-5">Хороший завтрак – залог успешного дня!<br/>
Приятного аппетита!</p>
                        </div>
                      </div>
                      <hr className="text-gray-200 mb-4 mt-4" />
                      
                    </div>
                  )
              })}>
                <div className="bg-atlas-ink/40 backdrop-blur-md p-4 w-fit rounded-sm border border-white/10">
                  <Image src="/restaurant-logo.png" alt="Restaurant Logo" width={100} height={48} className="h-10 md:h-12 w-auto object-contain brightness-0 invert" />
                </div>
                <div className="flex justify-between items-end">
                  <h3 className="font-serif text-3xl md:text-4xl">Ресторан Атлас</h3>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 bg-white/5 backdrop-blur-sm">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Terrace */}
            <FadeIn delay={0.3} className="md:col-span-5 group relative aspect-[4/5] overflow-hidden cursor-pointer">
              <Image 
                src="/terrace.jpg" 
                alt="Terrace"
                fill
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-atlas-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between z-10" onClick={() => setInfraModal({
                name: 'Атлас Терраса',
                  details: (
                    <div>
                      <p className="mb-0"></p>
                      <hr className="text-gray-200 mb-4" />
                       <div className="flex justify-between gap-4">
                        <Image src='/terrace.jpg' alt='Бассейн' height={150} width={230} className="relative max-h-[150px]" />
                        <div className="flex flex-col flex-1">
                          <h4 className="text-atlas-red">«Атлас Терраса»</h4>
                          <p className="mb-5">Мы приглашаем Вас в новый ресторан, расположенный на третьем этаже гостиницы. Здесь Вы можете попробовать новое меню, особенностью которого являются блюда, приготовленные в испанской печи «Хоспер» (Josper). В ней мясо, рыба и овощи готовятся на древесном угле, без добавления жиров и масла, что позволяет сохранить полезные свойства и витамины продуктов, а блюда имеют аппетитный аромат барбекю. Мы также предлагаем Вам отведать такие виды рыб, которые сложно найти в других ресторанах Донецка. Добро пожаловать и приятного Вам аппетита!</p>
                          <b>Ароматные блюда из печи «Хоспер» и прекрасное обслуживание.</b>
                        </div>
                      </div>
                      <hr className="text-gray-200 mb-4 mt-4" />

                    </div>
                  )
              })}>
                <div className="bg-atlas-ink/40 backdrop-blur-md p-4 w-fit rounded-sm border border-white/10">
                  <Image src="/terrace.png" alt="Terrace Logo" width={100} height={48} className="h-10 md:h-12 w-auto object-contain brightness-0 invert" />
                </div>
                <div className="flex justify-between items-end">
                  <h3 className="font-serif text-3xl md:text-4xl">Летняя Терраса</h3>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 bg-white/5 backdrop-blur-sm">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Pierrot */}
            <FadeIn delay={0.4} className="md:col-span-7 group relative aspect-video overflow-hidden cursor-pointer">
              <Image 
                src="/pierrot.jpg" 
                alt="Lobby Bar"
                fill
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-atlas-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between z-10"  onClick={() => setInfraModal({
                name: 'Лаунж бар «Пьеро»',
                  details: (
                    <div>
                      <p className="mb-0"></p>
                      <hr className="text-gray-200 mb-4" />

                      <div className="flex justify-between gap-4">
                        <Image src='/pierrot.jpg' alt='Бассейн' height={150} width={230} className="relative max-h-[150px]" />
                        <div className="flex flex-col flex-1">
                          <h4 className="text-atlas-red">Лаунж бар «Пьеро»</h4>
                          <p className="mb-5">Стильный, современный бар с отличным меню и безупречным обслуживанием. Вашему вниманию предлагаются закуски, восхитительные десерты, разнообразные крепкие и безалкогольные напитки, коктейли; обширная кофейная и чайная карты. Вечерами под аккомпанемент диджейских сэтов и лаунж-музыки можно расслабиться и даже потанцевать. Желаем Вам отличного настроения!</p>
                          <b>Стиль, зажигательная музыка и коктейли – все для Вашего настроения.</b>
                        </div>
                      </div>
                      <hr className="text-gray-200 mb-4 mt-4" />
                    </div>
                  )
              })}>
                <div className="bg-atlas-ink/40 backdrop-blur-md p-4 w-fit rounded-sm border border-white/10">
                  <Image src="/pierrot.png" alt="Pierrot Logo" width={100} height={48} className="h-10 md:h-12 w-auto object-contain brightness-0 invert" />
                </div>
                <div className="flex justify-between items-end">
                  <h3 className="font-serif text-3xl md:text-4xl">Лобби-бар Pierrot</h3>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 bg-white/5 backdrop-blur-sm">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="Номера" className="py-[100px] md:py-[150px] bg-atlas-bg px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-16 md:mb-24">
            <h2 className="font-serif text-4xl sm:text-6xl md:text-8xl mb-8 break-words">Ваш <br /> <i className="font-light">покой</i></h2>
            <p className="font-sans text-[10px] tracking-widest sm:tracking-[0.3em] uppercase opacity-40 max-w-xs">
              Коллекция из 164 номеров, созданных для безупречного отдыха.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {rooms.map((room, idx) => (
              <FadeIn key={idx} delay={idx * 0.1}>
                <RoomCard 
                  room={room} 
                  onOpenModal={setActiveModal} 
                  onBook={() => {
                    setIsBookingOpen(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Events & Weddings */}
      <section id="Мероприятия" className="py-[100px] md:py-[150px]">
        <div className="relative w-full h-[40vh] md:h-[60vh] mb-16 md:mb-24 overflow-hidden">
          <Image 
            src="/events.jpg" 
            alt="Events Banner"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "";
            }}
          />
          <div className="absolute inset-0 bg-atlas-ink/40 flex items-center justify-center">
            <h2 className="font-serif text-4xl sm:text-6xl md:text-9xl text-white tracking-tighter break-words text-center px-4">События</h2>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-24 mb-32">
            <FadeIn className="space-y-8 max-w-3xl">
              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight break-words">Пространство для <br /> <i className="font-light">важных решений</i></h3>
              <p className="font-sans text-xs md:text-sm leading-loose text-atlas-ink/60">
                Мы предлагаем конференц-залы, комнаты переговоров и залы &quot;Классик&quot; и &quot;Модерн&quot;. Идеальная акустика, современное оборудование и безупречный кейтеринг от шеф-повара.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-[9px] md:text-[10px] tracking-widest uppercase">
                <li className="flex items-center gap-2"><ChevronRight size={12} className="text-atlas-red" /> Зал &quot;Классик&quot;</li>
                <li className="flex items-center gap-2"><ChevronRight size={12} className="text-atlas-red" /> Зал &quot;Модерн&quot;</li>
                <li className="flex items-center gap-2"><ChevronRight size={12} className="text-atlas-red" /> Банкетный зал</li>
                <li className="flex items-center gap-2"><ChevronRight size={12} className="text-atlas-red" /> Переговорные</li>
              </ul>
            </FadeIn>
            <FadeIn className="space-y-8">
              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight break-words">Пакеты для <br /> <i className="font-light">молодоженов</i></h3>
              <p className="font-sans text-xs md:text-sm leading-loose text-atlas-ink/60 max-w-3xl">
                Свадебные пакеты в отеле Атлас.<br/><br/>
                Незабываемым завершением свадебного торжества станет романтический вечер, проведенный в уютном номере отеля Атлас.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 sm:p-8 border border-atlas-ink/10 hover:border-atlas-red hover:shadow-2xl transition-all duration-500 group bg-white hover:-translate-y-2">
                  <p className="font-sans text-[9px] md:text-[10px] tracking-widest uppercase opacity-40 mb-4 group-hover:text-atlas-red group-hover:opacity-100 transition-colors">Свадебный пакет &quot;Полулюкс&quot;</p>
                  <p className="font-serif text-3xl mb-4">12 000 ₽</p>
                  <ul className="text-[11px] opacity-60 mb-6 leading-relaxed space-y-2 list-disc pl-4">
                    <li>Украшение номера категории &quot;Полулюкс&quot; свадебными аксессуарами;</li>
                    <li>Бесплатный ранний заезд (по предварительному согласованию);</li>
                    <li>Сертификат на проживание со скидкой 50% в годовщину свадьбы;</li>
                    <li>Бесплатный поздний выезд (по предварительному согласованию);</li>
                    <li>Посещение тренажерного зала, бассейна и римской парной;</li>
                    <li>Комплимент от отеля: пирожные &quot;Шу&quot;, шампанское и фрукты;</li>
                    <li>Единоразовая скидка 20% на ужин в ресторане, сертификат на 3 месяца;</li>
                    <li>Единоразовая 20% скидка на процедуры в СПА (сертификат на 3 месяц).</li>
                  </ul>
                  <button 
                    onClick={() => {
                      setIsBookingOpen(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[9px] md:text-[10px] tracking-widest uppercase border-b border-atlas-ink/20 pb-1 group-hover:border-atlas-red group-hover:text-atlas-red transition-colors"
                  >
                    Выбрать
                  </button>
                </div>
                <div className="p-6 sm:p-8 border border-atlas-ink/10 hover:border-atlas-red hover:shadow-2xl transition-all duration-500 group bg-white hover:-translate-y-2">
                  <p className="font-sans text-[9px] md:text-[10px] tracking-widest uppercase opacity-40 mb-4 group-hover:text-atlas-red group-hover:opacity-100 transition-colors">Свадебный пакет &quot;Люкс&quot;</p>
                  <p className="font-serif text-3xl mb-4">18 000 ₽</p>
                  <ul className="text-[11px] opacity-60 mb-6 leading-relaxed space-y-2 list-disc pl-4">
                    <li>Украшение номера категории &quot;Люкс&quot; свадебными аксессуарами;</li>
                    <li>Бесплатный ранний заезд (по предварительному согласованию);</li>
                    <li>Сертификат на проживание со скидкой 50% в годовщину свадьбы;</li>
                    <li>Бесплатный поздний выезд (по предварительному согласованию);</li>
                    <li>Посещение тренажерного зала, бассейна и римской парной;</li>
                    <li>Единоразовая 20% скидка на процедуры в СПА (сертификат на 3 месяц);</li>
                    <li>Комплимент от отеля: пирожные &quot;Шу&quot;, фрукты, шампанское;</li>
                    <li>Единоразовая скидка 20% на ужин в ресторане, сертификат на 3 месяца.</li>
                  </ul>
                  <button 
                    onClick={() => {
                      setIsBookingOpen(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[9px] md:text-[10px] tracking-widest uppercase border-b border-atlas-ink/20 pb-1 group-hover:border-atlas-red group-hover:text-atlas-red transition-colors"
                  >
                    Выбрать
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Journal / News */}
      <section id="Новости" className="py-[100px] md:py-[150px] bg-[#F0EFEA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight break-words">Журнал <i className="font-light">Атлас</i></h2>
            <a href="#" className="font-sans text-[10px] tracking-widest uppercase border-b border-atlas-ink pb-1 hover:text-atlas-red hover:border-atlas-red transition-all">Все новости</a>
          </div>
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 lg:gap-12">
            {[
              {
                date: '12.03.2026',
                title: 'Весеннее обновление меню в ресторане Атлас',
                image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800'
              },
              {
                date: '05.03.2026',
                title: 'Новые СПА-ритуалы для восстановления сил',
                image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800'
              },
              {
                date: '28.02.2026',
                title: 'Искусство сервировки: мастер-класс от шефа',
                image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800'
              }
            ].map((news, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[4/3] overflow-hidden mb-6 shadow-lg rounded-xl">
                  <Image 
                    src={news.image} 
                    alt={news.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const fallbacks = [
                        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800",
                        "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800",
                        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800"
                      ];
                      target.src = fallbacks[i % 3];
                    }}
                  />
                  <div className="absolute inset-0 bg-atlas-ink/0 group-hover:bg-atlas-ink/20 transition-colors duration-500" />
                </div>
                <p className="font-sans text-[9px] md:text-[10px] tracking-widest uppercase opacity-40 mb-3 group-hover:text-atlas-red transition-colors">{news.date}</p>
                <h3 className="font-serif text-xl md:text-2xl mb-4 leading-snug group-hover:text-atlas-red transition-colors">{news.title}</h3>
                <button className="flex items-center gap-2 font-sans text-[9px] md:text-[10px] tracking-widest uppercase group-hover:gap-4 transition-all text-atlas-ink/60 group-hover:text-atlas-red">
                  Читать полностью <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location / Map */}
      <section id="Контакты" className="py-[100px] md:py-[150px] bg-atlas-ink text-white overflow-hidden relative map-section">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,_rgba(180,30,30,0.15)_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_80%,_rgba(255,255,255,0.05)_0%,_transparent_50%)] pointer-events-none" />
        
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <div className="lg:col-span-5 relative z-10">
              <FloatingElement delay={0.2}>
                <span className="font-sans text-[10px] tracking-widest sm:tracking-[0.4em] uppercase opacity-40 mb-8 block reveal-text">Местоположение</span>
                <h2 className="font-serif text-4xl sm:text-6xl md:text-8xl mb-16 leading-tight reveal-text break-words">Сердце <br /> <i className="font-light text-atlas-red">Донецка</i></h2>
              </FloatingElement>
              
              <div className="space-y-12 reveal-text">
                <div className="group cursor-pointer border-b border-white/10 pb-8">
                  <p className="font-sans text-[9px] tracking-widest uppercase opacity-40 mb-3 group-hover:text-atlas-red transition-colors flex items-center gap-2">
                    <MapPin size={10} /> Адрес
                  </p>
                  <p className="font-serif text-2xl md:text-3xl leading-snug group-hover:pl-4 transition-all duration-500">бульвар Шевченко, 20 <br /> Донецк, 283015</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="group cursor-pointer">
                    <p className="font-sans text-[9px] tracking-widest uppercase opacity-40 mb-3 group-hover:text-atlas-red transition-colors flex items-center gap-2">
                      <Phone size={10} /> Бронирование
                    </p>
                    <div className="space-y-1 group-hover:pl-2 transition-all duration-500">
                      <p className="font-serif text-xl">+7 (856) 338-20-20</p>
                      <p className="font-serif text-xl opacity-60">+7 (949) 338-20-20</p>
                    </div>
                  </div>
                  <div className="group cursor-pointer">
                    <p className="font-sans text-[9px] tracking-widest uppercase opacity-40 mb-3 group-hover:text-atlas-red transition-colors flex items-center gap-2">
                      <Mail size={10} /> Электронная почта
                    </p>
                    <div className="space-y-1 group-hover:pl-2 transition-all duration-500">
                      <p className="font-serif text-xl">info@atlas-donetsk.ru</p>
                      <p className="font-serif text-xl opacity-60">sales@atlas-donetsk.ru</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8">
                  <a 
                    href="https://yandex.ru/maps/org/atlas/1128330768" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between font-sans text-[10px] tracking-[0.2em] uppercase border border-white/20 px-6 sm:px-8 py-5 hover:bg-white hover:text-atlas-ink transition-all duration-500 w-full sm:w-auto sm:min-w-[280px]"
                  >
                    <span>Проложить маршрут</span>
                    <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 relative aspect-[4/3] lg:aspect-auto lg:h-[800px] map-container">
              <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl group">
                <div className="absolute inset-0 bg-atlas-ink/20 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none" />
                <iframe 
                  src="https://yandex.ru/map-widget/v1/?ll=37.818048%2C48.006904&mode=search&oid=1128330768&ol=biz&z=16.63" 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  className="absolute inset-0 w-full h-full grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-atlas-red text-white py-[80px] md:py-[100px] px-6 md:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="md:col-span-1">
              <Image src="/logos.png" alt="Atlas Logo" width={160} height={48} className="h-12 w-auto mb-8 brightness-0 invert" />
              <p className="font-sans text-xs leading-loose opacity-60 max-w-xs">
                Премиальный гостинично-ресторанный комплекс в самом сердце Донецка. Искусство гостеприимства с 2013 года.
              </p>
            </div>
            <div>
              <h4 className="font-sans text-[10px] tracking-widest sm:tracking-[0.3em] uppercase mb-8 opacity-60">Навигация</h4>
              <ul className="space-y-4 font-serif text-xl">
                <li><a href="#О нас" className="hover:italic transition-all">О нас</a></li>
                <li><a href="#Номера" className="hover:italic transition-all">Номера</a></li>
                <li><a href="#Инфраструктура" className="hover:italic transition-all">Инфраструктура</a></li>
                <li><a href="#Мероприятия" className="hover:italic transition-all">Мероприятия</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-[10px] tracking-widest sm:tracking-[0.3em] uppercase mb-8 opacity-60">Подписка</h4>
              <p className="text-xs opacity-60 mb-6">Будьте в курсе эксклюзивных предложений и новостей Атласа.</p>
              <form className="flex border-b border-white/20 pb-2 group">
                <input 
                  type="email" 
                  placeholder="Ваш Email" 
                  className="bg-transparent flex-1 font-sans text-xs outline-none placeholder:text-white/40"
                />
                <button type="submit" disabled={!footerFzConsent} className="group-hover:translate-x-1 transition-transform disabled:opacity-50 disabled:group-hover:translate-x-0"><ArrowRight size={16} /></button>
              </form>
              <div className="flex items-start gap-2 mt-4 text-[9px] opacity-60 uppercase tracking-wider">
                <button 
                  onClick={() => setFooterFzConsent(!footerFzConsent)}
                  className={cn(
                    "w-3 h-3 shrink-0 rounded-sm border flex items-center justify-center transition-colors mt-0.5",
                    footerFzConsent ? "bg-white border-white" : "border-white/40 hover:border-white/80"
                  )}
                >
                  {footerFzConsent && <Check size={8} className="text-atlas-red" />}
                </button>
                <span className="text-left">
                  Согласен с <a href="#" className="underline hover:text-white transition-colors">ФЗ-152</a>
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-sans text-[10px] tracking-widest sm:tracking-[0.3em] uppercase mb-8 opacity-60">Соцсети</h4>
              <div className="flex gap-6">
                <a href="#" className="hover:scale-110 transition-transform opacity-80 hover:opacity-100"><Instagram size={20} /></a>
                <a href="#" className="hover:scale-110 transition-transform opacity-80 hover:opacity-100"><Facebook size={20} /></a>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex flex-col lg:flex-row justify-between gap-8 font-sans text-[10px] tracking-widest uppercase opacity-40">
            <div className="flex flex-col gap-3">
              <p>© 2026 ООО &quot;Атлас Донбасса&quot;. Все права защищены.</p>
              <p className="normal-case tracking-normal text-xs opacity-80">Юридический адрес: РФ, ДНР, г. Донецк, б-р Шевченко, д. 20</p>
            </div>
            <div className="flex flex-col lg:items-end gap-3">
              <a href="#" className="hover:text-white transition-colors">Политика обработки персональных данных</a>
              <a href="#" className="hover:text-white transition-colors">Пользовательское соглашение</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <AnimatePresence>
        {!cookieAccepted && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-12 md:w-[400px] z-[100] bg-atlas-bg p-6 sm:p-8 shadow-2xl border border-atlas-ink/5"
          >
            <p className="font-sans text-[10px] leading-relaxed mb-6 tracking-wider uppercase opacity-60">
              Продолжая использовать наш сайт, вы даете согласие на обработку файлов cookie и пользовательских данных в целях функционирования сайта в соответствии с Политикой обработки персональных данных (ФЗ-152).
            </p>
            <button 
              onClick={() => setCookieAccepted(true)}
              className="w-full bg-atlas-ink text-atlas-bg py-3 font-sans text-[10px] tracking-widest uppercase hover:bg-atlas-red transition-colors"
            >
              Принять
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile Book Button */}
      <AnimatePresence>
        {scrolled && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-48px)]"
          >
            <button 
              onClick={() => {
                setIsBookingOpen(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-atlas-red text-white py-4 font-sans text-[10px] tracking-[0.2em] uppercase shadow-2xl"
            >
              Забронировать номер
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Modal */}
      <Modal 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)} 
        title={activeModal?.name || ''}
      >
        {activeModal?.details}
      </Modal>
      {/* Infrastructure Modal */}
      <Modal 
        isOpen={!!infraModal} 
        onClose={() => setInfraModal(null)} 
        title={infraModal?.name || ''}
      >
        {infraModal?.details}
      </Modal>
    </main>
  );
}

