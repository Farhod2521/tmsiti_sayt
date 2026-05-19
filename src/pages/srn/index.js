import Main from "@/layouts/main";
import Menu from "@/components/menu";
import { useEffect, useState, useRef } from "react";
import ContentLoader from "@/components/loader/content-loader";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

// Fragment ni alohida import qilish
import { Fragment } from "react";

const Index = () => {
  const [data, setData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [groupsData, setGroupsData] = useState([]);
  const [error, setError] = useState(null);
  const [groupsError, setGroupsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();
  const { highlight } = router.query;
  const highlightedRowRef = useRef(null);
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language;

  // Birinchi API - SRN ma'lumotlari
  useEffect(() => {
    fetch("https://shnk.tmsiti.uz/sren")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ma'lumotlarni yuklab bo'lmadi");
        }
        return response.json();
      })
      .then((result) => {
        setData(result);
        
        // Boshlang'ich holatda faqat 5 ta elementni ko'rsatish
        setDisplayedData(result.slice(0, 5));
        
        if (highlight) {
          setTimeout(() => {
            router.replace('/srn', undefined, { shallow: true });
          }, 3000);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [highlight, router]);

  // Ikkinchi API - 4-quyi tizim ma'lumotlari (shnk.tmsiti.uz/subsystems/)
  useEffect(() => {
    fetch("https://shnk.tmsiti.uz/subsystems/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Subsystems ma'lumotlarini yuklab bo'lmadi");
        }
        return response.json();
      })
      .then((result) => {
        // Faqat "4-қуйи тизим" bilan boshlanuvchi subsystemni topamiz
        const subsystem4 = result.find((s) =>
          s.title && s.title.startsWith("4-қуйи тизим")
        );
        setGroupsData(subsystem4 ? subsystem4.groups : []);
      })
      .catch((err) => {
        setGroupsError(err.message);
      })
      .finally(() => {
        setGroupsLoading(false);
      });
  }, []);

  // showAll o'zgarganda displayedData ni yangilash
  useEffect(() => {
    if (showAll) {
      setDisplayedData(data);
    } else {
      setDisplayedData(data.slice(0, 5));
    }
  }, [showAll, data]);

  useEffect(() => {
    if (highlight && highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [highlight, displayedData]);

  const extractNumberFromDesignation = (designation) => {
    if (!designation) return '';
    return designation.replace(/[SRNСРНShNQШНҚ\s]/gi, '').trim();
  };

  const getLocalizedText = (item, shnkItem = null) => {
    if (currentLanguage === 'ru') {
      return {
        name: item.sren_name_ru,
        shnkName: shnkItem ? shnkItem.sren_shnk_ru : null,
        pdf: item.sren_pdf_ru || item.sren_pdf_uz,
        shnkPdfUz: shnkItem ? shnkItem.sren_pdf_uz : null,
        shnkPdfRu: shnkItem ? shnkItem.sren_pdf_ru : null
      };
    } else {
      return {
        name: item.sren_name_uz,
        shnkName: shnkItem ? shnkItem.sren_shnk_uz : null,
        pdf: item.sren_pdf_uz,
        shnkPdfUz: shnkItem ? shnkItem.sren_pdf_uz : null,
        shnkPdfRu: shnkItem ? shnkItem.sren_pdf_ru : null
      };
    }
  };

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  // PDF mavjudligini tekshirish funksiyasi
  const hasValidPdf = (pdfValue) => {
    return pdfValue && pdfValue !== "" && pdfValue !== null;
  };

  // SHNK PDF ni olish funksiyasi
  const getShnkPdfUrl = (localizedShnk, currentLang) => {
    if (currentLang === 'ru') {
      return hasValidPdf(localizedShnk.shnkPdfRu) ? localizedShnk.shnkPdfRu : localizedShnk.shnkPdfUz;
    } else {
      return localizedShnk.shnkPdfUz;
    }
  };

  // 4-quyi tizim guruhlarini documents bilan birlashtirish
  const flattenedData = [];
  let globalIndex = 1;

  groupsData.forEach((group, groupIndex) => {
    if (group.documents && group.documents.length > 0) {
      // Guruh sarlavhasini qo'shish
      flattenedData.push({
        type: 'group-header',
        id: `group-${groupIndex}`,
        title: group.title
      });

      // Documentlarni qo'shish
      group.documents.forEach((doc, docIndex) => {
        flattenedData.push({
          type: 'shnk',
          id: `doc-${groupIndex}-${docIndex}`,
          index: globalIndex++,
          designation: doc.designation,
          name: currentLanguage === 'ru' ? doc.name_ru : doc.name_uz,
          pdf_uz: doc.pdf_uz,
          pdf_ru: doc.pdf_ru,
          url: doc.url
        });
      });
    }
  });

  if (loading || groupsLoading)
    return (
      <Main>
        <ContentLoader />
      </Main>
    );

  if (error) return <p>Xatolik: {error}</p>;
  if (groupsError) return <p>Groups xatolik: {groupsError}</p>;

  return (
    <Main>
      <Menu />
      <div className="bg-[#f3f4f6] min-h-screen py-[50px]">
        <div className="container my-[50px]">
          {/* Smeta-Resurs Normalari jadvali */}
          <div className="mb-8">
            <div className="mb-8">
              <h1 className="text-3xl text-blue-900 mb-2 text-center">Smeta-resurs normalari va maʼlumotnomalar</h1>
            </div>
            <h4 className="text-xl font-bold text-grey-900 mb-2 text-center">
              2023-yil 1-yanvardan majburiyligi bekor qilingan (
              <a
                href="https://lex.uz/docs/6230882#6231369"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                06.10.2022 yildagi 577-son VMQ
              </a>
              )
            </h4>
          </div> 
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">Smeta-Resurs Normalari</h1>
          </div>
          
          <div className="gap-6 mb-12">
            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  {/* Add search or other header elements here */}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-2">
                          №
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                          YANGI SHNQ
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                          HUJJAT NOMI
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-60">
                          ESKI SHNQ NOMI
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                          PDF
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                          FAYL
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayedData.map((item, idx) => {
                        const localizedItem = getLocalizedText(item);
                        const srnNumberOnly = extractNumberFromDesignation(item.sren_designation);
                        const shouldHighlight = highlight === srnNumberOnly;
                        
                        if (!item.sren_shnk || item.sren_shnk.length === 0) {
                          return (
                            <tr 
                              key={`empty-${idx}`} 
                              className={`hover:bg-gray-50 transition-colors ${shouldHighlight ? 'highlight-row' : ''}`}
                              ref={shouldHighlight ? highlightedRowRef : null}
                            >
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{idx + 1}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold">
                                  {item.sren_designation}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {localizedItem.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-center">
                                <span className="text-gray-400">-</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-gray-400">-</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {hasValidPdf(localizedItem.pdf) ? (
                                  <a
                                    href={`https://main.tmsiti.uz/media/${localizedItem.pdf}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                                  >
                                    <Image
                                      src={"/icons/download.svg"}
                                      alt="download"
                                      width={20}
                                      height={20}
                                    />
                                  </a>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100" title="PDF mavjud emas">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        }

                        return item.sren_shnk.map((shnk, shnkIdx) => {
                          const localizedShnk = getLocalizedText(item, shnk);
                          const shnkNumberOnly = extractNumberFromDesignation(shnk.sren_designation);
                          const shnkShouldHighlight = highlight === shnkNumberOnly;
                          const isFirst = shnkIdx === 0;
                          const shnkPdfUrl = getShnkPdfUrl(localizedShnk, currentLanguage);
                          
                          return (
                            <tr 
                              key={`${idx}-${shnkIdx}`} 
                              className={`hover:bg-gray-50 transition-colors ${shnkShouldHighlight ? 'highlight-row' : ''}`}
                              ref={shnkShouldHighlight ? highlightedRowRef : null}
                            >
                              {isFirst && (
                                <>
                                  <td
                                    className="px-6 py-4 text-sm text-gray-900 font-medium align-middle border-r border-gray-200"
                                    rowSpan={item.sren_shnk.length}
                                  >
                                    {idx + 1}
                                  </td>
                                  <td
                                    className="px-6 py-4 text-sm align-middle border-r border-gray-200"
                                    rowSpan={item.sren_shnk.length}
                                  >
                                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold">
                                      {item.sren_designation}
                                    </span>
                                  </td>
                                  <td
                                    className="px-6 py-4 text-sm text-gray-900 align-middle border-r border-gray-200"
                                    rowSpan={item.sren_shnk.length}
                                  >
                                    {localizedItem.name}
                                  </td>
                                </>
                              )}
                              <td className="px-6 py-4 text-sm align-middle border-r border-gray-200">
                                <div className="space-y-1">
                                  <div className="text-gray-900 font-semibold">{shnk.sren_designation}</div>
                                  <div className="text-xs text-gray-500 leading-relaxed">{localizedShnk.shnkName}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center align-middle border-r border-gray-200">
                                {hasValidPdf(shnkPdfUrl) ? (
                                  <a
                                    href={`https://main.tmsiti.uz/media/${shnkPdfUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                                  >
                                    <Image
                                      src={"/icons/download.svg"}
                                      alt="download"
                                      width={20}
                                      height={20}
                                    />
                                  </a>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100" title="PDF mavjud emas">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </div>
                                )}
                              </td>
                              {isFirst && (
                                <td
                                  className="px-6 py-4 text-center align-middle"
                                  rowSpan={item.sren_shnk.length}
                                >
                                  {hasValidPdf(localizedItem.pdf) ? (
                                    <a
                                      href={`https://main.tmsiti.uz/media/${localizedItem.pdf}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                                    >
                                      <Image
                                        src={"/icons/download.svg"}
                                        alt="download"
                                        width={20}
                                        height={20}
                                      />
                                    </a>
                                  ) : (
                                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100" title="PDF mavjud emas">
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                    </div>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                  
                  {/* Batafsil tugmasi */}
                  {data.length > 5 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-end">
                      <button
                        onClick={handleShowAll}
                        className="inline-flex items-end justify-end px-6 py-3 bg-blue-900 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                      >
                        {showAll ? '' : ''}
                        <svg 
                          className={`ml-2 w-5 h-5 transform transition-transform ${showAll ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <p className="mt-2 text-sm text-gray-600">
                        {showAll 
                          ? `Hamma ${data.length} ta ma'lumot ko'rsatilmoqda` 
                          : `Hozir ${displayedData.length} ta ma'lumot ko'rsatilmoqda, jami ${data.length} ta`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ikkinchi jadval - SHNK ma'lumotnomalari */}
          {flattenedData.length > 0 && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">Maʼlumotnomalar</h1>
              </div>
              
              <div className="gap-6">
                <div className="flex-1">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-grey-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-2">
                              №
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                              ШИФР
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-80">
                              ХУЖЖАТ НОМИ
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                              КУРИШ
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                              LEX.UZ
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {flattenedData.map((item) => {
                            if (item.type === 'group-header') {
                              return (
                                <tr key={item.id} className="bg-blue-50">
                                  <td colSpan="5" className="px-6 py-3">
                                    <div className="font-bold text-lg text-blue-900">
                                      {item.title}
                                    </div>
                                  </td>
                                </tr>
                              );
                            }
                            
                            // SHNK item
                            return (
                              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                  {item.index}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold">
                                    {item.designation}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {item.name}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {(item.pdf_uz || item.pdf_ru) ? (
                                    <a
                                      href={encodeURI(item.pdf_uz ?
                                        `https://main.tmsiti.uz/media/${item.pdf_uz}` :
                                        `https://main.tmsiti.uz/media/${item.pdf_ru}`
                                      )}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                                      title="PDF ko'rish"
                                    >
                                      <Image
                                        src={"/icons/download.svg"}
                                        alt="download"
                                        width={20}
                                        height={20}
                                      />
                                    </a>
                                  ) : (
                                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100" title="PDF mavjud emas">
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {item.url ? (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                      title="Lex.uz sahifasiga o'tish"
                                    >
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                      </svg>
                                    </a>
                                  ) : (
                                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100" title="URL mavjud emas">
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        .highlight-row {
          background-color: #fef3c7 !important;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { 
            background-color: #fef3c7;
          }
          50% { 
            background-color: #fde68a;
          }
        }
      `}</style>
    </Main>
  );
};

export default Index;
