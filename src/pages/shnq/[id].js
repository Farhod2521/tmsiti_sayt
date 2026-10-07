import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import axios from "axios";
import toast from "react-hot-toast";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import ContentLoader from "@/components/loader/content-loader";
import { config } from "@/config";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileTextIcon,
  GlobeIcon,
  HistoryIcon,
  LinkIcon,
  MinusIcon,
  MoreVerticalIcon,
  PlusIcon,
  PrinterIcon,
  SearchIcon,
  ShareIcon,
  StarIcon,
} from "@/components/icons/docs";

const API = config.BASE_MAIN_API;
const MEDIA_URL = config.MEDIA_URL;
const FAVORITES_KEY = "shnq_favorites";
const FONT_MIN = 13;
const FONT_MAX = 24;
const FONT_DEFAULT = 17;

const cardShadow = "shadow-[0_8px_30px_rgba(16,42,116,0.06)]";
const card = clsx("bg-white rounded-[18px] border border-[#EEF2FA]", cardShadow);

const withMedia = (html = "") => html.split("{{MEDIA}}").join(MEDIA_URL);

const fileUrl = (name) => (name ? `${MEDIA_URL}${name}` : null);

const formatDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

const splitDesignation = (designation = "") => {
  const match = designation.match(/^\s*(ШНҚ|ШНК|ҚМҚ|SHNQ|QMQ|ShNQ)\s*(.*)$/i);
  if (!match) return { label: "", number: designation };
  const isQmq = /ҚМҚ|QMQ/i.test(match[1]);
  return { label: isQmq ? "QMQ" : "SHNQ", number: match[2] };
};

// Hujjat tillari: uz — o'zbek (lotin), kr — o'zbek (kirill), ru — rus
const DOC_LANGS = [
  { id: "uz", label: "O'zbekcha", short: "UZ" },
  { id: "kr", label: "Ўзбекча", short: "ЎЗ" },
  { id: "ru", label: "Русский", short: "RU" },
];
const DOC_LANG_IDS = DOC_LANGS.map((l) => l.id);

// Sayt tiliga qarab qaysi hujjat tili birinchi ochiladi
const preferredLangs = (siteLang) => (siteLang === "ru" ? "ru,kr,uz" : "uz,kr,ru");

// Hujjat tilidagi matnlar (lex.uz dagi kabi)
const DOC_TEXTS = {
  uz: {
    prev: "Oldingi tahrirga qarang",
    hidePrev: "Oldingi tahrirni yashirish",
    hide: "Yashirish",
    until: (d) => `${d} gacha amalda bo'lgan tahrir`,
    change: (d) => `${d} dagi o'zgartirish`,
    added: (s) => `(${s} bilan to'ldirilgan)`,
    removed: (s) => `(${s} bilan chiqarilgan)`,
    changed: (s) => `(${s} tahririda)`,
  },
  kr: {
    prev: "Олдинги таҳрирга қаранг",
    hidePrev: "Олдинги таҳрирни яшириш",
    hide: "Яшириш",
    until: (d) => `${d} гача амалда бўлган таҳрир`,
    change: (d) => `${d} даги ўзгартириш`,
    added: (s) => `(${s} билан тўлдирилган)`,
    removed: (s) => `(${s} билан чиқарилган)`,
    changed: (s) => `(${s} таҳририда)`,
  },
  ru: {
    prev: "См. предыдущую редакцию",
    hidePrev: "Скрыть предыдущую редакцию",
    hide: "Скрыть",
    until: (d) => `Редакция, действовавшая до ${d}`,
    change: (d) => `изменения от ${d}`,
    added: (s) => `(дополнен ${s})`,
    removed: (s) => `(исключен ${s})`,
    changed: (s) => `(в редакции ${s})`,
  },
};

// Tahrir tarixidan lex.uz dagi kabi izoh matni
const historyNote = (entry, lang) => {
  const tx = DOC_TEXTS[lang] || DOC_TEXTS.uz;
  const source = entry.note || tx.change(formatDate(entry.date));
  if (entry.kind === "added") return tx.added(source);
  if (entry.kind === "removed") return tx.removed(source);
  return tx.changed(source);
};

const Index = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { id } = router.query;
  const queryLang = DOC_LANG_IDS.includes(router.query.lang) ? router.query.lang : null;
  const prefer = preferredLangs(i18n.language);
  const queryEdition = router.query.edition || null;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(FONT_DEFAULT);
  const [tocQuery, setTocQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [openPrev, setOpenPrev] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tocOpenMobile, setTocOpenMobile] = useState(false);
  const contentRef = useRef(null);
  const menuRef = useRef(null);

  // ---------- ma'lumotni olish ----------
  useEffect(() => {
    if (!router.isReady || !id) return;
    const params = new URLSearchParams();
    if (queryLang) params.set("lang", queryLang);
    else params.set("prefer", prefer); // til tanlanmagan — sayt tiliga mosini ochamiz
    if (queryEdition) params.set("edition", queryEdition);
    setLoading(true);
    setError(null);
    axios
      .get(`${API}shnq/${id}/?${params.toString()}`)
      .then(({ data: result }) => {
        setData(result);
        setOpenPrev({});
      })
      .catch((err) => {
        setError(
          err?.response?.status === 404
            ? "Hujjat topilmadi"
            : "Ma'lumotlarni yuklab bo'lmadi"
        );
      })
      .finally(() => setLoading(false));
  }, [router.isReady, id, queryLang, queryEdition, prefer]);

  useEffect(() => {
    if (!data) return;
    try {
      const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      setIsFavorite(saved.includes(data.designation));
    } catch (e) {
      setIsFavorite(false);
    }
  }, [data]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const content = data?.content || null;
  const edition = content?.edition || null;
  const docLang = edition?.lang || queryLang || prefer.split(",")[0];
  const tx = DOC_TEXTS[docLang] || DOC_TEXTS.uz;
  const blocks = useMemo(() => content?.blocks || [], [content]);
  const toc = useMemo(() => content?.toc || [], [content]);
  const editionsInLang = useMemo(
    () => (data?.editions || []).filter((e) => e.lang === docLang),
    [data, docLang]
  );
  const pdfName = data ? (docLang === "ru" ? data.pdf_ru || data.pdf_uz : data.pdf_uz || data.pdf_ru) : null;
  const isLexUrl = !!data?.url && data.url.includes("lex.uz");

  // ---------- mundarija: faol bo'limni kuzatish ----------
  useEffect(() => {
    if (!toc.length || !contentRef.current) return;
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" }
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  const filteredToc = useMemo(() => {
    const q = tocQuery.trim().toLowerCase();
    if (!q) return toc;
    return toc.filter((item) => item.text.toLowerCase().includes(q));
  }, [toc, tocQuery]);

  const flash = (el) => {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("lex-flash");
    setTimeout(() => el.classList.remove("lex-flash"), 1800);
  };

  const scrollToBlock = (blockId) => {
    flash(document.getElementById(blockId));
    setTocOpenMobile(false);
  };

  // Hujjat ichidagi havolalar ("3-bobiga" va h.k.)
  const onContentClick = useCallback((e) => {
    const link = e.target.closest && e.target.closest("a[data-anchor]");
    if (!link) return;
    e.preventDefault();
    const target = contentRef.current?.querySelector(
      `[data-anchor="${link.getAttribute("data-anchor")}"].lex-block`
    );
    flash(target);
  }, []);

  // ---------- amallar ----------
  const setQuery = (patch) => {
    const query = { ...router.query, ...patch };
    Object.keys(query).forEach((k) => (query[k] == null || query[k] === "") && delete query[k]);
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
  };

  const selectEdition = (editionId, isLatest) => {
    setQuery({ edition: isLatest ? null : String(editionId) });
  };

  const switchLang = (lang) => setQuery({ lang, edition: null });

  const toggleFavorite = () => {
    if (!data) return;
    try {
      const saved = new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"));
      if (saved.has(data.designation)) saved.delete(data.designation);
      else saved.add(data.designation);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(saved)));
      setIsFavorite(saved.has(data.designation));
      toast.success(saved.has(data.designation) ? "Sevimlilarga qo'shildi" : "Sevimlilardan olib tashlandi");
    } catch (e) {
      toast.error("Saqlab bo'lmadi");
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: data?.designation, url });
        return;
      } catch (e) {
        // foydalanuvchi bekor qildi — nusxalashga o'tamiz
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Havola nusxalandi");
    }
  };

  const download = (name) => {
    const url = fileUrl(name);
    if (!url) return;
    axios.post(`${API}shnq/${id}/download/`).catch(() => {});
    window.open(url, "_blank", "noopener");
  };

  const togglePrev = (blockId) =>
    setOpenPrev((prev) => ({ ...prev, [blockId]: !prev[blockId] }));

  // ---------- bloklarni chizish ----------
  const renderBlock = (block) => {
    const hist = block.hist || [];
    const prevEntries = hist.filter((h) => h.prev).slice().reverse();
    const sourceNotes = block.notes || [];
    const generatedNotes = sourceNotes.length
      ? []
      : hist.filter((h) => h.kind !== "removed").map((h) => historyNote(h, docLang));
    const isOpen = !!openPrev[block.id];

    if (block.t === "removed") {
      const entry = hist[0] || {};
      return (
        <div key={block.id} id={block.id} className={"lex-block lex-removed scroll-mt-28"}>
          <p className={"lex-note !m-0 !indent-0"}>{historyNote(entry, docLang)}</p>
          <button type={"button"} className={"lex-prev-link"} onClick={() => togglePrev(block.id)}>
            {isOpen ? tx.hide : tx.prev}
          </button>
          {isOpen && (
            <div className={"lex-prev-box"} dangerouslySetInnerHTML={{ __html: withMedia(block.html) }} />
          )}
        </div>
      );
    }

    let body;
    if (block.t === "h") {
      const Tag = block.lvl === 1 ? "h2" : "h3";
      body = (
        <Tag
          className={clsx("lex-h", `lvl${block.lvl || 1}`)}
          dangerouslySetInnerHTML={{ __html: withMedia(block.html) }}
        />
      );
    } else if (block.t === "table") {
      body = (
        <div className={"lex-table-wrap"} dangerouslySetInnerHTML={{ __html: withMedia(block.html) }} />
      );
    } else {
      body = (
        <p
          className={clsx("lex-p", block.cls)}
          data-align={block.align}
          dangerouslySetInnerHTML={{ __html: withMedia(block.html) }}
        />
      );
    }

    return (
      <div
        key={block.id}
        id={block.id}
        data-anchor={block.anchor || undefined}
        className={"lex-block scroll-mt-28"}
      >
        {prevEntries.length > 0 ? (
          <button type={"button"} className={"lex-prev-link print:hidden"} onClick={() => togglePrev(block.id)}>
            <HistoryIcon className={"w-[15px] h-[15px]"} />
            {isOpen ? tx.hidePrev : tx.prev}
          </button>
        ) : (
          block.lexprev &&
          isLexUrl && (
            <a href={data.url} target={"_blank"} rel={"noopener noreferrer"} className={"lex-prev-link print:hidden"}>
              <HistoryIcon className={"w-[15px] h-[15px]"} />
              {tx.prev} (lex.uz)
            </a>
          )
        )}
        {isOpen &&
          prevEntries.map((entry, idx) => (
            <div key={idx} className={"lex-prev-box"}>
              <p className={"text-[12px] font-semibold not-italic text-[#B78100] mb-1"}>
                {tx.until(formatDate(entry.date))}
              </p>
              <div dangerouslySetInnerHTML={{ __html: withMedia(entry.prev) }} />
            </div>
          ))}
        {body}
        {sourceNotes.map((note, idx) => (
          <p key={`n${idx}`} className={"lex-note"} dangerouslySetInnerHTML={{ __html: withMedia(note) }} />
        ))}
        {generatedNotes.map((note, idx) => (
          <p key={`g${idx}`} className={"lex-note"}>
            {note}
          </p>
        ))}
      </div>
    );
  };

  // ---------- holatlar ----------
  if (loading && !data) {
    return (
      <Main>
        <Menu />
        <div className={"max-w-[1536px] mx-auto px-5 lg:px-[55px] py-10"}>
          <div className={clsx(card, "p-6")}>
            <ContentLoader />
          </div>
        </div>
      </Main>
    );
  }

  if (error || !data) {
    return (
      <Main>
        <Menu />
        <div className={"max-w-[1536px] mx-auto px-5 lg:px-[55px] py-16"}>
          <div className={clsx(card, "p-12 text-center")}>
            <FileTextIcon className={"w-12 h-12 mx-auto text-[#8A95B0]"} />
            <h1 className={"mt-4 text-[20px] font-bold text-[#0B1A4F]"}>{error || "Hujjat topilmadi"}</h1>
            <Link href={"/shnq"} className={"inline-block mt-5 text-[14px] font-medium text-[#1D5BE8]"}>
              ← SHNQ ro&apos;yxatiga qaytish
            </Link>
          </div>
        </div>
      </Main>
    );
  }

  const { label, number } = splitDesignation(data.designation);
  const title = (docLang === "ru" ? data.name_ru || data.name_uz : data.name_uz || data.name_ru) || "";
  const groupTitle = data.group ? (docLang === "ru" ? data.group.title_ru || data.group.title_uz : data.group.title_uz) : null;
  const available = data.languages || [];
  const isOld = content && !content.is_latest;
  const latestInLang = editionsInLang[editionsInLang.length - 1];

  const actionBtn =
    "h-[40px] px-4 rounded-[12px] flex items-center gap-x-2 text-[14px] font-medium transition-colors";

  const tocList = (
    <>
      <div className={"relative mt-4"}>
        <SearchIcon className={"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A95B0]"} />
        <input
          type={"text"}
          value={tocQuery}
          onChange={(e) => setTocQuery(e.target.value)}
          placeholder={"Bo'limlarda qidirish..."}
          className={
            "w-full h-[40px] pl-9 pr-3 rounded-[10px] border border-[#DCE3F0] text-[13px] outline-none focus:border-[#1D5BE8]"
          }
        />
      </div>
      <ul className={"mt-3 space-y-1 max-h-[calc(100vh-260px)] overflow-y-auto pr-1"}>
        {filteredToc.length === 0 && <li className={"px-3 py-2 text-[13px] text-[#8A95B0]"}>Bo&apos;lim topilmadi</li>}
        {filteredToc.map((item) => (
          <li key={item.id}>
            <button
              type={"button"}
              onClick={() => scrollToBlock(item.id)}
              className={clsx(
                "w-full flex items-center gap-2 rounded-[10px] py-2 pr-2 text-left text-[13px] leading-[1.35] transition-colors",
                item.lvl === 1 ? "pl-3" : "pl-6 text-[12.5px]",
                activeId === item.id
                  ? "bg-[#EEF4FF] text-[#1D5BE8] font-semibold shadow-[inset_3px_0_0_#1D5BE8]"
                  : "text-[#1E2B5A] hover:bg-[#F5F8FF]"
              )}
            >
              <span className={"flex-1 line-clamp-2"}>{item.text}</span>
              <ChevronRightIcon className={"w-3.5 h-3.5 shrink-0 text-[#8A95B0]"} />
            </button>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <Main>
      <Head>
        <title>{`${data.designation} — ${title}`}</title>
      </Head>
      <style>{`@media print {
        body * { visibility: hidden !important; }
        #shnq-print, #shnq-print * { visibility: visible !important; }
        #shnq-print { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; box-shadow: none !important; border: 0 !important; }
      }`}</style>
      <Menu />

      <div className={"font-jakarta bg-[#F6F9FF] text-[#0B1A4F] pb-16"}>
        {/* HEADER */}
        <section className={"relative overflow-hidden bg-gradient-to-r from-white via-[#F7FAFF] to-[#EAF1FF]"}>
          <div className={"relative max-w-[1536px] mx-auto px-5 lg:px-[55px] pt-6 pb-7"}>
            <nav className={"flex flex-wrap items-center gap-x-2 text-[13px] text-[#5B6788]"}>
              <Link href={"/"} className={"hover:text-[#1D5BE8]"}>Bosh sahifa</Link>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />
              <Link href={"/shnq"} className={"hover:text-[#1D5BE8]"}>Me&apos;yoriy hujjatlar</Link>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />
              <Link href={"/shnq"} className={"hover:text-[#1D5BE8]"}>{label || "SHNQ"}</Link>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />
              <span className={"text-[#0B1A4F]"}>{number}</span>
            </nav>

            <div className={"mt-5 flex flex-col xl:flex-row xl:items-start gap-5"}>
              <div className={"flex items-start gap-4 flex-1 min-w-0"}>
                <div className={clsx("w-[64px] h-[64px] md:w-[76px] md:h-[76px] shrink-0 rounded-[18px] bg-white flex items-center justify-center", cardShadow)}>
                  <div className={"w-[44px] h-[44px] md:w-[52px] md:h-[52px] rounded-[14px] bg-[#E8F0FE] text-[#1D5BE8] flex items-center justify-center"}>
                    <FileTextIcon className={"w-7 h-7"} />
                  </div>
                </div>
                <div className={"min-w-0"}>
                  <div className={"flex flex-wrap items-center gap-3"}>
                    <p className={"text-[20px] md:text-[22px] font-bold"}>
                      {label} <span className={"text-[#1D5BE8]"}>{number}</span>
                    </p>
                    {data.status ? (
                      <span className={"px-2.5 py-[3px] rounded-md text-[12px] bg-[#E6F6EC] text-[#1E9E62]"}>Amalda</span>
                    ) : (
                      <span className={"px-2.5 py-[3px] rounded-md text-[12px] bg-[#FDECEC] text-[#E5484D]"}>Bekor qilingan</span>
                    )}
                  </div>
                  <h1 className={"mt-1 text-[22px] md:text-[28px] leading-[1.25] font-extrabold tracking-[-0.01em]"}>{title}</h1>
                  {groupTitle && <p className={"mt-1 text-[15px] md:text-[17px] text-[#5B6788]"}>{groupTitle}</p>}
                  <div className={"mt-4 flex flex-wrap gap-2"}>
                    {[
                      label && { key: "type", text: label },
                      edition && { key: "date", text: formatDate(edition.date), Icon: CalendarIcon },
                      content && { key: "lang", text: DOC_LANGS.find((l) => l.id === docLang)?.label, Icon: GlobeIcon },
                      { key: "views", text: (data.views || 0).toLocaleString("ru-RU"), Icon: EyeIcon },
                    ]
                      .filter(Boolean)
                      .map(({ key, text, Icon }) => (
                        <span key={key} className={"h-[34px] px-3 rounded-[10px] bg-white border border-[#E3E9F5] flex items-center gap-2 text-[13px] text-[#1E2B5A]"}>
                          {Icon && <Icon className={"w-4 h-4 text-[#5B6788]"} />}
                          {text}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className={"flex items-center gap-2 shrink-0"}>
                <button type={"button"} onClick={toggleFavorite} className={clsx(actionBtn, "bg-white border border-[#E3E9F5] hover:bg-[#F5F8FF]")}>
                  <StarIcon className={clsx("w-5 h-5", isFavorite ? "text-[#F5B400]" : "text-[#1D5BE8]")} filled={isFavorite} />
                  <span className={"hidden sm:inline"}>{isFavorite ? "Saqlangan" : "Sevimlilarga qo'shish"}</span>
                </button>
                <button type={"button"} onClick={share} className={clsx(actionBtn, "bg-white border border-[#E3E9F5] hover:bg-[#F5F8FF]")}>
                  <ShareIcon className={"w-5 h-5 text-[#1D5BE8]"} />
                  <span className={"hidden sm:inline"}>Ulashish</span>
                </button>
                <div className={"relative"} ref={menuRef}>
                  <button
                    type={"button"}
                    onClick={() => setMenuOpen((v) => !v)}
                    className={"w-[40px] h-[40px] rounded-[12px] bg-white border border-[#E3E9F5] flex items-center justify-center hover:bg-[#F5F8FF]"}
                  >
                    <MoreVerticalIcon className={"w-5 h-5"} />
                  </button>
                  {menuOpen && (
                    <ul className={"absolute right-0 top-full mt-1 z-30 w-[220px] bg-white rounded-xl border border-[#EEF2FA] shadow-[0_12px_32px_rgba(16,42,116,0.14)] p-1.5"}>
                      {isLexUrl && (
                        <li>
                          <a href={data.url} target={"_blank"} rel={"noopener noreferrer"} className={"flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] hover:bg-[#EEF4FF]"}>
                            <ExternalLinkIcon className={"w-4 h-4"} /> Lex.uz&apos;da ochish
                          </a>
                        </li>
                      )}
                      {pdfName && (
                        <li>
                          <button type={"button"} onClick={() => download(pdfName)} className={"w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-left hover:bg-[#EEF4FF]"}>
                            <FileTextIcon className={"w-4 h-4"} /> PDF variantini ochish
                          </button>
                        </li>
                      )}
                      <li>
                        <button
                          type={"button"}
                          onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                            toast.success("Havola nusxalandi");
                            setMenuOpen(false);
                          }}
                          className={"w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-left hover:bg-[#EEF4FF]"}
                        >
                          <LinkIcon className={"w-4 h-4"} /> Havolani nusxalash
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className={"max-w-[1536px] mx-auto px-3 md:px-5 lg:px-[55px] mt-2"}>
          <div className={"flex flex-col lg:flex-row gap-5 items-start"}>
            {/* Mundarija */}
            {toc.length > 0 && (
              <aside className={"w-full lg:w-[300px] shrink-0 lg:sticky lg:top-4"}>
                <div className={clsx(card, "p-4 lg:p-5")}>
                  <button
                    type={"button"}
                    onClick={() => setTocOpenMobile((v) => !v)}
                    className={"w-full flex items-center gap-3 text-[16px] font-bold text-left lg:cursor-default"}
                  >
                    <FileTextIcon className={"w-6 h-6 text-[#1D5BE8]"} />
                    <span className={"flex-1"}>Hujjat bo&apos;limlari</span>
                    <span className={"px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[12px] font-medium text-[#1D5BE8]"}>{toc.length}</span>
                    <ChevronDownIcon className={clsx("w-5 h-5 lg:hidden transition-transform", tocOpenMobile && "rotate-180")} />
                  </button>
                  <div className={clsx(tocOpenMobile ? "block" : "hidden", "lg:block")}>{tocList}</div>
                </div>
              </aside>
            )}

            {/* Matn */}
            <div className={"flex-1 min-w-0 w-full"}>
              <div className={clsx(card, "overflow-hidden")}>
                {/* Hujjat tili: mavjud bo'lmagan til nofaol turadi */}
                {available.length > 0 && (
                <div className={"flex items-center gap-1 px-3 md:px-4 pt-3 border-b border-[#EEF2FA] overflow-x-auto"}>
                  <GlobeIcon className={"w-5 h-5 mr-1 shrink-0 text-[#8A95B0]"} />
                  {DOC_LANGS.map((l) => {
                    const exists = available.includes(l.id);
                    const active = content && docLang === l.id;
                    return (
                      <button
                        key={l.id}
                        type={"button"}
                        disabled={!exists || active}
                        onClick={() => switchLang(l.id)}
                        title={exists ? l.label : "Bu tilda hali mavjud emas"}
                        className={clsx(
                          "relative shrink-0 h-[42px] px-4 text-[14px] font-semibold transition-colors",
                          active
                            ? "text-[#1D5BE8] after:absolute after:left-2 after:right-2 after:-bottom-px after:h-[3px] after:rounded-full after:bg-[#1D5BE8]"
                            : exists
                            ? "text-[#1E2B5A] hover:text-[#1D5BE8]"
                            : "text-[#C3CAD9] cursor-not-allowed"
                        )}
                      >
                        {l.label}
                        {!exists && <span className={"ml-1.5 text-[11px] font-medium"}>— yo&apos;q</span>}
                      </button>
                    );
                  })}
                </div>
                )}
                <div className={"flex flex-wrap items-center gap-3 px-4 md:px-5 py-3 border-b border-[#EEF2FA]"}>
                  <div className={"flex items-center gap-2 text-[13px] text-[#5B6788]"}>
                    Matn o&apos;lchami:
                    <div className={"flex items-center rounded-[10px] border border-[#E3E9F5]"}>
                      <button type={"button"} onClick={() => setFontSize((s) => Math.max(FONT_MIN, s - 1))} className={"w-8 h-8 flex items-center justify-center hover:bg-[#F5F8FF] rounded-l-[10px]"} aria-label={"Kichraytirish"}>
                        <MinusIcon className={"w-4 h-4"} />
                      </button>
                      <button type={"button"} onClick={() => setFontSize(FONT_DEFAULT)} className={"w-8 h-8 font-semibold text-[#0B1A4F]"} title={"Asl o'lcham"}>A</button>
                      <button type={"button"} onClick={() => setFontSize((s) => Math.min(FONT_MAX, s + 1))} className={"w-8 h-8 flex items-center justify-center hover:bg-[#F5F8FF] rounded-r-[10px]"} aria-label={"Kattalashtirish"}>
                        <PlusIcon className={"w-4 h-4"} />
                      </button>
                    </div>
                  </div>

                  {editionsInLang.length > 1 && (
                    <div className={"relative"}>
                      <select
                        value={edition?.id || ""}
                        onChange={(e) => {
                          const eid = Number(e.target.value);
                          selectEdition(eid, eid === latestInLang?.id);
                        }}
                        className={"appearance-none h-8 pl-3 pr-8 rounded-[10px] border border-[#E3E9F5] bg-white text-[13px] outline-none cursor-pointer"}
                      >
                        {editionsInLang
                          .slice()
                          .reverse()
                          .map((e) => (
                            <option key={e.id} value={e.id}>
                              {formatDate(e.date)} {e.id === latestInLang?.id ? "(amaldagi)" : e.stats?.original ? "(asl tahrir)" : ""}
                            </option>
                          ))}
                      </select>
                      <ChevronDownIcon className={"absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"} />
                    </div>
                  )}

                  {/* Amallar */}
                  <div className={"flex flex-wrap items-center gap-2 ml-auto"}>
                    {pdfName && (
                      <button type={"button"} onClick={() => download(pdfName)} className={"h-9 px-4 rounded-[10px] bg-[#1D5BE8] text-white text-[13px] font-semibold flex items-center gap-2 hover:bg-[#174FD0]"}>
                        <DownloadIcon className={"w-4 h-4"} /> PDF yuklab olish
                      </button>
                    )}
                    {edition?.file && (
                      <button type={"button"} onClick={() => download(edition.file)} className={clsx("h-9 px-4 rounded-[10px] text-[13px] font-semibold flex items-center gap-2", pdfName ? "bg-[#EEF4FF] text-[#1D5BE8] hover:bg-[#DCE7FF]" : "bg-[#1D5BE8] text-white hover:bg-[#174FD0]")}>
                        <DownloadIcon className={"w-4 h-4"} /> Word yuklab olish
                      </button>
                    )}
                    {content && (
                      <button type={"button"} onClick={() => window.print()} className={"h-9 px-4 rounded-[10px] bg-[#EEF4FF] text-[#1D5BE8] text-[13px] font-semibold flex items-center gap-2 hover:bg-[#DCE7FF]"}>
                        <PrinterIcon className={"w-4 h-4"} /> Chop etish
                      </button>
                    )}
                  </div>
                </div>

                {isOld && (
                  <div className={"mx-4 md:mx-6 mt-4 rounded-[12px] bg-[#FFF6DB] border border-[#F5DC8A] px-4 py-3 flex flex-wrap items-center gap-3 text-[14px] text-[#7A5A00]"}>
                    <HistoryIcon className={"w-5 h-5"} />
                    <span className={"flex-1"}>
                      Siz hujjatning <b>{formatDate(edition.date)}</b> dagi tahririni ko&apos;ryapsiz.
                    </span>
                    <button type={"button"} onClick={() => selectEdition(latestInLang.id, true)} className={"px-3 py-1.5 rounded-lg bg-white text-[13px] font-semibold text-[#1D5BE8]"}>
                      Amaldagi tahririga o&apos;tish
                    </button>
                  </div>
                )}

                <div id={"shnq-print"} className={clsx("px-4 md:px-10 xl:px-14 py-6 md:py-8 transition-opacity", loading && "opacity-50")}>
                  {content ? (
                    <div ref={contentRef} className={"lex-doc"} style={{ fontSize: `${fontSize}px` }} onClick={onContentClick}>
                      {blocks.map(renderBlock)}
                    </div>
                  ) : pdfName ? (
                    <iframe title={data.designation} src={fileUrl(pdfName)} className={"w-full h-[80vh] rounded-[12px] border border-[#EEF2FA]"} />
                  ) : (
                    <div className={"py-16 text-center"}>
                      <FileTextIcon className={"w-12 h-12 mx-auto text-[#8A95B0]"} />
                      <p className={"mt-4 text-[16px] font-semibold"}>Hujjat matni hali joylanmagan</p>
                      {isLexUrl && (
                        <a href={data.url} target={"_blank"} rel={"noopener noreferrer"} className={"inline-flex items-center gap-2 mt-4 text-[14px] font-medium text-[#1D5BE8]"}>
                          <ExternalLinkIcon className={"w-4 h-4"} /> Lex.uz&apos;da ochish
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </Main>
  );
};

export default Index;
