import React from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  BoltIcon,
  ChartBoxIcon,
  ChevronRightIcon,
  CubeIcon,
  DatabaseIcon,
  DownloadIcon,
  FileTextIcon,
  GraduationIcon,
  InfoIcon,
  PrinterIcon,
  ServerIcon,
  ShieldCheckIcon,
  TargetIcon,
} from "@/components/icons/docs";
import { BookIcon, GearIcon } from "@/components/icons/home";
import { ArrowRightIcon } from "@/components/icons/home";

const CERTIFICATE = "/images/certificate.png";

// Qurilish vazirining 2022-yil 22-noyabrdagi 202-sonli buyrug'i bo'yicha
const tasks = [
  {
    desc: (
      <>
        qurilish resurslarini guruhlarga va bo‘limlarga tasniflagan holda, har
        biri alohida identifikatsiya raqamlanishi va standartlarga muvofiq
        nomlanishini nazarda tutuvchi{" "}
        <strong>“Qurilish resurslari milliy klassifikatori”</strong> elektron
        platformasini (keyingi o‘rinlarda – Milliy klassifikator) joriy etish;
      </>
    ),
    Icon: DatabaseIcon,
    iconClass: "bg-[#E8F0FE] text-[#2B5CD9]",
  },
  {
    desc: (
      <>
        Milliy klassifikatorga kiritilgan qurilish materiallari va xizmatlari
        (ishlari) bo‘yicha ishlab chiqaruvchi tomonidan taklif etilayotgan
        narxlarning elektron katalogini (keyingi o‘rinlarda – Elektron katalog){" "}
        <strong>“Shaffof qurilish”</strong> milliy axborot tizimi orqali joriy
        etish;
      </>
    ),
    Icon: BookIcon,
    iconClass: "bg-[#EEEAFD] text-[#6D4FE0]",
  },
  {
    desc: (
      <>
        <strong>obyektlarni axborot modellashtirish </strong>(BIM / Building
        Information Modeling) texnologiyalari asosida loyihalashtirish,
        qurilish jarayonlarining barcha ishtirokchilarini ma’lumotlar bilan
        ta’minlash hamda umumiy ma’lumotlar muhiti (CDE / Common data
        environment)
      </>
    ),
    Icon: CubeIcon,
    iconClass: "bg-[#E4F6EC] text-[#1E9E62]",
  },
  {
    desc: (
      <>
        dasturiy-texnik majmua vositalarida qurilish loyihalarining raqamli
        boshqaruv tizimini (keyingi o‘rinlarda – Loyiha boshqaruvi tizimi)
        joriy etish;
      </>
    ),
    Icon: GearIcon,
    iconClass: "bg-[#FFEEE4] text-[#F0692A]",
  },
  {
    desc: (
      <>
        shaharsozlik hujjatlari, reglamentlar, shaharsozlik normalari va
        qoidalari va standartlarni ishlab chiqish, mavjudlarini
        takomillashtirish, amaliyotda qo‘llash bilan bog‘liq muammolarni tahlil
        qilish hamda bugungi kunda amalga oshirilayotgan islohotlar hamda
        xalqaro norma va standartlar bilan uyg‘unlashtirish;
      </>
    ),
    Icon: FileTextIcon,
    iconClass: "bg-[#E8F0FE] text-[#2B5CD9]",
  },
  {
    desc: (
      <>
        sohaga oid texnik jihatidan tartibga solishga doir milliy normativ
        hujjatlar, shuningdek, qurilish sohasidagi xorijiy standartlar, normalar
        va qoidalarning yagona reestri, elektron bazasi va fondini
        shakllantirish;
      </>
    ),
    Icon: ChartBoxIcon,
    iconClass: "bg-[#FDE8F1] text-[#D6336C]",
  },
  {
    desc: (
      <>
        vazirliklar va idoralar tomonidan yangi ishlab chiqilgan yoki
        takomillashtirilgan shaharsozlik hujjatlari loyihalariga amaldagi
        texnik jihatdan tartibga solish sohasidagi me’yoriy hujjatlarga
        muvofiqligi yuzasidan xulosalar berish tizimini raqamlashtirish;
      </>
    ),
    Icon: ShieldCheckIcon,
    iconClass: "bg-[#E4F6EC] text-[#1E9E62]",
  },
  {
    desc: (
      <>
        qurilishda BIM texnologiyalarini joriy etishda implementator (joriy
        etuvchi) funksiyasini bajarish, Institutda tashkil etilayotgan
        BIM-server va axborotlarni qayta ishlash markazi faoliyatini yo‘lga
        qo‘yish, shuningdek, axborot modellarining markazlashgan bankini
        shakllantirirish;
      </>
    ),
    Icon: ServerIcon,
    iconClass: "bg-[#EEEAFD] text-[#6D4FE0]",
  },
  {
    desc: (
      <>
        maqsadli dasturlar doirasida qurilishda xalqaro tajribalarga asoslangan
        BIM standartlarini va yagona talablarni ishlab chiqish, shuningdek, BIM
        texnologiyalarini buyurtmachi, loyihalash va qurilish bosqichlarida
        joriy etish holatining monitoringini yo‘lga qo‘yish;
      </>
    ),
    Icon: TargetIcon,
    iconClass: "bg-[#FFEEE4] text-[#F0692A]",
  },
  {
    desc: (
      <>
        BIM texnologiyalari asosida ishlab chiqilgan loyiha hujjatlarining
        energiya tejamkorlikka oid qismini ekspertizadan o‘tkazish;
      </>
    ),
    Icon: BoltIcon,
    iconClass: "bg-[#FFF6DB] text-[#D99A00]",
  },
  {
    desc: (
      <>
        sohaga oid tegishli yo‘nalishlarda kadrlarni maqsadli tayyorlash va
        malakasini oshirish (shu jumladan, mahalliy va xorijiy ta’lim va
        ilmiy-tadqiqot muassasalari bilan hamkorlikda yoki qo‘shma ta’lim
        dasturlari asosida).
      </>
    ),
    Icon: GraduationIcon,
    iconClass: "bg-[#E8F0FE] text-[#2B5CD9]",
  },
];

const cardShadow = "shadow-[0_10px_40px_rgba(16,42,116,0.07)]";

const printCertificate = () => {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(
    `<html><head><title>Guvohnoma</title><style>@page{margin:10mm}body{margin:0;display:flex;justify-content:center}img{max-width:100%;max-height:100vh}</style></head><body><img src="${window.location.origin}${CERTIFICATE}" onload="window.print();window.close()"></body></html>`
  );
  win.document.close();
};

const About = () => {
  const { t } = useTranslation();

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
              "absolute inset-0 bg-white/80 md:bg-transparent md:bg-gradient-to-r md:from-white md:via-white/85 md:to-white/0"
            }
          />
          <div
            className={
              "relative max-w-[1536px] mx-auto px-5 lg:px-[120px] pt-5 pb-[70px]"
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
              <span className={"text-[#0B1A4F]"}>{t("about_us")}</span>
            </nav>

            <span
              className={
                "inline-block mt-6 px-2.5 py-1 rounded-md bg-[#E4EEFF] text-[13px] font-bold tracking-wide text-[#1D5BE8] uppercase"
              }
            >
              {t("institut")}
            </span>
            <h1
              className={
                "mt-3 text-[38px] md:text-[56px] leading-none font-extrabold tracking-[-0.01em] text-[#0B1A4F]"
              }
            >
              {t("about_us")}
            </h1>
            <p
              className={
                "mt-4 max-w-[700px] text-[16px] md:text-[18px] leading-[1.45] text-[#5B6788]"
              }
            >
              Institutning faoliyati, asosiy vazifalari va yo&apos;nalishlari
              haqidagi to&apos;liq ma&apos;lumotlar.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section
          className={
            "relative z-10 -mt-[40px] max-w-[1536px] mx-auto px-3 md:px-5 lg:px-[72px] pb-16"
          }
        >
          <div
            className={clsx(
              "bg-white/80 backdrop-blur-sm rounded-[24px] border border-white p-4 md:p-6 lg:p-8 flex flex-col xl:flex-row gap-8",
              cardShadow
            )}
          >
            {/* Main */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={"flex-1 min-w-0"}
            >
              <div className={"flex gap-5"}>
                <span
                  className={
                    "hidden sm:flex w-[62px] h-[62px] shrink-0 rounded-[16px] bg-[#E8F0FE] text-[#2B5CD9] items-center justify-center"
                  }
                >
                  <FileTextIcon className={"w-8 h-8"} />
                </span>
                <p
                  className={
                    "text-[16px] md:text-[17px] leading-[1.6] text-[#1E2B5A]"
                  }
                >
                  O&apos;zbekiston Respublikasi Qurilish va uy-joy kommunal
                  xo&apos;jaligi vazirligi huzuridagi{" "}
                  <strong className={"text-[#0B1A4F]"}>
                    «Qurilishda texnik me&apos;yorlash va standartlashtirish
                    ilmiy-tadqiqot instituti»
                  </strong>{" "}
                  Davlat muassasasi O&apos;zbekiston Respublikasi
                  Prezidentining 2022-yil 22-sentabrdagi{" "}
                  <strong className={"text-[#0B1A4F]"}>
                    “Respublikada kapital qurilish sohasida buyurtmachi
                    xizmati faoliyatini takomillashtirish chora-tadbirlari
                    to&apos;g&apos;risida”
                  </strong>
                  gi{" "}
                  <a
                    href={"https://lex.uz/uz/docs/-6203336"}
                    target={"_blank"}
                    rel={"noopener noreferrer"}
                    className={"text-[#1D5BE8] underline underline-offset-2"}
                  >
                    PQ-378-son
                  </a>{" "}
                  qaroriga asosan O&apos;zbekiston Respublikasi Qurilish
                  vazirligi huzurida tashkil etilgan.
                </p>
              </div>

              <div className={"mt-8"}>
                <span className={"block w-[28px] h-[3px] rounded-full bg-[#1D5BE8]"} />
                <h2
                  className={
                    "mt-3 text-[24px] md:text-[26px] font-extrabold text-[#0B1A4F]"
                  }
                >
                  Asosiy vazifalar
                </h2>
                <p className={"mt-1 text-[14px] md:text-[15px] text-[#5B6788]"}>
                  Qurilish vazirining 2022-yil 22-noyabrdagi 202-sonli
                  buyrug&apos;iga ko&apos;ra institut faoliyatining ustuvor
                  yo&apos;nalishlari:
                </p>
              </div>

              <ol className={"mt-5 space-y-3"}>
                {tasks.map(({ desc, Icon, iconClass }, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
                    className={
                      "flex items-start sm:items-center gap-3 sm:gap-4 rounded-[14px] border border-[#EEF2FA] bg-white px-3 sm:px-4 py-3.5 hover:border-[#D6E2FB] hover:shadow-[0_8px_24px_rgba(16,42,116,0.06)] transition-all"
                    }
                  >
                    <span
                      className={
                        "w-[40px] h-[40px] shrink-0 rounded-full border border-[#E6EDFB] flex items-center justify-center text-[14px] font-semibold text-[#0B1A4F]"
                      }
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={clsx(
                        "hidden sm:flex w-[46px] h-[46px] shrink-0 rounded-[12px] items-center justify-center",
                        iconClass
                      )}
                    >
                      <Icon className={"w-6 h-6"} />
                    </span>
                    <p
                      className={
                        "min-w-0 text-[14px] leading-[1.55] text-[#1E2B5A] [&_strong]:text-[#0B1A4F]"
                      }
                    >
                      {desc}
                    </p>
                  </motion.li>
                ))}
              </ol>
            </motion.div>

            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className={"xl:w-[440px] shrink-0"}
            >
              <div className={"xl:sticky xl:top-6 space-y-4"}>
                <div
                  className={clsx(
                    "relative rounded-[18px] bg-white border border-[#E6EDFB] p-3",
                    cardShadow
                  )}
                >
                  <div className={"flex items-center justify-between px-1 pb-3"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-md bg-[#E6F6EC] text-[12px] font-medium text-[#1E9E62]"
                      }
                    >
                      Asosiy hujjat
                    </span>
                    <span className={"text-[12px] text-[#8A95B0]"}>
                      Kattalashtirish uchun bosing
                    </span>
                  </div>
                  <a
                    href={CERTIFICATE}
                    target={"_blank"}
                    rel={"noopener noreferrer"}
                    className={"block"}
                  >
                    <img
                      src={CERTIFICATE}
                      alt={"Yuridik shaxsni davlat ro'yxatidan o'tkazilganligi to'g'risidagi guvohnoma"}
                      className={"w-full rounded-[10px]"}
                    />
                  </a>
                </div>

                <div className={"grid grid-cols-2 gap-3"}>
                  <a
                    href={CERTIFICATE}
                    download={"TMSITI-guvohnoma.png"}
                    className={
                      "flex items-center gap-3 rounded-[14px] bg-[#1D4FC4] px-4 py-4 text-white shadow-[0_10px_24px_rgba(29,79,196,0.3)] hover:bg-[#173FA0] transition-colors"
                    }
                  >
                    <DownloadIcon className={"w-7 h-7 shrink-0"} />
                    <span>
                      <span className={"block text-[14px] font-semibold leading-tight"}>
                        Guvohnomani yuklab olish
                      </span>
                      <span className={"block mt-0.5 text-[12px] text-white/75"}>
                        PNG
                      </span>
                    </span>
                  </a>
                  <button
                    type={"button"}
                    onClick={printCertificate}
                    className={
                      "flex items-center gap-3 rounded-[14px] border-2 border-[#1D4FC4] bg-white px-4 py-4 text-left text-[#1D4FC4] hover:bg-[#EEF4FF] transition-colors"
                    }
                  >
                    <PrinterIcon className={"w-7 h-7 shrink-0"} />
                    <span>
                      <span className={"block text-[14px] font-semibold leading-tight"}>
                        Chop etish
                      </span>
                      <span className={"block mt-0.5 text-[12px] text-[#5B6788]"}>
                        Guvohnoma
                      </span>
                    </span>
                  </button>
                </div>

                <Link
                  href={"/management"}
                  className={
                    "group flex items-center gap-4 rounded-[16px] bg-[#EEF4FF] px-5 py-5 hover:bg-[#E4EEFF] transition-colors"
                  }
                >
                  <span
                    className={
                      "w-[50px] h-[50px] shrink-0 rounded-full bg-white flex items-center justify-center"
                    }
                  >
                    <InfoIcon className={"w-7 h-7 text-white fill-[#1D5BE8]"} />
                  </span>
                  <span className={"flex-1"}>
                    <span className={"block text-[15px] font-bold text-[#0B1A4F]"}>
                      Tezkor ma&apos;lumot
                    </span>
                    <span className={"block mt-1 text-[13px] leading-[1.45] text-[#5B6788]"}>
                      Institut rahbariyati, tarkibiy bo&apos;linmalari va
                      ular bilan bog&apos;lanish ma&apos;lumotlari
                    </span>
                  </span>
                  <span
                    className={
                      "flex items-center gap-1.5 text-[14px] font-semibold text-[#1D5BE8]"
                    }
                  >
                    Batafsil
                    <ArrowRightIcon className={"w-4 h-4 group-hover:translate-x-1 transition-transform"} />
                  </span>
                </Link>
              </div>
            </motion.aside>
          </div>
        </section>
      </div>
    </Main>
  );
};

export default About;
