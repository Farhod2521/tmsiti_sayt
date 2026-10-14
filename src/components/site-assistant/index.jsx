import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { config } from "@/config";
import { displayCode, displayText } from "@/utils/translit";
import { useLiveSocket } from "@/utils/live-socket";
import OperatorAvatar from "./avatar";

// Saytning o'ng pastki burchagidagi yordamchi chat.
// Mehmon ro'yxatdan o'tmaydi: birinchi xabarda backend xona ochadi, brauzerda faqat xona tokeni saqlanadi.
// Xabar operatorga (admin panel -> Chat) boradi, javob WebSocket orqali shu zahoti keladi.
// Har bir savolga qo'shimcha ravishda SHNQ matnlari ichidan mos hujjatlar ham ko'rsatiladi.

const API = config.BASE_MAIN_API;
const TOKEN_KEY = "tmsiti_chat_token";
const GREETING_KEY = "assistant_greeting_closed";

const TEXTS = {
  uz: {
    hello: "Assalomu alaykum! Sizga qanday yordam bera olaman?",
    helloSub: "Savolingizni yozing — operator javob beradi.",
    title: "TMSITI yordamchisi",
    status: "Operator odatda tez javob beradi",
    placeholder: "Savolingizni yozing...",
    delivered: "Xabaringiz operatorga yetkazildi. Javob shu yerda paydo bo'ladi — sahifani yopsangiz ham saqlanib qoladi.",
    docs: "Savolingiz bo'yicha mos hujjatlar:",
    seeAll: "Barcha natijalar",
    sendError: "Xabar yuborilmadi. Internet aloqasini tekshirib, qayta urinib ko'ring.",
    operator: "Operator",
    newReply: "Operator javob berdi",
    open: "Yordamchini ochish",
    close: "Yopish",
    send: "Yuborish",
  },
  ru: {
    hello: "Здравствуйте! Чем могу помочь?",
    helloSub: "Напишите вопрос — оператор ответит.",
    title: "Помощник TMSITI",
    status: "Оператор обычно отвечает быстро",
    placeholder: "Напишите вопрос...",
    delivered: "Сообщение передано оператору. Ответ появится здесь — он сохранится, даже если закрыть страницу.",
    docs: "Подходящие документы по вашему вопросу:",
    seeAll: "Все результаты",
    sendError: "Сообщение не отправлено. Проверьте интернет и попробуйте снова.",
    operator: "Оператор",
    newReply: "Оператор ответил",
    open: "Открыть помощника",
    close: "Закрыть",
    send: "Отправить",
  },
};

const store = {
  get(area, key) {
    try {
      return window[area].getItem(key);
    } catch (e) {
      return null;
    }
  },
  set(area, key, value) {
    try {
      window[area].setItem(key, value);
    } catch (e) {
      // brauzer saqlashni taqiqlagan — sessiya davomida ishlayveradi
    }
  },
};

const timeOf = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
};

const CloseIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox={"0 0 24 24"} className={className} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}>
    <path d={"M6 6l12 12M18 6 6 18"} strokeLinecap={"round"} />
  </svg>
);

const SendIcon = () => (
  <svg viewBox={"0 0 24 24"} className={"w-5 h-5"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}>
    <path d={"M22 2 11 13M22 2l-7 20-4-9-9-4z"} strokeLinejoin={"round"} />
  </svg>
);

const Ticks = ({ read }) => (
  <svg viewBox={"0 0 20 12"} className={clsx("w-4 h-3 inline-block", read ? "text-[#9CC1FF]" : "text-white/60")} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}>
    <path d={"m1 6 3.5 3.5L11 3"} strokeLinecap={"round"} strokeLinejoin={"round"} />
    {read && <path d={"m8 9.5 6.5-6.5"} strokeLinecap={"round"} />}
  </svg>
);

const SiteAssistant = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language === "ru" ? "ru" : "uz";
  const tx = TEXTS[lang];

  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [token, setToken] = useState(null);
  // Serverdagi xabarlar + faqat shu brauzerda ko'rinadigan yordamchi kartochkalar (local: true)
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    setToken(store.get("localStorage", TOKEN_KEY));
    if (store.get("sessionStorage", GREETING_KEY)) return undefined;
    const timer = setTimeout(() => setGreeting(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const loadHistory = useCallback(async (roomToken) => {
    if (!roomToken) return;
    try {
      const res = await fetch(`${API}chat/${roomToken}/messages/`);
      if (res.status === 404) {
        // Xona o'chirilgan — yangidan boshlanadi
        store.set("localStorage", TOKEN_KEY, "");
        setToken(null);
        return;
      }
      const data = await res.json();
      setItems((prev) => {
        const local = prev.filter((m) => m.local);
        const server = data.messages || [];
        // Mahalliy kartochkalar o'z joyida qolishi uchun: ular oldidagi server xabari id si bo'yicha joylanadi
        const merged = [];
        server.forEach((m) => {
          merged.push(m);
          local.filter((l) => l.after === m.id).forEach((l) => merged.push(l));
        });
        return merged;
      });
      setUnread(0);
    } catch (e) {
      // tarmoq xatosi — keyingi ochilishda qayta yuklanadi
    }
  }, []);

  useEffect(() => {
    if (open && token) loadHistory(token);
  }, [open, token, loadHistory]);

  const connected = useLiveSocket(token ? `chat/${token}/` : null, {
    enabled: !!token,
    onEvent: (data) => {
      if (data.event === "message" && data.message) {
        setItems((prev) => (prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]));
        if (data.message.sender === "operator") {
          if (openRef.current) loadHistory(token); // ochiq — o'qildi deb belgilanadi
          else setUnread((n) => n + 1);
        }
      } else if (data.event === "read") {
        setItems((prev) => prev.map((m) => (m.sender === "visitor" ? { ...m, read: true } : m)));
      }
    },
  });

  // WebSocket ulanmagan bo'lsa (masalan, tarmoq cheklovi) — oyna ochiq paytda REST bilan so'rab turamiz
  useEffect(() => {
    if (!open || !token || connected) return undefined;
    const timer = setInterval(() => loadHistory(token), 8000);
    return () => clearInterval(timer);
  }, [open, token, connected, loadHistory]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [items, open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const hideGreeting = () => {
    setGreeting(false);
    store.set("sessionStorage", GREETING_KEY, "1");
  };

  const openPanel = () => {
    hideGreeting();
    setOpen(true);
  };

  const ensureRoom = async () => {
    if (token) return token;
    const res = await fetch(`${API}chat/start/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: window.location.href }),
    });
    if (!res.ok) throw new Error("start");
    const data = await res.json();
    store.set("localStorage", TOKEN_KEY, data.token);
    setToken(data.token);
    return data.token;
  };

  const suggestDocs = async (question, afterId) => {
    try {
      const res = await fetch(`${API}shnq/search/?mode=question&limit=4&q=${encodeURIComponent(question)}`);
      const data = res.ok ? await res.json() : { results: [] };
      if ((data.results || []).length) {
        setItems((prev) => [
          ...prev,
          { local: true, id: `docs-${afterId}`, after: afterId, kind: "docs", results: data.results, query: question },
        ]);
      }
    } catch (e) {
      // hujjat tavsiyasi — qo'shimcha, xato bo'lsa ko'rsatilmaydi
    }
  };

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const roomToken = await ensureRoom();
      const res = await fetch(`${API}chat/${roomToken}/messages/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("send");
      const message = await res.json();
      setInput("");
      setItems((prev) => {
        const next = prev.some((m) => m.id === message.id) ? prev : [...prev, message];
        const firstQuestion = !next.some((m) => m.local && m.kind === "delivered");
        return firstQuestion
          ? [...next, { local: true, id: `delivered-${message.id}`, after: message.id, kind: "delivered" }]
          : next;
      });
      suggestDocs(text, message.id);
    } catch (err) {
      setItems((prev) => [...prev, { local: true, id: `err-${Date.now()}`, kind: "error" }]);
    } finally {
      setSending(false);
    }
  };

  const openDoc = (doc) => {
    const hit = (doc.hits || [])[0];
    setOpen(false);
    if (hit && hit.block) router.push(`/shnq/${doc.id}?lang=${hit.lang}#${hit.block}`);
    else router.push(`/shnq/${doc.id}`);
  };

  const botBubble = (key, children) => (
    <div key={key} className={"flex items-end gap-2"}>
      <OperatorAvatar className={"w-7 h-7 shrink-0"} />
      <div className={"max-w-[85%] min-w-0"}>{children}</div>
    </div>
  );

  const renderDocs = (item) =>
    botBubble(
      item.id,
      <div className={"rounded-2xl rounded-bl-md bg-[#F1F5FD] px-3 py-2.5"}>
        <p className={"text-[12px] font-semibold text-[#5B6788] mb-2"}>{tx.docs}</p>
        <div className={"space-y-1.5"}>
          {item.results.map((doc) => {
            const name = lang === "ru" ? doc.name_ru || doc.name_uz : doc.name_uz || doc.name_ru;
            return (
              <button
                key={doc.id}
                type={"button"}
                onClick={() => openDoc(doc)}
                className={"block w-full text-left rounded-xl bg-white border border-[#E6EDFB] px-3 py-2 hover:border-[#BFD3FA] transition-colors"}
              >
                <span className={"block text-[12px] font-bold text-[#1D5BE8]"}>{displayCode(doc.designation, lang)}</span>
                {name && (
                  <span className={"block text-[12px] text-[#0B1A4F] leading-snug line-clamp-2"}>
                    {displayText(name, lang)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          type={"button"}
          onClick={() => {
            setOpen(false);
            router.push(`/shnq?q=${encodeURIComponent(item.query)}`);
          }}
          className={"mt-2 text-[12px] font-semibold text-[#1D5BE8] hover:underline"}
        >
          {tx.seeAll} →
        </button>
      </div>
    );

  const renderItem = (item) => {
    if (item.local) {
      if (item.kind === "docs") return renderDocs(item);
      const text = item.kind === "error" ? tx.sendError : tx.delivered;
      return botBubble(
        item.id,
        <div className={clsx("rounded-2xl rounded-bl-md px-3.5 py-2 text-[13px] leading-[1.5]", item.kind === "error" ? "bg-[#FDECEC] text-[#B42318]" : "bg-[#F1F5FD] text-[#1E2B5A]")}>
          {text}
        </div>
      );
    }
    if (item.sender === "visitor") {
      return (
        <div key={item.id} className={"flex justify-end"}>
          <div className={"max-w-[82%] rounded-2xl rounded-br-md bg-[#1D5BE8] text-white px-3.5 py-2"}>
            <p className={"text-[13px] leading-[1.5] whitespace-pre-wrap break-words"}>{item.text}</p>
            <p className={"mt-0.5 text-[10px] text-white/70 text-right flex items-center justify-end gap-1"}>
              {timeOf(item.created_at)} <Ticks read={item.read} />
            </p>
          </div>
        </div>
      );
    }
    return botBubble(
      item.id,
      <div className={"rounded-2xl rounded-bl-md bg-[#F1F5FD] px-3.5 py-2"}>
        <p className={"text-[11px] font-semibold text-[#1D5BE8]"}>{tx.operator}</p>
        <p className={"text-[13px] leading-[1.5] text-[#1E2B5A] whitespace-pre-wrap break-words"}>{item.text}</p>
        <p className={"mt-0.5 text-[10px] text-[#8A95B0] text-right"}>{timeOf(item.created_at)}</p>
      </div>
    );
  };

  return (
    <div className={"fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] print:hidden"}>
      {/* "Assalomu alaykum" yozuvi / operator javobi haqida eslatma */}
      {!open && (greeting || unread > 0) && (
        <div
          className={"absolute bottom-[78px] right-0 w-[260px] rounded-2xl rounded-br-md bg-white px-4 py-3 shadow-[0_12px_32px_rgba(16,42,116,0.18)] border border-[#EEF2FA] cursor-pointer"}
          onClick={openPanel}
        >
          <button
            type={"button"}
            aria-label={tx.close}
            onClick={(e) => {
              e.stopPropagation();
              hideGreeting();
              setUnread(0);
            }}
            className={"absolute top-2 right-2 text-[#9AA6C4] hover:text-[#0B1A4F]"}
          >
            <CloseIcon className={"w-3.5 h-3.5"} />
          </button>
          {unread > 0 ? (
            <p className={"text-[14px] font-bold text-[#0B1A4F] pr-3"}>{tx.newReply} 💬</p>
          ) : (
            <>
              <p className={"text-[14px] font-bold text-[#0B1A4F] pr-3"}>{tx.hello}</p>
              <p className={"mt-0.5 text-[13px] leading-snug text-[#5B6788]"}>{tx.helloSub}</p>
            </>
          )}
        </div>
      )}

      {open && (
        <div
          role={"dialog"}
          aria-label={tx.title}
          className={"fixed inset-x-3 bottom-[92px] md:inset-x-auto md:right-6 md:w-[380px] h-[min(580px,calc(100vh-120px))] flex flex-col rounded-[22px] bg-white shadow-[0_20px_60px_rgba(16,42,116,0.25)] border border-[#EEF2FA] overflow-hidden"}
        >
          <div className={"shrink-0 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#1D5BE8] to-[#3B7BFF] text-white"}>
            <div className={"relative"}>
              <OperatorAvatar className={"w-11 h-11 rounded-full ring-2 ring-white/60"} />
              <span className={"absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22C55E] ring-2 ring-[#2A68F0]"} />
            </div>
            <div className={"flex-1 min-w-0"}>
              <p className={"text-[15px] font-bold leading-tight"}>{tx.title}</p>
              <p className={"text-[12px] text-white/80 truncate"}>{tx.status}</p>
            </div>
            <button
              type={"button"}
              aria-label={tx.close}
              onClick={() => setOpen(false)}
              className={"w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15"}
            >
              <CloseIcon />
            </button>
          </div>

          <div ref={listRef} className={"flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-[#FAFBFE]"}>
            {botBubble(
              "hello",
              <div className={"rounded-2xl rounded-bl-md bg-[#F1F5FD] px-3.5 py-2 text-[13px] leading-[1.5] text-[#1E2B5A]"}>
                {tx.hello}
              </div>
            )}
            {items.map(renderItem)}
          </div>

          <form onSubmit={send} className={"shrink-0 flex items-end gap-2 border-t border-[#EEF2FA] px-3 py-3 bg-white"}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={2000}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) send(e);
              }}
              placeholder={tx.placeholder}
              className={"flex-1 min-w-0 max-h-[110px] resize-none rounded-xl border border-[#DCE4F5] px-3 py-2.5 text-[13px] outline-none focus:border-[#1D5BE8] focus:ring-2 focus:ring-[#1D5BE8]/15"}
            />
            <button
              type={"submit"}
              disabled={sending || !input.trim()}
              aria-label={tx.send}
              className={"w-10 h-10 shrink-0 rounded-xl bg-[#1D5BE8] text-white flex items-center justify-center hover:bg-[#174BC2] disabled:opacity-50 transition-colors"}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      <button
        type={"button"}
        aria-label={open ? tx.close : tx.open}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={"relative w-[64px] h-[64px] rounded-full bg-white p-1 shadow-[0_10px_28px_rgba(29,91,232,0.35)] ring-2 ring-[#1D5BE8] hover:scale-105 transition-transform"}
      >
        {open ? (
          <span className={"w-full h-full rounded-full bg-[#1D5BE8] text-white flex items-center justify-center"}>
            <CloseIcon className={"w-6 h-6"} />
          </span>
        ) : (
          <>
            <OperatorAvatar className={"w-full h-full"} />
            {unread > 0 ? (
              <span className={"absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#E5484D] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white"}>
                {unread}
              </span>
            ) : (
              <span className={"absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#22C55E] ring-2 ring-white"} />
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default SiteAssistant;
