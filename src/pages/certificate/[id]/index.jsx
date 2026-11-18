import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Main from "@/layouts/main";
import Menu from "@/components/menu";

const API = "https://ad.tmsiti.uz/api/v1/appeal/generate-certificate";

// Shablon (sert2.png) ichidagi QR joylashuvi — backend certifikat.py dagi QR_BOX bilan bir xil
const TPL_W = 1055;
const TPL_H = 1491;
const QR = { x: 835, y: 462, size: 150 };

/* ---------------------------- ikonkalar ---------------------------- */
const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    {d}
  </svg>
);
const I = {
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  cap: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></>,
  cal: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  bank: <><path d="M3 10l9-6 9 6" /><path d="M5 10v9M9 10v9M15 10v9M19 10v9M3 21h18" /></>,
  doc: <><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
  download: <><path d="M12 4v11M7 10l5 5 5-5" /><path d="M4 20h16" /></>,
  print: <><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></>,
  link: <><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></>,
  check: <path d="M5 12l5 5 9-10" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

/* ------------------------------ sahifa ------------------------------ */
const CertificatePage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | notfound
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const imgUrl = id ? `${API}/${id}/` : null;
  const pdfUrl = id ? `${API}/${id}/?type=pdf` : null;

  useEffect(() => {
    if (!id) return;
    setStatus("loading");
    fetch(`${API}/${id}/?type=json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        setData(json);
        setStatus("ok");
      })
      .catch(() => setStatus("notfound"));
  }, [id]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Malaka oshirish sertifikati", url: pageUrl });
      } else {
        await navigator.clipboard.writeText(pageUrl);
        toast.success("Havola nusxalandi");
      }
    } catch (_) {
      /* foydalanuvchi bekor qildi */
    }
  };

  const handlePrint = () => {
    if (!imgUrl) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Sertifikat ${id}</title>
      <style>@page{size:A4;margin:0}html,body{margin:0}img{width:100%;height:auto;display:block}</style>
      </head><body><img src="${imgUrl}" onload="setTimeout(function(){window.print();window.close()},200)"></body></html>`);
    w.document.close();
  };

  const period =
    data && data.start_date && data.end_date
      ? `${data.start_date} – ${data.end_date}, 20${data.years}`
      : null;

  const rows = [
    { icon: I.user, label: "F.I.O.", value: data?.full_name },
    { icon: I.cap, label: "Kurs nomi", value: [data?.text1, data?.text2].filter(Boolean).join(" ") },
    { icon: I.cal, label: "O'qish davri", value: period },
    { icon: I.clock, label: "Jami soat", value: data?.hours ? `${data.hours} soat` : null },
    { icon: I.bank, label: "Ta'lim muassasasi", value: "Texnik me'yorlash va standartlashtirish ilmiy-tadqiqot instituti" },
    { icon: I.doc, label: "Qayd raqami", value: data?.number_code || id },
  ];

  const qrScale = 240 / QR.size;

  return (
    <Main>
      <Head>
        <title>Sertifikat {id ? `№ ${id}` : ""} | TMSITI</title>
      </Head>
      <Menu />

      <section className="bg-gradient-to-b from-[#EEF3FB] to-white min-h-[70vh] py-8 md:py-12">
        <div className="container">
          <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(20,37,91,0.08)] border border-[#E6ECF6] p-5 md:p-8 grid grid-cols-12 gap-6 md:gap-10">

            {/* ------------------------- chap: ma'lumot ------------------------- */}
            <div className="col-span-12 lg:col-span-6 flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-2xl bg-[#EAF1FF] text-[#1E5EFF] flex items-center justify-center">
                  <svg viewBox="0 0 48 48" className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
                    <rect x="6" y="8" width="36" height="26" rx="3" />
                    <path d="M13 16h22M13 22h14" strokeLinecap="round" />
                    <circle cx="33" cy="32" r="6" fill="#fff" />
                    <path d="M29.5 36.5L28 44l5-3 5 3-1.5-7.5" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-[#14255B] font-bold text-xl md:text-2xl leading-tight">
                    Malaka oshirish<br />sertifikati
                  </h1>
                  {status === "ok" && (
                    <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[#E7F8EE] text-[#16A34A] text-sm font-medium">
                      <span className="w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
                        <Icon d={I.check} className="w-3 h-3" />
                      </span>
                      Amal qilmoqda
                    </span>
                  )}
                  {status === "notfound" && !imgError && (
                    <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-[#FFF4E5] text-[#B45309] text-sm font-medium">
                      Ma'lumotlar yuklanmadi
                    </span>
                  )}
                  {imgError && (
                    <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-[#FDECEC] text-[#DC2626] text-sm font-medium">
                      Sertifikat topilmadi
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-[#E6ECF6] rounded-2xl divide-y divide-[#E6ECF6] overflow-hidden">
                {rows.map((r) => (
                  <div key={r.label} className="grid grid-cols-[28px_1fr] sm:grid-cols-[28px_150px_1fr] items-center gap-x-3 gap-y-1 px-4 py-3.5">
                    <span className="text-[#7C8BB0]"><Icon d={r.icon} /></span>
                    <span className="text-[#607198] text-sm">{r.label}</span>
                    <span className="col-start-2 sm:col-start-auto text-[#14255B] font-semibold text-sm md:text-[15px]">
                      {status === "loading" ? (
                        <span className="block h-4 w-3/4 bg-[#EEF2F8] rounded animate-pulse" />
                      ) : (
                        r.value || "—"
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
                <a
                  href={pdfUrl || "#"}
                  className="flex items-center justify-center gap-2 h-12 md:h-14 rounded-xl bg-gradient-to-b from-[#2B6BFF] to-[#1450E6] text-white font-semibold shadow-[0_6px_16px_rgba(30,94,255,0.3)] hover:brightness-110 transition"
                >
                  <Icon d={I.download} /> PDF yuklab olish
                </a>
                <button onClick={handlePrint}
                  className="flex items-center justify-center gap-2 h-12 md:h-14 rounded-xl border border-[#D9E1EF] text-[#14255B] font-semibold hover:bg-[#F5F8FD] transition">
                  <Icon d={I.print} /> Chop etish
                </button>
                <button onClick={handleShare}
                  className="flex items-center justify-center gap-2 h-12 rounded-xl border border-[#D9E1EF] text-[#14255B] font-medium text-sm md:text-base hover:bg-[#F5F8FD] transition">
                  <Icon d={I.link} /> Havola ulashish
                </button>
                <button onClick={() => setQrOpen(true)}
                  className="flex items-center justify-center gap-2 h-12 rounded-xl border border-[#D9E1EF] text-[#14255B] font-medium text-sm md:text-base hover:bg-[#F5F8FD] transition">
                  <Icon d={I.qr} /> QR-kodni ko'rish
                </button>
              </div>
            </div>

            {/* ------------------------- o'ng: rasm ------------------------- */}
            <div className="col-span-12 lg:col-span-6 flex items-start justify-center">
              <div className="relative w-full max-w-[520px] rounded-xl bg-white shadow-[0_12px_40px_rgba(20,37,91,0.15)] overflow-hidden"
                   style={{ aspectRatio: `${TPL_W} / ${TPL_H}` }}>
                {!imgLoaded && !imgError && (
                  <div className="absolute inset-0 bg-[#EEF2F8] animate-pulse" />
                )}
                {imgError ? (
                  <div className="absolute inset-0 flex items-center justify-center text-[#607198] text-center p-6">
                    Ushbu raqamdagi sertifikat topilmadi
                  </div>
                ) : (
                  imgUrl && (
                    <a href={imgUrl} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Sertifikat ${id}`}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                        className={`w-full h-full object-contain transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                      />
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------- QR modal ------------------------- */}
      {qrOpen && imgUrl && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4" onClick={() => setQrOpen(false)}>
          <div className="bg-white rounded-2xl p-6 relative text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setQrOpen(false)} className="absolute top-3 right-3 text-[#607198] hover:text-[#14255B]">
              <Icon d={I.close} />
            </button>
            <p className="text-[#14255B] font-semibold mb-4">Sertifikat QR-kodi</p>
            {/* QR sertifikat rasmining o'zidan kesib ko'rsatiladi */}
            <div
              className="w-[240px] h-[240px] mx-auto"
              style={{
                backgroundImage: `url(${imgUrl})`,
                backgroundSize: `${TPL_W * qrScale}px ${TPL_H * qrScale}px`,
                backgroundPosition: `-${QR.x * qrScale}px -${QR.y * qrScale}px`,
                imageRendering: "pixelated",
              }}
            />
            <p className="text-xs text-[#607198] mt-4 break-all max-w-[240px]">{pageUrl}</p>
          </div>
        </div>
      )}
    </Main>
  );
};

export default CertificatePage;
