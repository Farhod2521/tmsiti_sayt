import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import clsx from "clsx";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import ContentLoader from "@/components/loader/content-loader";
import { config } from "@/config";
import {
  CalendarIcon,
  ChevronRightIcon,
  FileSearchIcon,
  FileTextIcon,
  SearchIcon,
} from "@/components/icons/docs";

// Qonunlar bo'limi: SHNQ matnlarida havola qilingan hujjatlar (lex.uz dan avtomatik yuklanadi)
const API = config.BASE_MAIN_API;
const card = "bg-white rounded-[18px] border border-[#EEF2FA] shadow-[0_8px_30px_rgba(16,42,116,0.06)]";
const LANG_SHORT = { uz: "UZ", kr: "ЎЗ", ru: "RU" };

const formatDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

const Index = () => {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get(`${API}laws/`)
      .then(({ data }) => setItems(data.results || []))
      .catch(() => setError("Ma'lumotlarni yuklab bo'lmadi"));
  }, []);

  const order = i18n.language === "ru" ? ["ru", "kr", "uz"] : ["uz", "kr", "ru"];
  const titleOf = (item) => order.map((l) => item.titles?.[l]).find(Boolean) || "—";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!items || !q) return items || [];
    return items.filter((item) =>
      [item.number, ...Object.values(item.titles || {})].some((v) => (v || "").toLowerCase().includes(q))
    );
  }, [items, search]);

  return (
    <Main>
      <Head>
        <title>{`${t("laws_section")} — TMSITI`}</title>
      </Head>
      <Menu />
      <div className={"font-jakarta bg-[#F6F9FF] text-[#0B1A4F] pb-16"}>
        <section className={"bg-gradient-to-r from-white via-[#F7FAFF] to-[#EAF1FF]"}>
          <div className={"max-w-[1536px] mx-auto px-5 lg:px-[115px] pt-7 pb-10"}>
            <nav className={"flex flex-wrap items-center gap-x-2 text-[13px] text-[#5B6788]"}>
              <Link href={"/"} className={"hover:text-[#1D5BE8]"}>{t("homepage")}</Link>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />
              <span>{t("documents")}</span>
              <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />
              <span className={"text-[#0B1A4F]"}>{t("laws_section")}</span>
            </nav>
            <h1 className={"mt-5 text-[28px] md:text-[38px] font-extrabold tracking-[-0.01em]"}>{t("laws_section")}</h1>
            <p className={"mt-2 max-w-[620px] text-[15px] md:text-[16px] leading-[1.5] text-[#5B6788]"}>
              Shaharsozlik normalari va qoidalarida havola qilingan qonunlar, kodekslar va qarorlar — o&apos;zbek
              (lotin, kirill) va rus tillarida.
            </p>
          </div>
        </section>

        <section className={"max-w-[1536px] mx-auto px-3 md:px-5 lg:px-[55px]"}>
          <div className={clsx(card, "p-3")}>
            <div className={"relative"}>
              <SearchIcon className={"absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A95B0]"} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={"Hujjat nomi yoki raqami bo'yicha qidirish..."}
                className={
                  "w-full h-[46px] pl-12 pr-4 rounded-[12px] border border-[#DCE3F0] text-[14px] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition"
                }
              />
            </div>
          </div>

          <div className={"mt-4"}>
            {error ? (
              <div className={clsx(card, "p-10 text-center text-[#E5484D]")}>{error}</div>
            ) : items === null ? (
              <div className={clsx(card, "p-6")}>
                <ContentLoader />
              </div>
            ) : filtered.length === 0 ? (
              <div className={clsx(card, "p-12 text-center")}>
                <FileSearchIcon className={"w-12 h-12 mx-auto text-[#8A95B0]"} />
                <p className={"mt-4 text-[16px] font-semibold"}>Hech narsa topilmadi</p>
              </div>
            ) : (
              <ul className={clsx(card, "divide-y divide-[#EEF2FA] overflow-hidden")}>
                {filtered.map((item) => (
                  <li key={item.id}>
                    <Link href={`/qonunlar/${item.id}`} className={"flex items-start gap-4 px-4 md:px-5 py-4 hover:bg-[#FAFBFE] transition-colors group"}>
                      <span className={"w-[40px] h-[40px] shrink-0 rounded-[10px] bg-[#EEF4FF] text-[#1D5BE8] flex items-center justify-center"}>
                        <FileTextIcon className={"w-5 h-5"} />
                      </span>
                      <span className={"flex-1 min-w-0"}>
                        <span className={"block text-[15px] leading-[1.45] font-semibold group-hover:text-[#1D5BE8]"}>
                          {titleOf(item)}
                        </span>
                        <span className={"mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[#5B6788]"}>
                          {item.number && <span className={"px-2 py-[3px] rounded-md bg-[#F1F4FA]"}>{item.number}</span>}
                          {item.doc_date && (
                            <span className={"px-2 py-[3px] rounded-md bg-[#F1F4FA] flex items-center gap-1"}>
                              <CalendarIcon className={"w-3.5 h-3.5"} />
                              {formatDate(item.doc_date)}
                            </span>
                          )}
                          {(item.languages || []).map((l) => (
                            <span key={l} className={"px-2 py-[3px] rounded-md bg-[#EEF4FF] text-[#1D5BE8] font-semibold"}>
                              {LANG_SHORT[l]}
                            </span>
                          ))}
                        </span>
                      </span>
                      <ChevronRightIcon className={"w-4 h-4 mt-3 text-[#8A95B0]"} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </Main>
  );
};

export default Index;
