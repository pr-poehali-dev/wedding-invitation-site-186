import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const RSVP_URL = "https://functions.poehali.dev/ba642b11-ff8e-4081-972f-69e874549bd9";
const PASSWORD = "vlad-lyubov-2026";

interface RSVP {
  id: number;
  name: string;
  attending: boolean;
  guests: number;
  diet: string | null;
  drinks: string[];
  transfer: boolean | null;
  created_at: string;
}

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<{ rsvps: RSVP[]; total_guests: number; total_no: number; need_transfer: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === PASSWORD) { setAuth(true); setError(""); }
    else setError("Неверный пароль");
  };

  useEffect(() => {
    if (!auth) return;
    setLoading(true);
    fetch(RSVP_URL)
      .then(r => r.json())
      .then(d => setData(typeof d === "string" ? JSON.parse(d) : d))
      .finally(() => setLoading(false));
  }, [auth]);

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#0D0B08] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="font-display text-4xl text-white font-light italic mb-2">Любовь & Владислав</p>
            <p className="font-body text-xs text-[#C9A84C]/60 tracking-widest uppercase">Список гостей</p>
          </div>
          <form onSubmit={login} className="bg-[#141210] border border-[#C9A84C]/10 rounded-2xl p-8 space-y-4">
            <div>
              <label className="font-body text-xs tracking-widest uppercase text-[#C9A84C]/70 block mb-2">Пароль</label>
              <input
                type="password"
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0D0B08] border border-[#C9A84C]/20 rounded-lg px-4 py-3 font-body text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
              />
              {error && <p className="font-body text-xs text-red-400 mt-2">{error}</p>}
            </div>
            <button type="submit" className="w-full py-3 bg-[#C9A84C] text-[#0D0B08] rounded-lg font-body text-sm font-semibold tracking-widest uppercase hover:bg-[#E8C97A] transition-colors">
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filtered = data?.rsvps.filter(r =>
    filter === "all" ? true : filter === "yes" ? r.attending : !r.attending
  ) ?? [];

  return (
    <div className="min-h-screen bg-[#0D0B08] px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-body text-xs text-[#C9A84C]/60 tracking-widest uppercase mb-1">Список гостей</p>
            <h1 className="font-display text-4xl text-white font-light italic">Любовь & Владислав</h1>
          </div>
          <a href="/" className="flex items-center gap-2 font-body text-xs text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors tracking-widest uppercase">
            <Icon name="ArrowLeft" size={14} />
            На сайт
          </a>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin mx-auto mb-4" />
            <p className="font-body text-sm text-white/40">Загрузка...</p>
          </div>
        )}

        {data && !loading && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Всего ответов", value: data.rsvps.length, icon: "Users" },
                { label: "Придут (чел.)", value: data.total_guests, icon: "Heart" },
                { label: "Не придут", value: data.total_no, icon: "X" },
                { label: "Нужен трансфер", value: data.need_transfer, icon: "Car" },
              ].map((s, i) => (
                <div key={i} className="bg-[#141210] border border-[#C9A84C]/10 rounded-xl p-5 text-center">
                  <Icon name={s.icon} size={20} className="text-[#C9A84C] mx-auto mb-2" fallback="Info" />
                  <p className="font-display text-3xl text-white font-light">{s.value}</p>
                  <p className="font-body text-xs text-white/40 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-6">
              {[
                { val: "all" as const, label: "Все" },
                { val: "yes" as const, label: "Придут" },
                { val: "no" as const, label: "Не придут" },
              ].map(f => (
                <button
                  key={f.val}
                  onClick={() => setFilter(f.val)}
                  className={`px-4 py-2 rounded-lg font-body text-xs tracking-widest uppercase transition-colors ${
                    filter === f.val
                      ? "bg-[#C9A84C] text-[#0D0B08]"
                      : "bg-[#141210] border border-[#C9A84C]/10 text-white/50 hover:border-[#C9A84C]/30 hover:text-white/80"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="text-center py-12 text-white/30 font-body text-sm">Ответов пока нет</div>
              )}
              {filtered.map(r => (
                <div key={r.id} className="bg-[#141210] border border-[#C9A84C]/10 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${r.attending ? "bg-[#C9A84C]/15" : "bg-white/5"}`}>
                        <Icon name={r.attending ? "Heart" : "X"} size={16} className={r.attending ? "text-[#C9A84C]" : "text-white/30"} />
                      </div>
                      <div>
                        <p className="font-body text-white font-medium">{r.name}</p>
                        <p className="font-body text-xs text-white/40 mt-0.5">
                          {r.attending ? `${r.guests} ${r.guests === 1 ? "человек" : r.guests < 5 ? "человека" : "человек"}` : "Не придёт"}
                          {" · "}
                          {new Date(r.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.transfer && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 font-body text-xs">
                          <Icon name="Car" size={12} />Трансфер
                        </span>
                      )}
                      {r.drinks?.map(d => (
                        <span key={d} className="px-2 py-1 rounded-md bg-[#C9A84C]/10 text-[#C9A84C]/80 font-body text-xs">{d}</span>
                      ))}
                      {r.diet && (
                        <span className="px-2 py-1 rounded-md bg-white/5 text-white/50 font-body text-xs">{r.diet}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
