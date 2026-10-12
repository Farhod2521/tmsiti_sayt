import "@/styles/globals.css";
import { Hydrate, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import NextNProgress from "nextjs-progressbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import reactQueryClient from "@/config/react-query";
import i18n from "@/services/i18n";
import { useSettingsStore } from "@/store";
import { config } from "@/config";
import { initAnalytics, trackPageView } from "@/services/analytics";

// Saqlangan tilni (settings store) i18next bilan sinxronlaydi
const LanguageSync = () => {
  const lang = useSettingsStore((state) => state.lang) || config.DEFAULT_APP_LANG;
  useEffect(() => {
    if (i18n.language !== lang) i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
};

// Sayt statistikasi: har bir sahifa ochilishini yuboradi (admin -> "Statistika")
const AnalyticsTracker = () => {
  const router = useRouter();
  useEffect(() => {
    initAnalytics();
    // Sarlavha (document.title) yangilanishiga ulgurishi uchun biroz kutamiz
    const timers = [];
    const track = (url) => timers.push(setTimeout(() => trackPageView(url), 300));
    track(window.location.pathname);
    router.events.on("routeChangeComplete", track);
    return () => {
      router.events.off("routeChangeComplete", track);
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const [queryClient] = useState(() => reactQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate>
        <LanguageSync />
        <AnalyticsTracker />
        <NextNProgress height={5} color={"#1890FF"} />
        <Component {...pageProps} />
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster />
      </Hydrate>
    </QueryClientProvider>
  );
}
