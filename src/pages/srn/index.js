import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import DocsHero from "@/components/docs-hero";
import RowMenu from "@/components/row-menu";
import ContentLoader from "@/components/loader/content-loader";
import { config } from "@/config";
import { displayCode, displayText, searchNorm } from "@/utils/translit";
import {
  ChevronDownIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileSearchIcon,
  FileTextIcon,
  GlobeIcon,
  HistoryIcon,
  LayersIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons/docs";

// Smeta-resurs normalari (SRN) va 4-quyi tizim ma'lumotnomalari.
// Ma'lumot: shnk.tmsiti.uz/sren (SRN + almashtirilgan eski ShNQ lar) va /subsystems/ (4-quyi tizim).
// API da hujjat holati va sanasi yo'q — shuning uchun ular ko'rsatilmaydi.
const PdfViewerModal = dynamic(() => import("@/components/pdf-viewer"), { ssr: false });

const SHNK_API = config.BASE_SHNK_URL;
const VMQ_URL = "https://lex.uz/docs/6230882#6231369";
const card = "bg-white rounded-[18px] border border-[#EEF2FA] shadow-[0_8px_30px_rgba(16,42,116,0.06)]";

const isAddendum = (d) => /^qo.shimcha/i.test(d.trim());
const isGeneral = (d) => /\b4\.(01\.\d+|02\.00)\b/.test(d);
const numberOnly = (d = "") => d.replace(/[SRNСРНShNQШНҚ\s]/gi, "").trim();

const SRN_CATEGORIES = [
  ["all", "Barcha kategoriyalar"],
  ["general", "Umumiy nizom va qoidalar"],
  ["works", "Ish turlari bo'yicha"],
  ["addenda", "Qo'shimcha va o'zgartirishlar"],
];

const PdfButton = ({ onClick, disabled }) => (
  <button
    type={"button"}
    onClick={onClick}
    disabled={disabled}
    title={disabled ? "PDF mavjud emas" : "Sayt ichida ko'rish"}
    className={clsx(
      "inline-flex flex-col items-center justify-center w-12 h-12 rounded-[12px] text-[10.5px] font-semibold transition-colors",
      disabled ? "bg-[#F5F6F9] text-[#C3CAD9] cursor-not-allowed" : "bg-[#FDF0F0] text-[#D93B3B] hover:bg-[#FBDADA]"
    )}
  >
    <FileTextIcon className={"w-5 h-5"} />
    PDF
  </button>
);

const DownloadButton = ({ file }) =>
  file ? (
    <a
      href={`/pdf/${file}`}
      download
      title={"Yuklab olish"}
      className={"inline-flex w-10 h-10 items-center justify-center rounded-full bg-[#EEF4FF] text-[#1D5BE8] hover:bg-[#DCE7FF] transition-colors"}
    >
      <DownloadIcon className={"w-5 h-5"} />
    </a>
  ) : (
    <span className={"inline-flex w-10 h-10 items-center justify-center rounded-full bg-[#F5F6F9] text-[#C3CAD9]"} title={"Fayl yo'q"}>
      <DownloadIcon className={"w-5 h-5"} />
    </span>
  );

const LangBadges = ({ uz, ru }) => (
  <div className={"flex gap-1.5"}>
    {[["UZ", uz], ["RU", ru]].map(([label, has]) => (
      <span
        key={label}
        title={has ? `${label} tilida PDF bor` : `${label} tilida PDF yo'q`}
        className={clsx("px-2 py-[3px] rounded-md text-[12px] font-semibold", has ? "bg-[#EEF4FF] text-[#1D5BE8]" : "bg-[#F5F6F9] text-[#C3CAD9] line-through")}
      >
        {label}
      </span>
    ))}
  </div>
);

const Index = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isRu = lang === "ru";
  const highlight = router.query.highlight ? String(router.query.highlight) : null;

  const [srn, setSrn] = useState(null);
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("srn"); // srn | replaced | addenda (SRN jadvali uchun)
  const [refGroup, setRefGroup] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [pdfLang, setPdfLang] = useState("all");
  const [viewing, setViewing] = useState(null);
  const highlightRef = useRef(null);
  const refsRef = useRef(null);

  useEffect(() => {
    fetch(`${SHNK_API}sren`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setSrn)
      .catch(() => setError("Ma'lumotlarni yuklab bo'lmadi"));
    fetch(`${SHNK_API}subsystems/`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((all) => setGroups((all.find((s) => s.title?.startsWith("4-қуйи тизим")) || {}).groups || []))
      .catch(() => setGroups([]));
  }, []);

  // SHNQ ro'yxatidan "?highlight=4.02.01" bilan kelinganda — qatorni ko'rsatish
  useEffect(() => {
    if (!highlight || !srn || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => router.replace("/srn", undefined, { shallow: true, scroll: false }), 4000);
    return () => clearTimeout(timer);
  }, [highlight, srn]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(
    () =>
      (srn || []).map((item, i) => {
        const old = (item.sren_shnk || []).map((s) => ({
          code: s.sren_designation,
          name: (isRu ? s.sren_shnk_ru : s.sren_shnk_uz) || s.sren_shnk_uz || s.sren_shnk_ru || "",
          file: (isRu ? s.sren_pdf_ru || s.sren_pdf_uz : s.sren_pdf_uz || s.sren_pdf_ru) || null,
        }));
        return {
          key: `${item.sren_designation}-${i}`,
          code: item.sren_designation,
          name: (isRu ? item.sren_name_ru : item.sren_name_uz) || item.sren_name_uz || item.sren_name_ru || "",
          fileUz: item.sren_pdf_uz || null,
          fileRu: item.sren_pdf_ru || null,
          file: (isRu ? item.sren_pdf_ru || item.sren_pdf_uz : item.sren_pdf_uz || item.sren_pdf_ru) || null,
          old,
          addendum: isAddendum(item.sren_designation),
          general: isGeneral(item.sren_designation),
          highlighted:
            !!highlight && [item.sren_designation, ...old.map((o) => o.code)].some((c) => numberOnly(c) === highlight),
          haystack: searchNorm(
            `${item.sren_designation} ${item.sren_name_uz} ${item.sren_name_ru} ${(item.sren_shnk || [])
              .map((s) => `${s.sren_designation} ${s.sren_shnk_uz} ${s.sren_shnk_ru}`)
              .join(" ")}`
          ),
        };
      }),
    [srn, isRu, highlight]
  );

  const refs = useMemo(
    () =>
      (groups || []).map((g) => ({
        title: g.title,
        docs: (g.documents || []).map((d) => ({
          code: d.designation,
          name: displayText((isRu ? d.name_ru : d.name_uz) || d.name_uz || d.name_ru || "", lang),
          fileUz: d.pdf_uz || null,
          fileRu: d.pdf_ru || null,
          file: (isRu ? d.pdf_ru || d.pdf_uz : d.pdf_uz || d.pdf_ru) || null,
          url: d.url,
          haystack: searchNorm(`${d.designation} ${d.name_uz} ${d.name_ru}`),
        })),
      })),
    [groups, isRu, lang]
  );
  const refCount = refs.reduce((s, g) => s + g.docs.length, 0);

  const q = searchNorm(search);
  const langOk = (d) => pdfLang === "all" || (pdfLang === "uz" ? d.fileUz : d.fileRu);

  const visibleRows = rows.filter(
    (r) =>
      (tab === "srn" || (tab === "replaced" && r.old.length > 0) || (tab === "addenda" && r.addendum)) &&
      (category === "all" ||
        (category === "addenda" && r.addendum) ||
        (category === "general" && r.general) ||
        (category === "works" && !r.addendum && !r.general)) &&
      langOk(r) &&
      (!q || r.haystack.includes(q))
  );
  const visibleRefs = refs
    .filter((g) => refGroup === "all" || g.title === refGroup)
    .map((g) => ({ ...g, docs: g.docs.filter((d) => langOk(d) && (!q || d.haystack.includes(q))) }))
    .filter((g) => g.docs.length > 0);

  const tabs = [
    { id: "srn", label: "Jami SRN hujjatlar", value: rows.length, Icon: LayersIcon, tone: "bg-[#E8F0FE] text-[#1D5BE8]" },
    { id: "replaced", label: "Eski ShNQ o'rniga", value: rows.filter((r) => r.old.length).length, Icon: HistoryIcon, tone: "bg-[#E4F6EC] text-[#1E9E62]" },
    { id: "addenda", label: "Qo'shimchalar", value: rows.filter((r) => r.addendum).length, Icon: PlusIcon, tone: "bg-[#FFF1E4] text-[#E07A1F]" },
    { id: "refs", label: "Ma'lumotnomalar", value: refCount, Icon: FileTextIcon, tone: "bg-[#F1ECFD] text-[#7C5CE0]" },
  ];

  const switchTab = (id) => {
    if (id === "refs") {
      // Ma'lumotnomalar pastda — shu bo'limga o'tamiz
      refsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setTab(id);
  };

  const copyLink = (code) => {
    navigator.clipboard?.writeText(`${window.location.origin}/srn?highlight=${encodeURIComponent(numberOnly(code))}`);
    toast.success("Havola nusxalandi");
  };

  const open = (doc) => doc.file && setViewing({ title: doc.name, designation: displayCode(doc.code, lang), file: doc.file });

  const th = "py-3 px-4 text-left text-[12px] font-bold uppercase tracking-[0.04em] text-[#0B1A4F] whitespace-nowrap";

  return (
    <Main>
      <Menu />
      <div className={"font-jakarta bg-[#F6F9FF] text-[#0B1A4F] pb-16"}>
        <DocsHero
          crumbs={[{ label: t("homepage"), href: "/" }, { label: t("documents") }, { label: "Smeta-resurs normalari" }]}
          Icon={FileTextIcon}
          title={
            <>
              Smeta-resurs normalari
              <br className={"hidden md:block"} /> va ma&apos;lumotnomalar
            </>
          }
          subtitle={"Qurilish sohasida smeta-resurs normalari, resurs elementlari va ma'lumotnomalar bo'yicha hujjatlar to'plami."}
        >
          <p className={"mt-3 text-[15px] font-bold"}>
            2023-yil 1-yanvardan majburiyligi bekor qilingan{" "}
            <a href={VMQ_URL} target={"_blank"} rel={"noopener noreferrer"} className={"text-[#1D5BE8] underline underline-offset-2 hover:text-[#174FD0]"}>
              (06.10.2022 yildagi 577-son VMQ)
            </a>
          </p>
        </DocsHero>

        <section className={"relative z-10 -mt-[52px] max-w-[1536px] mx-auto px-3 md:px-5 lg:px-[55px] space-y-4"}>
          <div className={clsx(card, "p-3 md:p-4 space-y-4")}>
            {/* Qidiruv va filtrlar */}
            <div className={"flex flex-col lg:flex-row lg:items-center gap-3"}>
              <div className={"flex-1 relative"}>
                <SearchIcon className={"absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A95B0]"} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={"Hujjat nomi yoki raqami bo'yicha qidirish..."}
                  className={"w-full h-[48px] pl-12 pr-4 rounded-[12px] border border-[#DCE3F0] text-[14px] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition"}
                />
              </div>
              <div className={"grid grid-cols-2 sm:flex gap-2"}>
                {[
                  [category, setCategory, LayersIcon, SRN_CATEGORIES, "sm:w-[260px]"],
                  [pdfLang, setPdfLang, GlobeIcon, [["all", "Barcha tillar"], ["uz", "O'zbekcha PDF"], ["ru", "Ruscha PDF"]], "sm:w-[200px]"],
                ].map(([value, setter, Icon, options, w], i) => (
                  <div key={i} className={clsx("relative min-w-0", w)}>
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
              </div>
            </div>

            {/* Statistika = bo'limlar */}
            <div className={"grid grid-cols-2 xl:grid-cols-4 gap-3"}>
              {tabs.map(({ id, label, value, Icon, tone }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type={"button"}
                    onClick={() => switchTab(id)}
                    className={clsx(
                      "flex items-center gap-4 rounded-[14px] px-4 py-3.5 text-left transition-all",
                      active ? "bg-[#1E63F0] text-white shadow-[0_10px_24px_rgba(30,99,240,0.3)]" : "bg-white border border-[#EEF2FA] hover:border-[#D6E2FB]"
                    )}
                  >
                    <span className={clsx("w-12 h-12 shrink-0 rounded-[12px] flex items-center justify-center", active ? "bg-white/20" : tone)}>
                      <Icon className={"w-6 h-6"} />
                    </span>
                    <span className={"min-w-0"}>
                      <span className={clsx("block text-[13px] truncate", active ? "text-white/85" : "text-[#5B6788]")}>{label}</span>
                      <span className={"block text-[22px] font-extrabold leading-tight"}>{srn ? value : "—"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={clsx(card, "overflow-hidden")}>
            {error ? (
              <div className={"p-10 text-center text-[#E5484D]"}>{error}</div>
            ) : !srn || groups === null ? (
              <div className={"p-6"}><ContentLoader /></div>
            ) : (
              visibleRows.length === 0 ? (
                <Empty />
              ) : (
                <div className={"overflow-x-auto"}>
                  <table className={"w-full min-w-[1100px] text-[14px]"}>
                    <thead>
                      <tr className={"bg-[#F3F6FC] border-b border-[#E6ECF7]"}>
                        <th className={clsx(th, "w-[56px] text-center")}>№</th>
                        <th className={clsx(th, "w-[150px]")}>Yangi SHNQ</th>
                        <th className={th}>Hujjat nomi</th>
                        <th className={clsx(th, "w-[360px]")}>Eski ShNQ nomi</th>
                        <th className={clsx(th, "w-[110px]")}>Tili</th>
                        <th className={clsx(th, "w-[80px] text-center")}>PDF</th>
                        <th className={clsx(th, "w-[80px] text-center")}>Fayl</th>
                        <th className={"w-[52px]"} />
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((r, i) => (
                        <tr
                          key={r.key}
                          ref={r.highlighted ? highlightRef : null}
                          className={clsx("border-b border-[#EEF2FA] last:border-0 transition-colors align-middle", r.highlighted ? "bg-[#FFF6DB] animate-pulse" : "hover:bg-[#FAFBFE]")}
                        >
                          <td className={"py-4 px-4 text-center font-semibold text-[#5B6788]"}>{i + 1}</td>
                          <td className={"py-4 px-4"}>
                            <span className={clsx("inline-block px-3 py-1.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap", r.addendum ? "bg-[#FFF1E4] text-[#C9620E]" : "bg-[#E8F0FE] text-[#1D5BE8]")}>
                              {r.code}
                            </span>
                          </td>
                          <td className={"py-4 px-4 leading-[1.5] text-[#1E2B5A]"}>{r.name}</td>
                          <td className={"py-3 px-4"}>
                            {r.old.length === 0 ? (
                              <span className={"text-[#C3CAD9]"}>—</span>
                            ) : (
                              <div className={"space-y-2"}>
                                {r.old.map((o) => (
                                  <div key={o.code} className={"rounded-[10px] bg-[#F7F9FD] border-l-[3px] border-[#C9D6F2] px-3 py-2"}>
                                    <div className={"flex items-center gap-2"}>
                                      <span className={"text-[13px] font-bold"}>{o.code}</span>
                                      {o.file && (
                                        <button type={"button"} onClick={() => open(o)} className={"ml-auto text-[12px] font-semibold text-[#1D5BE8] hover:underline"}>
                                          PDF
                                        </button>
                                      )}
                                    </div>
                                    {o.name && <p className={"mt-0.5 text-[12px] leading-[1.45] text-[#5B6788]"}>{o.name}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className={"py-4 px-4"}><LangBadges uz={r.fileUz} ru={r.fileRu} /></td>
                          <td className={"py-4 px-4 text-center"}><PdfButton disabled={!r.file} onClick={() => open(r)} /></td>
                          <td className={"py-4 px-4 text-center"}><DownloadButton file={r.file} /></td>
                          <td className={"py-4 pr-3"}>
                            <RowMenu
                              items={[
                                r.fileUz && { label: "O'zbekcha PDF (yangi oyna)", Icon: ExternalLinkIcon, href: `${config.MEDIA_URL}${r.fileUz}` },
                                r.fileRu && { label: "Ruscha PDF (yangi oyna)", Icon: ExternalLinkIcon, href: `${config.MEDIA_URL}${r.fileRu}` },
                                { label: "Havolani nusxalash", Icon: CopyIcon, onClick: () => copyLink(r.code) },
                              ]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>

          {/* Maʼlumotnomalar (4-quyi tizim) — SRN jadvalidan keyin, doim ko'rinadi */}
          <div ref={refsRef} className={"scroll-mt-6 pt-6 flex flex-col sm:flex-row sm:items-end gap-3"}>
            <div className={"flex-1"}>
              <h2 className={"text-[26px] md:text-[30px] font-extrabold tracking-[-0.01em]"}>Maʼlumotnomalar</h2>
              <p className={"text-[14px] text-[#5B6788]"}>
                4-quyi tizim: smeta normativ hujjatlari va resurs elementlari to&apos;plamlari
                {groups && <span className={"font-semibold text-[#1D5BE8]"}> — {refCount} ta hujjat</span>}
              </p>
            </div>
            <div className={"relative sm:w-[340px] min-w-0"}>
              <LayersIcon className={"absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5B6788] pointer-events-none"} />
              <select
                value={refGroup}
                onChange={(e) => setRefGroup(e.target.value)}
                className={"appearance-none w-full h-[48px] pl-10 pr-9 rounded-[12px] border border-[#DCE3F0] bg-white text-[14px] outline-none focus:border-[#1D5BE8] cursor-pointer truncate"}
              >
                <option value={"all"}>Barcha guruhlar</option>
                {refs.map((g) => (
                  <option key={g.title} value={g.title}>{displayText(g.title, lang)}</option>
                ))}
              </select>
              <ChevronDownIcon className={"absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"} />
            </div>
          </div>

          <div className={clsx(card, "overflow-hidden")}>
            {error ? (
              <div className={"p-10 text-center text-[#E5484D]"}>{error}</div>
            ) : groups === null ? (
              <div className={"p-6"}><ContentLoader /></div>
            ) : visibleRefs.length === 0 ? (
              <Empty />
            ) : (
              <div className={"overflow-x-auto"}>
                <table className={"w-full min-w-[900px] text-[14px]"}>
                  <thead>
                    <tr className={"bg-[#F3F6FC] border-b border-[#E6ECF7]"}>
                      <th className={clsx(th, "w-[56px] text-center")}>№</th>
                      <th className={clsx(th, "w-[180px]")}>Shifr</th>
                      <th className={th}>Hujjat nomi</th>
                      <th className={clsx(th, "w-[110px]")}>Tili</th>
                      <th className={clsx(th, "w-[80px] text-center")}>PDF</th>
                      <th className={clsx(th, "w-[80px] text-center")}>Fayl</th>
                      <th className={"w-[52px]"} />
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let n = 0;
                      return visibleRefs.map((g) => (
                        <React.Fragment key={g.title}>
                          <tr className={"bg-[#EEF4FF]"}>
                            <td colSpan={7} className={"py-3 px-4 text-[14px] font-bold text-[#1D4FC4]"}>{displayText(g.title, lang)}</td>
                          </tr>
                          {g.docs.map((d) => {
                            n += 1;
                            return (
                              <tr key={`${g.title}-${d.code}-${n}`} className={"border-b border-[#EEF2FA] hover:bg-[#FAFBFE]"}>
                                <td className={"py-3.5 px-4 text-center font-semibold text-[#5B6788]"}>{n}</td>
                                <td className={"py-3.5 px-4"}>
                                  <span className={"inline-block px-3 py-1.5 rounded-[8px] bg-[#F1ECFD] text-[#6A48D4] text-[13px] font-semibold whitespace-nowrap"}>
                                    {displayCode(d.code, lang)}
                                  </span>
                                </td>
                                <td className={"py-3.5 px-4 leading-[1.5] text-[#1E2B5A]"}>{d.name}</td>
                                <td className={"py-3.5 px-4"}><LangBadges uz={d.fileUz} ru={d.fileRu} /></td>
                                <td className={"py-3.5 px-4 text-center"}><PdfButton disabled={!d.file} onClick={() => open(d)} /></td>
                                <td className={"py-3.5 px-4 text-center"}><DownloadButton file={d.file} /></td>
                                <td className={"py-3.5 pr-3"}>
                                  <RowMenu
                                    items={[
                                      d.url && { label: "Lex.uz'da ochish", Icon: ExternalLinkIcon, href: d.url },
                                      d.file && { label: "PDF (yangi oyna)", Icon: ExternalLinkIcon, href: `${config.MEDIA_URL}${d.file}` },
                                    ]}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {viewing && <PdfViewerModal doc={viewing} onClose={() => setViewing(null)} />}
    </Main>
  );
};

const Empty = () => (
  <div className={"p-12 text-center"}>
    <FileSearchIcon className={"w-12 h-12 mx-auto text-[#8A95B0]"} />
    <p className={"mt-4 text-[16px] font-semibold"}>Hech narsa topilmadi</p>
    <p className={"mt-1 text-[14px] text-[#5B6788]"}>Qidiruv so&apos;zini yoki filtrlarni o&apos;zgartirib ko&apos;ring.</p>
  </div>
);

export default Index;
