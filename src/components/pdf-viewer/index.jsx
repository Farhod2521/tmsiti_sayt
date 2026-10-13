// Sayt ichida PDF ko'rish oynasi (pdf.js — @react-pdf-viewer). Telefonda ham ishlaydi.
// Fayl /pdf/<yo'l> orqali yuklanadi (next.config.js -> main.tmsiti.uz/media proksi).
// Bu komponent faqat brauzerda ishlaydi: next/dynamic(..., { ssr: false }) bilan ulanadi.
import React, { useEffect, useMemo } from "react";
import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { config } from "@/config";
import { CloseIcon, DownloadIcon, ExternalLinkIcon, FileTextIcon } from "@/components/icons/docs";

const WORKER_URL = "/pdf.worker.min.js"; // node_modules/pdfjs-dist/build dan nusxa (versiyasi pdfjs-dist ga mos)

export const proxiedPdfUrl = (file) => `/pdf/${String(file).replace(/^\/+/, "")}`;
export const directPdfUrl = (file) => `${config.MEDIA_URL}${String(file).replace(/^\/+/, "")}`;

const PdfViewerModal = ({ doc, onClose }) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const layout = defaultLayoutPlugin({
    // Telefonda yon panel joy egallamasin; kompyuterda faqat sahifa miniatyuralari
    sidebarTabs: (tabs) => (isMobile ? [] : tabs.slice(0, 1)),
  });
  const fileUrl = useMemo(() => proxiedPdfUrl(doc.file), [doc.file]);

  // Esc bilan yopish va orqa fon aylanmasligi
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const btn =
    "h-10 px-3 md:px-4 rounded-[12px] flex items-center gap-2 text-[13.5px] font-semibold transition-colors shrink-0";

  return (
    <div className={"fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1A4F]/50 backdrop-blur-[2px] p-0 md:p-6"} onClick={onClose}>
      <div
        role={"dialog"}
        aria-modal={"true"}
        aria-label={doc.title}
        onClick={(e) => e.stopPropagation()}
        className={"flex flex-col w-full h-full md:max-w-[1200px] md:h-[92vh] bg-white md:rounded-[20px] overflow-hidden shadow-[0_24px_64px_rgba(11,26,79,0.35)]"}
      >
        <div className={"flex items-center gap-3 px-3 md:px-5 py-3 border-b border-[#EEF2FA]"}>
          <span className={"hidden sm:flex w-10 h-10 shrink-0 rounded-[12px] bg-[#E8F0FE] text-[#1D5BE8] items-center justify-center"}>
            <FileTextIcon className={"w-5 h-5"} />
          </span>
          <div className={"flex-1 min-w-0"}>
            <p className={"text-[13px] font-bold text-[#1D5BE8]"}>{doc.designation}</p>
            <p className={"text-[14px] font-semibold text-[#0B1A4F] truncate"}>{doc.title}</p>
          </div>
          <a href={fileUrl} download className={`${btn} bg-[#1D5BE8] text-white hover:bg-[#174FD0]`} title={"Yuklab olish"}>
            <DownloadIcon className={"w-[18px] h-[18px]"} />
            <span className={"hidden md:inline"}>Yuklab olish</span>
          </a>
          <a href={directPdfUrl(doc.file)} target={"_blank"} rel={"noopener noreferrer"} className={`${btn} bg-[#EEF4FF] text-[#1D5BE8] hover:bg-[#DCE7FF]`} title={"Yangi oynada ochish"}>
            <ExternalLinkIcon className={"w-[18px] h-[18px]"} />
            <span className={"hidden lg:inline"}>Yangi oynada</span>
          </a>
          <button type={"button"} onClick={onClose} className={`${btn} w-10 justify-center !px-0 text-[#5B6788] hover:bg-[#F1F4FA]`} aria-label={"Yopish"}>
            <CloseIcon className={"w-5 h-5"} />
          </button>
        </div>

        <div className={"flex-1 min-h-0 bg-[#F6F9FF]"}>
          <Worker workerUrl={WORKER_URL}>
            <Viewer
              fileUrl={fileUrl}
              plugins={[layout]}
              defaultScale={isMobile ? SpecialZoomLevel.PageWidth : SpecialZoomLevel.PageFit}
              renderError={() => (
                // pdf.js ocha olmasa — brauzerning o'z PDF ko'rgichi
                <iframe title={doc.title} src={directPdfUrl(doc.file)} className={"w-full h-full border-0"} />
              )}
            />
          </Worker>
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
