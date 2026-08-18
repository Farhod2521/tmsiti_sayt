import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Image from "next/image";
import Link from "next/link";
import Title from "@/components/title";
import RightIcon from "@/components/icons/right";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, A11y } from "swiper/modules";
import useGetTMSITIQuery from "@/hooks/api/useGetTMSITIQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { drop, get, head, slice } from "lodash";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import { useSettingsStore } from "@/store";
import { config } from "@/config";
import { useTranslation } from "react-i18next";

export default function Home() {
  const controls = useAnimation();
  
  const { t } = useTranslation();
  const lang = useSettingsStore((state) =>
    get(state, "lang", config.DEFAULT_APP_LANG)
  );

  const { data, isLoading } = useGetTMSITIQuery({
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

  const { data: discussion, isLoading: isLoadingDiscuss } = useGetTMSITIQuery({
    url: URLS.discuss,
    key: KEYS.discuss,
  });

  return (
    
    <Main>
      
      <Menu active={0} className={"relative z-30 !mb-0"} />

      <section className={"w-full bg-[#EAF4FC]"}>
        <div
          className={
            "relative w-full aspect-[1825/862]"
          }
        >
          <Image
            src={"/images/homepagebac.png"}
            alt={"hero-bg"}
            fill
            priority
            sizes={"100vw"}
            className={"object-cover object-center select-none pointer-events-none"}
          />

          <div
            className={
              "absolute inset-0 flex flex-col justify-center gap-y-[2.5%] pl-[4%] pr-[46%]"
            }
          >
            <motion.div
              initial={{ scale: 0.01 }}
              transition={{ delay: 0.3 }}
              animate={{ scale: 1 }}
              className={"bg-white/70 backdrop-blur-[1px] rounded-[6px] px-[3%] py-[2%] w-fit"}
            >
              <h1
                className={
                  "w-[46vw] sm:w-[38vw] md:w-[30vw] text-[4.4vw] sm:text-[3.6vw] md:text-[2.8vw] leading-[1.15] text-[#14255B] font-bold"
                }
              >
                {t("hymn")}
              </h1>
            </motion.div>

            <motion.div
              initial={{ scale: 0.01 }}
              transition={{ delay: 0.5 }}
              animate={{ scale: 1 }}
              className={
                "bg-white/70 backdrop-blur-[1px] rounded-[6px] px-[3%] py-[2%] w-fit flex gap-x-[6%]"
              }
            >
              <div className={"pt-[4%] border-t-[1px] border-[#14255B]"}>
                <Link
                  href={"/shnq"}
                  className={"block uppercase text-[#2E6DFF] text-[1.6vw] sm:text-[1.3vw] md:text-[0.9vw] leading-none"}
                >
                  {t("SHNQ")}
                </Link>

                <Link
                  href={"/shnq"}
                  className={
                    "flex items-center gap-x-[4px] text-[#001A57] hover:text-[#5D84CB] hover:underline text-[2.2vw] sm:text-[1.8vw] md:text-[1.25vw] leading-[1.2] font-bold transition-all duration-400"
                  }
                >
                  <span>{t("shnq")}</span>
                  <RightIcon color={"#2E6DFF"} classname={"w-[1.2vw] h-[1.2vw] min-w-[10px] min-h-[10px] shrink-0"} />
                </Link>
              </div>

              <div className={"pt-[4%] border-t-[1px] border-[#14255B]"}>
                <Link
                  href={"/standards"}
                  className={"block uppercase text-[#2E6DFF] text-[1.6vw] sm:text-[1.3vw] md:text-[0.9vw] leading-none"}
                >
                  {t("standards")}
                </Link>

                <Link
                  href={"/standards"}
                  className={
                    "flex items-center gap-x-[4px] text-[#001A57] hover:text-[#5D84CB] hover:underline text-[2.2vw] sm:text-[1.8vw] md:text-[1.25vw] leading-[1.2] font-bold transition-all duration-400"
                  }
                >
                  <span>{t("standards_desc")}</span>
                  <RightIcon color={"#2E6DFF"} classname={"w-[1.2vw] h-[1.2vw] min-w-[10px] min-h-[10px] shrink-0"} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/*desktop version*/}
      <section
        className={
          "h-[130px]  w-full bg-[#001A57] md:flex hidden items-center justify-center text-[#fff]"
        }
      >
        <motion.div
          initial={{ translateY: 40, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          className={" container mx-auto"}
        >
          <Swiper
            modules={[Pagination, Navigation]}
            navigation={true}
            loop={true}
            className={
              "mx-auto container flex items-center justify-center gap-x-[76px]"
            }
          >
            {get(discussion, "data.results", []).map((item) => (
              <SwiperSlide key={get(item, "id")}>
                <div
                  className={
                    "flex items-center justify-center md:gap-x-[10px] lg:gap-x-[30px] px-[20px]"
                  }
                >
                  <div>
                    <h4 className={"text-sm md:text-xs lg:text-base"}>
                      {t("discussions")}
                    </h4>
                    <p
                      className={
                        "text-[#BCBCBC] text-[14px] text-xs md:text-[10px] lg:text-[14px]"
                      }
                    >
                      {dayjs(get(item, "shnk_datetime")).format(
                        "MMM DD-MM, YYYY"
                      )}
                    </p>
                  </div>

                  <div className={"w-[1px] h-[80px] bg-white"}></div>

                  <div className={"w-[975px]"}>
                    <Link
                      href={`/discussion/${get(item, "id", "")}`}
                      className={
                        "hover:underline cursor-pointer transition-all duration-500"
                      }
                    >
                      <h4 className={"md:text-sm lg:text-xl text-base"}>
                        {get(item, "shnk_number")} - {get(item, "shnk_title")}
                      </h4>
                    </Link>
                    <p
                      className={
                        "text-xs md:text-xs lg:text-base line-clamp-2 md:line-clamp-none text-[#BCBCBC]"
                      }
                    >
                      {get(item, "shnk_description")}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </section>

      {/*mobile version*/}
      <section
        className={
          " md:hidden  flex items-center justify-center text-[#fff] px-[20px]"
        }
      >
        <motion.div
          initial={{ translateY: 40, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          className={" container mx-auto"}
        >
          <Swiper
            modules={[Pagination, Navigation]}
            spaceBetween={300}
            slidesPerView={2}
            loop={true}
            className={
              "mx-auto container flex items-center justify-center gap-x-[76px]"
            }
          >
            {get(discussion, "data.results", []).map((item) => (
              <SwiperSlide key={get(item, "id")}>
                <div
                  className={
                    "flex items-start justify-center flex-col w-[300px] border border-[#001A57]  rounded-[30px]  gap-y-[15px] p-[20px]"
                  }
                >
                  <div>
                    <h4 className={"text-sm md:text-base text-[#001A57]"}>
                      {t("discussions")}
                    </h4>
                    <p
                      className={
                        "text-[#001A57] text-[14px] text-xs md:text-[14px]"
                      }
                    >
                      {dayjs(get(item, "shnk_datetime")).format(
                        "MMM DD-MM, YYYY"
                      )}
                    </p>
                  </div>

                  <div className={""}>
                    <Link
                      href={`/discussion/${get(item, "id", "")}`}
                      className={
                        "hover:underline cursor-pointer transition-all duration-500"
                      }
                    >
                      <h4 className={"md:text-2xl text-base text-[#001A57]"}>
                        {get(item, "shnk_number")} - {get(item, "shnk_title")}
                      </h4>
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </section>
      <motion.section
        initial={{ translateY: 40, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        className={"mb-[82px]"}
      >
        <div
          className={
            "grid grid-cols-12 gap-x-[30px] container mx-auto px-[20px] md:px-0"
          }
        >
          <div
            className={
              "col-span-12 flex justify-between pt-[50px] pb-[30px] items-end "
            }
          >
            <Title>{t("last_news")}</Title>

            <Link
              href={"/news"}
              className={
                "underline text-[#2E6DFF] lg:text-sm xl:text-base md:text-xs text-[12px] font-bold"
              }
            >
              {t("all_news")}
            </Link>
          </div>

          <motion.div
            className={
              "xl:col-span-6 col-span-12 pb-[20px] mb-[20px] md:pb-0 mb:mb-0 md:border-b-0 md:border-none border-b-[#C5C6C7] border-b-[1px] "
            }
          >
            {head(
              NewsInReel.map((item) => (
                <div key={get(item, "id")} className={"grid-cols-12 grid "}>
                  <div
                    className={
                      "col-span-12 xl:w-[690px] lg:w-[600px] md:w-[500px]"
                    }
                  >
                    <Image
                      src={get(item, "news_image")}
                      loader={() => get(item, "news_image")}
                      width={468}
                      height={350}
                      alt="news-main-img"
                      className={
                        "md:w-full md:h-[300px] lg:h-[350px] xl:h-[468px]   object-cover"
                      }
                    />
                    <p className={"text-[#2E6DFF] mt-[30px] font-bold"}>
                      {t("news")}{" "}
                      {dayjs(get(item, "news_datetime")).format("DD.MM.YYYY")}
                    </p>
                    <Link href={`/news/${get(item, "id")}`}>
                      <h2
                        className={
                          "lg:text-2xl md:text-lg text-xl font-bold text-[#001A57] hover:text-[#2E6DFF] hover:underline mt-[20px]  md:line-clamp-none line-clamp-2"
                        }
                      >
                        {get(item, "news_title")}
                      </h2>
                    </Link>
                    <p
                      className={
                        "text-[#A9AFC5] mt-[10px] md:text-base text-sm line-clamp-3 md:line-clamp-6"
                      }
                    >
                      {get(item, "news_desc")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </motion.div>

          <div className={"md:col-span-6 col-span-12"}>
            <ul className={"grid grid-cols-12 "}>
              {drop(
                NewsInReel.map((news) => (
                  <motion.li
                    initial={{ translateX: 100, opacity: 0 }}
                    animate={{ translateX: 0, opacity: 1 }}
                    key={get(news, "id")}
                    className={"col-span-12"}
                  >
                    <div
                      className={
                        "md:grid md:grid-cols-6 flex gap-x-[30px] flex-col-reverse"
                      }
                    >
                      <div className={"md:col-span-3"}>
                        <p
                          className={
                            "text-[#2E6DFF] lg:text-sm md:text-xs text-sm mb-[20px] font-bold"
                          }
                        >
                          {t("news")}{" "}
                          {dayjs(get(news, "news_datetime")).format(
                            "DD.MM.YYYY"
                          )}
                        </p>
                        <Link href={`/news/${get(news, "id")}`}>
                          <h2
                            className={
                              "xl:text-xl lg:text-base md:text-sm text-base  hover:text-[#2E6DFF] hover:underline font-bold lg:line-clamp-5 md:line-clamp-4 line-clamp-3"
                            }
                          >
                            {get(news, "news_title")}
                          </h2>
                        </Link>
                      </div>

                      <div className={"md:col-span-3 md:w-[330px]"}>
                        <img
                          src={get(news, "news_image")}
                          alt={"news-img"}
                          className={
                            "md:w-full lg:h-[189px]   object-cover mb-[10px] md:mb-0"
                          }
                        />
                      </div>
                    </div>

                    <div
                      className={"w-full h-[1px] bg-gray-900 my-[30px]"}
                    ></div>
                  </motion.li>
                ))
              )}
            </ul>
          </div>
        </div>
      </motion.section>
    </Main>
  );
}
