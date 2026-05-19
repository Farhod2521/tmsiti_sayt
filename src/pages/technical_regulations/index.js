import React, { useState, useEffect } from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  const [regulations, setRegulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // API dan ma'lumotlarni olish
    const fetchData = async () => {
      try {
        const response = await fetch("https://main.tmsiti.uz/api/texnik-reglament/");
        const data = await response.json();
        setRegulations(data);
        setIsLoading(false);
      } catch (error) {
        console.error("API dan ma'lumot olishda xatolik:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <Link href={"#"}>{t("technical_regulations")}</Link>
        </div>
      </section>

      <section
        className={
          "grid grid-cols-12 container mx-auto mb-[50px] px-[20px] md:px-0"
        }
      >
        <h1 className="col-span-12 text-3xl mb-4 font-semibold">
          {t("technical_regulations")}
        </h1>
        
        {isLoading ? (
          <div className="col-span-12 text-center py-8">
            <p>Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : (
          <table className="col-span-12 mt-2 border-collapse border border-gray-300 w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-center">
                  №
                </th>
            
                <th className="border border-gray-300 px-4 py-2 ">
                Texnik reglamentlari nomi
                </th>
                <th className="border border-gray-300 text-center px-4 py-2 ">
                Hujjat
                </th>
              </tr>
            </thead>
            <tbody>
              {regulations.map((doc, docIndex) => (
                <tr key={docIndex} className="border border-gray-300">
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {docIndex + 1}
                  </td>
                
                  <td className="border border-gray-300 px-4 py-2 ">
                    {doc.name_uz}
                  </td>
                  <td className="border border-gray-300 px-4 py-2  text-center">
                    <a
                      href={doc.pdf_uz || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                     Ko'rish
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Main>
  );
};

export default Index;
