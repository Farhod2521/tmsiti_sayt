import React from "react";
import Image from "next/image";
import Link from "next/link";
import Lang from "@/components/lang";

const Header = ({ selectingLanguage }) => {
  return (
    <header className={"hidden md:block"}>
      <div className={"bg-[#182041] py-2"}>
        <div className={"container mx-auto text-white text-sm"}>
          <div className={"flex items-center justify-end"}>
            <div className={"flex mr-[40px] items-center gap-x-[10px]"}>
              <Image
                src={"/icons/phone.svg"}
                alt={"phone"}
                width={20}
                height={20}
                className={"w-[12px] h-[12px] md:w-[20px] md:h-[20px]"}
              />
              <Link
                className={"text-[12px] md:text-base"}
                href={"tel:+998 55 900-00-59"}
              >
                +998 55 900-00-59
              </Link>
            </div>

            <div className={"flex mr-[30px] gap-x-[10px]"}>
              <Image
                src={"/icons/mail.svg"}
                alt={"phone"}
                width={20}
                height={20}
                className={"w-[12px] h-[12px] md:w-[20px] md:h-[20px]"}
              />
              <Link href={"mailto: info@tmsiti.uz"}>info@tmsiti.uz</Link>
              <div className={"w-[1px] max-h-full mx-[3px] bg-white"}></div>

              <Image
                src={"/icons/mail.svg"}
                alt={"phone"}
                width={20}
                height={20}
                className={"w-[12px] h-[12px] md:w-[20px] md:h-[20px]"}
              />
              <Link href={"mailto: TMSITI@exat.uz"}>TMSITI@exat.uz</Link>
            </div>

            <Lang />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
