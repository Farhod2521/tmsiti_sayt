/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Onlayn test sahifasi avval /vacancies manzilida edi — eski havolalar yangi manzilga o'tadi
  async redirects() {
    return [{ source: "/vacancies", destination: "/onlinetest", permanent: true }];
  },
  async rewrites() {
    return [
      // PDF larni sayt ichida (pdf.js bilan) ochish uchun: main.tmsiti.uz/media boshqa domen bo'lgani sababli
      // brauzer ularni JavaScript orqali yuklashga ruxsat bermaydi — shu domen orqali proksi qilamiz.
      { source: "/pdf/:path*", destination: "https://main.tmsiti.uz/media/:path*" },
    ];
  },
};

module.exports = nextConfig;
