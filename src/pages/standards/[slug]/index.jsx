// pages/standards/[slug]/index.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSettingsStore } from "@/store";
import { get } from "lodash";
import { config } from "@/config";
import { useTranslation } from "react-i18next";
import useGetTMSITIQuery from "@/hooks/api/useGetTMSITIQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import Main from "@/layouts/main";
import Menu from "@/components/menu";

const Index = () => {
  const router = useRouter();
  const { slug, isNewApi } = router.query;
  const lang = useSettingsStore((state) =>
    get(state, "lang", config.DEFAULT_APP_LANG),
  );
  const { t } = useTranslation();

  // Eski API uchun
  const { data: oldApiData, isLoading: oldApiLoading } = useGetTMSITIQuery({
    key: [KEYS.standards, slug],
    url: `${URLS.standards}/${slug}/`,
    enabled: !!slug && isNewApi !== 'true',
  });

  // Yangi API uchun state
  const [newApiImages, setNewApiImages] = useState([]);
  const [isNewApiLoading, setIsNewApiLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Yangi API'dan rasmlarni olish
  useEffect(() => {
    if (slug && isNewApi === 'true') {
      fetchImages();
    }
  }, [slug, isNewApi, page]);

  const fetchImages = async () => {
    if (!slug || isNewApi !== 'true') return;
    
    setIsNewApiLoading(true);
    try {
      const url = `https://main.tmsiti.uz/api/standard/${slug}/images/?page=${page}&limit=${limit}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const result = await response.json();
      
      if (result.images && Array.isArray(result.images)) {
        if (page === 1) {
          // Birinchi sahifa - tozalab qo'yish
          setNewApiImages(result.images);
        } else {
          // Keyingi sahifalar - qo'shib qo'yish
          setNewApiImages(prev => [...prev, ...result.images]);
        }
        
        setPageCount(result.page_count || 0);
        setTotalPages(result.total_pages || 0);
        
        // Yana sahifa bor-yo'qligini tekshirish
        if (page >= (result.total_pages || 1)) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        setNewApiImages([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Rasmlarni yuklashda xato:", error);
      setHasMore(false);
    } finally {
      setIsNewApiLoading(false);
    }
  };

  // Keyingi sahifani yuklash
  const loadMore = () => {
    if (hasMore && !isNewApiLoading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  // Rasmlar ro'yxati
  const images = isNewApi === 'true' ? newApiImages : get(oldApiData, "data", []);
  const isLoading = isNewApi === 'true' ? isNewApiLoading : oldApiLoading;

  // Loading animatsiyasi
  const LoadingSpinner = () => (
    <div className="col-span-12 py-12 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">
        {lang === "uz" ? "Yuklanmoqda..." : lang === "ru" ? "Загрузка..." : "Loading..."}
      </p>
    </div>
  );

  // Ma'lumot yo'q holati
  const NoData = () => (
    <div className="col-span-12 py-16 flex flex-col items-center justify-center">
      <div className="text-6xl mb-4">📄</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        {lang === "uz" ? "Rasmlar topilmadi" : lang === "ru" ? "Изображения не найдены" : "Images not found"}
      </h3>
      <p className="text-gray-500 max-w-md text-center">
        {lang === "uz" ? "Ushbu standart uchun rasm ma'lumotlari mavjud emas" : 
         lang === "ru" ? "Данные изображений для этого стандарта отсутствуют" : 
         "No image data available for this standard"}
      </p>
    </div>
  );

  return (
    <Main>
      <Menu />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600 transition-colors">
              {lang === "uz" ? "Bosh sahifa" : lang === "ru" ? "Главная" : "Home"}
            </a>
            <span className="mx-2">/</span>
            <a href="/standards" className="hover:text-blue-600 transition-colors">
              {lang === "uz" ? "Standartlar" : lang === "ru" ? "Стандарты" : "Standards"}
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{slug}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Sarlavha va sahifa ma'lumotlari */}
        <div className="mb-6 text-center">

          
          {isNewApi === 'true' && (
            <div className="mt-2">
              

            </div>
          )}
        </div>

        {/* Rasmlar grid */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading && page === 1 ? (
            <LoadingSpinner />
          ) : images.length > 0 ? (
            <>
              {images.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  {/* Rasm sarlavhasi */}
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {lang === "uz" 
                          ? `Sahifa ${index + 1}` 
                          : lang === "ru" 
                          ? `Страница ${index + 1}` 
                          : `Page ${index + 1}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {isNewApi === 'true' ? 'Base64' : 'URL'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Rasm o'zi */}
                  <div className="p-4">
                    {isNewApi === 'true' ? (
                      <img
                        className="w-full h-auto max-w-4xl mx-auto border border-gray-100 rounded"
                        src={item}
                        alt={`${slug} - sahifa ${index + 1}`}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23999'%3ERasm yuklanmadi%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <img
                        className="w-full h-auto max-w-4xl mx-auto border border-gray-100 rounded"
                        src={`https://ad.tmsiti.uz${get(item, "image")}`}
                        alt={"image"}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23999'%3ERasm yuklanmadi%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
              
              {/* Yangi API uchun "Ko'proq yuklash" tugmasi */}
              {isNewApi === 'true' && hasMore && (
                <div className="text-center py-6">
                  <button
                    onClick={loadMore}
                    disabled={isNewApiLoading}
                    className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center justify-center mx-auto ${
                      isNewApiLoading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md'
                    }`}
                  >
                    {isNewApiLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {lang === "uz" ? "Yuklanmoqda..." : lang === "ru" ? "Загрузка..." : "Loading..."}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {lang === "uz" 
                          ? `Yana yuklash (${limit} sahifa)` 
                          : lang === "ru" 
                          ? `Загрузить еще (${limit} страниц)` 
                          : `Yana yuklash  (${limit} sahifa)`}
                      </>
                    )}
                  </button>
                  
                  {/* Progress bar */}
                  {totalPages > 0 && (
                    <div className="mt-4 max-w-md mx-auto">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>
                          {lang === "uz" 
                            ? `${newApiImages.length} sahifa yuklandi` 
                            : lang === "ru" 
                            ? `${newApiImages.length} страниц загружено` 
                            : `${newApiImages.length} sahifa yuklandi`}
                        </span>
                        <span>{page} / {totalPages}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(page / totalPages) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Barcha sahifalar yuklangan */}
              {isNewApi === 'true' && !hasMore && newApiImages.length > 0 && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {lang === "uz" 
                      ? "Barcha sahifalar yuklandi" 
                      : lang === "ru" 
                      ? "Все страницы загружены" 
                      : "Barcha sahifalar yuklandi"}
                  </div>
                </div>
              )}
            </>
          ) : (
            !isLoading && <NoData />
          )}
        </div>

        {/* Orqaga qaytish tugmasi */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {lang === "uz" ? "Orqaga qaytish" : lang === "ru" ? "Вернуться назад" : "Orqaga qaytish"}
          </button>
        </div>
      </div>
    </Main>
  );
};

export default Index;
