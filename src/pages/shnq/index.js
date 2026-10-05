import React, { useEffect, useMemo, useRef, useState } from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import ContentLoader from "@/components/loader/content-loader";
import { Checkbox, CountBadge } from "@/components/filter-controls";
import {
  BuildingsIcon,
  BusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileSearchIcon,
  FileTextIcon,
  FilterIcon,
  GridIcon,
  HomesIcon,
  LayersIcon,
  LeafIcon,
  LinkIcon,
  ListIcon,
  MoreVerticalIcon,
  SearchIcon,
  StarIcon,
  TrashIcon,
  UsersIcon,
} from "@/components/icons/docs";

const MEDIA_URL = "https://main.tmsiti.uz/media/";

const documentTypes = [
  { id: "shnq", label: "SHNQ" },
  { id: "qmq", label: "QMQ" },
  { id: "boshqa", label: "Boshqa" },
];

const subsystems = [
  { id: "1", label: "Tashkiliy va uslubiy normalar" },
  { id: "2", label: "Texnik loyihalash me'yorlari" },
  { id: "3", label: "Tashkil etish qoidalari va texnologiyasi" },
];

// Sektor API'da yo'q — guruh nomi va hujjat nomidagi kalit so'zlar orqali aniqlanadi
const sectors = [
  {
    id: "qurilish",
    label: "Qurilish",
    pattern: /қурилиш|строител/i,
    Icon: BuildingsIcon,
    iconClass: "bg-[#FDECEC] text-[#E5484D]",
  },
  {
    id: "turar_joy",
    label: "Turar joy",
    pattern: /турар\s*жой|жил(ой|ых|ищ)/i,
    Icon: HomesIcon,
    iconClass: "bg-[#F1ECFD] text-[#7C5CE0]",
  },
  {
    id: "ekologiya",
    label: "Ekologiya",
    pattern: /эколог|атроф[- ]муҳит|муҳофаза|окружающ/i,
    Icon: LeafIcon,
    iconClass: "bg-[#E6F6EC] text-[#22A35B]",
  },
  {
    id: "shaharsozlik",
    label: "Shaharsozlik",
    pattern: /шаҳарсозлик|шахарсозлик|градостро/i,
    Icon: BuildingsIcon,
    iconClass: "bg-[#FFF1E4] text-[#F08A24]",
  },
  {
    id: "transport",
    label: "Transport",
    pattern: /транспорт|йўл|автомобил|кўприк|дорог/i,
    Icon: BusIcon,
    iconClass: "bg-[#E8F0FE] text-[#2B5CD9]",
  },
];

const sortOptions = [
  { id: "relevance", label: "Relevantlik bo'yicha" },
  { id: "newest", label: "Avval yangilari" },
  { id: "oldest", label: "Avval eskilari" },
  { id: "code", label: "Shifr bo'yicha" },
];

const getDocType = (designation = "") => {
  if (/ШНҚ|ШНК|SHNQ/i.test(designation)) return "shnq";
  if (/ҚМҚ|QMQ/i.test(designation)) return "qmq";
  return "boshqa";
};

const splitDesignation = (designation = "") => {
  const match = designation.match(/^\s*(ШНҚ|ШНК|ҚМҚ|SHNQ|QMQ)\s*(.*)$/i);
  if (!match) return { label: "", number: designation };
  const type = getDocType(match[1]);
  return { label: type === "qmq" ? "QMQ" : "SHNQ", number: match[2] };
};

const getYear = (designation = "") => {
  const match = designation.match(/-(\d{2}|\d{4})\s*\*?\s*$/);
  if (!match) return null;
  const value = Number(match[1]);
  if (match[1].length === 4) return value;
  return value >= 50 ? 1900 + value : 2000 + value;
};

const getSectors = (doc, groupTitle = "") => {
  const text = `${groupTitle} ${doc.name_uz || ""} ${doc.name_ru || ""}`;
  return sectors.filter((s) => s.pattern.test(text)).map((s) => s.id);
};

const getPdfUrl = (doc) =>
  doc.pdf_uz
    ? `${MEDIA_URL}${doc.pdf_uz}`
    : doc.pdf_ru
    ? `${MEDIA_URL}${doc.pdf_ru}`
    : null;

const isSrnDoc = (doc) => !!doc.url && doc.url.includes("tmsiti.uz/srn");
const isLexDoc = (doc) => !!doc.url && doc.url.includes("lex.uz");

const countDocs = (items = []) =>
  items.reduce(
    (sum, item) =>
      sum +
      (item.groups || []).reduce(
        (acc, group) => acc + (group.documents || []).length,
        0
      ),
    0
  );

const filterDocs = (items, predicate) =>
  items
    .map((item) => {
      const groups = (item.groups || [])
        .map((group) => {
          const documents = (group.documents || []).filter((doc) =>
            predicate(doc, group)
          );
          return documents.length > 0 ? { ...group, documents } : null;
        })
        .filter(Boolean);
      return groups.length > 0 ? { ...item, groups } : null;
    })
    .filter(Boolean);

const cardShadow = "shadow-[0_8px_30px_rgba(16,42,116,0.06)]";

const Index = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("yangi");
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("relevance");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [dataShnq, setDataShnq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openItems, setOpenItems] = useState({});
  const [openGroups, setOpenGroups] = useState({});
  const [openActions, setOpenActions] = useState(null);
  const actionsRef = useRef(null);
  const [selectedFilters, setSelectedFilters] = useState({
    hujjatTurlari: [],
    quyiTizimlar: [],
    sektorlar: [],
  });

  const isFourthSectionTitle = (title = "") => /^\s*0?4\s*[-–.]/.test(title);

  // LocalStorage'dan saqlangan hujjatlarni olish
  useEffect(() => {
    const savedFavorites = localStorage.getItem("shnq_favorites");
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  useEffect(() => {
    fetch("https://shnk.tmsiti.uz/subsystems/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ma'lumotlarni yuklab bo'lmadi");
        }
        return response.json();
      })
      .then((result) => {
        setDataShnq(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Amallar menyusini tashqariga bosilganda yopish
  useEffect(() => {
    const onClick = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setOpenActions(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const baseData = useMemo(
    () =>
      (dataShnq || []).filter(
        (item) => !isFourthSectionTitle(item?.title || "")
      ),
    [dataShnq]
  );

  const stats = useMemo(() => {
    const allDocs = baseData.flatMap((item) =>
      (item.groups || []).flatMap((group) =>
        (group.documents || []).map((doc) => ({ doc, group }))
      )
    );
    const typeCounts = {};
    const sectorCounts = {};
    allDocs.forEach(({ doc, group }) => {
      const type = getDocType(doc.designation);
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      getSectors(doc, group.title).forEach((id) => {
        sectorCounts[id] = (sectorCounts[id] || 0) + 1;
      });
    });
    const subsystemCounts = {};
    subsystems.forEach(({ id }) => {
      subsystemCounts[id] = countDocs(
        baseData.filter((item) => matchesSubsystem(item, id))
      );
    });
    return {
      total: allDocs.length,
      categories: baseData.reduce(
        (sum, item) => sum + (item.groups || []).length,
        0
      ),
      types: Object.keys(typeCounts).length,
      pdf: allDocs.filter(({ doc }) => getPdfUrl(doc)).length,
      typeCounts,
      sectorCounts,
      subsystemCounts,
    };
  }, [baseData]);

  // Filtrlash, qidirish va saralash
  const filteredData = useMemo(() => {
    let result = baseData;
    const { hujjatTurlari, quyiTizimlar, sektorlar } = selectedFilters;

    if (hujjatTurlari.length > 0) {
      result = filterDocs(result, (doc) =>
        hujjatTurlari.includes(getDocType(doc.designation))
      );
    }

    if (quyiTizimlar.length > 0) {
      result = result.filter((item) => matchesSubsystem(item, quyiTizimlar[0]));
    }

    if (sektorlar.length > 0) {
      result = filterDocs(result, (doc, group) =>
        getSectors(doc, group.title).some((id) => sektorlar.includes(id))
      );
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = filterDocs(
        result,
        (doc) =>
          (doc.name_uz && doc.name_uz.toLowerCase().includes(query)) ||
          (doc.name_ru && doc.name_ru.toLowerCase().includes(query)) ||
          (doc.designation && doc.designation.toLowerCase().includes(query))
      );
    }

    // "Saqlanganlar" rejimida faqat saqlangan hujjatlar
    if (activeTab === "mening") {
      result = filterDocs(result, (doc) => favorites.has(doc.designation));
    }

    if (sortBy !== "relevance") {
      const compare = {
        newest: (a, b) =>
          (getYear(b.designation) || 0) - (getYear(a.designation) || 0),
        oldest: (a, b) =>
          (getYear(a.designation) || 9999) - (getYear(b.designation) || 9999),
        code: (a, b) =>
          (a.designation || "").localeCompare(b.designation || "", undefined, {
            numeric: true,
          }),
      }[sortBy];
      result = result.map((item) => ({
        ...item,
        groups: (item.groups || []).map((group) => ({
          ...group,
          documents: [...(group.documents || [])].sort(compare),
        })),
      }));
    }

    return result;
  }, [baseData, selectedFilters, searchQuery, activeTab, favorites, sortBy]);

  const toggleFavorite = (designation, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(designation)) {
        newFavorites.delete(designation);
      } else {
        newFavorites.add(designation);
      }
      localStorage.setItem(
        "shnq_favorites",
        JSON.stringify(Array.from(newFavorites))
      );
      return newFavorites;
    });
  };

  const clearAllFavorites = () => {
    if (window.confirm("Hamma saqlangan hujjatlarni o'chirishni istaysizmi?")) {
      setFavorites(new Set());
      localStorage.removeItem("shnq_favorites");
    }
  };

  const extractNumberFromDesignation = (designation) => {
    if (!designation) return "";
    return designation.replace(/[ШНҚShNQSHNQШНК\s]/gi, "").trim();
  };

  const handleNavigateToSRN = (designation) => {
    const numberOnly = extractNumberFromDesignation(designation);
    if (numberOnly) {
      router.push(`/srn?highlight=${numberOnly}`);
    }
  };

  const handleView = (doc) => {
    if (isSrnDoc(doc)) {
      handleNavigateToSRN(doc.designation);
      return;
    }
    // Hujjat sahifasi: lex.uz ko'rinishidagi matn (yoki matn bo'lmasa PDF)
    if (doc.id) {
      router.push(`/shnq/${doc.id}`);
      return;
    }
    const fileUrl = getPdfUrl(doc);
    if (fileUrl) window.open(fileUrl, "_blank");
  };

  const handleDownload = (doc) => {
    if (isSrnDoc(doc)) {
      handleNavigateToSRN(doc.designation);
      return;
    }
    const fileUrl = getPdfUrl(doc);
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "";
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const copyLink = (doc) => {
    const fileUrl = getPdfUrl(doc) || doc.url;
    if (fileUrl && navigator.clipboard) navigator.clipboard.writeText(fileUrl);
    setOpenActions(null);
  };

  const isViewDisabled = (doc) => !isSrnDoc(doc) && !doc.id && !getPdfUrl(doc);

  // openItems/openGroups: true — yopiq
  const toggleItem = (index) => {
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleGroup = (itemIndex, groupIndex) => {
    setOpenGroups((prev) => ({
      ...prev,
      [`${itemIndex}-${groupIndex}`]: !prev[`${itemIndex}-${groupIndex}`],
    }));
  };

  const handleFilterChange = (category, id) => {
    setSelectedFilters((prev) => {
      if (category === "quyiTizimlar") {
        return { ...prev, [category]: prev[category].includes(id) ? [] : [id] };
      }
      const categoryFilters = prev[category];
      const newFilters = categoryFilters.includes(id)
        ? categoryFilters.filter((item) => item !== id)
        : [...categoryFilters, id];
      return { ...prev, [category]: newFilters };
    });
  };

  const selectSectorChip = (id) => {
    setSelectedFilters((prev) => ({ ...prev, sektorlar: id ? [id] : [] }));
  };

  const clearFilters = () => {
    setSelectedFilters({ hujjatTurlari: [], quyiTizimlar: [], sektorlar: [] });
    setSearchQuery("");
  };

  const isEmptyResult = filteredData.length === 0;

  const heroStats = [
    {
      id: "total",
      value: stats.total,
      label: "Jami hujjatlar",
      Icon: FileTextIcon,
      iconClass: "bg-[#E8F0FE] text-[#2B5CD9]",
    },
    {
      id: "categories",
      value: stats.categories,
      label: "Kategoriya",
      Icon: LayersIcon,
      iconClass: "bg-[#E4F6EC] text-[#1E9E62]",
    },
    {
      id: "types",
      value: stats.types,
      label: "Hujjat turlari",
      Icon: UsersIcon,
      iconClass: "bg-[#EEEAFD] text-[#7C5CE0]",
    },
    {
      id: "pdf",
      value: stats.pdf,
      label: "PDF fayllar",
      Icon: DownloadIcon,
      iconClass: "bg-[#FFEEE4] text-[#F0692A]",
    },
  ];

  const renderActions = (doc, key, compact) => {
    const isFavorite = favorites.has(doc.designation);
    const viewDisabled = isViewDisabled(doc);
    return (
      <div className={"flex items-center gap-2 shrink-0"}>
        <button
          type={"button"}
          onClick={() => handleView(doc)}
          disabled={viewDisabled}
          title={viewDisabled ? "Ko'rish uchun fayl mavjud emas" : "Ko'rish"}
          className={clsx(
            "h-[36px] px-3 rounded-[10px] border flex items-center gap-x-2 text-[13px] font-medium transition-colors",
            viewDisabled
              ? "border-[#EEF1F6] text-[#B8C0D0] cursor-not-allowed"
              : "border-[#E3E9F5] text-[#1D5BE8] hover:bg-[#EEF4FF]"
          )}
        >
          <EyeIcon className={"w-[18px] h-[18px]"} />
          {!compact && <span className={"hidden sm:inline"}>Ko&apos;rish</span>}
        </button>
        <button
          type={"button"}
          onClick={() => handleDownload(doc)}
          disabled={viewDisabled}
          title={viewDisabled ? "Yuklab olish uchun fayl mavjud emas" : "Yuklab olish"}
          className={clsx(
            "h-[36px] px-3 rounded-[10px] border flex items-center gap-x-2 text-[13px] font-medium transition-colors",
            viewDisabled
              ? "border-[#EEF1F6] text-[#B8C0D0] cursor-not-allowed"
              : "border-[#E3E9F5] text-[#1D5BE8] hover:bg-[#EEF4FF]"
          )}
        >
          <DownloadIcon className={"w-[18px] h-[18px]"} />
          {!compact && (
            <span className={"hidden sm:inline"}>Yuklab olish</span>
          )}
        </button>
        {activeTab === "mening" ? (
          <button
            type={"button"}
            onClick={(e) => toggleFavorite(doc.designation, e)}
            title={"Saqlanganlardan o'chirish"}
            className={
              "w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[#E5484D] hover:bg-[#FDECEC] transition-colors"
            }
          >
            <TrashIcon className={"w-[18px] h-[18px]"} />
          </button>
        ) : (
          <button
            type={"button"}
            onClick={(e) => toggleFavorite(doc.designation, e)}
            title={isFavorite ? "Saqlanganlardan o'chirish" : "Saqlash"}
            className={clsx(
              "w-[36px] h-[36px] rounded-[10px] flex items-center justify-center hover:bg-[#F1F4FA] transition-colors",
              isFavorite ? "text-[#F5B400]" : "text-[#8A95B0]"
            )}
          >
            <StarIcon className={"w-5 h-5"} filled={isFavorite} />
          </button>
        )}
        <div
          className={"relative"}
          ref={openActions === key ? actionsRef : null}
        >
          <button
            type={"button"}
            onClick={() => setOpenActions(openActions === key ? null : key)}
            className={
              "w-[28px] h-[36px] rounded-[10px] flex items-center justify-center text-[#0B1A4F] hover:bg-[#F1F4FA] transition-colors"
            }
          >
            <MoreVerticalIcon className={"w-5 h-5"} />
          </button>
          {openActions === key && (
            <ul
              className={
                "absolute right-0 top-full mt-1 z-30 w-[210px] bg-white rounded-xl border border-[#EEF2FA] shadow-[0_12px_32px_rgba(16,42,116,0.14)] p-1.5"
              }
            >
              <li>
                <button
                  type={"button"}
                  disabled={!isLexDoc(doc)}
                  onClick={() => {
                    window.open(doc.url, "_blank");
                    setOpenActions(null);
                  }}
                  className={clsx(
                    "w-full flex items-center gap-x-2 px-3 py-2 rounded-lg text-[13px] text-left",
                    isLexDoc(doc)
                      ? "text-[#0B1A4F] hover:bg-[#EEF4FF]"
                      : "text-[#B8C0D0] cursor-not-allowed"
                  )}
                >
                  <ExternalLinkIcon className={"w-4 h-4"} />
                  Lex.uz&apos;da ochish
                </button>
              </li>
              <li>
                <button
                  type={"button"}
                  onClick={() => copyLink(doc)}
                  className={
                    "w-full flex items-center gap-x-2 px-3 py-2 rounded-lg text-[13px] text-left text-[#0B1A4F] hover:bg-[#EEF4FF]"
                  }
                >
                  <LinkIcon className={"w-4 h-4"} />
                  Havolani nusxalash
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    );
  };

  const renderTags = (doc) => {
    const year = getYear(doc.designation);
    const tagClass = "px-2.5 py-[3px] rounded-md text-[12px]";
    return (
      <div className={"mt-2 flex flex-wrap items-center gap-2"}>
        {doc.status === false ? (
          <span className={clsx(tagClass, "bg-[#FDECEC] text-[#E5484D]")}>
            Bekor qilingan
          </span>
        ) : (
          <span className={clsx(tagClass, "bg-[#E6F6EC] text-[#1E9E62]")}>
            Amalda
          </span>
        )}
        {year && (
          <span className={clsx(tagClass, "bg-[#F1F4FA] text-[#5B6788]")}>
            {year}
          </span>
        )}
        {getPdfUrl(doc) && (
          <span className={clsx(tagClass, "bg-[#F1F4FA] text-[#5B6788]")}>
            PDF
          </span>
        )}
      </div>
    );
  };

  const renderDocument = (doc, key) => {
    const { label, number } = splitDesignation(doc.designation);
    const code = (
      <div
        className={
          "text-[13px] leading-[1.35] font-semibold text-[#0B1A4F] break-words"
        }
      >
        {label && <p>{label}</p>}
        <p>{number}</p>
      </div>
    );
    const icon = (
      <div
        className={
          "w-[40px] h-[40px] shrink-0 rounded-[10px] bg-[#F1F4FA] text-[#5B6788] flex items-center justify-center"
        }
      >
        <FileTextIcon className={"w-5 h-5"} />
      </div>
    );

    if (viewMode === "grid") {
      return (
        <div
          key={key}
          className={
            "flex flex-col rounded-[14px] border border-[#EEF2FA] p-4 hover:border-[#D6E2FB] hover:shadow-[0_8px_24px_rgba(16,42,116,0.08)] transition-all"
          }
        >
          <div className={"flex items-start gap-3"}>
            {icon}
            {code}
          </div>
          <p className={"mt-3 text-[14px] leading-[1.45] text-[#1E2B5A]"}>
            {doc.name_uz}
          </p>
          {renderTags(doc)}
          <div className={"mt-auto pt-4"}>
            {renderActions(doc, key, true)}
          </div>
        </div>
      );
    }

    return (
      <div
        key={key}
        className={
          "flex flex-col md:flex-row md:items-center gap-4 px-4 md:px-5 py-4 border-t border-[#EEF2FA] hover:bg-[#FAFBFE] transition-colors"
        }
      >
        <div className={"flex items-start gap-4 md:w-[170px] shrink-0"}>
          {icon}
          {code}
        </div>
        <div className={"flex-1 min-w-0"}>
          <p className={"text-[14px] leading-[1.45] text-[#1E2B5A]"}>
            {doc.name_uz}
          </p>
          {renderTags(doc)}
        </div>
        {renderActions(doc, key)}
      </div>
    );
  };

  const renderList = () => {
    if (loading) {
      return (
        <div className={clsx("bg-white rounded-[18px] p-6", cardShadow)}>
          <ContentLoader />
        </div>
      );
    }

    if (error) {
      return (
        <div
          className={clsx(
            "bg-white rounded-[18px] p-10 text-center text-[#E5484D]",
            cardShadow
          )}
        >
          Xatolik: {error}
        </div>
      );
    }

    if (isEmptyResult) {
      return (
        <div
          className={clsx("bg-white rounded-[18px] p-12 text-center", cardShadow)}
        >
          <div
            className={
              "mx-auto w-[72px] h-[72px] rounded-full bg-[#E8F0FE] text-[#2B5CD9] flex items-center justify-center"
            }
          >
            {activeTab === "mening" ? (
              <StarIcon className={"w-9 h-9"} />
            ) : (
              <FileSearchIcon className={"w-9 h-9"} />
            )}
          </div>
          <h3 className={"mt-5 text-[18px] font-bold text-[#0B1A4F]"}>
            {activeTab === "mening"
              ? "Saqlangan hujjatlar hozircha yo'q"
              : "Hech narsa topilmadi"}
          </h3>
          <p className={"mt-2 text-[14px] text-[#5B6788] max-w-md mx-auto"}>
            {activeTab === "mening"
              ? "Kerakli hujjatlarni yulduzcha orqali ro'yxatingizga qo'shing."
              : "Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring."}
          </p>
        </div>
      );
    }

    return (
      <div className={"space-y-4"}>
        {filteredData.map((item, itemIndex) => {
          const itemClosed = openItems[itemIndex];
          return (
            <div
              key={itemIndex}
              className={clsx(
                "bg-white rounded-[18px] border border-[#EEF2FA]",
                cardShadow
              )}
            >
              <button
                type={"button"}
                onClick={() => toggleItem(itemIndex)}
                className={
                  "w-full flex items-center gap-4 px-4 md:px-5 py-4 text-left"
                }
              >
                <FileSearchIcon
                  className={"w-[26px] h-[26px] shrink-0 text-[#1D5BE8]"}
                />
                <h3
                  className={
                    "flex-1 text-[15px] md:text-[16px] font-bold text-[#0B1A4F]"
                  }
                >
                  {item.title}
                </h3>
                <span
                  className={
                    "shrink-0 px-3 py-1 rounded-lg bg-[#E8F0FE] text-[13px] font-medium text-[#1D5BE8]"
                  }
                >
                  {countDocs([item])} hujjat
                </span>
                <ChevronDownIcon
                  className={clsx(
                    "w-5 h-5 shrink-0 text-[#1D5BE8] transition-transform",
                    { "rotate-180": !itemClosed }
                  )}
                />
              </button>

              {!itemClosed && (
                <div className={"px-2 pb-2 space-y-2"}>
                  {(item.groups || []).map((group, groupIndex) => {
                    const groupKey = `${itemIndex}-${groupIndex}`;
                    const groupClosed = openGroups[groupKey];
                    return (
                      <div
                        key={groupIndex}
                        className={
                          "rounded-[14px] border border-[#E6EDFB] overflow-hidden"
                        }
                      >
                        <button
                          type={"button"}
                          onClick={() => toggleGroup(itemIndex, groupIndex)}
                          className={
                            "w-full flex items-center gap-4 px-3 md:px-4 py-3 bg-[#F3F7FF] hover:bg-[#EAF1FF] text-left transition-colors"
                          }
                        >
                          <FileSearchIcon
                            className={"w-[22px] h-[22px] shrink-0 text-[#1D5BE8]"}
                          />
                          <h4
                            className={
                              "flex-1 text-[14px] md:text-[15px] font-semibold text-[#1D4FC4]"
                            }
                          >
                            {group.title}
                          </h4>
                          <span
                            className={
                              "shrink-0 px-3 py-1 rounded-lg bg-[#DDE8FD] text-[13px] font-medium text-[#1D5BE8]"
                            }
                          >
                            {(group.documents || []).length} hujjat
                          </span>
                          <ChevronDownIcon
                            className={clsx(
                              "w-5 h-5 shrink-0 text-[#1D5BE8] transition-transform",
                              { "rotate-180": !groupClosed }
                            )}
                          />
                        </button>

                        {!groupClosed &&
                          (viewMode === "grid" ? (
                            <div
                              className={
                                "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3 p-3"
                              }
                            >
                              {(group.documents || []).map((doc, docIndex) =>
                                renderDocument(
                                  doc,
                                  `${groupKey}-${docIndex}`
                                )
                              )}
                            </div>
                          ) : (
                            <div>
                              {(group.documents || []).map((doc, docIndex) =>
                                renderDocument(
                                  doc,
                                  `${groupKey}-${docIndex}`
                                )
                              )}
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const activeSector =
    selectedFilters.sektorlar.length === 1 ? selectedFilters.sektorlar[0] : null;

  return (
    <Main>
      <Menu />

      <div className={"font-jakarta bg-[#F6F9FF] text-[#0B1A4F]"}>
        {/* HERO */}
        <section className={"relative overflow-hidden"}>
          <Image
            src={"/images/homepage-back.png?v=2"}
            unoptimized
            alt={""}
            fill
            priority
            sizes={"100vw"}
            className={
              "object-cover object-[80%_25%] select-none pointer-events-none"
            }
          />
          <div
            className={
              "absolute inset-0 bg-white/80 md:bg-transparent md:bg-gradient-to-r md:from-white/95 md:via-white/75 md:to-white/0"
            }
          />
          <div
            className={
              "absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-t from-[#F6F9FF] to-transparent"
            }
          />

          <div
            className={
              "relative max-w-[1536px] mx-auto px-5 lg:px-[115px] pt-7 pb-[70px]"
            }
          >
            <nav
              className={
                "flex flex-wrap items-center gap-x-2 text-[13px] text-[#0B1A4F]"
              }
            >
              <Link href={"/"} className={"hover:text-[#1D5BE8]"}>
                {t("homepage")}
              </Link>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />
              <span className={"text-[#5B6788]"}>{t("documents")}</span>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />
              <span className={"text-[#5B6788]"}>SHNQ</span>
            </nav>

            <h1
              className={
                "mt-5 text-[28px] md:text-[38px] font-extrabold tracking-[-0.01em] text-[#0B1A4F]"
              }
            >
              {t("shnq")}
            </h1>
            <p
              className={
                "mt-2 max-w-[520px] text-[15px] md:text-[16px] leading-[1.5] text-[#5B6788]"
              }
            >
              Qurilish va shaharsozlik sohasidagi me&apos;yoriy hujjatlar,
              standartlar, texnik qoidalar va uslubiy materiallar.
            </p>

            <div
              className={
                "mt-6 grid grid-cols-2 lg:flex lg:flex-wrap gap-3 lg:gap-4"
              }
            >
              {heroStats.map(({ id, value, label, Icon, iconClass }) => (
                <div
                  key={id}
                  className={
                    "flex items-center gap-x-4 lg:min-w-[165px] bg-white/85 backdrop-blur-sm rounded-[14px] px-3 py-3 lg:pr-6 shadow-[0_6px_20px_rgba(16,42,116,0.06)]"
                  }
                >
                  <div
                    className={clsx(
                      "w-[44px] h-[44px] shrink-0 rounded-[12px] flex items-center justify-center",
                      iconClass
                    )}
                  >
                    <Icon className={"w-6 h-6"} />
                  </div>
                  <div>
                    <p
                      className={
                        "text-[18px] font-bold leading-tight text-[#0B1A4F]"
                      }
                    >
                      {loading ? "—" : value.toLocaleString("ru-RU")}
                    </p>
                    <p className={"text-[13px] text-[#5B6788]"}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section
          className={
            "relative z-10 -mt-[36px] max-w-[1536px] mx-auto px-3 md:px-5 lg:px-[55px] pb-16"
          }
        >
          <div
            className={
              "bg-white/70 backdrop-blur-sm rounded-[28px] border border-white p-3 md:p-4 flex gap-5"
            }
          >
            {/* Sidebar */}
            <aside className={"w-[300px] shrink-0 hidden lg:block"}>
              <div
                className={clsx(
                  "bg-white rounded-[18px] border border-[#EEF2FA] p-5",
                  cardShadow
                )}
              >
                <div className={"flex items-center justify-between"}>
                  <div
                    className={
                      "flex items-center gap-x-3 text-[18px] font-bold text-[#0B1A4F]"
                    }
                  >
                    <FilterIcon className={"w-6 h-6"} />
                    Filtrlar
                  </div>
                  <button
                    type={"button"}
                    onClick={clearFilters}
                    className={
                      "px-2.5 py-1 rounded-md bg-[#EEF4FF] text-[13px] font-medium text-[#1D5BE8] hover:bg-[#DCE7FF] transition-colors"
                    }
                  >
                    Tozalash
                  </button>
                </div>

                <div className={"mt-6"}>
                  <h3 className={"text-[15px] font-bold text-[#0B1A4F]"}>
                    Hujjat turlari
                  </h3>
                  <div className={"mt-3 space-y-3"}>
                    {documentTypes.map((item) => (
                      <label
                        key={item.id}
                        className={
                          "flex items-center gap-3 cursor-pointer select-none"
                        }
                      >
                        <input
                          type={"checkbox"}
                          className={"sr-only"}
                          checked={selectedFilters.hujjatTurlari.includes(
                            item.id
                          )}
                          onChange={() =>
                            handleFilterChange("hujjatTurlari", item.id)
                          }
                        />
                        <Checkbox
                          checked={selectedFilters.hujjatTurlari.includes(
                            item.id
                          )}
                        />
                        <span className={"flex-1 text-[14px] text-[#1E2B5A]"}>
                          {item.label}
                        </span>
                        <CountBadge>
                          {(stats.typeCounts[item.id] || 0).toLocaleString(
                            "ru-RU"
                          )}
                        </CountBadge>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={"mt-7"}>
                  <div className={"flex items-center justify-between"}>
                    <h3 className={"text-[15px] font-bold text-[#0B1A4F]"}>
                      Quyi tizimlar
                    </h3>
                    <span
                      className={
                        "px-2.5 py-1 rounded-md bg-[#EEF4FF] text-[12px] font-medium text-[#1D5BE8]"
                      }
                    >
                      {subsystems.length} ta tizim
                    </span>
                  </div>
                  <div className={"mt-3 space-y-3"}>
                    {subsystems.map((item) => {
                      const checked = selectedFilters.quyiTizimlar.includes(
                        item.id
                      );
                      return (
                        <label
                          key={item.id}
                          className={
                            "flex items-center gap-3 cursor-pointer select-none"
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            handleFilterChange("quyiTizimlar", item.id);
                          }}
                        >
                          <Checkbox checked={checked} round />
                          <span
                            className={clsx(
                              "flex-1 text-[14px]",
                              checked
                                ? "text-[#0B1A4F] font-medium"
                                : "text-[#1E2B5A]"
                            )}
                          >
                            {item.label}
                          </span>
                          <CountBadge>
                            {stats.subsystemCounts?.[item.id] || 0}
                          </CountBadge>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className={"mt-7"}>
                  <h3 className={"text-[15px] font-bold text-[#0B1A4F]"}>
                    Sektorlar
                  </h3>
                  <div className={"mt-3 space-y-3"}>
                    {sectors.map((item) => (
                      <label
                        key={item.id}
                        className={
                          "flex items-center gap-3 cursor-pointer select-none"
                        }
                      >
                        <input
                          type={"checkbox"}
                          className={"sr-only"}
                          checked={selectedFilters.sektorlar.includes(item.id)}
                          onChange={() =>
                            handleFilterChange("sektorlar", item.id)
                          }
                        />
                        <Checkbox
                          checked={selectedFilters.sektorlar.includes(item.id)}
                        />
                        <span className={"flex-1 text-[14px] text-[#1E2B5A]"}>
                          {item.label}
                        </span>
                        <CountBadge>
                          {stats.sectorCounts[item.id] || 0}
                        </CountBadge>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <div className={"flex-1 min-w-0"}>
              {/* Toolbar */}
              <div
                className={clsx(
                  "bg-white rounded-[18px] border border-[#EEF2FA] p-3 flex flex-col md:flex-row md:items-center gap-3",
                  cardShadow
                )}
              >
                <div className={"flex-1 relative"}>
                  <SearchIcon
                    className={
                      "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A95B0]"
                    }
                  />
                  <input
                    type={"text"}
                    placeholder={
                      "Hujjat nomi, kodi yoki kalit so'zlar bo'yicha qidirish..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={
                      "w-full h-[46px] pl-12 pr-4 rounded-[12px] border border-[#DCE3F0] text-[14px] text-[#0B1A4F] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition"
                    }
                  />
                </div>
                <div className={"flex items-center gap-2"}>
                  <div className={"relative flex-1 md:flex-none"}>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={
                        "appearance-none w-full md:w-[190px] h-[46px] pl-4 pr-10 rounded-[12px] border border-[#DCE3F0] bg-white text-[14px] text-[#0B1A4F] outline-none focus:border-[#1D5BE8] cursor-pointer"
                      }
                    >
                      {sortOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon
                      className={
                        "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B1A4F] pointer-events-none"
                      }
                    />
                  </div>
                  <button
                    type={"button"}
                    onClick={() =>
                      setActiveTab(activeTab === "mening" ? "yangi" : "mening")
                    }
                    title={"Saqlangan hujjatlar"}
                    className={clsx(
                      "h-[46px] px-3 rounded-[12px] flex items-center gap-x-2 text-[14px] font-medium transition-colors",
                      activeTab === "mening"
                        ? "bg-[#FFF6DB] text-[#B78100]"
                        : "bg-[#F1F4FA] text-[#5B6788] hover:bg-[#E8EDF7]"
                    )}
                  >
                    <StarIcon
                      className={"w-5 h-5"}
                      filled={activeTab === "mening"}
                    />
                    {favorites.size}
                  </button>
                  <button
                    type={"button"}
                    onClick={() => setViewMode("list")}
                    className={clsx(
                      "w-[46px] h-[46px] rounded-[12px] flex items-center justify-center transition-colors",
                      viewMode === "list"
                        ? "bg-[#E4EEFF] text-[#1D5BE8]"
                        : "bg-[#F1F4FA] text-[#5B6788] hover:bg-[#E8EDF7]"
                    )}
                  >
                    <ListIcon className={"w-5 h-5"} />
                  </button>
                  <button
                    type={"button"}
                    onClick={() => setViewMode("grid")}
                    className={clsx(
                      "w-[46px] h-[46px] rounded-[12px] flex items-center justify-center transition-colors",
                      viewMode === "grid"
                        ? "bg-[#E4EEFF] text-[#1D5BE8]"
                        : "bg-[#F1F4FA] text-[#5B6788] hover:bg-[#E8EDF7]"
                    )}
                  >
                    <GridIcon className={"w-5 h-5"} />
                  </button>
                </div>
              </div>

              {/* Sector chips */}
              <div
                className={
                  "mt-4 flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 xl:grid xl:grid-cols-[1.25fr_repeat(5,1fr)] xl:overflow-visible"
                }
              >
                <button
                  type={"button"}
                  onClick={() => selectSectorChip(null)}
                  className={clsx(
                    "shrink-0 min-w-[170px] xl:min-w-0 flex items-center gap-3 rounded-[14px] px-4 py-3 text-left transition-all",
                    selectedFilters.sektorlar.length === 0
                      ? "bg-[#1E63F0] text-white shadow-[0_10px_24px_rgba(30,99,240,0.35)]"
                      : clsx("bg-white text-[#0B1A4F] hover:-translate-y-0.5", cardShadow)
                  )}
                >
                  <span
                    className={clsx(
                      "w-[40px] h-[40px] shrink-0 rounded-[10px] flex items-center justify-center",
                      selectedFilters.sektorlar.length === 0
                        ? "bg-white/20"
                        : "bg-[#E8F0FE] text-[#2B5CD9]"
                    )}
                  >
                    <FileTextIcon className={"w-5 h-5"} />
                  </span>
                  <span className={"min-w-0"}>
                    <span className={"block text-[14px] font-semibold whitespace-nowrap"}>
                      Barcha hujjatlar
                    </span>
                    <span
                      className={clsx(
                        "inline-block mt-1 px-2 rounded-md text-[12px]",
                        selectedFilters.sektorlar.length === 0
                          ? "bg-white/20"
                          : "bg-[#F1F4FA] text-[#5B6788]"
                      )}
                    >
                      {stats.total.toLocaleString("ru-RU")}
                    </span>
                  </span>
                </button>
                {sectors.map(({ id, label, Icon, iconClass }) => (
                  <button
                    key={id}
                    type={"button"}
                    onClick={() => selectSectorChip(activeSector === id ? null : id)}
                    className={clsx(
                      "shrink-0 min-w-[150px] xl:min-w-0 flex items-center gap-2.5 rounded-[14px] px-2.5 py-3 text-left bg-white border-2 transition-all hover:-translate-y-0.5",
                      cardShadow,
                      activeSector === id
                        ? "border-[#1E63F0]"
                        : "border-transparent"
                    )}
                  >
                    <span
                      className={clsx(
                        "w-[40px] h-[40px] shrink-0 rounded-[10px] flex items-center justify-center",
                        iconClass
                      )}
                    >
                      <Icon className={"w-5 h-5"} />
                    </span>
                    <span className={"min-w-0"}>
                      <span
                        className={
                          "block text-[14px] font-medium text-[#0B1A4F] truncate"
                        }
                      >
                        {label}
                      </span>
                      <span className={"block text-[13px] text-[#5B6788]"}>
                        {stats.sectorCounts[id] || 0}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              {activeTab === "mening" && favorites.size > 0 && (
                <div
                  className={clsx(
                    "mt-4 bg-white rounded-[18px] border border-[#EEF2FA] px-5 py-3 flex items-center justify-between",
                    cardShadow
                  )}
                >
                  <div
                    className={
                      "flex items-center gap-2 text-[14px] font-semibold text-[#0B1A4F]"
                    }
                  >
                    <StarIcon className={"w-5 h-5 text-[#F5B400]"} filled />
                    Saqlangan hujjatlar: {favorites.size} ta
                  </div>
                  <button
                    type={"button"}
                    onClick={clearAllFavorites}
                    className={
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-[#E5484D] hover:bg-[#FDECEC] transition-colors"
                    }
                  >
                    <TrashIcon className={"w-4 h-4"} />
                    Barchasini o&apos;chirish
                  </button>
                </div>
              )}

              <div className={"mt-4"}>{renderList()}</div>
            </div>
          </div>
        </section>
      </div>
    </Main>
  );
};

// Quyi tizim sarlavhasi "1-қуйи тизим..." ko'rinishida keladi
function matchesSubsystem(item, id) {
  const title = item.title || "";
  return title.includes(`${id}-қуйи`) || title.includes(`${id}-quyi`);
}

export default Index;
