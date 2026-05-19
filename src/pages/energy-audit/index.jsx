import React, { useState, useEffect } from "react";
import Main from "@/layouts/main";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import Menu from "@/components/menu";

const Management = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel uchun rasmlar ma'lumotlari
  const carouselItems = [
    {
      id: 1,
      title: "Elektr shinalarini termal tekshiruvi – teplovizor DT– 9897H",
      imageUrl: "https://ad.tmsiti.uz/Rasm/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BE%D0%BA1.jpg"
    },
    {
      id: 2,
      title: "Elektr shinalarini termal tekshiruvi – teplovizor DT– 9897H",
      imageUrl: "https://ad.tmsiti.uz/Rasm/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BE%D0%BA2.jpg"
    },
    {
      id: 3,
      title: "Elektr shinalarini termal tekshiruvi – teplovizor DT– 9897H",
      imageUrl: "https://ad.tmsiti.uz/Rasm/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BE%D0%BA3.jpg"
    },
    {
      id: 4,
      title: "Portativ ultratovushli suyuqlik oqimini oʻlchagich- GF PF333",
      imageUrl: "https://ad.tmsiti.uz/Rasm/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BE%D0%BA4.jpg"
    },
    {
      id: 5,
      title: "Elektr toki quvvati sifatini baholovchi analizator- Fluke-1773",
      imageUrl: "https://ad.tmsiti.uz/Rasm/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BE%D0%BA5.jpg"
    },
    {
      id: 6,
      title: "Aeroeshik (Blower door)- RETROTEC MODEL 6000 FAN",
      imageUrl: "https://ad.tmsiti.uz/Rasm/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BE%D0%BA6.jpg"
    },
    {
      id: 7,
      title: "Uskuna 7",
      imageUrl: "https://ad.tmsiti.uz/Rasm/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BE%D0%BA7.png"
    }
  ];

  // Metrologik tekshiruvdan o'tkazilgan uskunalar ma'lumotlari - 4 ustunli kichik format
  const equipmentData = [
    {
      id: 1,
      title: "LSJ F-2000",
      description: "Teplovizor",
      status: "available",
      imageUrl: "https://ad.tmsiti.uz/Rasm/image.png.png"
    },
    {
      id: 2,
      title: "DT– 9897H",
      description: "Ikki linzali Teplovizor",
      status: "available",
      imageUrl: "https://ad.tmsiti.uz/Rasm/image.png_1.png"
    },
    {
      id: 3,
      title: "GF PF333",
      description: "Portativ ultratovushli suyuqlik oqimini o‘lchagich",
      availability: "",
      status: "in-stock",
      imageUrl: "https://ad.tmsiti.uz/Rasm/image.png_2.png"
    },
    {
      id: 4,
      title: "Fluke-1773",
      description: "Elektr toki quvvati sifatini baholovchi analizator",
      availability: "Maintenance",
      status: "maintenance",
      imageUrl: "https://ad.tmsiti.uz/Rasm/image.png_3.png"
    },
    {
      id: 5,
      title: "ISO 9869 U-Value Measurement Kit - Build Test Solutions",
      description: "U-Value Measurement System Issiqlik uzatish koeffitsiyentini o‘lchash tizimi",
      status: "available",
      imageUrl: "https://ad.tmsiti.uz/Rasm/image.png_4.png"
    },
    {
      id: 6,
      title: "TESTO 174 H",
      description: "Yuqori aniqlikdagi xona termometri ",
      status: "available",
      imageUrl: "https://ad.tmsiti.uz/Rasm/image.png_5.png"
    },
    {
      id: 7,
      title: "TESTO 510",
      description: "Differensial bosim o‘lchagich",
      availability: "",
      status: "in-stock",
      imageUrl: "https://ad.tmsiti.uz/Rasm/image.png_6.png"
    },
    {
      id: 8,
      title: "HTC-2",
      description: "Termogigrometr",
      status: "available",
      imageUrl: "https://ad.tmsiti.uz/Rasm/image.png_7.png"
    }
  ];

  // Carousel avtomatik aylanishi
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // SEO Meta ma'lumotlari
  const seoTitle = "Energiya Auditi: Tartibi, Ahamiyati va Afzalliklari | Professional Energiya Audit Xizmatlari";
  const seoDescription = "Energiya auditi - bino, korxona va tashkilotlarda energiya samaradorligini oshirishning professional usuli. Energiya sarfini 40% gacha kamaytiring.";

  return (
    <>
      <Head>
        <meta name="google-site-verification" content="y3lTEeywXiQzghW0A9oAv39z2eUltED8wLTQejymsSU" />
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content="energiya auditi, energiya tejamkorligi, energiya samaradorligi, energiya audit O'zbekiston" />
        
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="article" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        
        <link rel="canonical" href="https://tmsiti.uz/energy-audit" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </Head>

      <Main>
        <Menu active={0} />
        {/* Breadcrumb navigation */}
        <section className={"bg-[#EFF3FA] text-xs text-[#607198] mb-[50px]"}>
          <div className={"container py-[12px] px-[20px] md:px-[15px] lg:px-[10px] xl:px-0"}>
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center space-x-1">
                <li>
                  <Link href={"/"} className="hover:text-blue-600 transition-colors">
                    {t("homepage") || "Bosh sahifa"}
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <Link href={"/institut"} className="hover:text-blue-600 transition-colors">
                    {t("institut") || "Institut"}
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <Link 
                    href={"/energy-audit"} 
                    className="font-semibold text-blue-600"
                    aria-current="page"
                  >
                    Energiya Auditi
                  </Link>
                </li>
              </ol>
            </nav>
          </div>
        </section>

        {/* Asosiy kontent */}
        <section className={"grid grid-cols-12 container mx-auto gap-x-[30px] mb-16"}>
          <article className="col-span-12 lg:col-span-8">
            <header className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Energiya Auditi: Tartibi, Ahamiyati va Afzalliklari
              </h1>
            </header>

            <div className="prose prose-lg max-w-none mb-10">
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>Energiya auditi</strong> — bino-inshootlar, jumladan ko'p kvartirali uylar,  
                ijtimoiy soha, ishlab chiqarish va jamoat binolarining energiya samaradorlik ko'rsatkichlarini aniqlash va ularni
                oshirish bo'yicha iqtisodiy asoslangan chora-tadbirlarni ishlab chiqish maqsadida o'tkaziladigan tekshiruv.
              </p>
            </div>

            <div className="space-y-8">
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Energiya auditining maqsadi va vazifasi
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>YER (Yoqilg'i-energresurslar) ni</strong> - oqilona va samarali ishlatish, energiya sarfini hisobga olishning to'g'riligini, shuningdek iste'molchilar va YER yetkazib beruvchilar bilan hisob kitoblarni nazorat qilish</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>YER (Yoqilg'i-energresurslar) ni</strong> - belgilangan normalarga shartnoma majburiyatlariga va energiya iste'molining haqiqiy ko'rsatkichlariga sarflash va to'lanishi muvofiqligini aniqlash va boshqalar</span>
                  </li>
                </ul>
              </section>

              {/* CAROUSEL BO'LIMI */}
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Bizning Energiya Audit Uskunalarimiz
                </h2>
                
                <div className="relative overflow-hidden rounded-lg bg-gray-50 p-4">
                  <div className="relative h-64 md:h-96 overflow-hidden">
                    {carouselItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out ${
                          index === currentSlide ? 'opacity-100 translate-x-0' : 
                          index < currentSlide ? 'opacity-0 -translate-x-full' : 
                          'opacity-0 translate-x-full'
                        }`}
                      >
                        <div className="grid grid-cols-3 gap-4 h-full items-center">
                          {/* Oldingi rasm (left) */}
                          <div className="flex flex-col items-center">
                            <div className="w-full h-40 md:h-56 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                              <img 
                                src={carouselItems[(index - 1 + carouselItems.length) % carouselItems.length].imageUrl} 
                                alt={carouselItems[(index - 1 + carouselItems.length) % carouselItems.length].title} 
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = e.target.parentElement.querySelector('.fallback-icon-left');
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <span className="text-gray-500 text-3xl fallback-icon-left hidden items-center justify-center">🛠️</span>
                            </div>
                            <p className="text-xs md:text-sm text-gray-600 text-center font-medium mt-1 line-clamp-2">
                              {carouselItems[(index - 1 + carouselItems.length) % carouselItems.length].title}
                            </p>
                          </div>

                          {/* Markaziy rasm (active) */}
                          <div className="flex flex-col items-center">
                            <div className="w-full h-48 md:h-64 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                              <img 
                                src={item.imageUrl} 
                                alt={item.title} 
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = e.target.parentElement.querySelector('.fallback-icon-center');
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <span className="text-blue-500 text-4xl fallback-icon-center hidden items-center justify-center">🛠️</span>
                            </div>
                            <p className="text-sm md:text-base text-gray-800 font-semibold text-center line-clamp-2">
                              {item.title}
                            </p>
                          </div>

                          {/* Keyingi rasm (right) */}
                          <div className="flex flex-col items-center">
                            <div className="w-full h-40 md:h-56 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                              <img 
                                src={carouselItems[(index + 1) % carouselItems.length].imageUrl} 
                                alt={carouselItems[(index + 1) % carouselItems.length].title} 
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = e.target.parentElement.querySelector('.fallback-icon-right');
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <span className="text-gray-500 text-3xl fallback-icon-right hidden items-center justify-center">🛠️</span>
                            </div>
                            <p className="text-xs md:text-sm text-gray-600 text-center font-medium mt-1 line-clamp-2">
                              {carouselItems[(index + 1) % carouselItems.length].title}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Dots */}
                  <div className="flex justify-center mt-6 space-x-2">
                    {carouselItems.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)}
                    className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    aria-label="Oldingi rasm"
                  >
                    <span className="material-symbols-outlined text-gray-700">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselItems.length)}
                    className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    aria-label="Keyingi rasm"
                  >
                    <span className="material-symbols-outlined text-gray-700">chevron_right</span>
                  </button>

                  {/* Slayd raqami */}
                  <div className="text-center mt-4 text-sm text-gray-500">
                    <span className="font-semibold text-blue-600">{currentSlide + 1}</span>
                    <span className="mx-1">/</span>
                    <span>{carouselItems.length}</span>
                  </div>
                </div>
              </section>

              {/* METROLOGIK TEKSHRIRUVDAN O'TKAZILGAN USKUNALAR BO'LIMI - 4 USTUNLI KICHIK FORMAT */}
              <section className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Metrologik tekshiruvdan o'tkazilib, tegishli sertifikatlarga ega energoaudit o'lchov uskunalari
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Bizning barcha energoaudit uskunalarimiz metrologik tekshiruvdan o'tkazilgan va xalqaro standartlarga mos sertifikatlangan
                  </p>
                </div>

                {/* 4 ustunli grid - kichik format */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {equipmentData.map((item) => (
                    <div 
                      key={item.id} 
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 bg-white group"
                    >
                      {/* Rasm qismi - kichik */}
                      <div className="relative h-[160px] md:h-[180px] overflow-hidden bg-white rounded-t-lg">
                        <div className="w-full h-full flex items-center justify-center p-1">
                          <img 
                            src={item.imageUrl} 
                            alt={`${item.title} - ${item.subtitle}`}
                            className="h-auto w-auto max-h-[150px] max-w-[90%] object-scale-down group-hover:scale-105 transition-transform duration-300"
                            style={{ imageRendering: 'auto' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = e.target.parentElement.querySelector('.equipment-fallback');
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        </div>
                        <div 
                          className="equipment-fallback absolute inset-0 hidden items-center justify-center bg-gray-50"
                          style={{ display: 'none' }}
                        >
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Matn qismi - kichik */}
                      <div className="p-3">
                        <div className="mb-2">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{item.title}</h3>
                          <h4 className="text-gray-600 text-xs truncate mb-1">{item.subtitle}</h4>
                        </div>
                        
                        <p className="text-gray-500 text-xs line-clamp-2 mb-3 h-10 overflow-hidden">
                          {item.description}
                        </p>
                        
                        {/* Sertifikat va ko'rish tugmasi - kichik */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="material-symbols-outlined text-green-500 text-xs mr-1">
                              verified
                            </span>
                            <span className="text-[10px] text-gray-600">Sertifikat</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </section>

              {/* ENERGIYA AUDIT XIZMATLARI */}
              <section id="xizmatlar" className="container mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wide mb-3">
                    Bizning Energiya Audit Xizmatlarimiz
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: "home",
                      title: "Bino tekshiruvi",
                      desc: "Binoning energiya iste'molini aniqlash, energiya yo'qotishlarini aniqlash va potentsial samaradorlikni aniqlash"
                    },
                    {
                      icon: "analytics",
                      title: "To'plangan ma'lumotlar tahlili",
                      desc: "Energiya iste'molining tafsilotlari, energiya yo'qotishlarini aniqlash va samaradorlikni oshirish bo'yicha tavsiyalar"
                    },
                    {
                      icon: "lightbulb",
                      title: "Amaliy tavsiyalar",
                      desc: "Energiya tejash choralari, jihozlarni almashtirish, binoning izolyatsiyasi bo'yicha yechimlar"
                    },
                    {
                      icon: "description",
                      title: "Energiya pasportini ishlab chiqish",
                      desc: "Resurs iste'moli ma'lumotlari bilan energiya pasportini tayyorlash"
                    },
                    {
                      icon: "bolt",
                      title: "Ekspress energiya tadqiqoti",
                      desc: "Tezkor energiya sarfi tahlili va dastlabiy tavsiyalar"
                    },
                    {
                      icon: "apartment",
                      title: "Sanoat korxonalari auditi",
                      desc: "Ishlab chiqarish jarayonlarining energiya samaradorligini tahlil qilish"
                    },
                    {
                      icon: "streetview",
                      title: "Ko'cha chiroqlari auditi",
                      desc: "Tungi yo'l chiroqlarining energiya samaradorligini baholash"
                    },
                    {
                      icon: "support_agent",
                      title: "Energiya konsalting xizmatlari",
                      desc: "Energiya tejash va samaradorlikni oshirish bo'yicha professional maslahatlar"
                    }
                  ].map((service, index) => (
                    <div key={index} className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex gap-3 items-start">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <span className="material-symbols-outlined">{service.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors text-sm">
                          {service.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ bo'limi */}
              <section className="mt-8 bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Energiya Auditiga Oid Tez-tez So'raladigan Savollar
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      q: "Energiya auditini qanday obyektlar uchun o'tkazish mumkin?",
                      a: "Sanoat korxonalari, davlat muassasalari, turar-joy binolari, ta'lim muassasalari va barcha turdagi tijorat binolari."
                    },
                    {
                      q: "Energiya auditining o'rtacha narxi qancha?",
                      a: "Obyektning maydoni, energioresurslar iste'moli (elektr energiya, gaz, suv, issiqlik energiyasi), murakkabligi va joylashuviga qarab narxlar belgilanadi. Bepul konsultatsiya uchun biz bilan bog'lanishingiz mumkin."
                    },
                    {
                      q: "Audit natijalari qancha vaqt ichida amalga oshiriladi?",
                      a: "Energoaudit o'tkazilayotgan obyektning murakkabligiga va joylashuviga qarab (30 - 120 kungacha)."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{faq.q}</h3>
                      <p className="text-gray-700">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 mt-8 lg:mt-0">
            <div className="sticky top-8 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                  Bepul Konsultatsiya
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Mutaxassislarimiz bilan bog'lanib, bepul maslahat oling.
                </p>
                <form className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Ismingiz" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input 
                    type="tel" 
                    placeholder="Telefon raqamingiz" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    So'rov Yuborish
                  </button>
                </form>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Bog'lanish uchun telfon raqamlar:</p>
                  <a href="tel:+998 55 900-00-59" className="block text-blue-600 hover:text-blue-800 font-semibold mb-1">
                    +998 55 900-00-59
                  </a>
             
                </div>
              </div>
            </div>
          </aside>
        </section>
      </Main>
    </>
  );
};

export default Management;
