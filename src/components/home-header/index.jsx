import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { get, isEmpty, toUpper } from "lodash";
import { useTranslation } from "react-i18next";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";
import { menuData } from "@/components/menu/menu-data";
import MenuItem from "@/components/menu/menu-item";
import { useSettingsStore } from "@/store";
import { config } from "@/config";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  SearchIcon,
} from "@/components/icons/home";

const findMenu = (title) => menuData.find((item) => item.title === title);

const navItems = [
  { id: "home", title: "homepage", url: "/" },
  { id: "institut", title: "institut", subMenu: findMenu("institut").subMenu },
  { id: "activity", title: "activity", subMenu: findMenu("activity").subMenu },
  {
    id: "documents",
    title: "documents",
    subMenu: findMenu("documents").subMenu,
  },
  { id: "news", title: "home.nav_news", url: "/news" },
];

const matchesPath = (url, pathname) =>
  !!url &&
  url.startsWith("/") &&
  url !== "/#" &&
  (pathname === url || pathname.startsWith(`${url}/`));

// Joriy sahifa manziliga qarab faol menyu bandini aniqlaydi
const getActiveId = (pathname) => {
  if (pathname === "/") return "home";
  const found = navItems.find(
    (item) =>
      item.url !== "/" &&
      (matchesPath(item.url, pathname) ||
        get(item, "subMenu", []).some((sub) =>
          matchesPath(get(sub, "url"), pathname)
        ))
  );
  return get(found, "id");
};

const languages = ["uz", "ru", "en"];

const LangSelect = () => {
  const { i18n } = useTranslation();
  const lang = useSettingsStore((state) =>
    get(state, "lang", config.DEFAULT_APP_LANG)
  );
  const setLang = useSettingsStore((state) => get(state, "setLang", () => {}));
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = lang || i18n.language || config.DEFAULT_APP_LANG;

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const changeLang = (value) => {
    setLang(value);
    i18n.changeLanguage(value);
    setOpen(false);
  };

  return (
    <div ref={ref} className={"relative"}>
      <button
        type={"button"}
        onClick={() => setOpen(!open)}
        className={
          "h-[50px] min-w-[78px] px-4 rounded-full border border-[#E3E9F5] bg-white flex items-center justify-center gap-x-2 text-[15px] font-medium text-[#0B1A4F] hover:border-[#1D5BE8] transition-colors"
        }
      >
        {toUpper(current)}
        <ChevronDownIcon
          className={clsx("w-4 h-4 transition-transform", {
            "rotate-180": open,
          })}
        />
      </button>
      {open && (
        <ul
          className={
            "absolute right-0 mt-2 w-full min-w-[78px] bg-white rounded-2xl shadow-[0_12px_32px_rgba(16,42,116,0.14)] border border-[#EEF2FA] overflow-hidden z-50"
          }
        >
          {languages.map((item) => (
            <li key={item}>
              <button
                type={"button"}
                onClick={() => changeLang(item)}
                className={clsx(
                  "w-full py-2.5 text-[14px] font-medium hover:bg-[#EEF4FF] transition-colors",
                  item === current ? "text-[#1D5BE8]" : "text-[#0B1A4F]"
                )}
              >
                {toUpper(item)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const HomeHeader = () => {
  const router = useRouter();
  const active = getActiveId(get(router, "asPath", "/").split(/[?#]/)[0]);
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(false);
  const [openDropdownMenu, setOpenDropdownMenu] = useState(null);

  return (
    <header
      className={
        "relative z-50 bg-white border-b border-[#EEF2FA] font-jakarta"
      }
    >
      <div
        className={
          "max-w-[1536px] mx-auto px-5 lg:px-[46px] h-[76px] lg:h-[100px] flex items-center justify-between gap-x-4"
        }
      >
        <Link href={"/"} className={"flex items-center gap-x-3 shrink-0"}>
          <Image
            src={"/icons/brand.svg"}
            alt={"TMSITI"}
            width={62}
            height={66}
            className={"w-[46px] h-[50px] lg:w-[62px] lg:h-[66px]"}
          />
          <span
            className={
              "text-[#0B1A4F] font-extrabold text-[24px] lg:text-[30px] leading-none tracking-tight"
            }
          >
            TMSITI
          </span>
        </Link>

        <nav className={"hidden xl:block"}>
          <ul className={"flex items-center gap-x-0.5 2xl:gap-x-1"}>
            {navItems.map((item) => {
              const hasSub = !isEmpty(get(item, "subMenu"));
              const isActive = item.id === active;
              return (
                <li key={item.id} className={"relative group"}>
                  <Link
                    href={get(item, "url") || "#"}
                    onClick={(e) => !get(item, "url") && e.preventDefault()}
                    className={clsx(
                      "flex items-center gap-x-1.5 h-[46px] px-4 2xl:px-[18px] rounded-full text-[14px] 2xl:text-[15px] font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-[#E4EEFF] text-[#1D5BE8]"
                        : "text-[#0B1A4F] hover:bg-[#F1F5FD] hover:text-[#1D5BE8]"
                    )}
                  >
                    {t(item.title)}
                    {hasSub && !item.hideChevron && (
                      <ChevronDownIcon
                        className={
                          "w-4 h-4 transition-transform group-hover:rotate-180"
                        }
                      />
                    )}
                  </Link>

                  {hasSub && (
                    <div
                      className={
                        "invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 absolute left-0 top-full pt-3 z-50"
                      }
                    >
                      <ul
                        className={
                          "w-[300px] bg-white rounded-2xl p-2 shadow-[0_16px_40px_rgba(16,42,116,0.14)] border border-[#EEF2FA]"
                        }
                      >
                        {get(item, "subMenu", []).map((subItem) => (
                          <li key={get(subItem, "id")}>
                            <Link
                              href={get(subItem, "url")}
                              className={
                                "block px-4 py-2.5 rounded-xl text-[14px] font-medium text-[#0B1A4F] hover:bg-[#EEF4FF] hover:text-[#1D5BE8] transition-colors first-letter:uppercase"
                              }
                            >
                              {t(get(subItem, "title"))}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={"flex items-center gap-x-3"}>
          <Link
            href={"/shnq"}
            aria-label={"search"}
            className={
              "hidden md:flex w-[50px] h-[50px] rounded-full bg-[#EAF1FF] text-[#0B1A4F] items-center justify-center hover:bg-[#DCE7FF] transition-colors"
            }
          >
            <SearchIcon className={"w-5 h-5"} />
          </Link>
          <div className={"hidden md:block"}>
            <LangSelect />
          </div>
          <Link
            href={"/contact"}
            className={
              "hidden xl:flex items-center gap-x-3 h-[50px] px-6 rounded-[14px] bg-[#102C79] text-white text-[15px] font-semibold shadow-[0_10px_24px_rgba(16,44,121,0.25)] hover:bg-[#0B2263] transition-colors whitespace-nowrap"
            }
          >
            {t("home.contact_us")}
            <ArrowRightIcon className={"w-5 h-5"} />
          </Link>
          <button
            type={"button"}
            onClick={() => setOpenMenu(true)}
            className={
              "xl:hidden w-[46px] h-[46px] rounded-full bg-[#EAF1FF] text-[#0B1A4F] flex items-center justify-center"
            }
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {openMenu && (
        <div
          className={
            "xl:hidden fixed inset-0 z-50 bg-white overflow-y-auto h-screen"
          }
        >
          <div
            className={
              "flex items-center justify-between px-5 h-[76px] border-b border-[#EEF2FA]"
            }
          >
            <span className={"text-[#0B1A4F] font-extrabold text-[22px]"}>
              TMSITI
            </span>
            <div className={"flex items-center gap-x-3"}>
              <LangSelect />
              <button
                type={"button"}
                onClick={() => setOpenMenu(false)}
                className={
                  "w-[46px] h-[46px] rounded-full bg-[#EAF1FF] text-[#0B1A4F] flex items-center justify-center"
                }
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          <ul className={"flex flex-col text-[#0B1A4F] py-4"}>
            {menuData
              .filter((item) => item.title !== "contact")
              .map((item) => (
              <MenuItem
                key={get(item, "id")}
                item={item}
                openDropdownMenu={openDropdownMenu}
                setOpenDropdownMenu={setOpenDropdownMenu}
              />
            ))}
          </ul>
          <div className={"px-5 pb-8"}>
            <Link
              href={"/contact"}
              className={
                "flex items-center justify-center gap-x-3 h-[52px] rounded-[14px] bg-[#102C79] text-white font-semibold"
              }
            >
              {t("home.contact_us")}
              <ArrowRightIcon className={"w-5 h-5"} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeHeader;
