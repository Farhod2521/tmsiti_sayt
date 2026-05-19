import React from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Link from "next/link";
import { get } from "lodash";
import { useTranslation } from "react-i18next";
import ContentLoader from "@/components/loader/content-loader";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSettingsStore } from "@/store";
import SnowAnimation from "@/components/SnowAnimation";

const Index = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('yangi');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [dataShnq, setDataShnq] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const language = useSettingsStore((state) => get(state, "lang", ""));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openItems, setOpenItems] = useState({});
  const [openGroups, setOpenGroups] = useState({});
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = useState({
    hujjatTurlari: [],
    quyiTizimlar: [],
    sektorlar: []
  });

  const isFourthSectionTitle = (title = "") => /^\s*0?4\s*[-–.]/.test(title);

  const removeFourthGroup = (items = []) =>
    items.filter((item) => !isFourthSectionTitle(item?.title || ""));

  // LocalStorage'dan saqlangan hujjatlarni olish
  useEffect(() => {
    const savedFavorites = localStorage.getItem('shnq_favorites');
    if (savedFavorites) {
      const favoritesArray = JSON.parse(savedFavorites);
      setFavorites(new Set(favoritesArray));
    }
  }, []);

  // Favorites o'zgarganda localStorage'ga saqlash
  const saveFavoritesToLocalStorage = (favoritesSet) => {
    const favoritesArray = Array.from(favoritesSet);
    localStorage.setItem('shnq_favorites', JSON.stringify(favoritesArray));
  };

  const toggleFavorite = (designation, e) => {
    if (e) e.stopPropagation();
    
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(designation)) {
        newFavorites.delete(designation);
      } else {
        newFavorites.add(designation);
      }
      // Darhol localStorage'ga saqlash
      saveFavoritesToLocalStorage(newFavorites);
      return newFavorites;
    });
  };

  // "Mening hujjatlarim" tab'ida barcha saqlanganlarni o'chirish
  const clearAllFavorites = () => {
    if (window.confirm("Hamma saqlangan hujjatlarni o'chirishni istaysizmi?")) {
      setFavorites(new Set());
      localStorage.removeItem('shnq_favorites');
    }
  };

  useEffect(() => {
    fetch("https://shnk.tmsiti.uz/subsystems/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ma'lumotlarni yuklab bo'lmadi");
        }
        return response.json();
      })
      .then((result) => {
        setDataShnq(result);
        setFilteredData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filtrlash va qidirish funksiyasi
  useEffect(() => {
    if (!dataShnq) return;

    let result = [...dataShnq];
    result = removeFourthGroup(result);

    // Hujjat turlari bo'yicha filtrlash (SHNQ/QMQ)
    if (selectedFilters.hujjatTurlari.length > 0) {
      result = result.map(item => {
        const filteredGroups = item.groups?.map(group => {
          const filteredDocs = group.documents?.filter(doc => {
            const designation = doc.designation || '';
            const isSHNQ = designation.includes('ШНҚ') || designation.includes('ШНК') || designation.includes('SHNQ');
            const isQMQ = designation.includes('ҚМҚ') || designation.includes('QMQ');
            
            if (selectedFilters.hujjatTurlari.includes('shnq') && selectedFilters.hujjatTurlari.includes('qmq')) {
              return isSHNQ || isQMQ;
            } else if (selectedFilters.hujjatTurlari.includes('shnq')) {
              return isSHNQ;
            } else if (selectedFilters.hujjatTurlari.includes('qmq')) {
              return isQMQ;
            }
            return true;
          });
          
          return filteredDocs?.length > 0 ? { ...group, documents: filteredDocs } : null;
        }).filter(Boolean);
        
        return filteredGroups.length > 0 ? { ...item, groups: filteredGroups } : null;
      }).filter(Boolean);
    }

    // Quyi tizimlar bo'yicha filtrlash
    if (selectedFilters.quyiTizimlar.length > 0) {
      result = result.filter(item => {
        const itemTitle = item.title || '';
        const selectedSystem = selectedFilters.quyiTizimlar[0];
        return itemTitle.includes(`${selectedSystem}-қуйи`) || itemTitle.includes(`${selectedSystem}-quyi`);
      });
    }

    // Qidiruv bo'yicha filtrlash
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.map(item => {
        const filteredGroups = item.groups?.map(group => {
          const filteredDocs = group.documents?.filter(doc => {
            return (
              (doc.name_uz && doc.name_uz.toLowerCase().includes(query)) ||
              (doc.name_ru && doc.name_ru.toLowerCase().includes(query)) ||
              (doc.designation && doc.designation.toLowerCase().includes(query))
            );
          });
          
          return filteredDocs?.length > 0 ? { ...group, documents: filteredDocs } : null;
        }).filter(Boolean);
        
        return filteredGroups.length > 0 ? { ...item, groups: filteredGroups } : null;
      }).filter(Boolean);
    }

    // "Mening hujjatlarim" tab uchun faqat saqlanganlarni ko'rsatish
    if (activeTab === 'mening') {
      result = result.map(item => {
        const filteredGroups = item.groups?.map(group => {
          const filteredDocs = group.documents?.filter(doc => 
            favorites.has(doc.designation)
          );
          
          return filteredDocs?.length > 0 ? { ...group, documents: filteredDocs } : null;
        }).filter(Boolean);
        
        return filteredGroups.length > 0 ? { ...item, groups: filteredGroups } : null;
      }).filter(Boolean);
    }

    setFilteredData(result);
  }, [dataShnq, selectedFilters, searchQuery, activeTab, favorites]);

  const handleView = (doc) => {
    if (doc.url && doc.url.includes("tmsiti.uz/srn")) {
      handleNavigateToSRN(doc.designation);
      return;
    }
    const fileUrl = doc.pdf_uz 
      ? `https://main.tmsiti.uz/media/${doc.pdf_uz}`
      : doc.pdf_ru 
        ? `https://main.tmsiti.uz/media/${doc.pdf_ru}`
        : null;
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const extractNumberFromDesignation = (designation) => {
    if (!designation) return '';
    return designation.replace(/[ШНҚShNQSHNQШНК\s]/gi, '').trim();
  };

  const handleNavigateToSRN = (designation) => {
    const numberOnly = extractNumberFromDesignation(designation);
    if (numberOnly) {
      router.push(`/srn?highlight=${numberOnly}`);
    }
  };

  const handleDownload = (doc) => {
    if (doc.url && doc.url.includes("tmsiti.uz/srn")) {
      handleNavigateToSRN(doc.designation);
      return;
    }
    if (doc.url && (doc.url.includes("lex.uz") || doc.url.includes("www.lex.uz"))) {
      window.open(doc.url, '_blank');
      return;
    }
  };

  const isViewButtonDisabled = (doc) => {
    if (doc.url && doc.url.includes("tmsiti.uz/srn")) return false;
    if (doc.pdf_uz || doc.pdf_ru) return false;
    return true;
  };

  const isDownloadButtonDisabled = (doc) => {
    if (doc.url && doc.url.includes("tmsiti.uz/srn")) return false;
    if (doc.url && (doc.url.includes("lex.uz") || doc.url.includes("www.lex.uz"))) return false;
    if (!doc.url || doc.url === "null" || doc.url === "" || doc.url === null) return true;
    return true;
  };

  const toggleItem = (index) => {
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleGroup = (itemIndex, groupIndex) => {
    setOpenGroups((prev) => ({
      ...prev,
      [`${itemIndex}-${groupIndex}`]: !prev[`${itemIndex}-${groupIndex}`],
    }));
  };

  const filterData = {
    hujjatTurlari: [
      { id: 'shnq', label: 'SHNQ', count: 0 },
      { id: 'qmq', label: 'QMQ', count: 0 },
    ],
    quyiTizimlar: [
      { id: '1', label: 'Tashkiliy va uslubiy normalar', count: 0 },
      { id: '2', label: 'Texnik loyihalash meyorlari', count: 0 },
      { id: '3', label: 'Tashkil etish qoidlariva  ...', count: 0 },
      { id: '4', label: 'Iqtisodiy standartlar', count: 0 }
    ],
    sektorlar: [
      { id: 'qurilish', label: 'Qurilish', count: 0 },
      { id: 'energetika', label: 'Turar joy', count: 0 },
      { id: 'ekologiya', label: 'Ekologiya', count: 0 },
      { id: 'shaharsozlik', label: 'Shaharsozlik', count: 0 }
    ]
  };

  const handleFilterChange = (category, id) => {
    setSelectedFilters(prev => {
      if (category === 'quyiTizimlar') {
        const newFilters = prev[category].includes(id) ? [] : [id];
        return { ...prev, [category]: newFilters };
      }
      
      const categoryFilters = prev[category];
      const newFilters = categoryFilters.includes(id)
        ? categoryFilters.filter(item => item !== id)
        : [...categoryFilters, id];
      return { ...prev, [category]: newFilters };
    });
  };

  const clearFilters = () => {
    setSelectedFilters({
      hujjatTurlari: [],
      quyiTizimlar: [],
      sektorlar: []
    });
    setSearchQuery('');
  };

  if (loading)
    return (
      <Main>
        <ContentLoader />
      </Main>
    );
  if (error) return <p>Xatolik: {error}</p>;

  return (
    <Main>
      <SnowAnimation />
      <Menu />
      
      {/* Breadcrumb */}
      <section className={"bg-[#EFF3FA] text-xs text-[#607198] mb-[30px]"}>
        <div
          className={
            "container py-[12px] px-[20px] md:px-[15px] lg:px-[10px] xl:px-0"
          }
        >
          <Link href={"/"}>{t("homepage")} / </Link>
          <Link href={"#"}>{t("documents")} / </Link>
          <Link href={"#"}>{t("SHNQ")}</Link>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-[20px] md:px-[15px] lg:px-[10px] xl:px-0">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('yangi')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'yangi'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Shaharsozlik normlari va qoidalari
            </button>
            <button
              onClick={() => setActiveTab('mening')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'mening'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mening hujjatlarim ({favorites.size})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Background */}
      <section className="bg-[#f3f4f6] min-h-screen">
        <div className="container mx-auto px-[20px] md:px-[15px] lg:px-[10px] xl:px-0 py-6">
          <div className="flex gap-6">
            {/* Sidebar Filter with Box Shadow */}
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <div className="bg-white rounded-lg p-4 sticky top-4" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span>Filtrlar</span>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Tozalash
                  </button>
                </div>

                {/* Hujjat Turlari */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3 text-sm">HUJJAT TURLARI</h3>
                  <div className="space-y-2">
                    {filterData.hujjatTurlari.map(item => (
                      <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.hujjatTurlari.includes(item.id)}
                          onChange={() => handleFilterChange('hujjatTurlari', item.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quyi Tizimlar */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3 text-sm flex items-center justify-between">
                    QUYI TIZIMLAR
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded">4 quyi tizim</span>
                  </h3>
                  <div className="space-y-2">
                    {filterData.quyiTizimlar.map(item => (
                      <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="quyiTizim"
                          checked={selectedFilters.quyiTizimlar.includes(item.id)}
                          onChange={() => handleFilterChange('quyiTizimlar', item.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sektorlar */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 text-sm">SEKTORLAR</h3>
                  <div className="space-y-2">
                    {filterData.sektorlar.map(item => (
                      <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.sektorlar.includes(item.id)}
                          onChange={() => handleFilterChange('sektorlar', item.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {/* Search and View Toggle with Box Shadow */}
              <div className="bg-white rounded-lg p-4 mb-4 flex flex-col md:flex-row items-stretch md:items-center gap-4" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Hujjat nomi, kodi yoki kalit so'zlar bo'yicha qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* "Mening hujjatlarim" uchun header */}
              {activeTab === 'mening' && favorites.size > 0 && (
                <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-between" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="font-medium text-gray-900">Saqlangan hujjatlar: {favorites.size} ta</span>
                  </div>
                  <button
                    onClick={clearAllFavorites}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                    </svg>
                    Barchasini o'chirish
                  </button>
                </div>
              )}

              {/* Conditional Content - Mening hujjatlarim Empty State */}
              {activeTab === 'mening' && (!filteredData || filteredData.length === 0 || filteredData.every(item => !item.groups || item.groups.length === 0)) ? (
                <div className="bg-white rounded-lg p-12 text-center" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                  <div className="flex justify-center mb-6">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                      <path d="M3 7C3 5.89543 3.89543 5 5 5H9L10 3H14L15 5H19C20.1046 5 21 5.89543 21 7V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#DBEAFE"/>
                      <rect x="7" y="10" width="10" height="8" rx="1" fill="#93C5FD"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Mening hujjatlarimda hozircha hujjatlar mavjud emas
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Kerakli standartlarni qidiruv orqali topib, ularni ro'yxatingizga qo'shing!
                  </p>
                  <div className="flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              ) : (
                /* Documents List with Box Shadow */
                <div className="space-y-3">
                  {filteredData && filteredData.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-white rounded-lg overflow-hidden" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                      {/* Section Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors"
                        onClick={() => toggleItem(itemIndex)}
                      >
                        <h3 className="font-semibold text-gray-900 text-base">{item.title}</h3>
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          className={`transform transition-transform ${openItems[itemIndex] ? '' : 'rotate-180'}`}
                        >
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </div>

                      {/* Groups */}
                      {!openItems[itemIndex] && item.groups && (
                        <div className="border-t border-gray-200">
                          {item.groups.map((group, groupIndex) => (
                            <div key={groupIndex} className="border-b border-gray-200 last:border-b-0">
                              {/* Group Header */}
                              <div
                                className="p-4 cursor-pointer hover:bg-blue-50 flex items-center justify-between bg-blue-50 transition-colors"
                                onClick={() => toggleGroup(itemIndex, groupIndex)}
                              >
                                <h4 className="font-medium text-blue-900">{group.title}</h4>
                                <svg 
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                  className={`transform transition-transform text-blue-600 ${openGroups[`${itemIndex}-${groupIndex}`] ? '' : 'rotate-180'}`}
                                >
                                  <polyline points="18 15 12 9 6 15" />
                                </svg>
                              </div>

                              {/* Documents Table */}
                              {!openGroups[`${itemIndex}-${groupIndex}`] && (
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                          ШИФР
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                          ҲУЖЖАТ НОМИ
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-24">
                                          КЎРИШ
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-24">
                                          LEX.UZ
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-20">
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {group.documents && group.documents.map((doc, docIndex) => {
                                        const isFavorite = favorites.has(doc.designation);
                                        return (
                                          <tr key={docIndex} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                              {doc.designation}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                              {doc.name_uz}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleView(doc);
                                                }}
                                                disabled={isViewButtonDisabled(doc)}
                                                className={`inline-flex items-center justify-center p-1.5 rounded transition-colors ${
                                                  !isViewButtonDisabled(doc)
                                                    ? 'text-blue-600 hover:bg-blue-50'
                                                    : 'text-gray-300 cursor-not-allowed'
                                                }`}
                                                title={
                                                  !isViewButtonDisabled(doc)
                                                    ? "Кўриш"
                                                    : "Кўриш учун файл мавжуд эмас"
                                                }
                                              >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                  <circle cx="12" cy="12" r="3" />
                                                </svg>
                                              </button>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDownload(doc);
                                                }}
                                                disabled={isDownloadButtonDisabled(doc)}
                                                className={`inline-flex items-center justify-center p-1.5 rounded transition-colors ${
                                                  !isDownloadButtonDisabled(doc)
                                                    ? 'text-green-600 hover:bg-green-50'
                                                    : 'text-gray-300 cursor-not-allowed'
                                                }`}
                                                title={
                                                  !isDownloadButtonDisabled(doc)
                                                    ? doc.url
                                                    : "Lex.uz га ҳавола учун URL мавжуд эмас"
                                                }
                                              >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                  <polyline points="15 3 21 3 21 9" />
                                                  <line x1="10" y1="14" x2="21" y2="3" />
                                                </svg>
                                              </button>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                              {activeTab === 'mening' ? (
                                                // "Mening hujjatlarim" tab'ida faqat o'chirish tugmasi
                                                <button
                                                  onClick={(e) => toggleFavorite(doc.designation, e)}
                                                  className="inline-flex items-center justify-center p-1.5 rounded hover:bg-red-50 transition-colors text-red-600"
                                                  title="Saqlanganlardan o'chirish"
                                                >
                                                  <svg 
                                                    width="18" 
                                                    height="18" 
                                                    viewBox="0 0 24 24" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="2"
                                                  >
                                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                                                  </svg>
                                                </button>
                                              ) : (
                                                // Asosiy tab'da yulduzcha tugmasi
                                                <button
                                                  onClick={(e) => toggleFavorite(doc.designation, e)}
                                                  className="inline-flex items-center justify-center p-1.5 rounded hover:bg-gray-100 transition-colors"
                                                  title={isFavorite ? "Saqlanganlardan o'chirish" : "Saqlash"}
                                                >
                                                  <svg 
                                                    width="18" 
                                                    height="18" 
                                                    viewBox="0 0 24 24" 
                                                    fill={isFavorite ? '#facc15' : 'none'}
                                                    stroke={isFavorite ? '#facc15' : '#9ca3af'}
                                                    strokeWidth="2"
                                                  >
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                  </svg>
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Main>
  );
};

export default Index;
