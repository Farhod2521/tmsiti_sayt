import React from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Link from "next/link";

import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";

import parse from "html-react-parser";
import { useSettingsStore } from "@/store";
import { useTranslation } from "react-i18next";
import { get, groupBy } from "lodash";
import useGetSHNKQuery from "@/hooks/api/useGetSHNKQuery";

const Index = () => {
  const { t } = useTranslation();
  const { data, isLoading, isFetching } = useGetSHNKQuery({
    key: KEYS.buildingRegulations,
    url: URLS.buildingRegulations,
  });

  const language = useSettingsStore((state) => get(state, "lang", ""));
  
  // Ma'lumotlarni guruh bo'yicha guruhlash
  const groupedData = groupBy(get(data, "data", []), "group");
  
  // Guruhlarni tartiblash (01-, 02-, ... ketma-ketligida)
  const sortedGroups = Object.keys(groupedData).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });

  // Har bir guruhdagi elementlarni sanash uchun umumiy counter
  let globalCounter = 1;

  return (
    <Main>
      <Menu />
      <section className={"bg-[#EFF3FA] text-xs text-[#607198] mb-[70px]"}>
        <div
          className={
            "container py-[12px] px-[20px] md:px-[15px] lg:px-[10px] xl:px-0"
          }
        >
          <Link href={"/"}>{t("homepage")} / </Link>
          <Link href={"#"}>{t("documents")} / </Link>
          <Link href={"#"}>{t("building_regulations")}</Link>
        </div>
      </section>

      <section
        className={
          "grid grid-cols-12 container mx-auto mb-[50px] px-[20px] md:px-0"
        }
      >
        <h1 className="col-span-12 text-3xl mb-8 font-semibold">
          {t("building_regulations")}
        </h1>
        
        {sortedGroups.map((groupName, groupIndex) => {
          const groupDocs = groupedData[groupName];
          const groupStartCounter = globalCounter;
          
          return (
            <div key={groupIndex} className="col-span-12 mb-8">
              {/* Guruh nomi */}
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">
                {groupName}
              </h2>
              
              {/* Guruh uchun jadval */}
              <table className="border-collapse border border-gray-300 w-full text-left mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-center w-16">
                      №
                    </th>
                    <th className="border border-gray-300 px-4 py-2 w-32">
                      Белгиланиши
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Қурилиш регламентлари номи
                    </th>
                    <th className="border border-gray-300 text-center px-4 py-2 w-32">
                      Ҳужжат
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupDocs.map((doc, docIndex) => {
                    const currentCounter = globalCounter++;
                    return (
                      <tr key={docIndex} className="border border-gray-300 hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {currentCounter}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {doc.designation}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {doc.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <a
                            href={`https://main.tmsiti.uz/media/${doc.pdf_uz}` || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            Кўриш
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </section>
    </Main>
  );
};

export default Index;
