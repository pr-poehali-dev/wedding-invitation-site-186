import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const WEDDING_DATE = new Date("2026-07-11T13:40:00");

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

function useIntersection(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl border border-[#C9A84C]/30 bg-[#141210] flex items-center justify-center backdrop-blur-sm">
        <span className="font-display text-3xl md:text-4xl font-light leading-none" style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #C9A84C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="font-body text-xs md:text-sm text-[#C9A84C]/70 mt-2 tracking-widest uppercase">{label}</span>
    </div>
  );
}

const ornamentSvg = (
  <svg viewBox="0 0 200 20" className="w-32 h-5 opacity-60" fill="none">
    <path d="M0 10 Q25 2 50 10 Q75 18 100 10 Q125 2 150 10 Q175 18 200 10" stroke="#C9A84C" strokeWidth="1" fill="none"/>
    <circle cx="100" cy="10" r="3" fill="#C9A84C"/>
    <circle cx="50" cy="10" r="2" fill="#C9A84C" opacity="0.5"/>
    <circle cx="150" cy="10" r="2" fill="#C9A84C" opacity="0.5"/>
  </svg>
);

function RSVPSection() {
  const { ref, visible } = useIntersection();
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(1);
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [diet, setDiet] = useState("");
  const [drinks, setDrinks] = useState<string[]>([]);
  const [transfer, setTransfer] = useState<"yes" | "no" | null>(null);

  const toggleDrink = (d: string) =>
    setDrinks(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !attending) return;
    setSending(true);
    try {
      await fetch("https://functions.poehali.dev/ba642b11-ff8e-4081-972f-69e874549bd9", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, attending: attending === "yes", guests, diet, drinks, transfer }),
      });
    } catch (err) { console.error(err); }
    setSending(false);
    setSubmitted(true);
  };

  return (
    <section id="rsvp" className="py-24 px-4 bg-[#0D0B08]" ref={ref}>
      <div className={`max-w-2xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="text-center mb-12">
          <span className="font-body text-xs tracking-[0.3em] uppercase text-[#C9A84C]/70 mb-4 block">Ваш ответ</span>
          <h2 className="font-display text-5xl md:text-6xl text-white font-light">
            Подтверждение <em>присутствия</em>
          </h2>
          <div className="w-16 h-px bg-[#C9A84C]/50 mx-auto mt-6" />
        </div>

        {submitted ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full border-2 border-[#C9A84C] flex items-center justify-center mx-auto mb-6" style={{ animation: "pulse-gold 2s ease-in-out infinite" }}>
              <Icon name="Heart" size={32} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-display text-3xl text-white font-light mb-3">
              {attending === "yes" ? "Ждём вас!" : "Спасибо за ответ"}
            </h3>
            <p className="font-body text-white/50">
              {attending === "yes"
                ? `${name}, мы рады что вы будете с нами в этот особенный день`
                : `${name}, жаль, что вы не сможете присутствовать`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-body text-xs tracking-widest uppercase text-[#C9A84C]/70 block mb-2">Ваше имя *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Иван Иванов"
                required
                className="w-full bg-[#141210] border border-[#C9A84C]/20 rounded-lg px-4 py-3 font-body text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
              />
            </div>

            <div>
              <label className="font-body text-xs tracking-widest uppercase text-[#C9A84C]/70 block mb-3">Вы придёте? *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "yes" as const, label: "С радостью!", icon: "Heart" },
                  { val: "no" as const, label: "К сожалению, нет", icon: "X" },
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setAttending(opt.val)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border font-body text-sm transition-all duration-200 ${
                      attending === opt.val
                        ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                        : "border-white/10 bg-[#141210] text-white/50 hover:border-white/30 hover:text-white/80"
                    }`}
                  >
                    <Icon name={opt.icon} size={16} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {attending === "yes" && (
              <div className="space-y-6">
                <div>
                  <label className="font-body text-xs tracking-widest uppercase text-[#C9A84C]/70 block mb-3">
                    Количество гостей
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setGuests(n)}
                        className={`w-12 h-12 rounded-lg border font-body text-sm font-medium transition-all duration-200 ${
                          guests === n
                            ? "border-[#C9A84C] bg-[#C9A84C] text-[#0D0B08]"
                            : "border-white/10 bg-[#141210] text-white/50 hover:border-white/30"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setGuests(g => Math.min(10, g < 6 ? 6 : g + 1))}
                      className={`px-4 h-12 rounded-lg border font-body text-sm font-medium transition-all duration-200 ${
                        guests > 5
                          ? "border-[#C9A84C] bg-[#C9A84C] text-[#0D0B08]"
                          : "border-white/10 bg-[#141210] text-white/50 hover:border-white/30"
                      }`}
                    >
                      {guests > 5 ? `${guests} чел.` : "6+"}
                    </button>
                  </div>
                  <p className="font-body text-xs text-white/30 mt-2">Выбрано: {guests} {guests === 1 ? "человек" : guests < 5 ? "человека" : "человек"}</p>
                </div>

                <div>
                  <label className="font-body text-xs tracking-widest uppercase text-[#C9A84C]/70 block mb-3">Предпочтения в еде</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {["Мясо", "Рыба", "Вегетарианское", "Без глютена", "Без лактозы", "Детское меню"].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDiet(d => d === opt ? "" : opt)}
                        className={`py-2.5 px-3 rounded-lg border font-body text-sm transition-all duration-200 text-left ${
                          diet === opt
                            ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                            : "border-white/10 bg-[#141210] text-white/50 hover:border-white/30 hover:text-white/80"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Аллергии или особые пожелания..."
                    rows={2}
                    className="w-full bg-[#141210] border border-[#C9A84C]/20 rounded-lg px-4 py-3 font-body text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/60 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="font-body text-xs tracking-widest uppercase text-[#C9A84C]/70 block mb-3">Предпочтения в напитках</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Шампанское", "Вино красное", "Вино белое", "Виски / коньяк", "Пиво", "Без алкоголя"].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleDrink(opt)}
                        className={`py-2.5 px-3 rounded-lg border font-body text-sm transition-all duration-200 text-left ${
                          drinks.includes(opt)
                            ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                            : "border-white/10 bg-[#141210] text-white/50 hover:border-white/30 hover:text-white/80"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-body text-xs tracking-widest uppercase text-[#C9A84C]/70 block mb-3">Нужен ли трансфер?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: "yes" as const, label: "Да, нужен", icon: "Car" },
                      { val: "no" as const, label: "Нет, доберусь сам", icon: "MapPin" },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setTransfer(opt.val)}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border font-body text-sm transition-all duration-200 ${
                          transfer === opt.val
                            ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                            : "border-white/10 bg-[#141210] text-white/50 hover:border-white/30 hover:text-white/80"
                        }`}
                      >
                        <Icon name={opt.icon} size={16} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!name || !attending || sending}
              className="w-full py-4 rounded-lg font-body text-sm font-semibold tracking-widest uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-[#C9A84C] text-[#0D0B08] hover:bg-[#E8C97A] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {sending && <span className="w-4 h-4 border-2 border-[#0D0B08]/30 border-t-[#0D0B08] rounded-full animate-spin" />}
              {sending ? "Отправляем..." : "Отправить ответ"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function NavDot({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} className="group flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/40 group-hover:bg-[#C9A84C] transition-colors" />
      <span className="font-body text-xs text-[#C9A84C]/50 group-hover:text-[#C9A84C] transition-colors tracking-widest uppercase hidden md:block">{label}</span>
    </a>
  );
}

export default function Index() {
  const countdown = useCountdown(WEDDING_DATE);
  const aboutRef = useIntersection();
  const venueRef = useIntersection();
  const contactRef = useIntersection();

  return (
    <div className="min-h-screen bg-[#0D0B08] text-white overflow-x-hidden">
      {/* Floating nav */}
      <nav className="fixed top-6 right-6 z-50 flex flex-col gap-3 bg-[#141210]/80 backdrop-blur-md rounded-2xl px-3 py-4 border border-[#C9A84C]/10">
        <NavDot label="Событие" href="#about" />
        <NavDot label="Место" href="#venue" />
        <NavDot label="RSVP" href="#rsvp" />
        <NavDot label="Контакты" href="#contacts" />
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(https://cdn.poehali.dev/projects/5ae45994-548b-4892-9e0c-ad377572f249/files/ffb9a703-74d1-410c-984f-dad3efe312b1.jpg)` }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(13,11,8,0.65) 0%, rgba(13,11,8,0.45) 50%, rgba(13,11,8,1) 100%)" }} />

        <div className="absolute top-8 left-8 opacity-30 pointer-events-none">
          <div className="w-12 h-12 border-l border-t border-[#C9A84C]" />
        </div>
        <div className="absolute top-8 right-20 opacity-30 pointer-events-none md:right-24">
          <div className="w-12 h-12 border-r border-t border-[#C9A84C]" />
        </div>
        <div className="absolute bottom-8 left-8 opacity-30 pointer-events-none">
          <div className="w-12 h-12 border-l border-b border-[#C9A84C]" />
        </div>
        <div className="absolute bottom-8 right-20 opacity-30 pointer-events-none md:right-24">
          <div className="w-12 h-12 border-r border-b border-[#C9A84C]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="animate-fadeIn">
            <span className="font-body text-xs tracking-[0.4em] uppercase text-[#C9A84C]/80 block mb-6">
              Приглашение на торжество
            </span>
          </div>

          <div className="animate-fadeInUp delay-200">
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-light leading-none text-white mb-2">
              Любовь
            </h1>
            <div className="flex items-center justify-center gap-4 my-3 md:my-4">
              {ornamentSvg}
            </div>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-light leading-none italic" style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #C9A84C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              &amp; Владислав
            </h1>
          </div>

          <div className="animate-fadeInUp delay-500 mt-8 md:mt-12">
            <p className="font-body text-base md:text-lg text-white/60 tracking-widest uppercase">
              11 июля 2026 · Кемерово
            </p>
          </div>

          <div className="animate-fadeInUp delay-700 mt-10 md:mt-14">
            <div className="flex items-start justify-center gap-4 md:gap-6">
              <CountdownUnit value={countdown.days} label="дней" />
              <span className="font-display text-3xl text-[#C9A84C]/40 mt-4">:</span>
              <CountdownUnit value={countdown.hours} label="часов" />
              <span className="font-display text-3xl text-[#C9A84C]/40 mt-4">:</span>
              <CountdownUnit value={countdown.minutes} label="минут" />
              <span className="font-display text-3xl text-[#C9A84C]/40 mt-4">:</span>
              <CountdownUnit value={countdown.seconds} label="секунд" />
            </div>
          </div>

          <div className="animate-fadeInUp delay-800 mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#rsvp"
              className="group inline-flex items-center gap-2 bg-[#C9A84C] text-[#0D0B08] px-8 py-4 rounded-full font-body text-sm font-semibold tracking-widest uppercase hover:bg-[#E8C97A] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Подтвердить участие
              <Icon name="ArrowRight" size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center gap-2 border border-[#C9A84C]/30 text-[#C9A84C] px-8 py-4 rounded-full font-body text-sm tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-all duration-300"
            >
              Подробнее
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <Icon name="ChevronDown" size={20} className="text-[#C9A84C]/40" />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-4 bg-[#0D0B08]" ref={aboutRef.ref}>
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${aboutRef.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="text-center mb-16">
            <span className="font-body text-xs tracking-[0.3em] uppercase text-[#C9A84C]/70 mb-4 block">История</span>
            <h2 className="font-display text-5xl md:text-6xl text-white font-light mb-6">О <em>событии</em></h2>
            <div className="w-16 h-px bg-[#C9A84C]/50 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "Gem", title: "Регистрация", time: "13:40", desc: "Торжественная регистрация брака в Органе ЗАГС № 3 г. Кемерово" },
              { icon: "Camera", title: "Фотосессия", time: "15:00", desc: "Памятные снимки в окружении природы и городских красот Кемерово" },
              { icon: "UtensilsCrossed", title: "Банкет", time: "17:00", desc: "Праздничный ужин в ресторане Oronero — музыка, тосты и веселье" },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative bg-[#141210] border border-[#C9A84C]/10 rounded-2xl p-8 hover:border-[#C9A84C]/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center mb-6">
                  <Icon name={item.icon} size={22} className="text-[#C9A84C]" fallback="Star" />
                </div>
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className="font-display text-2xl text-white font-light">{item.title}</h3>
                  <span className="font-body text-sm text-[#C9A84C]/70">{item.time}</span>
                </div>
                <p className="font-body text-sm text-white/40 leading-relaxed">{item.desc}</p>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          <div className="mt-12 bg-[#141210] border border-[#C9A84C]/10 rounded-2xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <span className="font-body text-xs tracking-[0.3em] uppercase text-[#C9A84C]/70 mb-4 block">Наша история</span>
                <p className="font-display text-2xl md:text-3xl text-white font-light leading-relaxed italic">
                  "Два года назад мы встретились случайно — и с тех пор знаем, что случайностей не бывает."
                </p>
              </div>
              <div className="hidden md:block w-px bg-[#C9A84C]/20 self-stretch" />
              <div className="md:w-48 text-center md:text-right">
                <p className="font-display text-5xl font-light" style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #C9A84C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>2024</p>
                <p className="font-body text-xs text-white/30 mt-1 tracking-widest uppercase">Год знакомства</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VENUE */}
      <section id="venue" className="py-24 px-4 bg-[#0A0908]" ref={venueRef.ref}>
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${venueRef.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="text-center mb-16">
            <span className="font-body text-xs tracking-[0.3em] uppercase text-[#C9A84C]/70 mb-4 block">Адрес</span>
            <h2 className="font-display text-5xl md:text-6xl text-white font-light mb-6">Место <em>и время</em></h2>
            <div className="w-16 h-px bg-[#C9A84C]/50 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#141210] border border-[#C9A84C]/10 rounded-2xl p-8 space-y-6">
              {[
                { icon: "MapPin", label: "Банкет", value: "Ресторан «Oronero»\nг. Кемерово" },
                { icon: "Calendar", label: "Дата", value: "11 июля 2026 года\nСуббота" },
                { icon: "Clock", label: "Программа", value: "13:40 — Регистрация в ЗАГС № 3\n15:00 — Фотосессия\n17:00 — Банкет в Oronero" },
                { icon: "Car", label: "Парковка", value: "Бесплатная парковка\nдля гостей на месте" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size={18} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-[#C9A84C]/60 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-body text-sm text-white/80 whitespace-pre-line leading-relaxed">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#141210] border border-[#C9A84C]/10 rounded-2xl overflow-hidden relative min-h-64">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=86.0917,55.3559&z=14&pt=86.0917,55.3559,pm2rdm"
                width="100%"
                height="100%"
                className="absolute inset-0 w-full h-full opacity-80"
                style={{ border: "none", filter: "saturate(0.5) brightness(0.7)" }}
                title="Карта"
              />
              <div className="absolute inset-0 border border-[#C9A84C]/10 rounded-2xl pointer-events-none" />
              <a
                href="https://yandex.ru/maps/?text=Oronero+Кемерово"
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#C9A84C] text-[#0D0B08] px-4 py-2 rounded-lg font-body text-xs font-semibold tracking-widest uppercase hover:bg-[#E8C97A] transition-colors"
              >
                <Icon name="Navigation" size={12} />
                Маршрут
              </a>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "Building2", label: "ЗАГС", value: "ЗАГС № 3, Кемерово" },
              { icon: "Utensils", label: "Ресторан", value: "Oronero, Кемерово" },
              { icon: "Car", label: "На авто", value: "Навигатор: Oronero Кемерово" },
              { icon: "Phone", label: "Вопросы", value: "+7 (999) 111-22-33" },
            ].map((item, i) => (
              <div key={i} className="bg-[#141210] border border-[#C9A84C]/10 rounded-xl p-4 text-center hover:border-[#C9A84C]/30 transition-colors">
                <Icon name={item.icon} size={18} className="text-[#C9A84C] mx-auto mb-2" fallback="Info" />
                <p className="font-body text-xs text-[#C9A84C]/60 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="font-body text-xs text-white/60">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP */}
      <RSVPSection />

      {/* CONTACTS */}
      <section id="contacts" className="py-24 px-4 bg-[#0A0908]" ref={contactRef.ref}>
        <div className={`max-w-2xl mx-auto text-center transition-all duration-700 ${contactRef.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="font-body text-xs tracking-[0.3em] uppercase text-[#C9A84C]/70 mb-4 block">Связь</span>
          <h2 className="font-display text-5xl md:text-6xl text-white font-light mb-6">Контакты</h2>
          <div className="w-16 h-px bg-[#C9A84C]/50 mx-auto mb-12" />

          <p className="font-body text-white/50 text-sm leading-relaxed mb-10">
            Если у вас есть вопросы или особые пожелания — мы всегда на связи. Не стесняйтесь писать!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {[
              { icon: "Phone", label: "Владислав", value: "+7 (996) 411-36-51", href: "tel:+79964113651" },
              { icon: "Phone", label: "Любовь", value: "+7 (995) 443-15-06", href: "tel:+79954431506" },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="group flex items-center gap-4 bg-[#141210] border border-[#C9A84C]/10 rounded-xl p-5 hover:border-[#C9A84C]/40 transition-all duration-300 hover:-translate-y-0.5 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C9A84C]/20 transition-colors">
                  <Icon name={item.icon} size={18} className="text-[#C9A84C]" />
                </div>
                <div>
                  <p className="font-body text-xs text-[#C9A84C]/60 uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="font-body text-sm text-white/80">{item.value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="border-t border-[#C9A84C]/10 pt-10">
            <div className="flex justify-center mb-4">{ornamentSvg}</div>
            <p className="font-display text-2xl text-white/40 font-light italic">11 · 07 · 2026</p>
            <p className="font-body text-xs text-white/20 mt-2 tracking-widest uppercase">Любовь &amp; Владислав</p>
          </div>
        </div>
      </section>
    </div>
  );
}