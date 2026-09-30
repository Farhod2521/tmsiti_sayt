import Main from "@/layouts/main";
import HomeHeader from "@/components/home-header";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import useGetTMSITIQuery from "@/hooks/api/useGetTMSITIQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { get, isEmpty } from "lodash";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import { useSettingsStore } from "@/store";
import { config } from "@/config";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  BookIcon,
  DocumentIcon,
  FlaskIcon,
  GearIcon,
  GlobeIcon,
  LaurelLeftIcon,
  LaurelRightIcon,
  PlayIcon,
  UsersIcon,
} from "@/components/icons/home";

const stats = [
  {
    id: 1,
    value: "7 000+",
    label: "home.stat_documents",
    Icon: DocumentIcon,
    iconClass: "bg-[#E8F0FE] text-[#2B5CD9]",
  },
  {
    id: 2,
    value: "150+",
    label: "home.stat_research",
    Icon: BookIcon,
    iconClass: "bg-[#E4F6EC] text-[#1E9E62]",
  },
  {
    id: 3,
    value: "200+",
    label: "home.stat_team",
    Icon: UsersIcon,
    iconClass: "bg-[#FFEEE4] text-[#F0692A]",
  },
  {
    id: 4,
    value: "50+",
    label: "home.stat_partners",
    Icon: GlobeIcon,
    iconClass: "bg-[#EEEAFD] text-[#5B44D8]",
  },
];

const directions = [
  {
    id: 1,
    title: "home.dir_documents",
    desc: "home.dir_documents_desc",
    url: "/shnq",
    image: "/images/home/dir-documents.jpg",
    Icon: DocumentIcon,
    cardClass: "from-[#EEF4FF] to-[#F6F9FF]",
    iconClass: "bg-[#DCE7FC] text-[#2B5CD9]",
    arrowClass: "text-[#2B5CD9]",
  },
  {
    id: 2,
    title: "home.dir_research",
    desc: "home.dir_research_desc",
    url: "https://sites.google.com/view/kompleks-sinov-laboratoriyasi/%D0%B3%D0%BB%D0%B0%D0%B2%D0%BD%D0%B0%D1%8F-%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0",
    image: "/images/home/dir-research.jpg",
    Icon: FlaskIcon,
    cardClass: "from-[#E9F8F0] to-[#F4FBF7]",
    iconClass: "bg-[#D5F1E2] text-[#1E9E62]",
    arrowClass: "text-[#2B5CD9]",
  },
  {
    id: 3,
    title: "home.dir_standards",
    desc: "home.dir_standards_desc",
    url: "/standards",
    image: "/images/home/dir-standards.jpg",
    Icon: GearIcon,
    cardClass: "from-[#FFF2E8] to-[#FFF8F3]",
    iconClass: "bg-[#FFE3D2] text-[#F0692A]",
    arrowClass: "text-[#F0692A]",
  },
  {
    id: 4,
    title: "home.dir_cooperation",
    desc: "home.dir_cooperation_desc",
    url: null,
    image: "/images/home/dir-cooperation.jpg",
    Icon: UsersIcon,
    cardClass: "from-[#F1EEFD] to-[#F8F6FE]",
    iconClass: "bg-[#E4DEFB] text-[#5B44D8]",
    arrowClass: "text-[#2B5CD9]",
  },
];

// Tashqi havola yangi oynada, url bo'lmasa karta bosilmaydi
const DirectionLink = ({ url, className, children }) => {
  if (!url) return <div className={className}>{children}</div>;
  if (url.startsWith("http")) {
    return (
      <a href={url} target={"_blank"} rel={"noopener noreferrer"} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={url} className={className}>
      {children}
    </Link>
  );
};

const monthShort = {
  uz: ["YAN", "FEV", "MAR", "APR", "MAY", "IYUN", "IYUL", "AVG", "SENT", "OKT", "NOY", "DEK"],
  ru: ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"],
  en: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
};

// Stats panelidagi dumaloq rasmlar — fon rasmining turli qismlari
const thumbPositions = ["78% 45%", "62% 60%", "92% 40%"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

const SectionLabel = ({ children }) => (
  <p
    className={
      "flex items-center gap-x-3 text-[13px] md:text-[14px] font-medium uppercase tracking-[0.08em] text-[#1D5BE8]"
    }
  >
    <span className={"w-9 h-[1.5px] bg-[#1D5BE8]"} />
    {children}
  </p>
);

export default function Home() {
  const { t } = useTranslation();
  const [videoOpen, setVideoOpen] = useState(false);
  const lang = useSettingsStore((state) =>
    get(state, "lang", config.DEFAULT_APP_LANG)
  );

  // Video oynasini Esc bilan yopish
  useEffect(() => {
    if (!videoOpen) return;
    const onKey = (e) => e.key === "Escape" && setVideoOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [videoOpen]);

  const { data } = useGetTMSITIQuery({
    key: KEYS.newsMain,
    url: URLS.news,
    params: {
      lang: lang || config.DEFAULT_APP_LANG,
      page: 1,
    },
  });

  const NewsInReel = get(data, "data.results", []).filter(
    (item) => get(item, "news_in_reel") === true
  );
  const latestNews = (
    isEmpty(NewsInReel) ? get(data, "data.results", []) : NewsInReel
  ).slice(0, 3);

  const { data: discussion } = useGetTMSITIQuery({
    url: URLS.discuss,
    key: KEYS.discuss,
  });
  const discussions = get(discussion, "data.results", []);

  return (
    <Main>
      <div className={"font-jakarta bg-[#F6F9FF] text-[#0B1A4F]"}>
        <HomeHeader />

        {/* HERO */}
        <section
          className={
            "relative w-full overflow-hidden min-h-[640px] md:min-h-[560px]"
          }
        >
          <Image
            src={"/images/homepage-back.png?v=2"}
            unoptimized
            alt={"TMSITI"}
            fill
            priority
            sizes={"100vw"}
            className={
              "object-cover object-[72%_center] select-none pointer-events-none"
            }
          />
          <div
            className={
              "absolute inset-0 bg-white/70 md:bg-transparent md:bg-gradient-to-r md:from-white/60 md:via-white/10 md:to-transparent"
            }
          />
          <div
            className={
              "absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-[#F6F9FF] to-transparent"
            }
          />

          <div
            className={
              "relative max-w-[1536px] mx-auto px-5 lg:px-[77px] pt-12 md:pt-[58px] pb-[180px] md:pb-[140px]"
            }
          >
            <motion.div {...fadeUp(0.1)}>
              <SectionLabel>{t("home.tagline")}</SectionLabel>
            </motion.div>

            <motion.h1
              {...fadeUp(0.2)}
              className={
                "mt-5 max-w-[680px] text-[34px] sm:text-[44px] xl:text-[53px] leading-[1.08] font-extrabold tracking-[-0.02em] text-[#0B1A4F]"
              }
            >
              {t("home.hero_title_1")}{" "}
              <span className={"text-[#1D5BE8]"}>{t("home.hero_title_2")}</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.3)}
              className={
                "mt-6 max-w-[500px] text-[16px] md:text-[17px] leading-[1.5] text-[#26335F]"
              }
            >
              {t("home.hero_desc")}
            </motion.p>

            <motion.div
              {...fadeUp(0.4)}
              className={"mt-8 flex flex-wrap items-center gap-4"}
            >
              <Link
                href={"/about"}
                className={
                  "flex items-center gap-x-3 h-[48px] px-8 rounded-[14px] bg-[#0D5BF2] text-white text-[15px] font-semibold shadow-[0_12px_28px_rgba(13,91,242,0.35)] hover:bg-[#0A4DD0] transition-colors"
                }
              >
                {t("home.about_btn")}
                <ArrowRightIcon className={"w-5 h-5"} />
              </Link>
              <button
                type={"button"}
                onClick={() => setVideoOpen(true)}
                className={
                  "flex items-center gap-x-3 h-[48px] px-6 rounded-[14px] border border-[#8FA9E6] bg-white/60 backdrop-blur-sm text-[#0B1A4F] text-[15px] font-semibold hover:bg-white transition-colors"
                }
              >
                <PlayIcon className={"w-6 h-6 text-[#1D5BE8]"} />
                {t("home.video_btn")}
              </button>
            </motion.div>
          </div>

          {/* 35 YIL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={
              "hidden lg:flex absolute top-[44px] left-[55%] w-[226px] h-[114px] flex-col items-center justify-center rounded-[18px] border border-white/60 bg-white/20 backdrop-blur-md shadow-[0_8px_32px_rgba(29,91,232,0.12)] text-white"
            }
          >
            <div className={"flex items-center gap-x-2"}>
              <LaurelLeftIcon className={"w-[14px] h-[40px] text-white/90"} />
              <span className={"text-[48px] leading-none font-extrabold"}>
                35
              </span>
              <span className={"text-[26px] leading-none font-bold mt-2"}>
                {t("home.years")}
              </span>
              <LaurelRightIcon className={"w-[14px] h-[40px] text-white/90"} />
            </div>
            <p
              className={
                "mt-2 max-w-[140px] text-center text-[12px] leading-[1.25] text-white/90"
              }
            >
              {t("home.years_desc")}
            </p>
          </motion.div>
        </section>

        {/* STATS */}
        <section
          className={
            "relative z-10 -mt-[150px] md:-mt-[100px] max-w-[1536px] mx-auto px-5 lg:px-[75px]"
          }
        >
          <motion.div
            {...fadeUp(0.5)}
            className={
              "bg-white rounded-[20px] shadow-[0_20px_50px_rgba(16,42,116,0.10)] px-6 lg:px-9 py-6 grid grid-cols-2 lg:flex lg:items-center gap-6 lg:gap-0"
            }
          >
            {stats.map(({ id, value, label, Icon, iconClass }, index) => (
              <div
                key={id}
                className={clsx(
                  "flex items-center gap-x-4 lg:flex-1 lg:px-6 first:lg:pl-0",
                  { "lg:border-l lg:border-[#E6EBF5]": index > 0 }
                )}
              >
                <div
                  className={clsx(
                    "w-[52px] h-[52px] lg:w-[62px] lg:h-[62px] shrink-0 rounded-full flex items-center justify-center",
                    iconClass
                  )}
                >
                  <Icon className={"w-6 h-6 lg:w-7 lg:h-7"} />
                </div>
                <div>
                  <p
                    className={
                      "text-[20px] lg:text-[22px] font-bold leading-tight text-[#0B1A4F]"
                    }
                  >
                    {value}
                  </p>
                  <p className={"text-[13px] lg:text-[14px] text-[#5B6788]"}>
                    {t(label)}
                  </p>
                </div>
              </div>
            ))}

            <Link
              href={"/about"}
              className={
                "hidden xl:flex items-center gap-x-3 pl-6 border-l border-[#E6EBF5] group"
              }
            >
              <div className={"flex -space-x-4"}>
                {thumbPositions.map((pos) => (
                  <div
                    key={pos}
                    className={
                      "w-[50px] h-[50px] rounded-full border-2 border-white bg-cover shadow-md"
                    }
                    style={{
                      backgroundImage: "url(/images/homepage-back.png?v=2)",
                      backgroundSize: "600%",
                      backgroundPosition: pos,
                    }}
                  />
                ))}
              </div>
              <span
                className={
                  "w-[42px] h-[42px] rounded-full border border-[#E3E9F5] flex items-center justify-center text-[#1D5BE8] group-hover:bg-[#1D5BE8] group-hover:text-white transition-colors"
                }
              >
                <ArrowRightIcon className={"w-5 h-5"} />
              </span>
            </Link>
          </motion.div>
        </section>

        {/* DIRECTIONS */}
        <section
          className={
            "max-w-[1536px] mx-auto px-5 lg:px-[60px] pt-12 md:pt-[46px] pb-10"
          }
        >
          <div
            className={
              "flex flex-col md:flex-row md:items-end justify-between gap-5 lg:px-[17px]"
            }
          >
            <div>
              <SectionLabel>{t("home.directions_label")}</SectionLabel>
              <h2
                className={
                  "mt-3 text-[28px] md:text-[36px] font-extrabold tracking-[-0.01em] text-[#0B1A4F]"
                }
              >
                {t("home.directions_title")}
              </h2>
            </div>
            <Link
              href={"/about"}
              className={
                "self-start md:self-auto flex items-center gap-x-3 h-[44px] px-7 rounded-full border border-[#1D5BE8] text-[#1D5BE8] text-[15px] font-semibold hover:bg-[#1D5BE8] hover:text-white transition-colors"
              }
            >
              {t("home.all_directions")}
              <ArrowRightIcon className={"w-5 h-5"} />
            </Link>
          </div>

          <div
            className={
              "mt-7 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5"
            }
          >
            {directions.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <DirectionLink
                  url={item.url}
                  className={clsx(
                    "group block h-full rounded-[20px] border-[3px] border-white bg-gradient-to-b p-4 shadow-[0_8px_30px_rgba(16,42,116,0.06)] transition-all duration-300",
                    item.url &&
                      "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,42,116,0.12)]",
                    item.cardClass
                  )}
                >
                  <div className={"flex items-start gap-x-4 min-h-[80px]"}>
                    <div
                      className={clsx(
                        "w-[60px] h-[60px] shrink-0 rounded-full flex items-center justify-center",
                        item.iconClass
                      )}
                    >
                      <item.Icon className={"w-7 h-7"} />
                    </div>
                    <div className={"flex-1 pt-1"}>
                      <h3
                        className={
                          "text-[16px] font-bold text-[#0B1A4F] leading-tight"
                        }
                      >
                        {t(item.title)}
                      </h3>
                      <p
                        className={
                          "mt-2 text-[12.5px] leading-[1.35] text-[#5B6788]"
                        }
                      >
                        {t(item.desc)}
                      </p>
                    </div>
                    <span
                      className={clsx(
                        "mt-2 w-[40px] h-[40px] shrink-0 rounded-full bg-white shadow-[0_4px_14px_rgba(16,42,116,0.10)] flex items-center justify-center group-hover:translate-x-1 transition-transform",
                        item.arrowClass
                      )}
                    >
                      <ArrowRightIcon className={"w-[18px] h-[18px]"} />
                    </span>
                  </div>
                  <div
                    className={
                      "relative mt-3 h-[150px] xl:h-[114px] rounded-[14px] overflow-hidden"
                    }
                  >
                    <Image
                      src={item.image}
                      alt={t(item.title)}
                      fill
                      sizes={"(min-width: 1280px) 320px, 50vw"}
                      className={
                        "object-cover group-hover:scale-105 transition-transform duration-500"
                      }
                    />
                  </div>
                </DirectionLink>
              </motion.div>
            ))}
          </div>
        </section>

        {/* DISCUSSIONS */}
        {!isEmpty(discussions) && (
          <section className={"max-w-[1536px] mx-auto px-5 lg:px-[77px] py-8"}>
            <div
              className={
                "rounded-[20px] bg-gradient-to-r from-[#102C79] to-[#1D5BE8] text-white px-6 md:px-10 py-7 shadow-[0_20px_50px_rgba(16,44,121,0.25)]"
              }
            >
              <Swiper
                modules={[Navigation, Autoplay]}
                navigation={true}
                autoplay={{ delay: 6000, disableOnInteraction: false }}
                loop={discussions.length > 1}
                className={"home-discussion-swiper"}
              >
                {discussions.map((item) => (
                  <SwiperSlide key={get(item, "id")}>
                    <div
                      className={
                        "flex flex-col md:flex-row md:items-center gap-4 md:gap-8 px-2 md:px-12"
                      }
                    >
                      <div className={"shrink-0"}>
                        <p
                          className={
                            "text-[13px] uppercase tracking-[0.08em] text-white/70"
                          }
                        >
                          {t("home.discussions_label")}
                        </p>
                        <p className={"mt-1 text-[15px] font-semibold"}>
                          {dayjs(get(item, "shnk_datetime")).format(
                            "DD.MM.YYYY"
                          )}
                        </p>
                      </div>
                      <div
                        className={"hidden md:block w-px h-[64px] bg-white/30"}
                      />
                      <div className={"min-w-0"}>
                        <Link
                          href={`/discussion/${get(item, "id", "")}`}
                          className={"hover:underline"}
                        >
                          <h4
                            className={
                              "text-[16px] md:text-[18px] font-bold line-clamp-2"
                            }
                          >
                            {get(item, "shnk_number")} -{" "}
                            {get(item, "shnk_title")}
                          </h4>
                        </Link>
                        <p
                          className={
                            "mt-1 text-[14px] text-white/75 line-clamp-2"
                          }
                        >
                          {get(item, "shnk_description")}
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>
        )}

        {/* NEWS */}
        <section
          className={"max-w-[1536px] mx-auto px-5 lg:px-[77px] pt-8 pb-20"}
        >
          <div
            className={
              "flex flex-col md:flex-row md:items-end justify-between gap-5"
            }
          >
            <div>
              <SectionLabel>{t("home.news_label")}</SectionLabel>
              <h2
                className={
                  "mt-3 text-[28px] md:text-[36px] font-extrabold tracking-[-0.01em] text-[#0B1A4F]"
                }
              >
                {t("home.news_title")}
              </h2>
            </div>
            <Link
              href={"/news"}
              className={
                "self-start md:self-auto flex items-center gap-x-3 h-[48px] px-7 rounded-full border border-[#1D5BE8] text-[#1D5BE8] text-[15px] font-semibold hover:bg-[#1D5BE8] hover:text-white transition-colors"
              }
            >
              {t("all_news")}
              <ArrowRightIcon className={"w-5 h-5"} />
            </Link>
          </div>

          <div
            className={
              "mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            }
          >
            {latestNews.map((news, index) => {
              const date = dayjs(get(news, "news_datetime"));
              return (
                <motion.div
                  key={get(news, "id")}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={`/news/${get(news, "id")}`}
                    className={
                      "group flex flex-col h-full bg-white rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgba(16,42,116,0.07)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,42,116,0.13)] transition-all duration-300"
                    }
                  >
                    <div className={"relative h-[210px] overflow-hidden"}>
                      <img
                        src={get(news, "news_image")}
                        alt={get(news, "news_title")}
                        className={
                          "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        }
                      />
                      <div
                        className={
                          "absolute top-4 left-4 w-[52px] py-2 rounded-[10px] bg-white text-center shadow-[0_4px_14px_rgba(16,42,116,0.15)]"
                        }
                      >
                        <p
                          className={
                            "text-[18px] font-extrabold leading-none text-[#0B1A4F]"
                          }
                        >
                          {date.format("DD")}
                        </p>
                        <p
                          className={
                            "mt-1 text-[10px] font-semibold leading-none uppercase text-[#0B1A4F]"
                          }
                        >
                          {get(monthShort, [lang, date.month()]) ||
                            get(monthShort, ["uz", date.month()])}
                        </p>
                      </div>
                    </div>
                    <div className={"flex flex-col flex-1 px-5 pt-5 pb-6"}>
                      <h3
                        className={
                          "text-[17px] font-bold leading-snug text-[#0B1A4F] group-hover:text-[#1D5BE8] transition-colors line-clamp-2"
                        }
                      >
                        {get(news, "news_title")}
                      </h3>
                      <p
                        className={
                          "mt-3 text-[14.5px] leading-[1.55] text-[#5B6788] line-clamp-2"
                        }
                      >
                        {get(news, "news_desc")}
                      </p>
                      <span
                        className={
                          "mt-auto pt-5 flex items-center gap-x-2 text-[14px] font-semibold text-[#1D5BE8]"
                        }
                      >
                        {t("more_details")}
                        <ArrowRightIcon
                          className={
                            "w-4 h-4 group-hover:translate-x-1 transition-transform"
                          }
                        />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      {videoOpen && (
        <div
          className={
            "fixed inset-0 z-[60] bg-[#07123A]/80 backdrop-blur-sm flex items-center justify-center p-4"
          }
          onClick={() => setVideoOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className={
              "relative w-full max-w-[1100px] aspect-video rounded-[20px] overflow-hidden bg-[#07123A] shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
            }
          >
            <video
              src={"/videos/tmsiti-intro.mp4"}
              poster={"/videos/tmsiti-intro-poster.jpg"}
              autoPlay
              controls
              playsInline
              className={"w-full h-full object-cover"}
            />
            <button
              type={"button"}
              onClick={() => setVideoOpen(false)}
              aria-label={"Yopish"}
              className={
                "absolute top-4 right-4 w-[42px] h-[42px] rounded-full bg-white/15 backdrop-blur-md text-white text-[24px] leading-none flex items-center justify-center hover:bg-white/30 transition-colors"
              }
            >
              ×
            </button>
          </motion.div>
        </div>
      )}
    </Main>
  );
}
