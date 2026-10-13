import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import clsx from "clsx";
import toast from "react-hot-toast";
import { get } from "lodash";
import { useTranslation } from "react-i18next";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import DocsHero from "@/components/docs-hero";
import RowMenu from "@/components/row-menu";
import ContentLoader from "@/components/loader/content-loader";
import useGetSHNKQuery from "@/hooks/api/useGetSHNKQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { config } from "@/config";
import { displayText, searchNorm } from "@/utils/translit";
import {
  ChevronDownIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileSearchIcon,
  FileTextIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
} from "@/components/icons/docs";

// PDF ko'rish oynasi faqat brauzerda (pdf.js) — kerak bo'lgandagina yuklanadi
const PdfViewerModal = dynamic(() => import("@/components/pdf-viewer"), { ssr: false });

const card = "bg-white rounded-[18px] border border-[#EEF2FA] shadow-[0_8px_30px_rgba(16,42,116,0.06)]";
const ICON_TONES = [
  "bg-[#E8F0FE] text-[#1D5BE8]",
  "bg-[#E4F6EC] text-[#1E9E62]",
  "bg-[#F1ECFD] text-[#7C5CE0]",
  "bg-[#FFF1E4] text-[#E07A1F]",
  "bg-[#FDECEC] text-[#E5484D]",
];

// Mavzu hujjat belgilanishidan aniqlanadi (API da alohida maydon yo'q)
const TOPICS = [
  { id: "qmq", label: "QMQ — qurilish me'yorlari", test: (d) => /^(ҚМҚ|QMQ)/i.test(d) },
  { id: "shnq", label: "SHNQ — shaharsozlik normalari", test: (d) => /^(ШНҚ|ШНК|SHNQ)/i.test(d) },
  { id: "guide", label: "Texnik qo'llanmalar", test: (d) => /(ҚЎЛЛАНМА|qo.llanma|руководство)/i.test(d) },
];
const topicOf = (designation = "") => (TOPICS.find((t) => t.test(designation.trim())) || { id: "other" }).id;

const SORTS = [
  { id: "az", label: "Nomi (A–Z)" },
  { id: "za", label: "Nomi (Z–A)" },
  { id: "designation", label: "Belgilanishi bo'yicha" },
];

const Index = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language;
  const { data, isLoading } = useGetSHNKQuery({ key: KEYS.reference, url: URLS.reference });

  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [sortBy, setSortBy] = useState("az");
  const [view, setView] = useState("list");
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    if (window.innerWidth < 768) setView("grid");
  }, []);

  const docs = useMemo(
    () =>
      get(data, "data", []).map((d) => ({
        ...d,
        file: d.pdf_uz || d.pdf_ru,
        // "." kabi ma'nosiz belgilanishlar ko'rsatilmaydi
        code: (d.designation || "").trim().length > 2 ? d.designation.trim() : "",
        topic: topicOf(d.designation),
        title: displayText(d.name, lang),
        haystack: searchNorm(`${d.designation} ${d.name}`),
      })),
    [data, lang]
  );

  const visible = useMemo(() => {
    const q = searchNorm(search);
    const list = docs.filter((d) => (topic === "all" || d.topic === topic) && (!q || d.haystack.includes(q)));
    const byTitle = (a, b) => a.title.replace(/^[«“"]/, "").localeCompare(b.title.replace(/^[«“"]/, ""));
    return [...list].sort(
      sortBy === "za" ? (a, b) => byTitle(b, a)
        : sortBy === "designation" ? (a, b) => (a.code || "~").localeCompare(b.code || "~", undefined, { numeric: true })
        : byTitle
    );
  }, [docs, search, topic, sortBy]);

  const topicsInData = TOPICS.filter((tp) => docs.some((d) => d.topic === tp.id));

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

  const copyLink = (doc) => {
    const url = `${window.location.origin}${window.location.pathname}?view=${doc.id}`;
    navigator.clipboard?.writeText(url);
    toast.success("Havola nusxalandi");
  };

  const actions = (doc, compact) => {
    if (!doc.file) return <span className={"text-[12.5px] text-[#8A95B0]"}>Fayl yo&apos;q</span>;
    const base = "h-9 rounded-full px-4 flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-colors bg-[#EEF4FF] text-[#1D5BE8] hover:bg-[#DCE7FF]";
    return (
      <div className={"flex items-center gap-2"}>
        <button type={"button"} onClick={() => openViewer(doc)} className={clsx(base, compact && "flex-1")}>
          <EyeIcon className={"w-[17px] h-[17px]"} /> Ko&apos;rish
        </button>
        <a href={`/pdf/${doc.file}`} download className={clsx(base, compact && "flex-1")}>
          <DownloadIcon className={"w-[17px] h-[17px]"} /> {compact ? "Yuklash" : "Yuklab olish"}
        </a>
        <RowMenu
          items={[
            { label: "PDF ni yangi oynada", Icon: ExternalLinkIcon, href: `${config.MEDIA_URL}${doc.file}` },
            { label: "Havolani nusxalash", Icon: CopyIcon, onClick: () => copyLink(doc) },
          ]}
        />
      </div>
    );
  };

  return (
    <Main>
      <Menu />
      <div className={"font-jakarta bg-[#F6F9FF] text-[#0B1A4F] pb-16"}>
        <DocsHero
          crumbs={[{ label: t("homepage"), href: "/" }, { label: t("documents") }, { label: t("reference") }]}
          Icon={FileTextIcon}
          title={t("reference")}
          subtitle={
            <>
              Qurilish sohasiga oid ma&apos;lumotnoma, yo&apos;riqnomalar va boshqa uslubiy materiallar bilan tanishing.
              {docs.length > 0 && <span className={"font-semibold text-[#1D5BE8]"}> {docs.length} ta hujjat.</span>}
            </>
          }
        />

        <section className={"relative z-10 -mt-[52px] max-w-[1536px] mx-auto px-3 md:px-5 lg:px-[55px]"}>
          <div className={clsx(card, "overflow-hidden")}>
            {/* Qidiruv va filtrlar */}
            <div className={"p-3 md:p-4 flex flex-col lg:flex-row lg:items-center gap-3"}>
              <div className={"flex-1 relative"}>
                <SearchIcon className={"absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A95B0]"} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={"Nomi yoki belgilanishi bo'yicha qidirish..."}
                  className={"w-full h-[46px] pl-12 pr-4 rounded-[12px] border border-[#DCE3F0] text-[14px] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition"}
                />
              </div>
              <div className={"flex items-center gap-2"}>
                {[
                  [topic, setTopic, [["all", "Barcha mavzular"], ...topicsInData.map((tp) => [tp.id, tp.label]), ...(docs.some((d) => d.topic === "other") ? [["other", "Boshqalar"]] : [])], "lg:w-[240px]"],
                  [sortBy, setSortBy, SORTS.map((s) => [s.id, `Tartiblash: ${s.label}`]), "lg:w-[240px]"],
                ].map(([value, setter, options, w], i) => (
                  <div key={i} className={clsx("relative flex-1 lg:flex-none min-w-0", w)}>
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

            {isLoading ? (
              <div className={"p-6"}><ContentLoader /></div>
            ) : visible.length === 0 ? (
              <div className={"p-12 text-center"}>
                <FileSearchIcon className={"w-12 h-12 mx-auto text-[#8A95B0]"} />
                <p className={"mt-4 text-[16px] font-semibold"}>Hech narsa topilmadi</p>
                <p className={"mt-1 text-[14px] text-[#5B6788]"}>Qidiruv so&apos;zini yoki mavzuni o&apos;zgartirib ko&apos;ring.</p>
              </div>
            ) : view === "list" ? (
              <div className={"overflow-x-auto"}>
                <table className={"w-full min-w-[720px] text-[14px]"}>
                  <thead>
                    <tr className={"bg-[#EEF4FF] text-[14px]"}>
                      <th className={"w-[72px] py-3 text-center font-bold"}>№</th>
                      <th className={"py-3 px-2 text-left font-bold"}>Nomi</th>
                      <th className={"w-[380px] py-3 px-4 text-left font-bold"}>Hujjat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((doc, i) => (
                      <tr key={doc.id} className={"border-b border-[#EEF2FA] last:border-0 hover:bg-[#FAFBFE] transition-colors"}>
                        <td className={"py-3 text-center"}>
                          <span className={"inline-flex w-9 h-8 items-center justify-center rounded-[8px] bg-[#F1F4FA] text-[13px] font-semibold"}>{i + 1}</span>
                        </td>
                        <td className={"py-3 px-2"}>
                          <div className={"flex items-center gap-4"}>
                            <span className={clsx("w-10 h-10 shrink-0 rounded-[10px] flex items-center justify-center", ICON_TONES[i % ICON_TONES.length])}>
                              <FileTextIcon className={"w-5 h-5"} />
                            </span>
                            <span className={"min-w-0"}>
                              <span className={"block text-[15px] leading-[1.45] text-[#0B1A4F]"}>{doc.title}</span>
                              {doc.code && <span className={"inline-block mt-1 px-2 py-0.5 rounded-md bg-[#F1F4FA] text-[12px] text-[#5B6788]"}>{displayText(doc.code, lang)}</span>}
                            </span>
                          </div>
                        </td>
                        <td className={"py-3 px-4"}>{actions(doc)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={"p-3 md:p-4 pt-0 md:pt-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"}>
                {visible.map((doc, i) => (
                  <div key={doc.id} className={"flex flex-col rounded-[14px] border border-[#EEF2FA] p-4 hover:border-[#D6E2FB] hover:shadow-[0_8px_24px_rgba(16,42,116,0.08)] transition-all"}>
                    <div className={"flex items-center gap-3"}>
                      <span className={clsx("w-10 h-10 shrink-0 rounded-[10px] flex items-center justify-center", ICON_TONES[i % ICON_TONES.length])}>
                        <FileTextIcon className={"w-5 h-5"} />
                      </span>
                      {doc.code && <span className={"text-[13px] font-semibold text-[#5B6788]"}>{displayText(doc.code, lang)}</span>}
                      <span className={"ml-auto text-[12px] text-[#8A95B0]"}>№ {i + 1}</span>
                    </div>
                    <p className={"mt-3 mb-4 text-[15px] leading-[1.45]"}>{doc.title}</p>
                    <div className={"mt-auto"}>{actions(doc, true)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {viewing && (
        <PdfViewerModal
          doc={{ title: viewing.title, designation: displayText(viewing.code, lang), file: viewing.file }}
          onClose={closeViewer}
        />
      )}
    </Main>
  );
};

export default Index;
