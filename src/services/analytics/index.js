// Sayt statistikasi uchun yengil tracker (admin -> "Statistika").
// Har bir sahifa ochilishi va sahifada o'tkazilgan vaqt backendga yuboriladi.
// Shaxsiy ma'lumot yig'ilmaydi: brauzerda faqat tasodifiy ID saqlanadi, IP serverda saqlanmaydi.
import { config } from "@/config";

const ENDPOINT = `${config.BASE_MAIN_API}analytics/collect/`;
const VISITOR_KEY = "tm_vid";
const SESSION_KEY = "tm_sid";
const SESSION_SEEN_KEY = "tm_sseen";
const SESSION_IDLE_MS = 30 * 60 * 1000; // 30 daqiqa faolsizlikdan keyin yangi tashrif
const EXCLUDED = [/^\/admin/, /^\/__/];

let current = null; // { pid, path, visibleMs, visibleSince }

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

// storage: "localStorage" | "sessionStorage" — ba'zi rejimlarda ularga murojaatning o'zi xato beradi
const storageGet = (storage, key) => {
  try {
    return window[storage].getItem(key);
  } catch (e) {
    return null;
  }
};

const storageSet = (storage, key, value) => {
  try {
    window[storage].setItem(key, value);
  } catch (e) {
    // yopiq rejim — ID faqat shu sahifa davomida yashaydi
  }
};

const visitorId = () => {
  let id = storageGet("localStorage", VISITOR_KEY);
  if (!id) {
    id = uid();
    storageSet("localStorage", VISITOR_KEY, id);
  }
  return id;
};

// { id, isNew } — yangi tashrif boshlanganini ham qaytaradi
const session = () => {
  const now = Date.now();
  let id = storageGet("sessionStorage", SESSION_KEY);
  const seen = Number(storageGet("sessionStorage", SESSION_SEEN_KEY) || 0);
  const isNew = !id || now - seen > SESSION_IDLE_MS;
  if (isNew) {
    id = uid();
    storageSet("sessionStorage", SESSION_KEY, id);
  }
  storageSet("sessionStorage", SESSION_SEEN_KEY, String(now));
  return { id, isNew };
};

// text/plain — CORS preflight talab qilmaydi, sendBeacon bilan sahifa yopilayotganda ham yetib boradi
const send = (payload) => {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain" }))) return;
  } catch (e) {
    // fetch bilan urinib ko'ramiz
  }
  fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
};

const visibleSeconds = () => {
  if (!current) return 0;
  const extra = current.visibleSince ? Date.now() - current.visibleSince : 0;
  return Math.round((current.visibleMs + extra) / 1000);
};

const flush = () => {
  const sec = visibleSeconds();
  if (current && sec > 0) send({ t: "ping", pid: current.pid, sec });
};

export const trackPageView = (url) => {
  if (typeof window === "undefined") return;
  const path = (url || window.location.pathname).split(/[?#]/)[0] || "/";
  // Faqat ?lang=, #band o'zgargan bo'lsa — bu o'sha sahifa, yangi ko'rish emas
  if (current && current.path === path) return;
  flush(); // oldingi sahifada o'tkazilgan vaqt
  if (EXCLUDED.some((re) => re.test(path))) {
    current = null;
    return;
  }
  const { id: sid, isNew } = session();
  current = {
    pid: uid(),
    path,
    visibleMs: 0,
    visibleSince: document.visibilityState === "visible" ? Date.now() : null,
  };
  send({
    t: "pv",
    pid: current.pid,
    vid: visitorId(),
    sid,
    path,
    title: document.title || "",
    ref: isNew ? document.referrer || "" : "",
    entry: isNew,
  });
};

let listening = false;

export const initAnalytics = () => {
  if (typeof window === "undefined" || listening) return;
  listening = true;
  document.addEventListener("visibilitychange", () => {
    if (!current) return;
    if (document.visibilityState === "hidden") {
      if (current.visibleSince) current.visibleMs += Date.now() - current.visibleSince;
      current.visibleSince = null;
      flush();
    } else {
      current.visibleSince = Date.now();
      session(); // faollik — tashrif davom etadi
    }
  });
  window.addEventListener("pagehide", flush);
};
