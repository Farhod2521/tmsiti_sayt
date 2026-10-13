import React, { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import clsx from "clsx";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import DocsHero from "@/components/docs-hero";
import RowMenu from "@/components/row-menu";
import ContentLoader from "@/components/loader/content-loader";
import { config } from "@/config";
import { searchNorm, toLatin } from "@/utils/translit";
import {
  BookIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileSearchIcon,
  FileTextIcon,
  GlobeIcon,
  GridIcon,
  LandmarkIcon,
  ListIcon,
  ScaleIcon,
  SearchIcon,
} from "@/components/icons/docs";

// Qonunlar bo'limi: SHNQ matnlarida havola qilingan hujjatlar (lex.uz dan avtomatik yuklanadi).
// Turi backend da aniqlanadi (lex_sync.law_kind): raqami (ПФ-, ПҚ-) va matn boshidagi sarlavha bo'yicha.
const API = config.BASE_MAIN_API;
const card = "bg-white rounded-[18px] border border-[#EEF2FA] shadow-[0_8px_30px_rgba(16,42,116,0.06)]";

const KINDS = {
  kodeks: { label: "Kodeks", Icon: BookIcon, cls: "bg-[#E8F0FE] text-[#1D5BE8]" },
  qonun: { label: "Qonun", Icon: ScaleIcon, cls: "bg-[#ECEFFD] text-[#4450C4]" },
  farmon: { label: "Prezident farmoni", Icon: LandmarkIcon, cls: "bg-[#E6F6EC] text-[#1E9E62]" },
  pq: { label: "Prezident qarori", Icon: LandmarkIcon, cls: "bg-[#E3F4F6] text-[#0B7A88]" },
  hukumat: { label: "Hukumat qarori", Icon: LandmarkIcon, cls: "bg-[#FFF1E4] text-[#C9620E]" },
  idoraviy: { label: "Vazirlik qarori", Icon: LandmarkIcon, cls: "bg-[#F1ECFD] text-[#6A48D4]" },
  boshqa: { label: "Boshqa", Icon: FileTextIcon, cls: "bg-[#F1F4FA] text-[#5B6788]" },
};
const ICON_TONES = [
  "bg-[#E8F0FE] text-[#1D5BE8]",
  "bg-[#E4F6EC] text-[#1E9E62]",
  "bg-[#FDECEC] text-[#E5484D]",
  "bg-[#FFF1E4] text-[#E07A1F]",
  "bg-[#F1ECFD] text-[#7C5CE0]",
];
const LANGS = [
  { id: "uz", short: "UZ", label: "O'zbekcha (lotin)" },
  { id: "kr", short: "ЎЗ", label: "Ўзбекча (кирилл)" },
  { id: "ru", short: "RU", label: "Русский" },
];

const formatDate = (iso) => (iso ? iso.split("-").reverse().join(".") : "");

const Index = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [kind, setKind] = useState("all");
  const [docLang, setDocLang] = useState("all");
  const [view, setView] = useState("list");
  const searchRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${API}laws/`)
      .then(({ data }) => setItems(data.results || []))
      .catch(() => setError("Ma'lumotlarni yuklab bo'lmadi"));
    if (window.innerWidth < 768) setView("grid");
  }, []);

  // Ctrl/⌘ + K — qidiruvga o'tish
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const order = lang === "ru" ? ["ru", "kr", "uz"] : ["uz", "kr", "ru"];
  const titleOf = (item) => {
    const key = order.find((l) => item.titles?.[l]);
    const text = key ? item.titles[key] : "—";
    return key === "kr" && lang !== "ru" ? toLatin(text) : text;
  };

  const laws = useMemo(
    () =>
      (items || []).map((item) => ({
        ...item,
        year: item.doc_date ? item.doc_date.slice(0, 4) : "",
        haystack: searchNorm(`${item.number} ${Object.values(item.titles || {}).join(" ")}`),
      })),
    [items]
  );

  const years = useMemo(() => [...new Set(laws.map((l) => l.year).filter(Boolean))].sort().reverse(), [laws]);
  const kindsInData = Object.keys(KINDS).filter((k) => laws.some((l) => l.kind === k));

  const visible = useMemo(() => {
    const q = searchNorm(search);
    return laws.filter(
      (l) =>
        (year === "all" || l.year === year) &&
        (kind === "all" || l.kind === kind) &&
        (docLang === "all" || (l.languages || []).includes(docLang)) &&
        (!q || l.haystack.includes(q))
    );
  }, [laws, search, year, kind, docLang]);

  const fileOf = (item) => {
    const key = order.find((l) => item.files?.[l]);
    return key ? item.files[key] : null;
  };

  const copyLink = (item) => {
    navigator.clipboard?.writeText(`${window.location.origin}/qonunlar/${item.id}`);
    toast.success("Havola nusxalandi");
  };

  const filters = [
    [year, setYear, CalendarIcon, [["all", "Barcha yillar"], ...years.map((y) => [y, `${y}-yil`])]],
    [kind, setKind, FileTextIcon, [["all", "Barcha turi"], ...kindsInData.map((k) => [k, KINDS[k].label])]],
    [docLang, setDocLang, GlobeIcon, [["all", "Barcha tillar"], ...LANGS.map((l) => [l.id, l.label])]],
  ];

  const meta = (item) => (
    <div className={"mt-2 flex flex-wrap items-center gap-1.5 text-[12px] text-[#5B6788]"}>
      {item.number && (
        <span className={"px-2 py-[3px] rounded-md bg-[#F1F4FA]"}>{lang === "ru" ? item.number : toLatin(item.number)}</span>
      )}
      {item.doc_date && (
        <span className={"px-2 py-[3px] rounded-md bg-[#F1F4FA] flex items-center gap-1"}>
          <CalendarIcon className={"w-3.5 h-3.5"} />
          {formatDate(item.doc_date)}
        </span>
      )}
      {LANGS.filter((l) => (item.languages || []).includes(l.id)).map((l) => (
        <span key={l.id} className={"px-2 py-[3px] rounded-md bg-[#EEF4FF] text-[#1D5BE8] font-semibold"} title={l.label}>
          {l.short}
        </span>
      ))}
    </div>
  );

  const kindBadge = (item) => {
    const k = KINDS[item.kind] || KINDS.boshqa;
    return (
      <span className={clsx("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-semibold whitespace-nowrap", k.cls)}>
        <k.Icon className={"w-4 h-4"} />
        {k.label}
      </span>
    );
  };

  const actions = (item, compact) => {
    const file = fileOf(item);
    const base = "h-10 px-4 rounded-[12px] border border-[#DCE3F0] flex items-center justify-center gap-1.5 text-[13.5px] font-semibold text-[#1D5BE8] hover:bg-[#F5F8FF] transition-colors";
    return (
      <div className={"flex items-center gap-2"}>
        <Link href={`/qonunlar/${item.id}`} className={clsx(base, compact && "flex-1")}>
          <EyeIcon className={"w-[17px] h-[17px]"} /> Ko&apos;rish
        </Link>
        {file && (
          <a href={`/pdf/${file}`} download className={clsx(base, compact && "flex-1")} title={"Word (.doc) faylni yuklab olish"}>
            <DownloadIcon className={"w-[17px] h-[17px]"} /> {compact ? "Yuklash" : "Yuklab olish"}
          </a>
        )}
        <RowMenu
          items={[
            item.url && { label: "Lex.uz'da ochish", Icon: ExternalLinkIcon, href: item.url },
            { label: "Havolani nusxalash", Icon: CopyIcon, onClick: () => copyLink(item) },
          ]}
        />
      </div>
    );
  };

  return (
    <Main>
      <Head>
        <title>{`${t("laws_section")} — TMSITI`}</title>
      </Head>
      <Menu />
      <div className={"font-jakarta bg-[#F6F9FF] text-[#0B1A4F] pb-16"}>
        <DocsHero
          crumbs={[{ label: t("homepage"), href: "/" }, { label: t("documents") }, { label: t("laws_section") }]}
          Icon={ScaleIcon}
          title={t("laws_section")}
          subtitle={
            <>
              Shaharsozlik normalari va qoidalarida havola qilingan qonunlar, kodekslar va qarorlar — o&apos;zbek (lotin,
              kirill) va rus tillarida.
              {laws.length > 0 && <span className={"font-semibold text-[#1D5BE8]"}> {laws.length} ta hujjat.</span>}
            </>
          }
        />

        <section className={"relative z-10 -mt-[52px] max-w-[1536px] mx-auto px-3 md:px-5 lg:px-[55px] space-y-3"}>
          {/* Qidiruv va filtrlar */}
          <div className={clsx(card, "p-3 flex flex-col xl:flex-row xl:items-center gap-3")}>
            <div className={"flex-1 relative"}>
              <SearchIcon className={"absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A95B0]"} />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={"Hujjat nomi yoki raqami bo'yicha qidirish..."}
                className={"w-full h-[48px] pl-12 pr-16 rounded-[12px] border border-[#DCE3F0] text-[14px] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition"}
              />
              <kbd className={"hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-7 px-2 items-center rounded-md border border-[#DCE3F0] bg-[#F7F9FD] text-[12px] text-[#5B6788] font-sans"}>
                Ctrl K
              </kbd>
            </div>
            <div className={"grid grid-cols-2 sm:flex sm:items-center gap-2"}>
              {filters.map(([value, setter, Icon, options], i) => (
                <div key={i} className={"relative sm:w-[190px] min-w-0"}>
                  <Icon className={"absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5B6788] pointer-events-none"} />
                  <select
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className={"appearance-none w-full h-[48px] pl-10 pr-9 rounded-[12px] border border-[#DCE3F0] bg-white text-[14px] outline-none focus:border-[#1D5BE8] cursor-pointer truncate"}
                  >
                    {options.map(([id, label]) => (
                      <option key={id} value={id}>{label}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className={"absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"} />
                </div>
              ))}
              <div className={"flex gap-2 sm:ml-1 sm:pl-3 sm:border-l sm:border-[#EEF2FA]"}>
                {[["list", ListIcon], ["grid", GridIcon]].map(([id, Icon]) => (
                  <button
                    key={id}
                    type={"button"}
                    onClick={() => setView(id)}
                    aria-label={id === "list" ? "Ro'yxat ko'rinishi" : "Kartochka ko'rinishi"}
                    className={clsx(
                      "w-[48px] h-[48px] shrink-0 rounded-[12px] flex items-center justify-center transition-colors",
                      view === id ? "bg-[#1D5BE8] text-white" : "bg-[#F1F4FA] text-[#5B6788] hover:bg-[#E8EDF7]"
                    )}
                  >
                    <Icon className={"w-5 h-5"} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error ? (
            <div className={clsx(card, "p-10 text-center text-[#E5484D]")}>{error}</div>
          ) : items === null ? (
            <div className={clsx(card, "p-6")}><ContentLoader /></div>
          ) : visible.length === 0 ? (
            <div className={clsx(card, "p-12 text-center")}>
              <FileSearchIcon className={"w-12 h-12 mx-auto text-[#8A95B0]"} />
              <p className={"mt-4 text-[16px] font-semibold"}>Hech narsa topilmadi</p>
              <p className={"mt-1 text-[14px] text-[#5B6788]"}>Qidiruv so&apos;zini yoki filtrlarni o&apos;zgartirib ko&apos;ring.</p>
            </div>
          ) : view === "list" ? (
            <ul className={"space-y-3"}>
              {visible.map((item, i) => (
                <li key={item.id} className={clsx(card, "flex flex-col lg:flex-row lg:items-center gap-4 p-4 hover:border-[#D6E2FB] transition-colors")}>
                  <div className={"flex items-start gap-4 flex-1 min-w-0"}>
                    <span className={"hidden sm:inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F4FA] text-[14px] font-semibold"}>{i + 1}</span>
                    <span className={clsx("w-[52px] h-[52px] shrink-0 rounded-[14px] flex items-center justify-center", ICON_TONES[i % ICON_TONES.length])}>
                      <FileTextIcon className={"w-6 h-6"} />
                    </span>
                    <div className={"min-w-0"}>
                      <Link href={`/qonunlar/${item.id}`} className={"block text-[15px] leading-[1.45] font-bold hover:text-[#1D5BE8] line-clamp-3"}>
                        {titleOf(item)}
                      </Link>
                      {meta(item)}
                    </div>
                  </div>
                  <div className={"flex flex-wrap items-center gap-3 lg:justify-end"}>
                    {kindBadge(item)}
                    {actions(item)}
                    <Link
                      href={`/qonunlar/${item.id}`}
                      aria-label={"Ochish"}
                      className={"hidden lg:flex w-10 h-10 rounded-full items-center justify-center text-[#0B1A4F] hover:bg-[#EEF4FF]"}
                    >
                      <ChevronRightIcon className={"w-5 h-5"} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={"grid gap-3 sm:grid-cols-2 xl:grid-cols-3"}>
              {visible.map((item, i) => (
                <div key={item.id} className={clsx(card, "flex flex-col p-4")}>
                  <div className={"flex items-center gap-3"}>
                    <span className={clsx("w-10 h-10 shrink-0 rounded-[10px] flex items-center justify-center", ICON_TONES[i % ICON_TONES.length])}>
                      <FileTextIcon className={"w-5 h-5"} />
                    </span>
                    {kindBadge(item)}
                  </div>
                  <Link href={`/qonunlar/${item.id}`} className={"mt-3 text-[15px] leading-[1.45] font-bold hover:text-[#1D5BE8] line-clamp-4"}>
                    {titleOf(item)}
                  </Link>
                  {meta(item)}
                  <div className={"mt-auto pt-4"}>{actions(item, true)}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Main>
  );
};

export default Index;
