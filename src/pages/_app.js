import "@/styles/globals.css";
import { Hydrate, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import NextNProgress from "nextjs-progressbar";
import { useEffect, useState } from "react";
import reactQueryClient from "@/config/react-query";
import i18n from "@/services/i18n";
import { useSettingsStore } from "@/store";
import { config } from "@/config";

// Saqlangan tilni (settings store) i18next bilan sinxronlaydi
const LanguageSync = () => {
  const lang = useSettingsStore((state) => state.lang) || config.DEFAULT_APP_LANG;
  useEffect(() => {
    if (i18n.language !== lang) i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  }, [lang]);
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
        <NextNProgress height={5} color={"#1890FF"} />
        <Component {...pageProps} />
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster />
      </Hydrate>
    </QueryClientProvider>
  );
}
