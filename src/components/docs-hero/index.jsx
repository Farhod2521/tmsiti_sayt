// Me'yoriy hujjatlar sahifalari uchun umumiy hero (Qurilish reglamentlari, Ma'lumotnoma, Qonunlar)
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@/components/icons/docs";

const DocsHero = ({ crumbs = [], Icon, title, subtitle, children }) => (
  <section className={"relative overflow-hidden"}>
    <Image
      src={"/images/homepage-back.png?v=2"}
      unoptimized
      alt={""}
      fill
      priority
      sizes={"100vw"}
      className={"object-cover object-[80%_25%] select-none pointer-events-none"}
    />
    <div className={"absolute inset-0 bg-white/90 md:bg-transparent md:bg-gradient-to-r md:from-white md:via-white/85 md:to-white/10"} />
    <div className={"absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-t from-[#F6F9FF] to-transparent"} />
    <div className={"relative max-w-[1536px] mx-auto px-5 lg:px-[85px] pt-6 pb-[86px]"}>
      <nav className={"flex flex-wrap items-center gap-x-2 text-[13px] text-[#0B1A4F]"}>
        <HomeIcon className={"w-4 h-4 text-[#1D5BE8]"} />
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRightIcon className={"w-3.5 h-3.5 text-[#8A95B0]"} />}
            {c.href ? (
              <Link href={c.href} className={"hover:text-[#1D5BE8]"}>{c.label}</Link>
            ) : (
              <span className={i === crumbs.length - 1 ? "text-[#5B6788]" : ""}>{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <div className={"mt-7 flex items-start gap-5"}>
        {Icon && (
          <span className={"hidden sm:flex w-[84px] h-[84px] shrink-0 rounded-[22px] bg-[#E8F0FE] text-[#1D5BE8] items-center justify-center shadow-[0_8px_24px_rgba(29,91,232,0.12)]"}>
            <Icon className={"w-11 h-11"} />
          </span>
        )}
        <div>
          <h1 className={"text-[30px] md:text-[44px] leading-[1.1] font-extrabold tracking-[-0.02em] text-[#0B1A4F]"}>{title}</h1>
          {subtitle && <p className={"mt-3 max-w-[600px] text-[15px] md:text-[16px] leading-[1.55] text-[#3E4B70]"}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  </section>
);

export default DocsHero;
