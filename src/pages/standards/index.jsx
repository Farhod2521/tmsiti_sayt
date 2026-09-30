// pages/standards/index.jsx
import React, { useState, useMemo, useEffect } from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import useGetTMSITIQuery from "@/hooks/api/useGetTMSITIQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { get } from "lodash";
import dayjs from "dayjs";
import { useSettingsStore } from "@/store";
import { useTranslation } from "react-i18next";
import { Checkbox, CountBadge } from "@/components/filter-controls";
import {
  BookmarkIcon,
  BoltIcon,
  BuildingsIcon,
  CalendarIcon,
  ChartBoxIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CirclePlusIcon,
  DropIcon,
  FactoryIcon,
  FileTextIcon,
  FilterIcon,
  GridIcon,
  LeafIcon,
  ListIcon,
  RefreshUpIcon,
  RoadIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/icons/docs";
import { ArrowRightIcon } from "@/components/icons/home";

const PAGE_SIZE = 12;
const FAVORITES_KEY = "standards_favorites";

// Soha API'da yo'q — standart nomidagi kalit so'zlar orqali aniqlanadi
const sectors = [
  {
    id: "qurilish",
    label: "Qurilish",
    pattern:
      /qurilish|beton|g['‘ʻ’]?isht|devor|bino|konstruksiya|panel|строител|бетон|кирпич|здани|панел/i,
    Icon: BuildingsIcon,
    iconClass: "text-[#2B5CD9]",
  },
  {
    id: "transport",
    label: "Yo'l va transport",
    pattern:
      /yo['‘ʻ’]?l|ko['‘ʻ’]?prik|avtomobil|asfalt|transport|дорог|мост|автомоб|асфальт|транспорт/i,
    Icon: RoadIcon,
    iconClass: "text-[#5B6788]",
  },
  {
    id: "sanoat",
    label: "Sanoat",
    pattern:
      /po['‘ʻ’]?lat|\bsim\b|metall|sanoat|prokat|сталь|металл|промышл|проволок/i,
    Icon: FactoryIcon,
    iconClass: "text-[#7C5CE0]",
  },
  {
    id: "ekologiya",
    label: "Ekologiya",
    pattern: /ekolog|atrof|chiqindi|эколог|окружающ|отход/i,
    Icon: LeafIcon,
    iconClass: "text-[#22A35B]",
  },
  {
    id: "shaharsozlik",
    label: "Shaharsozlik",
    pattern: /shaharsozlik|hudud|градостро|территор|планиров/i,
    Icon: BuildingsIcon,
    iconClass: "text-[#F08A24]",
  },
  {
    id: "energetika",
    label: "Energetika",
    pattern:
      /energ|issiqlik|elektr|isitish|izolyats|энерг|тепл|электр|изоляц/i,
    Icon: BoltIcon,
    iconClass: "text-[#F5B400]",
  },
  {
    id: "suv",
    label: "Suv ta'minoti",
    pattern: /\bsuv|kanaliz|quvur|водо|канализ|труб/i,
    Icon: DropIcon,
    iconClass: "text-[#1E8CE8]",
  },
  {
    id: "boshqa",
    label: "Boshqa",
    Icon: CirclePlusIcon,
    iconClass: "text-[#5B6788]",
  },
];

const standardTypes = [
  { id: "ozmst", label: "O'zMSt", pattern: /o['‘ʻ’]?zmst/i },
  { id: "en", label: "EN (Yevropa)", pattern: /\bEN\b/ },
  { id: "iso", label: "ISO (Xalqaro)", pattern: /\bISO\b/i },
  { id: "gost", label: "GOST", pattern: /GOST|ГОСТ/i },
  { id: "snip", label: "SNiP", pattern: /SNiP|СНиП/i },
  { id: "idt", label: "IDT", pattern: /\bIDT\b/i },
];

const sortOptions = [
  { id: "updated", label: "Yangilangan sanasi" },
  { id: "code", label: "Shifr bo'yicha" },
  { id: "title", label: "Nomi bo'yicha" },
];

const covers = [
  { image: "/images/home/std-cover-1.jpg", stripe: "bg-[#1B2F7A]" },
  { image: "/images/home/std-cover-2.jpg", stripe: "bg-[#1D5BE8]" },
  { image: "/images/home/std-cover-3.jpg", stripe: "bg-[#9B1B5A]" },
  { image: "/images/home/std-cover-4.jpg", stripe: "bg-[#2B5CD9]" },
  { image: "/images/home/std-cover-5.jpg", stripe: "bg-[#8A5A2B]" },
  { image: "/images/home/std-cover-6.jpg", stripe: "bg-[#E0A21B]" },
];

const cardShadow = "shadow-[0_8px_30px_rgba(16,42,116,0.06)]";

const safeString = (value) => {
  if (!value && value !== 0) return "";
  return String(value);
};

// Tanlangan tildagi maydon, bo'lmasa o'zbekcha yoki umumiy maydon
const pick = (item, field, language) =>
  safeString(
    get(item, `${field}_${language}`) ||
      get(item, `${field}_uz`) ||
      get(item, field, "")
  );

const getYear = (designation = "") => {
  const match = designation.match(/:(\d{4})/);
  return match ? Number(match[1]) : null;
};

const getSectorIds = (item) => {
  const text = [
    get(item, "title_uz"),
    get(item, "title_ru"),
    get(item, "title_en"),
    get(item, "title"),
  ]
    .filter(Boolean)
    .join(" ");
  const ids = sectors
    .filter((s) => s.pattern && s.pattern.test(text))
    .map((s) => s.id);
  return ids.length > 0 ? ids : ["boshqa"];
};

const getTypeIds = (item) => {
  const designation = `${get(item, "designation_uz", "")} ${get(
    item,
    "designation",
    ""
  )}`;
  return standardTypes
    .filter((type) => type.pattern.test(designation))
    .map((type) => type.id);
};

// "O'zMSt EN 10245-4:2025 (EN ...)" → { prefix: "O'zMSt", code: "EN 10245-4:2025" }
const splitCode = (designation = "") => {
  const main = designation.split("(")[0].trim();
  const match = main.match(/^(\S+)\s+(.*)$/);
  return match ? { prefix: match[1], code: match[2] } : { prefix: main, code: "" };
};

const Cover = ({ designation, index }) => {
  const { prefix, code } = splitCode(designation);
  const cover = covers[index % covers.length];
  return (
    <div
      className={
        "relative w-[104px] sm:w-[118px] h-[178px] shrink-0 rounded-[6px] overflow-hidden bg-gradient-to-b from-[#E9EFF8] via-[#F4F7FC] to-white border border-[#EEF2FA]"
      }
    >
      <span className={clsx("absolute inset-y-0 left-0 w-[5px] z-10", cover.stripe)} />
      <img
        src={cover.image}
        alt={""}
        loading={"lazy"}
        className={"absolute inset-x-0 bottom-0 w-full h-[58%] object-cover"}
      />
      <div
        className={
          "absolute inset-x-0 top-[38%] h-[16%] bg-gradient-to-b from-[#F4F7FC] to-transparent"
        }
      />
      <div className={"relative pl-4 pr-2 pt-9 text-[#0B1A4F]"}>
        <p className={"text-[14px] font-extrabold leading-none"}>{prefix}</p>
        <p
          className={
            "mt-1 text-[11px] font-bold leading-tight break-words line-clamp-2"
          }
        >
          {code}
        </p>
      </div>
    </div>
  );
};

const StandardsPage = () => {
  const { t } = useTranslation();
  const {
    data: oldApiData,
    isLoading: oldApiLoading,
  } = useGetTMSITIQuery({
    key: KEYS.standards,
    url: URLS.standards,
  });

  const language = useSettingsStore((state) => get(state, "lang", "")) || "uz";
  const [searchQuery, setSearchQuery] = useState("");
  const [newApiData, setNewApiData] = useState([]);
  const [isNewApiLoading, setIsNewApiLoading] = useState(true);
  const [newApiError, setNewApiError] = useState(null);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [sortBy, setSortBy] = useState("updated");
  const [viewMode, setViewMode] = useState("grid");
  const [showAllSectors, setShowAllSectors] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Yangi API'dan ma'lumotlarni olish
  useEffect(() => {
    const fetchNewStandards = async () => {
      setIsNewApiLoading(true);
      setNewApiError(null);

      try {
        const response = await fetch(
          "https://main.tmsiti.uz/api/standard-list/"
        );

        if (!response.ok) {
          throw new Error(`HTTP xato! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const transformedData = result.data.map((item) => ({
            id: item.id,
            title: get(item, "title_uz", ""),
            title_uz: get(item, "title_uz", ""),
            title_ru: get(item, "title_ru", ""),
            title_en: get(item, "title_en", ""),
            designation: get(item, "designation_uz", ""),
            designation_uz: get(item, "designation_uz", ""),
            designation_ru: get(item, "designation_ru", ""),
            designation_en: get(item, "designation_en", ""),
            // PDF yangi API'da yo'q — eski API'dan slug bo'yicha olinadi
            pdf: null,
            slug: get(item, "slug", ""),
            number: get(item, "number", item.id),
            updated_at: get(item, "updated_at", null),
            isNewApi: true,
          }));

          setNewApiData(transformedData);
        } else {
          setNewApiData([]);
        }
      } catch (err) {
        console.error("Yangi API'dan ma'lumot olishda xato:", err);
        setNewApiError(err.message);
        setNewApiData([]);
      } finally {
        setIsNewApiLoading(false);
      }
    };

    fetchNewStandards();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch (e) {}
  }, []);

  // Ikkala API ma'lumotlarini birlashtirish (yangi ma'lumotlar birinchi)
  const combinedData = useMemo(() => {
    const oldData = get(oldApiData, "data", []);
    const oldBySlug = new Map(oldData.map((item) => [get(item, "slug"), item]));
    const uniqueDataMap = new Map();

    [...newApiData, ...oldData].forEach((item) => {
      const key = get(item, "slug", "") || String(get(item, "id", ""));
      if (!uniqueDataMap.has(key) || get(item, "isNewApi", false)) {
        const pdf =
          get(item, "pdf") || get(oldBySlug.get(get(item, "slug")), "pdf", null);
        uniqueDataMap.set(key, {
          ...item,
          pdf,
          sectorIds: getSectorIds(item),
          typeIds: getTypeIds(item),
        });
      }
    });

    return Array.from(uniqueDataMap.values());
  }, [oldApiData, newApiData]);

  const counts = useMemo(() => {
    const sectorCounts = {};
    const typeCounts = {};
    combinedData.forEach((item) => {
      item.sectorIds.forEach((id) => {
        sectorCounts[id] = (sectorCounts[id] || 0) + 1;
      });
      item.typeIds.forEach((id) => {
        typeCounts[id] = (typeCounts[id] || 0) + 1;
      });
    });
    return { sectorCounts, typeCounts };
  }, [combinedData]);

  const visibleTypes = standardTypes.filter((type) => counts.typeCounts[type.id]);

  const filteredData = useMemo(() => {
    let result = combinedData;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) =>
        [
          "title_uz",
          "title_ru",
          "title_en",
          "designation_uz",
          "designation_ru",
          "designation_en",
          "title",
          "designation",
        ].some((field) =>
          safeString(get(item, field, "")).toLowerCase().includes(query)
        )
      );
    }

    if (selectedSectors.length > 0) {
      result = result.filter((item) =>
        item.sectorIds.some((id) => selectedSectors.includes(id))
      );
    }

    if (selectedTypes.length > 0) {
      result = result.filter((item) =>
        item.typeIds.some((id) => selectedTypes.includes(id))
      );
    }

    if (onlyFavorites) {
      result = result.filter((item) => favorites.has(get(item, "slug")));
    }

    const sortValue = (item) =>
      get(item, "updated_at")
        ? dayjs(item.updated_at).valueOf()
        : dayjs(`${getYear(get(item, "designation", "")) || 1970}-01-01`).valueOf();

    const sorters = {
      updated: (a, b) => sortValue(b) - sortValue(a),
      code: (a, b) =>
        pick(a, "designation", language).localeCompare(
          pick(b, "designation", language),
          undefined,
          { numeric: true }
        ),
      title: (a, b) =>
        pick(a, "title", language).localeCompare(pick(b, "title", language)),
    };

    return [...result].sort(sorters[sortBy]);
  }, [
    combinedData,
    searchQuery,
    selectedSectors,
    selectedTypes,
    onlyFavorites,
    favorites,
    sortBy,
    language,
  ]);

  // Filtr o'zgarganda sahifalashni boshidan boshlash
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedSectors, selectedTypes, onlyFavorites, sortBy]);

  const toggleInList = (setter, id) =>
    setter((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

  const toggleFavorite = (slug) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSectors([]);
    setSelectedTypes([]);
    setOnlyFavorites(false);
  };

  const activeChip = selectedSectors.length === 1 ? selectedSectors[0] : null;
  const isLoading = oldApiLoading || isNewApiLoading;
  const activeSectorsCount = sectors.filter(
    (s) => s.id !== "boshqa" && counts.sectorCounts[s.id]
  ).length;
  const shownSectors = showAllSectors ? sectors : sectors.slice(0, 6);

  const heroStats = [
    {
      id: "total",
      value: isLoading ? "—" : combinedData.length.toLocaleString("ru-RU"),
      label: "Jami standartlar",
      Icon: ShieldCheckIcon,
      iconClass: "bg-[#E8F0FE] text-[#2B5CD9]",
    },
    {
      id: "sectors",
      value: isLoading ? "—" : activeSectorsCount,
      label: "Soha",
      Icon: ChartBoxIcon,
      iconClass: "bg-[#E4F6EC] text-[#1E9E62]",
    },
    {
      id: "updated",
      value: "Yangi",
      label: "Doimiy yangilanadi",
      Icon: RefreshUpIcon,
      iconClass: "bg-[#FFEEE4] text-[#F0692A]",
    },
  ];

  const renderCard = (item, index) => {
    const slug = get(item, "slug");
    const designation = pick(item, "designation", language);
    const isFavorite = favorites.has(slug);
    const year = getYear(designation);
    const date = get(item, "updated_at")
      ? dayjs(item.updated_at).format("YYYY-MM-DD")
      : year;

    return (
      <div
        key={`${get(item, "id")}-${slug}`}
        className={clsx(
          "flex flex-col bg-white rounded-[16px] border border-[#EEF2FA] p-4 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(16,42,116,0.12)] transition-all duration-300",
          cardShadow
        )}
      >
        <div className={"flex gap-4 flex-1"}>
          <Cover designation={designation} index={index} />
          <div className={"flex flex-col min-w-0 flex-1"}>
            <div>
              {get(item, "isNewApi") ? (
                <span
                  className={
                    "inline-block px-2.5 py-[3px] rounded-md bg-[#E6F6EC] text-[12px] font-medium text-[#1E9E62]"
                  }
                >
                  Yangi
                </span>
              ) : (
                <span
                  className={
                    "inline-block px-2.5 py-[3px] rounded-md bg-[#EEF4FF] text-[12px] font-medium text-[#1D5BE8]"
                  }
                >
                  {splitCode(designation).prefix}
                </span>
              )}
            </div>
            <h3
              className={
                "mt-2 text-[16px] font-bold leading-snug text-[#0B1A4F] break-words"
              }
            >
              {designation}
            </h3>
            <p
              className={
                "mt-2 text-[13px] leading-[1.45] text-[#5B6788] line-clamp-4"
              }
            >
              {pick(item, "title", language)}
            </p>
            <div
              className={
                "mt-auto pt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[#5B6788]"
              }
            >
              {get(item, "pdf") && (
                <span className={"flex items-center gap-1"}>
                  <FileTextIcon className={"w-3.5 h-3.5"} />
                  PDF
                </span>
              )}
              {date && (
                <span className={"flex items-center gap-1"}>
                  <CalendarIcon className={"w-3.5 h-3.5"} />
                  {date}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={"mt-4 flex items-center justify-between"}>
          <button
            type={"button"}
            onClick={() => toggleFavorite(slug)}
            title={isFavorite ? "Saqlanganlardan o'chirish" : "Saqlash"}
            className={clsx(
              "w-[34px] h-[34px] rounded-[8px] border flex items-center justify-center transition-colors",
              isFavorite
                ? "border-[#1D5BE8] bg-[#EEF4FF] text-[#1D5BE8]"
                : "border-[#E3E9F5] text-[#1D5BE8] hover:bg-[#EEF4FF]"
            )}
          >
            <BookmarkIcon className={"w-[18px] h-[18px]"} filled={isFavorite} />
          </button>
          <Link
            href={{
              pathname: `/standards/${slug}`,
              query: { isNewApi: get(item, "isNewApi", false) ? "true" : "false" },
            }}
            className={
              "flex items-center gap-x-2 h-[34px] px-5 rounded-[8px] border border-[#1D5BE8] text-[#1D5BE8] text-[14px] font-semibold hover:bg-[#1D5BE8] hover:text-white transition-colors"
            }
          >
            {language === "ru" ? "Подробнее" : "Batafsil"}
            <ArrowRightIcon className={"w-4 h-4"} />
          </Link>
        </div>
      </div>
    );
  };

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
              "absolute inset-0 bg-[#0B2A6E]/80 md:bg-transparent md:bg-gradient-to-r md:from-[#0B2A6E]/90 md:via-[#1447B8]/55 md:to-transparent"
            }
          />

          <div
            className={
              "relative max-w-[1536px] mx-auto px-5 lg:px-[69px] pt-12 pb-[70px]"
            }
          >
            <nav
              className={
                "flex flex-wrap items-center gap-x-2 text-[13px] text-white/90"
              }
            >
              <Link href={"/"} className={"hover:text-white"}>
                {t("homepage")}
              </Link>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-white/70"} />
              <span>{t("documents")}</span>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-white/70"} />
              <span>{t("standards")}</span>
            </nav>

            <h1
              className={
                "mt-4 text-[38px] md:text-[56px] leading-none font-extrabold tracking-[-0.01em] text-white"
              }
            >
              {t("standards")}
            </h1>
            <p
              className={
                "mt-5 max-w-[580px] text-[15px] md:text-[16px] leading-[1.6] text-white/90"
              }
            >
              O&apos;zbekiston Respublikasida amaldagi milliy va xalqaro
              standartlar to&apos;plami. Qurilish, sanoat va boshqa
              sohalardagi standartlarni qulay va tez toping.
            </p>

            <div
              className={
                "mt-6 lg:mt-0 lg:absolute lg:left-[38%] lg:top-[64px] inline-flex flex-wrap gap-x-7 gap-y-4 rounded-[14px] border border-white/60 bg-white/75 backdrop-blur-md px-4 py-3.5 shadow-[0_8px_32px_rgba(16,42,116,0.15)]"
              }
            >
              {heroStats.map(({ id, value, label, Icon, iconClass }) => (
                <div key={id} className={"flex items-center gap-x-3 pr-2"}>
                  <div
                    className={clsx(
                      "w-[44px] h-[44px] shrink-0 rounded-full flex items-center justify-center",
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
                      {value}
                    </p>
                    <p className={"text-[12px] text-[#5B6788]"}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section
          className={
            "relative z-10 -mt-[30px] max-w-[1536px] mx-auto px-3 md:px-5 lg:px-[48px] pb-16 flex gap-4"
          }
        >
          {/* Sidebar */}
          <aside className={"w-[294px] shrink-0 hidden lg:block"}>
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
                    "text-[14px] font-medium text-[#1D5BE8] underline underline-offset-2 hover:text-[#0A4DD0]"
                  }
                >
                  Tozalash
                </button>
              </div>

              <div className={"mt-6"}>
                <h3 className={"text-[14px] font-bold text-[#0B1A4F]"}>
                  Qidiruv
                </h3>
                <div className={"mt-3 relative"}>
                  <SearchIcon
                    className={
                      "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A95B0]"
                    }
                  />
                  <input
                    type={"text"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={"Standart nomi, kodi yoki kalit so'z..."}
                    className={
                      "w-full h-[40px] pl-9 pr-3 rounded-[10px] border border-[#DCE3F0] text-[13px] text-[#0B1A4F] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition"
                    }
                  />
                </div>
              </div>

              <div className={"mt-6"}>
                <h3 className={"text-[14px] font-bold text-[#0B1A4F]"}>
                  Soha bo&apos;yicha
                </h3>
                <div className={"mt-3 space-y-2.5"}>
                  {shownSectors.map((item) => {
                    const checked = selectedSectors.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={
                          "flex items-center gap-3 cursor-pointer select-none"
                        }
                      >
                        <input
                          type={"checkbox"}
                          className={"sr-only"}
                          checked={checked}
                          onChange={() =>
                            toggleInList(setSelectedSectors, item.id)
                          }
                        />
                        <Checkbox checked={checked} />
                        <span className={"flex-1 text-[13px] text-[#1E2B5A]"}>
                          {item.label}
                        </span>
                        <CountBadge>{counts.sectorCounts[item.id] || 0}</CountBadge>
                      </label>
                    );
                  })}
                </div>
                <button
                  type={"button"}
                  onClick={() => setShowAllSectors(!showAllSectors)}
                  className={
                    "mt-3 flex items-center gap-1.5 text-[14px] font-medium text-[#1D5BE8]"
                  }
                >
                  {showAllSectors ? "Kamroq ko'rsatish" : "Yana ko'rsatish"}
                  <ChevronDownIcon
                    className={clsx("w-4 h-4 transition-transform", {
                      "rotate-180": showAllSectors,
                    })}
                  />
                </button>
              </div>

              {visibleTypes.length > 0 && (
                <div className={"mt-6"}>
                  <h3 className={"text-[14px] font-bold text-[#0B1A4F]"}>
                    Standart turi
                  </h3>
                  <div className={"mt-3 space-y-2.5"}>
                    {visibleTypes.map((item) => {
                      const checked = selectedTypes.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className={
                            "flex items-center gap-3 cursor-pointer select-none"
                          }
                        >
                          <input
                            type={"checkbox"}
                            className={"sr-only"}
                            checked={checked}
                            onChange={() =>
                              toggleInList(setSelectedTypes, item.id)
                            }
                          />
                          <Checkbox checked={checked} />
                          <span
                            className={"flex-1 text-[13px] text-[#1E2B5A]"}
                          >
                            {item.label}
                          </span>
                          <CountBadge>
                            {(counts.typeCounts[item.id] || 0).toLocaleString(
                              "ru-RU"
                            )}
                          </CountBadge>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className={"mt-6"}>
                <h3 className={"text-[14px] font-bold text-[#0B1A4F]"}>
                  Saqlanganlar
                </h3>
                <label
                  className={
                    "mt-3 flex items-center gap-3 cursor-pointer select-none"
                  }
                >
                  <input
                    type={"checkbox"}
                    className={"sr-only"}
                    checked={onlyFavorites}
                    onChange={() => setOnlyFavorites(!onlyFavorites)}
                  />
                  <Checkbox checked={onlyFavorites} />
                  <span className={"flex-1 text-[13px] text-[#1E2B5A]"}>
                    Faqat saqlanganlar
                  </span>
                  <CountBadge active={favorites.size > 0}>
                    {favorites.size}
                  </CountBadge>
                </label>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className={"flex-1 min-w-0"}>
            <div
              className={clsx(
                "bg-white rounded-[18px] border border-[#EEF2FA] p-3 flex flex-col md:flex-row md:items-center gap-3",
                cardShadow
              )}
            >
              <form
                className={"flex-1 flex gap-3"}
                onSubmit={(e) => e.preventDefault()}
              >
                <div className={"flex-1 relative"}>
                  <SearchIcon
                    className={
                      "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A95B0]"
                    }
                  />
                  <input
                    type={"text"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === "ru"
                        ? "Поиск стандартов..."
                        : "Standartlarni qidirish..."
                    }
                    className={
                      "w-full h-[44px] pl-12 pr-4 rounded-[10px] border border-[#DCE3F0] text-[14px] text-[#0B1A4F] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition"
                    }
                  />
                </div>
                <button
                  type={"submit"}
                  className={
                    "h-[44px] px-5 rounded-[10px] bg-[#1D5BE8] text-white text-[14px] font-semibold flex items-center gap-2 hover:bg-[#0A4DD0] transition-colors"
                  }
                >
                  <SearchIcon className={"w-[18px] h-[18px]"} />
                  <span className={"hidden sm:inline"}>Qidirish</span>
                </button>
              </form>
              <div className={"flex items-center gap-2"}>
                <div className={"relative flex-1 md:flex-none"}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={
                      "appearance-none w-full md:w-[196px] h-[44px] pl-4 pr-10 rounded-[10px] border border-[#DCE3F0] bg-white text-[14px] text-[#0B1A4F] outline-none focus:border-[#1D5BE8] cursor-pointer"
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
                  onClick={() => setViewMode("grid")}
                  className={clsx(
                    "w-[44px] h-[44px] rounded-[10px] flex items-center justify-center transition-colors",
                    viewMode === "grid"
                      ? "bg-[#E4EEFF] text-[#1D5BE8]"
                      : "bg-[#F1F4FA] text-[#5B6788] hover:bg-[#E8EDF7]"
                  )}
                >
                  <GridIcon className={"w-5 h-5"} />
                </button>
                <button
                  type={"button"}
                  onClick={() => setViewMode("list")}
                  className={clsx(
                    "w-[44px] h-[44px] rounded-[10px] flex items-center justify-center transition-colors",
                    viewMode === "list"
                      ? "bg-[#E4EEFF] text-[#1D5BE8]"
                      : "bg-[#F1F4FA] text-[#5B6788] hover:bg-[#E8EDF7]"
                  )}
                >
                  <ListIcon className={"w-5 h-5"} />
                </button>
              </div>
            </div>

            {/* Soha chiplari */}
            <div className={"mt-4 flex gap-2 overflow-x-auto 2xl:flex-wrap pb-1"}>
              <button
                type={"button"}
                onClick={() => setSelectedSectors([])}
                className={clsx(
                  "shrink-0 h-[38px] px-3.5 rounded-[10px] flex items-center gap-2 text-[13px] font-medium transition-colors",
                  selectedSectors.length === 0
                    ? "bg-[#1D5BE8] text-white shadow-[0_8px_20px_rgba(29,91,232,0.3)]"
                    : "bg-white border border-[#E3E9F5] text-[#0B1A4F] hover:border-[#1D5BE8]"
                )}
              >
                <BuildingsIcon className={"w-4 h-4"} />
                Barchasi
              </button>
              {sectors.map(({ id, label, Icon, iconClass }) => (
                <button
                  key={id}
                  type={"button"}
                  onClick={() =>
                    setSelectedSectors(activeChip === id ? [] : [id])
                  }
                  className={clsx(
                    "shrink-0 h-[38px] px-3 rounded-[10px] flex items-center gap-1.5 text-[13px] font-medium bg-white border transition-colors",
                    activeChip === id
                      ? "border-[#1D5BE8] text-[#1D5BE8]"
                      : "border-[#E3E9F5] text-[#0B1A4F] hover:border-[#1D5BE8]"
                  )}
                >
                  <Icon className={clsx("w-[18px] h-[18px]", iconClass)} />
                  {label}
                </button>
              ))}
            </div>

            <p className={"mt-4 text-[14px] text-[#1E2B5A]"}>
              {isLoading
                ? "Yuklanmoqda..."
                : `${filteredData.length.toLocaleString("ru-RU")} ta standart topildi`}
            </p>

            {newApiError && (
              <div
                className={
                  "mt-3 px-4 py-3 rounded-[12px] bg-[#FFF6DB] text-[13px] text-[#B78100]"
                }
              >
                Yangi standartlar yuklanmadi, faqat mavjud standartlar
                ko&apos;rsatilmoqda.
              </div>
            )}

            <div
              className={clsx(
                "mt-4 grid gap-4",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 2xl:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className={clsx(
                        "bg-white rounded-[16px] p-4 flex gap-4 animate-pulse",
                        cardShadow
                      )}
                    >
                      <div className={"w-[118px] h-[178px] rounded-md bg-[#EEF2FA]"} />
                      <div className={"flex-1 space-y-3 pt-2"}>
                        <div className={"h-4 w-16 rounded bg-[#EEF2FA]"} />
                        <div className={"h-5 rounded bg-[#EEF2FA]"} />
                        <div className={"h-4 w-2/3 rounded bg-[#EEF2FA]"} />
                      </div>
                    </div>
                  ))
                : filteredData
                    .slice(0, visibleCount)
                    .map((item, index) => renderCard(item, index))}
            </div>

            {!isLoading && filteredData.length === 0 && (
              <div
                className={clsx(
                  "mt-4 bg-white rounded-[18px] p-12 text-center",
                  cardShadow
                )}
              >
                <div
                  className={
                    "mx-auto w-[72px] h-[72px] rounded-full bg-[#E8F0FE] text-[#2B5CD9] flex items-center justify-center"
                  }
                >
                  <SearchIcon className={"w-9 h-9"} />
                </div>
                <h3 className={"mt-5 text-[18px] font-bold text-[#0B1A4F]"}>
                  Hech narsa topilmadi
                </h3>
                <p className={"mt-2 text-[14px] text-[#5B6788]"}>
                  Qidiruv so&apos;zini yoki filtrlarni o&apos;zgartirib
                  ko&apos;ring.
                </p>
              </div>
            )}

            {!isLoading && filteredData.length > visibleCount && (
              <div className={"mt-8 flex justify-center"}>
                <button
                  type={"button"}
                  onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}
                  className={
                    "h-[46px] px-8 rounded-full border border-[#1D5BE8] text-[#1D5BE8] text-[15px] font-semibold hover:bg-[#1D5BE8] hover:text-white transition-colors"
                  }
                >
                  Yana yuklash ({filteredData.length - visibleCount})
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </Main>
  );
};

export default StandardsPage;
