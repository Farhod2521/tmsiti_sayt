export const config = {
  BASE_SHNK_URL: "https://shnk.tmsiti.uz/",
  BASE_TMSITI_URL: "https://ad.tmsiti.uz/api/v1/",
  BASE_TRANSLATION_URL: "https://backend-market.tmsiti.uz/",
  FILE_URL: "https://shnk.rcsc.uz",
  // Django backend (tmsiti repo): SHNQ matnlari, tahrirlar va admin dashboard API
  BASE_MAIN_API: process.env.NEXT_PUBLIC_MAIN_API || "https://main.tmsiti.uz/api/",
  MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL || "https://main.tmsiti.uz/media/",
  DEFAULT_APP_LANG: "uz",
};
