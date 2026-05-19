// pages/standards/index.jsx
import React, { useState, useMemo, useEffect } from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Link from "next/link";
import { motion } from "framer-motion";
import Title from "@/components/title";
import useGetTMSITIQuery from "@/hooks/api/useGetTMSITIQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { get } from "lodash";
import { useSettingsStore } from "@/store";
import { useTranslation } from "react-i18next";

const StandardsPage = () => {
  const { t } = useTranslation();
  const { data: oldApiData, isLoading: oldApiLoading, isFetching: oldApiFetching } = useGetTMSITIQuery({
    key: KEYS.standards,
    url: URLS.standards,
  });

  const language = useSettingsStore((state) => get(state, "lang", ""));
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newApiData, setNewApiData] = useState([]);
  const [isNewApiLoading, setIsNewApiLoading] = useState(true);
  const [newApiError, setNewApiError] = useState(null);

  // Yangi API'dan ma'lumotlarni olish
  useEffect(() => {
    const fetchNewStandards = async () => {
      setIsNewApiLoading(true);
      setNewApiError(null);
      
      try {
        const response = await fetch("https://main.tmsiti.uz/api/standard-list/");
        
        if (!response.ok) {
          throw new Error(`HTTP xato! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          // Yangi API strukturasi bilan ishlash uchun o'zgartirish
          const transformedData = result.data.map(item => ({
            id: item.id,
            title: get(item, "title_uz", ""),
            title_uz: get(item, "title_uz", ""),
            title_ru: get(item, "title_ru", ""),
            title_en: get(item, "title_en", ""),
            designation: get(item, "designation_uz", ""),
            designation_uz: get(item, "designation_uz", ""),
            designation_ru: get(item, "designation_ru", ""),
            designation_en: get(item, "designation_en", ""),
            // PDF yangi API'da hozircha mavjud emas, eski API'dan foydalanamiz yoki null qoldiramiz
            pdf: null, // PDF yangi API'da bo'lmasa, oldApiData'dan qidiriladi
            slug: get(item, "slug", ""),
            number: get(item, "number", item.id),
            isNewApi: true // Yangi API'dan kelganligini bildirish uchun flag
          }));
          
          setNewApiData(transformedData);
        } else {
          setNewApiData([]);
        }
      } catch (err) {
        console.error("Yangi API'dan ma'lumot olishda xato:", err);
        setNewApiError(err.message);
        setNewApiData([]);
      } finally {
        setIsNewApiLoading(false);
      }
    };

    fetchNewStandards();
  }, []);

  // Xavfsiz string conversion funksiyasi
  const safeString = (value) => {
    if (!value && value !== 0) return "";
    return String(value);
  };

  // Ikkala API ma'lumotlarini birlashtirish (yangi ma'lumotlar birinchi)
  const combinedData = useMemo(() => {
    const oldData = get(oldApiData, "data", []);
    
    // Yangi API'dan kelgan ma'lumotlarni birinchi qo'yish
    const allData = [...newApiData, ...oldData];
    
    // Slug yoki ID bo'yicha duplicate'larni olib tashlash
    const uniqueDataMap = new Map();
    
    allData.forEach(item => {
      const slug = get(item, "slug", "");
      const id = get(item, "id", "");
      const key = slug || id.toString();
      
      // Agar allaqachon mavjud bo'lsa, yangisini saqlab qolamiz (yangi API'dan kelgani)
      if (!uniqueDataMap.has(key) || get(item, "isNewApi", false)) {
        uniqueDataMap.set(key, item);
      }
    });
    
    return Array.from(uniqueDataMap.values());
  }, [oldApiData, newApiData]);

  // Filterlash funksiyasi
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return combinedData;
    }

    const query = searchQuery.toLowerCase().trim();
    return combinedData.filter((item) => {
      const searchFields = [
        safeString(get(item, "title_uz", "")).toLowerCase(),
        safeString(get(item, "title_ru", "")).toLowerCase(),
        safeString(get(item, "title_en", "")).toLowerCase(),
        safeString(get(item, "designation_uz", "")).toLowerCase(),
        safeString(get(item, "designation_ru", "")).toLowerCase(),
        safeString(get(item, "designation_en", "")).toLowerCase(),
        safeString(get(item, "title", "")).toLowerCase(),
        safeString(get(item, "designation", "")).toLowerCase(),
      ];

      return searchFields.some(field => field.includes(query));
    });
  }, [combinedData, searchQuery]);

  // PDF manzilini olish (yangi API'da PDF yo'q bo'lsa, eski API'dan olish)
  const getPdfUrl = (item) => {
    // Agar yangi API'dan kelgan bo'lsa va unda PDF yo'q bo'lsa
    if (get(item, "isNewApi", false) && !get(item, "pdf")) {
      // Slug bo'yicha eski API'dan PDF manzilini qidirish
      const slug = get(item, "slug", "");
      const oldApiItems = get(oldApiData, "data", []);
      const matchingOldItem = oldApiItems.find(oldItem => 
        get(oldItem, "slug", "") === slug
      );
      
      return get(matchingOldItem, "pdf", null);
    }
    
    return get(item, "pdf", null);
  };

  const openPdfViewer = (item) => {
    const pdfUrl = getPdfUrl(item);
    if (!pdfUrl) return;
    
    const pdfData = {
      url: pdfUrl,
      title: language === "uz"
        ? safeString(get(item, "designation_uz", get(item, "designation", "")))
        : language === "ru"
        ? safeString(get(item, "designation_ru", get(item, "designation", "")))
        : language === "en"
        ? safeString(get(item, "designation_en", get(item, "designation", "")))
        : safeString(get(item, "designation_uz", get(item, "designation", ""))),
      fullTitle: language === "uz"
        ? safeString(get(item, "title_uz", get(item, "title", "")))
        : language === "ru"
        ? safeString(get(item, "title_ru", get(item, "title", "")))
        : language === "en"
        ? safeString(get(item, "title_en", get(item, "title", "")))
        : safeString(get(item, "title_uz", get(item, "title", "")))
    };
    setSelectedPdf(pdfData);
  };

  // Input change handler
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Loading holati
  const isLoading = oldApiLoading || isNewApiLoading;

  return (
    <Main>
      <Menu />
      
      {/* Breadcrumb */}
      <section className="bg-[#EFF3FA] text-xs text-[#607198] mb-[70px]">
        <div className="container py-[12px] px-[20px] md:px-[15px] lg:px-[10px] xl:px-0">
          <Link href="/" className="hover:text-blue-600">{t("homepage")}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{t("standards")}</span>
        </div>
      </section>

      {/* Asosiy kontent */}
      <section className="container mx-auto mb-[50px] px-[20px] md:px-0">
        <motion.div
          initial={{ translateX: "-200px" }}
          animate={{ translateX: "0px" }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Title>{t("standards")}</Title>
        </motion.div>

        {/* Search qismi */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={
                  language === "uz" 
                    ? "Standartlarni qidirish..." 
                    : language === "ru" 
                    ? "Поиск стандартов..." 
                    : "Search standards..."
                }
                className="w-full px-6 py-4 pl-12 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 shadow-sm"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Natijalar soni */}
            {searchQuery && (
              <div className="mt-4 text-center">
                <p className="text-gray-600">
                  {filteredData.length} ta natija topildi
                  {get(oldApiData, "data", []).length > 0 && newApiData.length > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({newApiData.length} ta yangi standart)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Xatolik xabari (faqat yangi API uchun) */}
        {newApiError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-600 text-center text-sm">
              {language === "uz" 
                ? "Yangi standartlar yuklanmadi, faqat mavjud standartlar ko'rsatilmoqda." 
                : language === "ru" 
                ? "Новые стандарты не загружены, отображаются только существующие стандарты." 
                : "New standards failed to load, only existing standards are displayed."}
            </p>
          </div>
        )}

        {/* PDF fayllar ro'yxati */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))
          ) : (
            filteredData.map((item) => {
              const pdfUrl = getPdfUrl(item);
              const isNew = get(item, "isNewApi", false);
              
              return (
                <div
                  key={`${get(item, "id")}-${get(item, "slug")}`}
                  className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative ${
                    isNew ? "border-gray-200" : "border-gray-200"
                  }`}
                >
                  {/* Yangi standart belgisi */}
                  {/* {isNew && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {language === "uz" ? "YANGI" : language === "ru" ? "НОВЫЙ" : "YANGI"}
                      </span>
                    </div>
                  )} */}
                  
                  <div className="p-6">
                    {/* PDF icon */}
                    <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-lg mb-4 mx-auto">
                      <span className="text-4xl text-red-600">📕</span>
                    </div>

                    {/* Standart raqami */}
                    <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
                      {language === "uz"
                        ? safeString(get(item, "designation_uz", get(item, "designation", "")))
                        : language === "ru"
                        ? safeString(get(item, "designation_ru", get(item, "designation", "")))
                        : language === "en"
                        ? safeString(get(item, "designation_en", get(item, "designation", "")))
                        : safeString(get(item, "designation_uz", get(item, "designation", "")))}
                    </h3>

                    {/* Standart nomi */}
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                      {language === "uz"
                        ? safeString(get(item, "title_uz", get(item, "title", "")))
                        : language === "ru"
                        ? safeString(get(item, "title_ru", get(item, "title", "")))
                        : language === "en"
                        ? safeString(get(item, "title_en", get(item, "title", "")))
                        : safeString(get(item, "title_uz", get(item, "title", "")))}
                    </p>

                    {/* Harakatlar tugmalari */}
                    <div className="flex flex-col gap-2">
        
                        <Link
                          href={{
                            pathname: `/standards/${get(item, "slug")}`,
                            query: { 
                              isNewApi: get(item, "isNewApi", false) ? 'true' : 'false' 
                            }
                          }}
                          className="w-full py-3 bg-blue-900 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 text-center"
                        >
                          {language === "uz" 
                            ? "Batafsil" 
                            : language === "ru" 
                            ? "Подробнее" 
                            : "Batafsil"}
                        </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ma'lumot yo'q */}
        {!isLoading && filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery 
                ? language === "uz"
                  ? "Hech narsa topilmadi"
                  : language === "ru"
                  ? "Ничего не найдено"
                  : "Nothing found"
                : language === "uz"
                ? "Standartlar topilmadi"
                : language === "ru"
                ? "Стандарты не найдены"
                : "Standards not found"
              }
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? language === "uz"
                  ? `"${searchQuery}" so'zi bo'yicha hech qanday standart topilmadi`
                  : language === "ru"
                  ? `По запросу "${searchQuery}" стандарты не найдены`
                  : `No standards found for "${searchQuery}"`
                : language === "uz"
                ? "Hozircha hech qanday standart mavjud emas"
                : language === "ru"
                ? "На данный момент стандартов нет"
                : "No standards available at the moment"
              }
            </p>
          </div>
        )}
      </section>

      {/* PDF ko'ruvchi modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedPdf.title}</h3>
              <button
                onClick={() => setSelectedPdf(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex-grow p-4">
              <iframe
                src={selectedPdf.url}
                className="w-full h-full border-0"
                title={selectedPdf.title}
              />
            </div>
          </div>
        </div>
      )}
    </Main>
  );
};

export default StandardsPage;
