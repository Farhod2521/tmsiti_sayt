import React, { useEffect, useMemo, useState } from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import useGetTMSITIQuery from "@/hooks/api/useGetTMSITIQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { get } from "lodash";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/store";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/filter-controls";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  MailIcon,
  OrgChartIcon,
  PhoneIcon,
  SearchIcon,
} from "@/components/icons/docs";
import { ArrowRightIcon } from "@/components/icons/home";

// Bo'linma turi va faoliyat yo'nalishi API'da yo'q — lavozim nomidan aniqlanadi
const unitTypes = [
  { id: "boshqarma", label: "Boshqarma", pattern: /boshqarma/i },
  { id: "bolim", label: "Bo'lim", pattern: /bo['‘ʻʼ’]?lim/i },
  { id: "sektor", label: "Sektor", pattern: /sektor/i },
  { id: "markaz", label: "Markaz", pattern: /markaz/i },
  { id: "laboratoriya", label: "Laboratoriya", pattern: /laboratoriya/i },
  { id: "organ", label: "Sertifikatlash organi", pattern: /organi/i },
];

const directions = [
  { id: "meyorlash", label: "Texnik me'yorlash", pattern: /me['‘ʻʼ’]?yorlash/i },
  { id: "standart", label: "Standartlashtirish", pattern: /standart/i },
  {
    id: "sertifikat",
    label: "Sertifikatlashtirish",
    pattern: /sertifikat|muvofiqlik/i,
  },
  { id: "sinov", label: "Sinov va laboratoriya", pattern: /sinov|laboratoriya/i },
  { id: "xalqaro", label: "Xalqaro hamkorlik", pattern: /xalqaro/i },
  {
    id: "normativ",
    label: "Normativ hujjatlar",
    pattern: /normativ|atamalar|ijro/i,
  },
  { id: "energo", label: "Energoaudit", pattern: /energo/i },
  { id: "it", label: "IT va raqamlashtirish", pattern: /raqamli|axborot/i },
];

const sortOptions = [
  { id: "default", label: "Standart tartib" },
  { id: "az", label: "A–Z bo'yicha" },
  { id: "za", label: "Z–A bo'yicha" },
];

const cardShadow = "shadow-[0_8px_30px_rgba(16,42,116,0.06)]";

const pick = (item, field, language) =>
  get(item, `${field}_${language}`) || get(item, `${field}_uz`) || get(item, field, "");

const isLogo = (url = "") => /TMSITI_Logo/i.test(url);

// Rasm faqat admin paneldan (API) olinadi
const getPhoto = (item) => get(item, "image");

// "Standartlashtirish boshqarmasi boshlig'i" → "Standartlashtirish boshqarmasi"
const getUnitName = (position = "") =>
  position.replace(/\s+boshlig['‘ʻʼ’]?i\s*$/i, "").replace(/\s+/g, " ").trim();

const matchIds = (list, text) =>
  list.filter((entry) => entry.pattern.test(text)).map((entry) => entry.id);

const Photo = ({ item, className }) => {
  const src = getPhoto(item);
  const [failed, setFailed] = useState(false);
  // Rasm serverda topilmasa (404) logotip ko'rsatiladi
  const logo = isLogo(src) || failed;
  return (
    <div
      className={clsx(
        "relative shrink-0 overflow-hidden rounded-[12px] bg-gradient-to-br from-[#E3ECFA] via-[#F0F5FD] to-[#D6E3F8]",
        className
      )}
    >
      {src &&
        (logo ? (
          <Image
            src={"/icons/brand.svg"}
            alt={"TMSITI"}
            fill
            className={"object-contain p-6 opacity-90"}
          />
        ) : (
          // Oq fonli rasmlar gradient fon bilan qo'shilib ketishi uchun multiply
          <img
            src={src}
            alt={get(item, "full_name_uz", "")}
            loading={"lazy"}
            onError={() => setFailed(true)}
            className={"absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply"}
          />
        ))}
    </div>
  );
};

const Index = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetTMSITIQuery({
    key: KEYS.structural,
    url: URLS.structural,
  });
  const language = useSettingsStore((state) => get(state, "lang", "")) || "uz";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedDirections, setSelectedDirections] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid");
  const [selected, setSelected] = useState(null);

  const items = useMemo(
    () =>
      get(data, "data", []).map((item) => {
        const positionUz = get(item, "position_uz", "");
        return {
          ...item,
          typeIds: matchIds(unitTypes, positionUz),
          directionIds: matchIds(directions, positionUz),
        };
      }),
    [data]
  );

  const counts = useMemo(() => {
    const result = { types: {}, directions: {} };
    items.forEach((item) => {
      item.typeIds.forEach((id) => {
        result.types[id] = (result.types[id] || 0) + 1;
      });
      item.directionIds.forEach((id) => {
        result.directions[id] = (result.directions[id] || 0) + 1;
      });
    });
    return result;
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter((item) =>
        [
          "full_name_uz",
          "full_name_ru",
          "full_name_en",
          "position_uz",
          "position_ru",
          "position_en",
        ].some((field) => (get(item, field) || "").toLowerCase().includes(query))
      );
    }
    if (selectedTypes.length > 0) {
      result = result.filter((item) =>
        item.typeIds.some((id) => selectedTypes.includes(id))
      );
    }
    if (selectedDirections.length > 0) {
      result = result.filter((item) =>
        item.directionIds.some((id) => selectedDirections.includes(id))
      );
    }
    if (sortBy !== "default") {
      const direction = sortBy === "az" ? 1 : -1;
      result = [...result].sort(
        (a, b) =>
          direction *
          pick(a, "full_name", language).localeCompare(pick(b, "full_name", language))
      );
    }
    return result;
  }, [items, searchQuery, selectedTypes, selectedDirections, sortBy, language]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  const toggleInList = (setter, id) =>
    setter((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]
    );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedDirections([]);
  };

  const titleWords = (t("structure") || "").split(" ");
  const titleLast = titleWords.pop();

  const renderFilterGroup = (title, list, countMap, selectedIds, setter) => {
    const visible = list.filter((entry) => countMap[entry.id]);
    if (visible.length === 0) return null;
    return (
      <div className={"mt-6"}>
        <h3 className={"text-[14px] font-bold text-[#0B1A4F]"}>{title}</h3>
        <div className={"mt-3 space-y-2.5"}>
          {visible.map((entry) => {
            const checked = selectedIds.includes(entry.id);
            return (
              <label
                key={entry.id}
                className={"flex items-center gap-3 cursor-pointer select-none"}
              >
                <input
                  type={"checkbox"}
                  className={"sr-only"}
                  checked={checked}
                  onChange={() => toggleInList(setter, entry.id)}
                />
                <Checkbox checked={checked} />
                <span className={"text-[14px] text-[#1E2B5A]"}>
                  {entry.label}{" "}
                  <span className={"text-[#8A95B0]"}>({countMap[entry.id]})</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCard = (item, index) => {
    const position = pick(item, "position", language);
    const email = get(item, "email");
    const phone = get(item, "phone");
    return (
      <motion.div
        key={get(item, "id")}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
        className={clsx(
          "bg-white rounded-[16px] border border-[#EEF2FA] p-4 flex gap-4 hover:shadow-[0_16px_40px_rgba(16,42,116,0.12)] transition-shadow",
          cardShadow
        )}
      >
        <Photo item={item} className={"w-[104px] sm:w-[113px] h-[150px] sm:h-[163px]"} />
        <div className={"flex-1 min-w-0 flex flex-col"}>
          <span
            className={
              "self-start px-2.5 py-1 rounded-md bg-[#E4EEFF] text-[11.5px] leading-[1.35] font-medium text-[#1D5BE8] break-words"
            }
          >
            {getUnitName(get(item, "position_uz", ""))}
          </span>
          <h3
            className={
              "mt-2 text-[16px] font-extrabold leading-tight text-[#0B1A4F]"
            }
          >
            {pick(item, "full_name", language)}
          </h3>
          <p className={"mt-1 text-[12px] leading-[1.35] text-[#8A95B0]"}>
            {position}
          </p>

          <div className={"mt-2 flex items-end gap-2"}>
            <div className={"flex-1 min-w-0 space-y-1 text-[12.5px] text-[#1E2B5A]"}>
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className={"flex items-center gap-2 hover:text-[#1D5BE8]"}
                >
                  <PhoneIcon className={"w-4 h-4 text-[#1D5BE8] shrink-0"} />
                  {phone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className={"flex items-center gap-2 hover:text-[#1D5BE8] truncate"}
                >
                  <MailIcon className={"w-4 h-4 text-[#1D5BE8] shrink-0"} />
                  {email}
                </a>
              )}
            </div>
            {email && (
              <a
                href={`mailto:${email}`}
                title={"Xabar yuborish"}
                className={
                  "w-[32px] h-[32px] shrink-0 rounded-full bg-[#EEF4FF] text-[#1D5BE8] flex items-center justify-center hover:bg-[#1D5BE8] hover:text-white transition-colors"
                }
              >
                <ChevronRightIcon className={"w-4 h-4"} />
              </a>
            )}
          </div>

          <button
            type={"button"}
            onClick={() => setSelected(item)}
            className={
              "mt-3 self-start h-[32px] px-4 rounded-[8px] border border-[#1D5BE8] text-[#1D5BE8] text-[12.5px] font-semibold flex items-center gap-2 hover:bg-[#1D5BE8] hover:text-white transition-colors"
            }
          >
            Batafsil ma&apos;lumot
            <ArrowRightIcon className={"w-3.5 h-3.5"} />
          </button>
        </div>
      </motion.div>
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
              "object-cover object-[80%_30%] select-none pointer-events-none"
            }
          />
          <div
            className={
              "absolute inset-0 bg-white/80 md:bg-transparent md:bg-gradient-to-r md:from-white md:via-white/80 md:to-white/0"
            }
          />
          <div
            className={
              "relative max-w-[1536px] mx-auto px-5 lg:px-[104px] pt-7 pb-[75px]"
            }
          >
            <nav
              className={
                "flex flex-wrap items-center gap-x-2 text-[13px] text-[#5B6788]"
              }
            >
              <Link href={"/"} className={"hover:text-[#1D5BE8]"}>
                {t("homepage")}
              </Link>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />
              <span>{t("institut")}</span>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />
              <span className={"text-[#0B1A4F]"}>{t("structure")}</span>
            </nav>
            <h1
              className={
                "mt-6 text-[34px] md:text-[50px] leading-none font-extrabold tracking-[-0.01em] text-[#0B1A4F]"
              }
            >
              {titleWords.join(" ")}{" "}
              <span className={"text-[#1D5BE8]"}>{titleLast}</span>
            </h1>
            <p
              className={
                "mt-4 max-w-[540px] text-[16px] md:text-[18px] leading-[1.45] text-[#5B6788]"
              }
            >
              Institutning tarkibiy bo&apos;linmalari va ularning rahbarlari
              to&apos;g&apos;risida ma&apos;lumotlar.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section
          className={
            "relative z-10 -mt-[48px] max-w-[1536px] mx-auto px-3 md:px-5 lg:px-[44px] pb-16 flex gap-5"
          }
        >
          {/* Sidebar */}
          <aside className={"w-[290px] shrink-0 hidden lg:block"}>
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

              <div className={"mt-5 relative"}>
                <SearchIcon
                  className={
                    "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A95B0]"
                  }
                />
                <input
                  type={"text"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={"Rahbar yoki bo'lim nomi..."}
                  className={
                    "w-full h-[40px] pl-9 pr-3 rounded-[10px] border border-[#DCE3F0] text-[13px] text-[#0B1A4F] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition"
                  }
                />
              </div>

              {renderFilterGroup(
                "Boshqarma turi",
                unitTypes,
                counts.types,
                selectedTypes,
                setSelectedTypes
              )}
              {renderFilterGroup(
                "Faoliyat yo'nalishi",
                directions,
                counts.directions,
                selectedDirections,
                setSelectedDirections
              )}

              <Link
                href={"/structure"}
                className={
                  "group mt-8 flex items-center gap-3 rounded-[14px] bg-[#EEF4FF] px-4 py-4 hover:bg-[#E4EEFF] transition-colors"
                }
              >
                <OrgChartIcon className={"w-9 h-9 shrink-0 text-[#1D5BE8]"} />
                <span className={"flex-1"}>
                  <span className={"block text-[14px] font-bold text-[#0B1A4F]"}>
                    Tarkibiy tuzilma
                  </span>
                  <span className={"block text-[13px] leading-[1.35] text-[#5B6788]"}>
                    Barcha bo&apos;linmalar tuzilmasini sxemada ko&apos;rish
                  </span>
                </span>
                <span
                  className={
                    "w-[30px] h-[30px] shrink-0 rounded-full bg-white text-[#1D5BE8] flex items-center justify-center group-hover:translate-x-0.5 transition-transform"
                  }
                >
                  <ChevronRightIcon className={"w-4 h-4"} />
                </span>
              </Link>
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
                  placeholder={"Rahbar, bo'lim nomi yoki kalit so'z..."}
                  className={
                    "w-full h-[44px] pl-12 pr-4 rounded-[10px] border border-[#DCE3F0] text-[14px] text-[#0B1A4F] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition"
                  }
                />
              </div>
              <div className={"flex items-center gap-2"}>
                <div className={"relative flex-1 md:flex-none"}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={
                      "appearance-none w-full md:w-[184px] h-[44px] pl-4 pr-10 rounded-[10px] border border-[#DCE3F0] bg-white text-[14px] text-[#0B1A4F] outline-none focus:border-[#1D5BE8] cursor-pointer"
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
                {[
                  { id: "grid", Icon: GridIcon },
                  { id: "list", Icon: ListIcon },
                ].map(({ id, Icon }) => (
                  <button
                    key={id}
                    type={"button"}
                    onClick={() => setViewMode(id)}
                    className={clsx(
                      "w-[44px] h-[44px] rounded-[10px] flex items-center justify-center transition-colors",
                      viewMode === id
                        ? "bg-[#E4EEFF] text-[#1D5BE8]"
                        : "bg-[#F1F4FA] text-[#5B6788] hover:bg-[#E8EDF7]"
                    )}
                  >
                    <Icon className={"w-5 h-5"} />
                  </button>
                ))}
              </div>
            </div>

            <p className={"mt-4 text-[14px] text-[#1E2B5A]"}>
              {isLoading ? "Yuklanmoqda..." : `Jami: ${filtered.length} ta bo'lim`}
            </p>

            <div
              className={clsx(
                "mt-4 grid gap-4",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 2xl:grid-cols-3"
                  : "grid-cols-1 xl:grid-cols-2"
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
                      <div className={"w-[113px] h-[163px] rounded-[12px] bg-[#EEF2FA]"} />
                      <div className={"flex-1 space-y-3 pt-1"}>
                        <div className={"h-5 w-2/3 rounded bg-[#EEF2FA]"} />
                        <div className={"h-5 rounded bg-[#EEF2FA]"} />
                        <div className={"h-4 w-1/2 rounded bg-[#EEF2FA]"} />
                      </div>
                    </div>
                  ))
                : filtered.map((item, index) => renderCard(item, index))}
            </div>

            {!isLoading && filtered.length === 0 && (
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
                  Qidiruv so&apos;zini yoki filtrlarni o&apos;zgartirib ko&apos;ring.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Batafsil ma'lumot oynasi */}
      {selected && (
        <div
          className={
            "fixed inset-0 z-[60] bg-[#0B1A4F]/40 backdrop-blur-sm flex items-center justify-center p-4 font-jakarta"
          }
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={
              "relative w-full max-w-[640px] bg-white rounded-[22px] p-6 flex flex-col sm:flex-row gap-6 shadow-[0_30px_80px_rgba(11,26,79,0.25)]"
            }
          >
            <button
              type={"button"}
              onClick={() => setSelected(null)}
              className={
                "absolute top-4 right-4 w-[36px] h-[36px] rounded-full bg-[#F1F4FA] text-[#0B1A4F] flex items-center justify-center hover:bg-[#E4EEFF]"
              }
            >
              <CloseIcon className={"w-5 h-5"} />
            </button>
            <Photo item={selected} className={"w-full sm:w-[180px] h-[240px]"} />
            <div className={"flex-1 min-w-0 pr-6"}>
              <span
                className={
                  "inline-block px-3 py-1 rounded-md bg-[#E4EEFF] text-[12px] font-medium text-[#1D5BE8]"
                }
              >
                {getUnitName(get(selected, "position_uz", ""))}
              </span>
              <h3 className={"mt-3 text-[22px] font-extrabold leading-tight text-[#0B1A4F]"}>
                {pick(selected, "full_name", language)}
              </h3>
              <p className={"mt-2 text-[14px] leading-[1.5] text-[#5B6788]"}>
                {pick(selected, "position", language)}
              </p>
              <div className={"mt-5 space-y-3 text-[14px] text-[#1E2B5A]"}>
                {get(selected, "phone") && (
                  <a
                    href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`}
                    className={"flex items-center gap-3 hover:text-[#1D5BE8]"}
                  >
                    <span className={"w-[38px] h-[38px] rounded-[10px] bg-[#EEF4FF] text-[#1D5BE8] flex items-center justify-center"}>
                      <PhoneIcon className={"w-5 h-5"} />
                    </span>
                    {selected.phone}
                  </a>
                )}
                {get(selected, "email") && (
                  <a
                    href={`mailto:${selected.email}`}
                    className={"flex items-center gap-3 hover:text-[#1D5BE8]"}
                  >
                    <span className={"w-[38px] h-[38px] rounded-[10px] bg-[#EEF4FF] text-[#1D5BE8] flex items-center justify-center"}>
                      <MailIcon className={"w-5 h-5"} />
                    </span>
                    {selected.email}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Main>
  );
};

export default Index;
