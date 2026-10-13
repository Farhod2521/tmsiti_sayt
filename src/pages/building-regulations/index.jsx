import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import clsx from "clsx";
import { get } from "lodash";
import { useTranslation } from "react-i18next";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import ContentLoader from "@/components/loader/content-loader";
import useGetSHNKQuery from "@/hooks/api/useGetSHNKQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { config } from "@/config";
import { searchNorm as norm } from "@/utils/translit";
import {
  BoltIcon,
  BuildingsIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DownloadIcon,
  DropIcon,
  EyeIcon,
  FileSearchIcon,
  FileTextIcon,
  GridIcon,
  HomesIcon,
  LayersIcon,
  LeafIcon,
  ListIcon,
  RoadIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/icons/docs";

// PDF ko'rish oynasi faqat brauzerda (pdf.js) — kerak bo'lgandagina yuklanadi
const PdfViewerModal = dynamic(() => import("@/components/pdf-viewer"), { ssr: false });

const card = "bg-white rounded-[18px] border border-[#EEF2FA] shadow-[0_8px_30px_rgba(16,42,116,0.06)]";

// Guruhlar: raqami bo'yicha nom (lotin/rus), qisqa tavsif, ikonka va rang
const GROUPS = {
  1: {
    uz: "Obodonlashtirish ishlari", ru: "Благоустройство",
    desc: "Hududlarni obodonlashtirish va qurilishdagi ekologik faoliyat talablari.",
    Icon: LeafIcon, tone: "green",
  },
  2: {
    uz: "Poydevorlar", ru: "Основания и фундаменты",
    desc: "Yer inshootlari, zamin va poydevorlar, kon korxonalarining yer osti lahimlari.",
    Icon: LayersIcon, tone: "orange",
  },
  3: {
    uz: "Qurilish konstruksiyalari", ru: "Строительные конструкции",
    desc: "Yuk ko'taruvchi, metall, temirbeton konstruksiyalar, qorishmalar va beton buyumlar.",
    Icon: BuildingsIcon, tone: "blue",
  },
  4: {
    uz: "Himoyalovchi, izolyatsiyalovchi va pardozlovchi qoplamalar", ru: "Защитные, изоляционные и отделочные покрытия",
    desc: "Konstruksiyalarni korroziyadan himoyalash, issiqlik va tovush izolyatsiyasi.",
    Icon: ShieldCheckIcon, tone: "purple",
  },
  5: {
    uz: "Muhandislik va texnologik uskunalar, tarmoqlar va inshootlar", ru: "Инженерное оборудование, сети и сооружения",
    desc: "Sanitariya-texnik, gaz, issiqlik, suv ta'minoti, elektrotexnika va avtomatlashtirish.",
    Icon: BoltIcon, tone: "teal",
  },
  6: {
    uz: "Transport inshootlari", ru: "Транспортные сооружения",
    desc: "Temir va avtomobil yo'llari, ko'priklar, tunnellar, metropoliten va aerodromlar.",
    Icon: RoadIcon, tone: "rose",
  },
  7: {
    uz: "Gidrotexnika va melioratsiya tizimlari va inshootlari", ru: "Гидротехнические и мелиоративные системы",
    desc: "Daryolardagi gidrotexnika inshootlari, sug'orish va kollektor-drenaj tarmoqlari.",
    Icon: DropIcon, tone: "indigo",
  },
};

const TONES = {
  blue: { head: "bg-[#EEF4FF]", icon: "bg-[#DCE7FF] text-[#1D5BE8]", badge: "bg-[#DCE7FF] text-[#1D5BE8]", chev: "text-[#1D5BE8]" },
  green: { head: "bg-[#EAF8F0]", icon: "bg-[#D3F1E0] text-[#1E9E62]", badge: "bg-[#D3F1E0] text-[#1E9E62]", chev: "text-[#1E9E62]" },
  orange: { head: "bg-[#FFF3E8]", icon: "bg-[#FFE2C7] text-[#C9620E]", badge: "bg-[#FFE2C7] text-[#B5590C]", chev: "text-[#C9620E]" },
  purple: { head: "bg-[#F3EEFD]", icon: "bg-[#E4D9FB] text-[#7C5CE0]", badge: "bg-[#E4D9FB] text-[#6A48D4]", chev: "text-[#7C5CE0]" },
  teal: { head: "bg-[#E9F7F8]", icon: "bg-[#CDEDEF] text-[#0E8A9A]", badge: "bg-[#CDEDEF] text-[#0B7A88]", chev: "text-[#0E8A9A]" },
  rose: { head: "bg-[#FDEFF3]", icon: "bg-[#FAD7E1] text-[#C93C68]", badge: "bg-[#FAD7E1] text-[#B5335C]", chev: "text-[#C93C68]" },
  indigo: { head: "bg-[#EEF0FD]", icon: "bg-[#DADFFB] text-[#4F5BD5]", badge: "bg-[#DADFFB] text-[#4450C4]", chev: "text-[#4F5BD5]" },
};

const groupNumber = (title = "") => parseInt((title.match(/\d+/) || ["0"])[0], 10);

const SORTS = [
  { id: "designation", label: "Belgilanishi bo'yicha" },
  { id: "name", label: "Nomi bo'yicha" },
];

const Index = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language;
  const { data, isLoading } = useGetSHNKQuery({ key: KEYS.buildingRegulations, url: URLS.buildingRegulations });

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [sortBy, setSortBy] = useState("designation");
  const [view, setView] = useState("list");
  const [closed, setClosed] = useState({});
  const [viewing, setViewing] = useState(null);

  const docs = get(data, "data", []);

  // Telefonda jadval o'rniga kartochkalar qulayroq
  useEffect(() => {
    if (window.innerWidth < 768) setView("grid");
  }, []);

  // Guruhlash, raqam bo'yicha tartiblash, umumiy tartib raqami
  const groups = useMemo(() => {
    const map = new Map();
    docs.forEach((doc) => {
      const n = groupNumber(doc.group);
      if (!map.has(n)) map.set(n, { n, raw: doc.group, docs: [] });
      map.get(n).docs.push(doc);
    });
    let counter = 1;
    return [...map.values()]
      .sort((a, b) => a.n - b.n)
      .map((g) => {
        const sorted = [...g.docs].sort((a, b) =>
          sortBy === "name"
            ? (a.name || "").localeCompare(b.name || "")
            : (a.designation || "").localeCompare(b.designation || "", undefined, { numeric: true })
        );
        return { ...g, docs: sorted.map((d) => ({ ...d, no: counter++, haystack: norm(`${d.designation} ${d.name}`) })) };
      });
  }, [docs, sortBy]);

  const query = norm(search);
  const visible = groups
    .filter((g) => groupFilter === "all" || String(g.n) === groupFilter)
    .map((g) => ({ ...g, docs: query ? g.docs.filter((d) => d.haystack.includes(query)) : g.docs }))
    .filter((g) => g.docs.length > 0);

  const groupTitle = (g) => {
    const meta = GROUPS[g.n];
    const name = meta ? (lang === "ru" ? meta.ru : meta.uz) : g.raw.replace(/^\s*\d+\s*[-‑–]?\s*(гуруҳ|guruh)\.?\s*/i, "");
    return `${String(g.n).padStart(2, "0")}-${lang === "ru" ? "группа" : "guruh"}. ${name}`;
  };

  const designation = (d) => (lang === "ru" ? d.designation : (d.designation || "").replace(/^ҚР/, "QR"));

  // ?view=<id> — PDF oynasini havola orqali ochish
  useEffect(() => {
    if (!router.isReady || !router.query.view || !docs.length) return;
    const doc = docs.find((d) => String(d.id) === String(router.query.view));
    if (doc) setViewing(doc);
  }, [router.isReady, router.query.view, docs]);

  const openViewer = (doc) => {
    setViewing(doc);
    router.replace({ query: { ...router.query, view: doc.id } }, undefined, { shallow: true, scroll: false });
  };
  const closeViewer = () => {
    setViewing(null);
    const { view: _omit, ...rest } = router.query;
    router.replace({ query: rest }, undefined, { shallow: true, scroll: false });
  };

  const actions = (doc, compact) => {
    const file = doc.pdf_uz || doc.pdf_ru;
    const base = "h-9 rounded-full flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-colors";
    if (!file) return <span className={"text-[12.5px] text-[#8A95B0]"}>Fayl yo&apos;q</span>;
    return (
      <div className={"flex items-center gap-2"}>
        <button type={"button"} onClick={() => openViewer(doc)} className={clsx(base, "px-4 bg-[#EEF4FF] text-[#1D5BE8] hover:bg-[#DCE7FF]", compact && "flex-1")}>
          <EyeIcon className={"w-[17px] h-[17px]"} /> Ko&apos;rish
        </button>
        <a href={`/pdf/${file}`} download className={clsx(base, "px-4 bg-[#EEF4FF] text-[#1D5BE8] hover:bg-[#DCE7FF]", compact && "flex-1")}>
          <DownloadIcon className={"w-[17px] h-[17px]"} /> {compact ? "Yuklash" : "Yuklab olish"}
        </a>
        <a
          href={`${config.MEDIA_URL}${file}`}
          target={"_blank"}
          rel={"noopener noreferrer"}
          title={"PDF faylni yangi oynada ochish"}
          className={clsx(base, "px-3 bg-[#FDECEC] text-[#D93B3B] hover:bg-[#FBDADA]")}
        >
          <FileTextIcon className={"w-[16px] h-[16px]"} /> PDF
        </a>
      </div>
    );
  };

  const total = docs.length;

  return (
    <Main>
      <Menu />
      <div className={"font-jakarta bg-[#F6F9FF] text-[#0B1A4F] pb-16"}>
        {/* HERO */}
        <section className={"relative overflow-hidden"}>
          <Image
            src={"/images/homepage-back.png?v=2"}
            unoptimized
            alt={""}
            fill
            priority
            sizes={"100vw"}
            className={"object-cover object-[80%_25%] select-none pointer-events-none"}
          />
          <div className={"absolute inset-0 bg-white/90 md:bg-transparent md:bg-gradient-to-r md:from-white md:via-white/85 md:to-white/10"} />
          <div className={"absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-t from-[#F6F9FF] to-transparent"} />
          <div className={"relative max-w-[1536px] mx-auto px-5 lg:px-[85px] pt-6 pb-[86px]"}>
            <nav className={"flex flex-wrap items-center gap-x-2 text-[13px] text-[#0B1A4F]"}>
              <Link href={"/"} className={"hover:text-[#1D5BE8]"}>{t("homepage")}</Link>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />
              <span className={"text-[#5B6788]"}>{t("documents")}</span>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />
              <span className={"text-[#5B6788]"}>{t("building_regulations")}</span>
            </nav>
            <div className={"mt-7 flex items-start gap-5"}>
              <span className={"hidden sm:flex w-[84px] h-[84px] shrink-0 rounded-[22px] bg-[#E8F0FE] text-[#1D5BE8] items-center justify-center shadow-[0_8px_24px_rgba(29,91,232,0.12)]"}>
                <FileTextIcon className={"w-11 h-11"} />
              </span>
              <div>
                <h1 className={"text-[30px] md:text-[44px] leading-[1.1] font-extrabold tracking-[-0.02em]"}>{t("building_regulations")}</h1>
                <p className={"mt-3 max-w-[560px] text-[15px] md:text-[16px] leading-[1.55] text-[#3E4B70]"}>
                  Qurilish sohasidagi me&apos;yoriy hujjatlar, texnik qoidalar va reglamentlarni qulay shaklda o&apos;rganing.
                  {total > 0 && <span className={"font-semibold text-[#1D5BE8]"}> {total} ta hujjat, {groups.length} ta guruh.</span>}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={"relative z-10 -mt-[52px] max-w-[1536px] mx-auto px-3 md:px-5 lg:px-[55px] space-y-4"}>
          {/* Qidiruv va filtrlar */}
          <div className={clsx(card, "p-3 flex flex-col lg:flex-row lg:items-center gap-3")}>
            <div className={"flex-1 relative"}>
              <SearchIcon className={"absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A95B0]"} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={"Reglament nomi yoki belgilanishi bo'yicha qidirish..."}
                className={"w-full h-[46px] pl-12 pr-4 rounded-[12px] border border-[#DCE3F0] text-[14px] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition"}
              />
            </div>
            <div className={"flex items-center gap-2"}>
              {[
                [groupFilter, setGroupFilter, [["all", "Barcha guruhlar"], ...groups.map((g) => [String(g.n), groupTitle(g)])], "lg:w-[220px]"],
                [sortBy, setSortBy, SORTS.map((s) => [s.id, s.label]), "lg:w-[200px]"],
              ].map(([value, setter, options, w], i) => (
                <div key={i} className={clsx("relative flex-1 lg:flex-none", w)}>
                  <select
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className={"appearance-none w-full h-[46px] pl-4 pr-10 rounded-[12px] border border-[#DCE3F0] bg-white text-[14px] outline-none focus:border-[#1D5BE8] cursor-pointer truncate"}
                  >
                    {options.map(([id, label]) => (
                      <option key={id} value={id}>{label}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className={"absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"} />
                </div>
              ))}
              {[["list", ListIcon], ["grid", GridIcon]].map(([id, Icon]) => (
                <button
                  key={id}
                  type={"button"}
                  onClick={() => setView(id)}
                  aria-label={id === "list" ? "Jadval ko'rinishi" : "Kartochka ko'rinishi"}
                  className={clsx(
                    "w-[46px] h-[46px] shrink-0 rounded-[12px] flex items-center justify-center transition-colors",
                    view === id ? "bg-[#1D5BE8] text-white" : "bg-[#F1F4FA] text-[#5B6788] hover:bg-[#E8EDF7]"
                  )}
                >
                  <Icon className={"w-5 h-5"} />
                </button>
              ))}
            </div>
          </div>

          {/* Guruhlar */}
          {isLoading ? (
            <div className={clsx(card, "p-6")}><ContentLoader /></div>
          ) : visible.length === 0 ? (
            <div className={clsx(card, "p-12 text-center")}>
              <FileSearchIcon className={"w-12 h-12 mx-auto text-[#8A95B0]"} />
              <p className={"mt-4 text-[16px] font-semibold"}>Hech narsa topilmadi</p>
              <p className={"mt-1 text-[14px] text-[#5B6788]"}>Qidiruv so&apos;zini yoki guruhni o&apos;zgartirib ko&apos;ring.</p>
            </div>
          ) : (
            visible.map((g) => {
              const meta = GROUPS[g.n] || { Icon: HomesIcon, tone: "blue", desc: "" };
              const tone = TONES[meta.tone];
              const isClosed = closed[g.n] && !query;
              return (
                <div key={g.n} className={clsx(card, "overflow-hidden")}>
                  <button
                    type={"button"}
                    onClick={() => setClosed((c) => ({ ...c, [g.n]: !c[g.n] }))}
                    className={clsx("w-full flex items-center gap-4 px-4 md:px-5 py-4 text-left", tone.head)}
                  >
                    <span className={clsx("w-[52px] h-[52px] shrink-0 rounded-[14px] flex items-center justify-center", tone.icon)}>
                      <meta.Icon className={"w-7 h-7"} />
                    </span>
                    <span className={"flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4"}>
                      <span className={"flex flex-wrap items-center gap-3"}>
                        <span className={"text-[16px] md:text-[19px] font-extrabold"}>{groupTitle(g)}</span>
                        <span className={clsx("px-2.5 py-1 rounded-full text-[12.5px] font-semibold", tone.badge)}>{g.docs.length} ta hujjat</span>
                      </span>
                      {meta.desc && (
                        <span className={"md:ml-auto md:max-w-[380px] text-[12.5px] leading-[1.45] text-[#5B6788]"}>{meta.desc}</span>
                      )}
                    </span>
                    <ChevronDownIcon className={clsx("w-6 h-6 shrink-0 transition-transform", tone.chev, !isClosed && "rotate-180")} />
                  </button>

                  {!isClosed &&
                    (view === "list" ? (
                      <div className={"p-3 md:p-4 overflow-x-auto"}>
                        <table className={"w-full min-w-[760px] text-[14px] border border-[#EEF2FA] rounded-[12px] border-separate border-spacing-0 overflow-hidden"}>
                          <thead>
                            <tr className={"bg-[#F7F9FD] text-[13px] text-[#0B1A4F]"}>
                              <th className={"w-[64px] py-3 text-center font-semibold border-b border-[#EEF2FA]"}>№</th>
                              <th className={"w-[150px] py-3 px-4 text-left font-semibold border-b border-l border-[#EEF2FA]"}>Belgilanishi</th>
                              <th className={"py-3 px-4 text-left font-semibold border-b border-l border-[#EEF2FA]"}>Qurilish reglamentlari nomi</th>
                              <th className={"w-[360px] py-3 px-4 text-left font-semibold border-b border-l border-[#EEF2FA]"}>Hujjat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.docs.map((doc) => (
                              <tr key={doc.id} className={"hover:bg-[#FAFBFE] transition-colors"}>
                                <td className={"py-3 text-center text-[#5B6788] border-b border-[#F1F4FA]"}>{doc.no}</td>
                                <td className={"py-3 px-4 font-semibold whitespace-nowrap border-b border-l border-[#F1F4FA]"}>{designation(doc)}</td>
                                <td className={"py-3 px-4 text-[#1E2B5A] border-b border-l border-[#F1F4FA]"}>{doc.name}</td>
                                <td className={"py-2.5 px-4 border-b border-l border-[#F1F4FA]"}>{actions(doc)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className={"p-3 md:p-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"}>
                        {g.docs.map((doc) => (
                          <div key={doc.id} className={"flex flex-col rounded-[14px] border border-[#EEF2FA] p-4 hover:border-[#D6E2FB] hover:shadow-[0_8px_24px_rgba(16,42,116,0.08)] transition-all"}>
                            <div className={"flex items-center gap-3"}>
                              <span className={clsx("w-10 h-10 shrink-0 rounded-[10px] flex items-center justify-center", tone.icon)}>
                                <FileTextIcon className={"w-5 h-5"} />
                              </span>
                              <span className={"text-[14px] font-bold"}>{designation(doc)}</span>
                              <span className={"ml-auto text-[12px] text-[#8A95B0]"}>№ {doc.no}</span>
                            </div>
                            <p className={"mt-3 mb-4 text-[14px] leading-[1.45] text-[#1E2B5A]"}>{doc.name}</p>
                            <div className={"mt-auto"}>{actions(doc, true)}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              );
            })
          )}
        </section>
      </div>

      {viewing && (
        <PdfViewerModal
          doc={{ title: viewing.name, designation: designation(viewing), file: viewing.pdf_uz || viewing.pdf_ru }}
          onClose={closeViewer}
        />
      )}
    </Main>
  );
};

export default Index;
