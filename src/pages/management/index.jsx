import React, { useState } from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import useGetTMSITIQuery from "@/hooks/api/useGetTMSITIQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { drop, get, head, isNil } from "lodash";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  CalendarIcon,
  ChevronRightIcon,
  FileTextIcon,
  MailIcon,
  MessageIcon,
  PhoneIcon,
} from "@/components/icons/docs";

// API'dagi rasmlar kichik va oq fonli — shu xodimlar uchun sifatli rasmlar
const localPhotos = {
  1: "/images/management/worker-1.jpg",
  5: "/images/management/worker-5.jpg",
  6: "/images/management/worker-6.jpg",
};

// Lavozim bo'yicha qisqa tavsif (API'da yo'q)
const descriptions = {
  1: "Institut faoliyatini umumiy boshqarish, strategik rivojlanish, ilmiy-tadqiqot yo'nalishlari va xalqaro hamkorlik aloqalarini muvofiqlashtirish.",
  5: "Ilmiy-tadqiqot ishlari, texnik me'yorlash, standartlashtirish va innovatsion rivojlanish yo'nalishlari bo'yicha faoliyatni muvofiqlashtirish.",
  6: "Ma'muriy xo'jalik faoliyati, moliyaviy-iqtisodiy masalalar va umumiy ishlar bo'yicha direktor o'rinbosari.",
};

const receptionDays = {
  du: "Dushanba",
  se: "Seshanba",
  ch: "Chorshanba",
  pa: "Payshanba",
  ju: "Juma",
  sh: "Shanba",
};

const cardShadow = "shadow-[0_10px_40px_rgba(16,42,116,0.07)]";

const getPhoto = (item) =>
  localPhotos[get(item, "id")] || get(item, "worker_image");

const getReception = (item) => {
  const day = get(item, "worker_reception_day");
  return {
    day: get(receptionDays, day, day),
    time: get(item, "worker_reception_time"),
  };
};

const Photo = ({ item, className }) => (
  <div
    className={clsx(
      "relative overflow-hidden rounded-[14px] bg-gradient-to-br from-[#DCE8FA] via-[#EEF4FD] to-[#CFDFF7]",
      className
    )}
  >
    {getPhoto(item) && (
      <Image
        src={getPhoto(item)}
        alt={get(item, "worker_name", "")}
        fill
        unoptimized
        sizes={"300px"}
        className={"object-cover object-top"}
      />
    )}
  </div>
);

const PostBadge = ({ children, large }) => (
  <span
    className={clsx(
      "inline-block rounded-lg bg-[#E4EEFF] font-medium text-[#1D5BE8]",
      large ? "px-4 py-1.5 text-[15px]" : "px-3 py-1 text-[13px]"
    )}
  >
    {children}
  </span>
);

const InfoItem = ({ Icon, label, children, large }) => (
  <div className={"flex items-start gap-3"}>
    <span
      className={clsx(
        "shrink-0 rounded-[12px] bg-[#EEF4FF] text-[#1D5BE8] flex items-center justify-center",
        large ? "w-[46px] h-[46px]" : "w-[42px] h-[42px]"
      )}
    >
      <Icon className={large ? "w-6 h-6" : "w-[22px] h-[22px]"} />
    </span>
    <div
      className={clsx(
        "leading-[1.4] text-[#5B6788]",
        large ? "text-[15px]" : "text-[13px]"
      )}
    >
      <p className={"font-semibold text-[#0B1A4F]"}>{label}</p>
      {children}
    </div>
  </div>
);

const ContactInfo = ({ item, large }) => {
  const { t } = useTranslation();
  const { day, time } = getReception(item);
  return (
    <div className={"flex flex-wrap gap-x-10 gap-y-4"}>
      {(day || time) && (
        <InfoItem Icon={PhoneIcon} label={t("receptionDays")} large={large}>
          {day && <p>{day}</p>}
          {time && <p>{time}</p>}
        </InfoItem>
      )}
      {get(item, "worker_email") && (
        <InfoItem Icon={MailIcon} label={t("email")} large={large}>
          <a
            href={`mailto:${item.worker_email}`}
            className={"text-[#0B1A4F] hover:text-[#1D5BE8]"}
          >
            {item.worker_email}
          </a>
        </InfoItem>
      )}
    </div>
  );
};

// "Batafsil" ochilganda ko'rinadigan qo'shimcha ma'lumotlar
const Details = ({ item }) => {
  const { t } = useTranslation();
  const rows = [
    { label: t("phone"), value: get(item, "worker_phone") },
    { label: t("bachelor"), value: get(item, "worker_bachelor") },
    { label: t("master"), value: get(item, "worker_master") },
    {
      label: "Ilmiy daraja yoki unvon",
      value: get(item, "academic_title"),
    },
  ].filter((row) => !isNil(row.value) && row.value !== "");

  return (
    <motion.dl
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={
        "mt-4 rounded-[12px] bg-[#F6F9FF] border border-[#E6EDFB] px-4 py-3 space-y-2 text-[14px] overflow-hidden"
      }
    >
      {rows.map((row) => (
        <div key={row.label} className={"flex flex-wrap gap-x-2"}>
          <dt className={"text-[#5B6788]"}>{row.label}:</dt>
          <dd className={"font-medium text-[#0B1A4F]"}>
            {row.label === t("phone") ? (
              <a href={`tel:${row.value.replace(/[^\d+]/g, "")}`}>
                {row.value}
              </a>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </motion.dl>
  );
};

const DirectorCard = ({ item }) => {
  const [open, setOpen] = useState(false);
  const actions = [
    {
      id: "reception",
      title: "Qabulga yozilish",
      desc: "Onlayn ariza qoldiring",
      Icon: CalendarIcon,
      iconClass: "bg-[#EEF4FF] text-[#1D5BE8]",
      href: "/contact",
    },
    {
      id: "duties",
      title: "Vakolat va vazifalar",
      desc: "Batafsil ma'lumot",
      Icon: FileTextIcon,
      iconClass: "bg-[#EEF4FF] text-[#1D5BE8]",
      onClick: () => setOpen(!open),
    },
    {
      id: "message",
      title: "Xabar yuborish",
      desc: "Bevosita murojaat",
      Icon: MessageIcon,
      iconClass: "bg-[#E6F6EC] text-[#1E9E62]",
      href: get(item, "worker_email") ? `mailto:${item.worker_email}` : "/contact",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={clsx(
        "bg-white rounded-[22px] border border-[#EEF2FA] p-5 md:p-7 flex flex-col lg:flex-row gap-6 lg:gap-8",
        cardShadow
      )}
    >
      <Photo
        item={item}
        className={"w-full sm:w-[275px] h-[300px] sm:h-[245px] shrink-0"}
      />

      <div className={"flex-1 min-w-0 lg:pr-8 lg:border-r lg:border-[#EEF2FA]"}>
        <PostBadge large>{get(item, "worker_post")}</PostBadge>
        <h2
          className={
            "mt-4 text-[24px] md:text-[30px] font-extrabold leading-tight text-[#0B1A4F]"
          }
        >
          {get(item, "worker_name")}
        </h2>
        {descriptions[get(item, "id")] && (
          <p
            className={
              "mt-3 max-w-[620px] text-[15px] md:text-[17px] leading-[1.55] text-[#5B6788]"
            }
          >
            {descriptions[get(item, "id")]}
          </p>
        )}
        <div className={"mt-6"}>
          <ContactInfo item={item} large />
        </div>
        {open && <Details item={item} />}
      </div>

      <div className={"lg:w-[325px] shrink-0 flex flex-col gap-3"}>
        {actions.map(({ id, title, desc, Icon, iconClass, href, onClick }) => {
          const content = (
            <>
              <span
                className={clsx(
                  "w-[46px] h-[46px] shrink-0 rounded-[12px] flex items-center justify-center",
                  iconClass
                )}
              >
                <Icon className={"w-6 h-6"} />
              </span>
              <span className={"flex-1 text-left"}>
                <span
                  className={"block text-[15px] font-bold text-[#0B1A4F]"}
                >
                  {title}
                </span>
                <span className={"block text-[13px] text-[#5B6788]"}>
                  {desc}
                </span>
              </span>
              <ChevronRightIcon
                className={clsx(
                  "w-5 h-5 text-[#1D5BE8] transition-transform group-hover:translate-x-1",
                  { "rotate-90": id === "duties" && open }
                )}
              />
            </>
          );
          const className =
            "group flex items-center gap-4 rounded-[14px] border border-[#E6EDFB] px-4 py-3.5 hover:border-[#1D5BE8] hover:shadow-[0_8px_24px_rgba(29,91,232,0.10)] transition-all";
          return href ? (
            <Link key={id} href={href} className={className}>
              {content}
            </Link>
          ) : (
            <button
              key={id}
              type={"button"}
              onClick={onClick}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

const DeputyCard = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  const buttonClass =
    "flex-1 min-w-[140px] h-[52px] px-4 rounded-[12px] border border-[#E6EDFB] flex items-center justify-center gap-3 text-[14px] font-medium text-[#0B1A4F] hover:border-[#1D5BE8] hover:text-[#1D5BE8] transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={clsx(
        "bg-white rounded-[22px] border border-[#EEF2FA] p-5 md:p-6 flex flex-col",
        cardShadow
      )}
    >
      <div className={"flex flex-col sm:flex-row gap-5 md:gap-6"}>
        <Photo
          item={item}
          className={"w-full sm:w-[207px] h-[280px] sm:h-[223px] shrink-0"}
        />
        <div className={"flex-1 min-w-0"}>
          <PostBadge>{get(item, "worker_post")}</PostBadge>
          <h3
            className={
              "mt-3 text-[20px] md:text-[22px] font-extrabold leading-tight text-[#0B1A4F]"
            }
          >
            {get(item, "worker_name")}
          </h3>
          {descriptions[get(item, "id")] && (
            <p
              className={
                "mt-3 text-[14px] leading-[1.5] text-[#5B6788]"
              }
            >
              {descriptions[get(item, "id")]}
            </p>
          )}
          <div className={"mt-5"}>
            <ContactInfo item={item} />
          </div>
        </div>
      </div>

      {open && <Details item={item} />}

      <div className={"mt-auto pt-5 flex flex-wrap gap-3"}>
        <Link href={"/contact"} className={buttonClass}>
          <CalendarIcon className={"w-5 h-5 text-[#1D5BE8]"} />
          Qabulga yozilish
        </Link>
        <a
          href={
            get(item, "worker_email")
              ? `mailto:${item.worker_email}`
              : "/contact"
          }
          className={buttonClass}
        >
          <MailIcon className={"w-5 h-5 text-[#1D5BE8]"} />
          Xabar yuborish
        </a>
        <button
          type={"button"}
          onClick={() => setOpen(!open)}
          className={clsx(buttonClass, {
            "!border-[#1D5BE8] !text-[#1D5BE8]": open,
          })}
        >
          <FileTextIcon className={"w-5 h-5 text-[#1D5BE8]"} />
          Batafsil ma&apos;lumot
        </button>
      </div>
    </motion.div>
  );
};

const Management = () => {
  const { data, isLoading } = useGetTMSITIQuery({
    key: KEYS.workers,
    url: URLS.workers,
  });
  const { t } = useTranslation();
  const workers = get(data, "data", []);
  const director = head(workers);
  const deputies = drop(workers);

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
              "relative max-w-[1536px] mx-auto px-5 lg:px-[107px] pt-5 pb-[80px]"
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
              <span className={"text-[#0B1A4F]"}>{t("leadership")}</span>
            </nav>

            <h1
              className={
                "mt-8 text-[40px] md:text-[62px] leading-none font-extrabold tracking-[-0.01em] text-[#0B1A4F]"
              }
            >
              {t("leadership")}
            </h1>
            <p
              className={
                "mt-5 max-w-[470px] text-[16px] md:text-[18px] leading-[1.5] text-[#5B6788]"
              }
            >
              Institut faoliyatini boshqaruvchi rahbarlar va ularning
              o&apos;z yo&apos;nalishlari bo&apos;yicha ma&apos;lumotlari.
            </p>
          </div>
        </section>

        <section
          className={
            "relative z-10 -mt-[52px] max-w-[1536px] mx-auto px-4 md:px-5 lg:px-[80px] pb-16"
          }
        >
          {isLoading ? (
            <div
              className={clsx(
                "bg-white rounded-[22px] p-7 flex gap-8 animate-pulse",
                cardShadow
              )}
            >
              <div className={"w-[275px] h-[245px] rounded-[14px] bg-[#EEF2FA]"} />
              <div className={"flex-1 space-y-4 pt-3"}>
                <div className={"h-7 w-24 rounded-lg bg-[#EEF2FA]"} />
                <div className={"h-8 w-2/3 rounded-lg bg-[#EEF2FA]"} />
                <div className={"h-5 w-full rounded-lg bg-[#EEF2FA]"} />
              </div>
            </div>
          ) : (
            director && <DirectorCard item={director} />
          )}

          {deputies.length > 0 && (
            <>
              <div className={"mt-10"}>
                <h2
                  className={
                    "text-[26px] md:text-[30px] font-extrabold text-[#0B1A4F]"
                  }
                >
                  Direktor o&apos;rinbosarlari
                </h2>
                <span
                  className={
                    "block mt-3 w-[48px] h-[4px] rounded-full bg-[#1D5BE8]"
                  }
                />
              </div>

              <div className={"mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4"}>
                {deputies.map((item, index) => (
                  <DeputyCard key={get(item, "id")} item={item} index={index} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </Main>
  );
};

export default Management;
