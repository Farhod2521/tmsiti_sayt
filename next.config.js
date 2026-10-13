/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // PDF larni sayt ichida (pdf.js bilan) ochish uchun: main.tmsiti.uz/media boshqa domen bo'lgani sababli
      // brauzer ularni JavaScript orqali yuklashga ruxsat bermaydi — shu domen orqali proksi qilamiz.
      { source: "/pdf/:path*", destination: "https://main.tmsiti.uz/media/:path*" },
    ];
  },
};

module.exports = nextConfig;
