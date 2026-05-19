import React from "react";
import Brand from "@/components/brand";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer>
      <div
        className={"bg-[#28366D] bg-no-repeat bg-cover  py-[50px]  "}
        style={{ backgroundImage: "url(/images/footer-background.png)" }}
      >
        <div className={"container mx-auto text-white"}>
          <div className="grid md:grid-cols-12 grid-rows-12 gap-x-[30px] px-[20px] text-center md:text-start">
            <div className="row-span-12 md:col-span-3 ">
              <Brand active={1} />
              <p className={"my-5  md:w-auto"}>{t("institut_desc")}</p>
              <p>{t("check_text")}</p>
              <ul
                className={
                  "flex justify-center md:justify-start items-center my-2.5 gap-x-[10px]"
                }
              >
                <li>
                  <p>{t("social_networks")}:</p>
                </li>
                <li>
                  <Link href={"#"}>
                    <Image
                      width={24}
                      alt={"social-media"}
                      height={24}
                      src={"/icons/telegram.svg"}
                    />
                  </Link>
                </li>
                <li>
                  <Link href={"#"}>
                    <Image
                      width={24}
                      alt={"social-media"}
                      height={24}
                      src={"/icons/instagram.svg"}
                    />
                  </Link>
                </li>
                <li>
                  <Link href={"#"}>
                    <Image
                      width={24}
                      alt={"social-media"}
                      height={24}
                      src={"/icons/facebook.svg"}
                    />
                  </Link>
                </li>
              </ul>
            </div>
            <div
              className={
                " row-span-12  md:col-span-9 flex flex-col md:flex-row justify-center  md:justify-end gap-x-[30px]"
              }
            >
              <div className="">
                <h4
                  className={
                    "md:text-xl text-lg font-bold mb-[10px] md:mb-[30px]"
                  }
                >
                  {t("institut")}
                </h4>
                <ul className={"text-[#D9D9D9] text-sm md:text-base"}>
                  <li className={"mb-[10px]"}>
                    <Link href={"/about"}>{t("about_institute")}</Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"/management"}>{t("leadership")}</Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"/structure"}>
                      {t("organizational_structure")}
                    </Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"/structural-divisions"}>{t("structure")}</Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"/vacancies"}>{t("vacancies")}</Link>
                  </li>
                  {/*<li className={'mb-[10px]'}>*/}
                  {/*    <Link href={'/classifier'}>Laboratoriya</Link>*/}
                  {/*</li>*/}
                  {/*<li className={'mb-[10px]'}>*/}
                  {/*    <Link href={'#'}>O‘quv markazi</Link>*/}
                  {/*</li>*/}
                </ul>
              </div>

              <div className="">
                <h4
                  className={
                    "md:text-xl text-lg font-bold mb-[10px] md:mb-[30px]"
                  }
                >
                  {t("documents")}
                </h4>
                <ul className={"text-[#D9D9D9]"}>
                  <li className={"mb-[10px]"}>
                    <Link href={"#"}>{t("laws")}</Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"/shnk"}>{t("shnq")}</Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"/standards"}>{t("standards")}</Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"/works"}>{t("building_regulations")}</Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"/discussion"}>{t("discussions")}</Link>
                  </li>
                </ul>
              </div>

              <div className="">
                <h4
                  className={
                    "md:text-xl text-lg font-bold mb-[10px] md:mb-[30px]"
                  }
                >
                  {t("activity")}
                </h4>
                <ul className={"text-[#D9D9D9]"}>
                  <li className={"mb-[10px]"}>
                    <Link href={"https://catalog.tmsiti.uz/classifier"}>
                      {t("classifier")}
                    </Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"#"}>{t("e_fond")}</Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"#"}>{t("lab")}</Link>
                  </li>
                </ul>
              </div>

              <div className="">
                <h4
                  className={
                    "md:text-xl text-lg font-bold mb-[10px] md:mb-[30px]"
                  }
                >
                  {t("messages")}
                </h4>
                <ul className={"text-[#D9D9D9]"}>
                  <li className={"mb-[10px]"}>
                    <Link href={"/announcement"}>{t("announcements")}</Link>
                  </li>

                  <li className={"mb-[10px]"}>
                    <Link href={"/news"}>{t("news")}</Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"#"}>{t("meetings")}</Link>
                  </li>
                  <li className={"mb-[10px]"}>
                    <Link href={"#"}>{t("events")}</Link>
                  </li>

                  <li className={"mb-[10px]"}>
                    <Link href={"#"}>{t("cooperation")}</Link>
                  </li>
                </ul>
              </div>

              <div className="">
                <Link href={"/contact"}>
                  <h4
                    className={
                      "md:text-xl capitalize text-lg font-bold mb-[10px] md:mb-[30px]"
                    }
                  >
                    {t("contact")}
                  </h4>
                </Link>
                <ul className={"text-[#D9D9D9]"}>
                  <li className={"text-base mb-[10px]"}>
                    <p>{t("address")}</p>
                  </li>
                  <li className={" text-base  mb-[10px]"}>
                    <Link href={"tel:+998 55 900-00-59"}>
                      {t("phone")}: +998 55 900-00-59
                    </Link>{" "}
                    <br />
                  </li>
                  <li className={"text-base flex flex-col mb-[10px]"}>
                    <Link
                      href={"mailto:info@tmsiti.uz"}
                      className={"mb-[10px]"}
                    >
                      {t("email")}: info@tmsiti.uz
                    </Link>
                    <Link href={"mailto:TMSITI@exat.uz"}>
                      EXAT: TMSITI@exat.uz
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={
          "bg-[#001A57] h-[50px] md:h-[30px] w-full text-[#fff] flex justify-center items-center text-[10px] md:text-xs"
        }
      >
        <p>{t("company_name")} | All rights reserved © 2021</p>
      </div>
    </footer>
  );
};
export default Footer;
