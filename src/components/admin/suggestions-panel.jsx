import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { ExternalLinkIcon, MessageIcon, PhoneIcon, SearchIcon, TrashIcon } from "@/components/icons/docs";

// Admin panel -> Takliflar: hujjat sahifasidagi ⋮ -> "Hujjatga taklif yuborish" orqali kelgan takliflar.

const card = "bg-white rounded-[18px] border border-[#EEF2FA] shadow-[0_8px_30px_rgba(16,42,116,0.06)]";

const STATUSES = [
  { id: "new", label: "Yangi", cls: "bg-[#E8F0FE] text-[#1D5BE8]" },
  { id: "reviewed", label: "Ko'rib chiqildi", cls: "bg-[#E6F6EC] text-[#1E9E62]" },
  { id: "rejected", label: "Rad etildi", cls: "bg-[#F1F4FA] text-[#5B6788]" },
];
const TYPE_CLS = { suggestion: "bg-[#EEEAFD] text-[#7C5CE0]", error: "bg-[#FDECEC] text-[#E5484D]" };

const dateTime = (iso) =>
  new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const docHref = (s) => `${s.kind === "law" ? "/qonunlar" : "/shnq"}/${s.doc_id}${s.block ? `#${s.block}` : ""}`;

const SuggestionsPanel = ({ client, event, onChanged }) => {
  const [statusFilter, setStatusFilter] = useState("new");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setPage(1), [statusFilter, typeFilter, debounced]);

  const load = useCallback(() => {
    setLoading(true);
    client
      .get("shnq-admin/suggestions/", {
        params: { status: statusFilter || undefined, type: typeFilter || undefined, search: debounced || undefined, page },
      })
      .then(({ data: res }) => setData(res))
      .catch(() => toast.error("Takliflarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [client, statusFilter, typeFilter, debounced, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Yangi taklif kelganda (WebSocket) ro'yxat yangilanadi
  useEffect(() => {
    if (event && event.event === "suggestion") load();
  }, [event, load]);

  const setStatus = async (item, value) => {
    try {
      await client.patch(`shnq-admin/suggestions/${item.id}/`, { status: value });
      toast.success("Holat yangilandi");
      load();
      if (onChanged) onChanged();
    } catch (err) {
      toast.error("Saqlab bo'lmadi");
    }
  };

  const remove = async (item) => {
    if (!window.confirm("Taklif o'chirilsinmi?")) return;
    try {
      await client.delete(`shnq-admin/suggestions/${item.id}/`);
      load();
      if (onChanged) onChanged();
    } catch (err) {
      toast.error("O'chirib bo'lmadi");
    }
  };

  const counts = data?.counts || {};
  const tabs = [...STATUSES.map((s) => ({ ...s, count: counts[s.id] })), { id: "", label: "Barchasi" }];

  return (
    <div className={"space-y-4"}>
      <div className={clsx(card, "p-3 flex flex-wrap items-center gap-2")}>
        <div className={"flex flex-wrap gap-1"}>
          {tabs.map((t) => (
            <button
              key={t.id || "all"}
              type={"button"}
              onClick={() => setStatusFilter(t.id)}
              className={clsx(
                "h-9 px-3.5 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-colors",
                statusFilter === t.id ? "bg-[#1D5BE8] text-white" : "text-[#5B6788] hover:bg-[#F1F4FA]"
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span className={clsx("min-w-[20px] h-5 px-1.5 rounded-full text-[11px] flex items-center justify-center", statusFilter === t.id ? "bg-white/25" : "bg-[#E8F0FE] text-[#1D5BE8]")}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className={"flex-1"} />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={"h-9 px-3 rounded-[10px] border border-[#DCE3F0] text-[13px] outline-none focus:border-[#1D5BE8]"}
        >
          <option value={""}>Barcha turlar</option>
          <option value={"suggestion"}>Hujjatga taklif</option>
          <option value={"error"}>Texnik xatolik</option>
        </select>
        <div className={"relative w-full sm:w-[260px]"}>
          <SearchIcon className={"w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95B0]"} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={"Ism, telefon, matn..."}
            className={"w-full h-9 pl-9 pr-3 rounded-[10px] border border-[#DCE3F0] text-[13px] outline-none focus:border-[#1D5BE8]"}
          />
        </div>
      </div>

      {data === null ? (
        <div className={clsx(card, "p-10 text-center text-[14px] text-[#8A95B0]")}>Yuklanmoqda...</div>
      ) : data.results.length === 0 ? (
        <div className={clsx(card, "p-12 text-center")}>
          <MessageIcon className={"w-10 h-10 mx-auto text-[#C9D3EA]"} />
          <p className={"mt-3 text-[15px] font-semibold"}>Takliflar yo&apos;q</p>
          <p className={"mt-1 text-[13px] text-[#5B6788]"}>Hujjat sahifasida band yonidagi ⋮ menyusidan yuborilgan takliflar shu yerda chiqadi</p>
        </div>
      ) : (
        <div className={clsx("space-y-3 transition-opacity", loading && "opacity-60")}>
          {data.results.map((s) => {
            const st = STATUSES.find((x) => x.id === s.status) || STATUSES[0];
            return (
              <article key={s.id} className={clsx(card, "p-4 md:p-5")}>
                <div className={"flex flex-wrap items-center gap-2"}>
                  <span className={clsx("px-2.5 py-1 rounded-lg text-[12px] font-semibold", TYPE_CLS[s.type])}>{s.type_label}</span>
                  <span className={clsx("px-2.5 py-1 rounded-lg text-[12px] font-semibold", st.cls)}>{st.label}</span>
                  <span className={"text-[12px] text-[#8A95B0]"}>{dateTime(s.created_at)}</span>
                  <div className={"flex-1"} />
                  <select
                    value={s.status}
                    onChange={(e) => setStatus(s, e.target.value)}
                    className={"h-8 px-2 rounded-lg border border-[#DCE3F0] text-[12px] outline-none focus:border-[#1D5BE8]"}
                  >
                    {STATUSES.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.label}
                      </option>
                    ))}
                  </select>
                  <button type={"button"} onClick={() => remove(s)} aria-label={"O'chirish"} className={"w-8 h-8 rounded-lg text-[#E5484D] hover:bg-[#FDECEC] flex items-center justify-center"}>
                    <TrashIcon className={"w-4 h-4"} />
                  </button>
                </div>

                <a href={docHref(s)} target={"_blank"} rel={"noopener noreferrer"} className={"mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-[#1D5BE8] hover:underline"}>
                  {s.doc_title || `Hujjat #${s.doc_id}`} <ExternalLinkIcon className={"w-3.5 h-3.5"} />
                </a>
                {s.block_text && (
                  <blockquote className={"mt-2 rounded-[10px] bg-[#F6F9FF] border-l-4 border-[#C9D8F8] px-3 py-2 text-[13px] leading-[1.5] text-[#5B6788] line-clamp-3"}>
                    {s.block_text}
                  </blockquote>
                )}
                <p className={"mt-3 text-[14px] leading-[1.6] text-[#0B1A4F] whitespace-pre-wrap break-words"}>{s.text}</p>

                <div className={"mt-4 pt-3 border-t border-[#EEF2FA] flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#5B6788]"}>
                  <span className={"font-semibold text-[#0B1A4F]"}>{s.full_name}</span>
                  <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className={"flex items-center gap-1.5 hover:text-[#1D5BE8]"}>
                    <PhoneIcon className={"w-4 h-4"} /> {s.phone}
                  </a>
                  <span>📍 {[s.region_name, s.city].filter(Boolean).join(", ") || (s.country || "Joylashuv noma'lum")}</span>
                </div>
              </article>
            );
          })}

          {data.pages > 1 && (
            <div className={"flex items-center justify-center gap-2 pt-2"}>
              <button type={"button"} disabled={page <= 1} onClick={() => setPage(page - 1)} className={"h-9 px-4 rounded-[10px] bg-white border border-[#DCE3F0] text-[13px] disabled:opacity-40"}>
                ← Oldingi
              </button>
              <span className={"text-[13px] text-[#5B6788]"}>
                {data.page} / {data.pages}
              </span>
              <button type={"button"} disabled={page >= data.pages} onClick={() => setPage(page + 1)} className={"h-9 px-4 rounded-[10px] bg-white border border-[#DCE3F0] text-[13px] disabled:opacity-40"}>
                Keyingi →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionsPanel;
