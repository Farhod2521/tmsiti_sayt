import React from "react";
import Image from "next/image";
import Link from "next/link";
import useGetTMSITIQuery from "@/hooks/api/useGetTMSITIQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { get, isEmpty, isNil } from "lodash";
import { useTranslation } from "react-i18next";

const Card = ({
  name,
  img,
  position,
  phone,
  mail,
  receptionDays,
  bachelor,
  master,
  academicTitle,
}) => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetTMSITIQuery({
    key: KEYS.workers,
    url: URLS.workers,
  });

  return (
    <>
      <div
        className={
          "flex  gap-x-[30px] flex-col md:flex-row items-center md:items-start border px-[10px] rounded-[5px] shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px] md:shadow-none md:rounded-0 md:px-0 md:border-none"
        }
      >
        <div className={"min-w-[210px] h-[250px]"}>
          <img
            src={`${img}`}
            alt={"profile-img"}
            className={" w-[210px] h-[250px] object-contain"}
          />
        </div>

        <div className={""}>
          {/* lavozim */}
          <h4
            className={
              "md:text-lg text-base  text-[#2B4764] text-center md:text-start mt-[10px] md:mt-0"
            }
          >
            {position}
          </h4>
          {/* F.I.O */}
          <h2
            className={
              "font-semibold text-lg md:text-2xl mb-[30px] text-center md:text-start"
            }
          >
            {name}
          </h2>
          {/* Qabul kunlari */}
          <p
            className={
              "lg:text-base md:text-sm text-xs mt-[10px] text-center md:text-start"
            }
          >
            {t("receptionDays")}: {receptionDays}
          </p>
          {/* Telefon raqam */}
          {/* <div className={"text-center md:text-start mt-[10px]"}>
            <Link
              className={"lg:text-base md:text-sm text-xs text-[#001A57] "}
              href={`tel:${phone}`}
            >
              {t("phone")}: {phone}
            </Link>{" "}
          </div> */}

          {/* Mail pochta */}
          <div className={"text-center md:text-start mt-[10px]"}>
            <Link
              className={" lg:text-base md:text-sm text-xs text-[#001A57] "}
              href={`mailto:${mail}`}
            >
              {t("email")}: {mail}{" "}
            </Link>
          </div>
          {/* Bachelor */}
          {/* <p
            className={
              " lg:text-base md:text-sm text-xs mt-[10px] text-center md:text-start "
            }
          >
            {t("bachelor")}: {bachelor}
          </p> */}
          {/* Master */}
          <p
            className={
              " lg:text-base md:text-sm text-xs mt-[10px] text-center md:text-start"
            }
          >
            {master}
          </p>
          {/* Ilmiy daraja yoki unvon   */}
          <p
            className={
              " lg:text-base md:text-sm text-xs mt-[10px] text-center md:text-start"
            }
          >
            {academicTitle}
          </p>
        </div>
      </div>
    </>
  );
};

export default Card;
