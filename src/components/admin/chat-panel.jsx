import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { ExternalLinkIcon, MessageIcon, SearchIcon } from "@/components/icons/docs";

// Admin panel -> Chat: Telegram kabi — chapda yozgan mehmonlar, o'ngda yozishma.
// Yangi xabarlar Dashboard dagi WebSocket dan `event` orqali keladi.

const card = "bg-white rounded-[18px] border border-[#EEF2FA] shadow-[0_8px_30px_rgba(16,42,116,0.06)]";
const COLORS = ["#1D5BE8", "#7C5CE0", "#1E9E62", "#F0692A", "#E5484D", "#0EA5B7", "#B7791F"];

const timeLabel = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
};

const clock = (iso) => new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
const dayLabel = (iso) => new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });

const place = (room) => [room.region_name, room.city].filter(Boolean).join(", ") || (room.country ? room.country : "Joylashuv noma'lum");

const RoomAvatar = ({ room, size = "w-11 h-11 text-[15px]" }) => (
  <div
    className={clsx("shrink-0 rounded-full text-white font-bold flex items-center justify-center", size)}
    style={{ background: COLORS[room.id % COLORS.length] }}
  >
    {(room.title || "M").replace("Mehmon #", "#").slice(0, 3)}
  </div>
);

const Ticks = ({ read }) => (
  <svg viewBox={"0 0 20 12"} className={clsx("w-4 h-3 inline-block", read ? "text-[#9CC1FF]" : "text-white/60")} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}>
    <path d={"m1 6 3.5 3.5L11 3"} strokeLinecap={"round"} strokeLinejoin={"round"} />
    {read && <path d={"m8 9.5 6.5-6.5"} strokeLinecap={"round"} />}
  </svg>
);

const ChatPanel = ({ client, event, connected }) => {
  const [rooms, setRooms] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const selectedRef = useRef(null);
  selectedRef.current = selectedId;

  const loadRooms = useCallback(() => {
    client
      .get("shnq-admin/chat/rooms/", { params: { search: search.trim() || undefined } })
      .then(({ data }) => setRooms(data.rooms))
      .catch(() => setRooms((prev) => prev || []));
  }, [client, search]);

  useEffect(() => {
    const t = setTimeout(loadRooms, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [loadRooms, search]);

  const loadMessages = useCallback(
    (id) => {
      client
        .get(`shnq-admin/chat/rooms/${id}/messages/`)
        .then(({ data }) => {
          if (selectedRef.current !== id) return;
          setRoom(data.room);
          setMessages(data.messages);
          setRooms((prev) => (prev || []).map((r) => (r.id === id ? { ...r, unread: 0 } : r)));
        })
        .catch(() => toast.error("Yozishmani yuklab bo'lmadi"));
    },
    [client]
  );

  useEffect(() => {
    if (!selectedId) return;
    setMessages([]);
    loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  // WebSocket hodisalari
  useEffect(() => {
    if (!event) return;
    if (event.event === "message" && event.room) {
      setRooms((prev) => {
        const others = (prev || []).filter((r) => r.id !== event.room.id);
        const updated = { ...event.room, unread: event.room.id === selectedRef.current ? 0 : event.room.unread };
        return [updated, ...others];
      });
      if (event.room.id === selectedRef.current) {
        setMessages((prev) => (prev.some((m) => m.id === event.message.id) ? prev : [...prev, event.message]));
        if (event.message.sender === "visitor") loadMessages(event.room.id); // ochiq — o'qildi
      }
    } else if (event.event === "read") {
      setRooms((prev) => (prev || []).map((r) => (r.id === event.room ? { ...r, unread: 0 } : r)));
    } else if (event.event === "seen" && event.room === selectedRef.current) {
      setMessages((prev) => prev.map((m) => (m.sender === "operator" ? { ...m, read: true } : m)));
    }
  }, [event, loadMessages]);

  // WebSocket ulanmagan bo'lsa — ro'yxat va ochiq yozishma har 10 soniyada yangilanadi
  useEffect(() => {
    if (connected) return undefined;
    const timer = setInterval(() => {
      loadRooms();
      if (selectedRef.current) loadMessages(selectedRef.current);
    }, 10000);
    return () => clearInterval(timer);
  }, [connected, loadRooms, loadMessages]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || !selectedId || sending) return;
    setSending(true);
    try {
      const { data } = await client.post(`shnq-admin/chat/rooms/${selectedId}/messages/`, { text: value });
      setText("");
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Xabar yuborilmadi");
    } finally {
      setSending(false);
    }
  };

  // Kun bo'yicha ajratgichlar bilan
  const grouped = useMemo(() => {
    const out = [];
    let day = null;
    messages.forEach((m) => {
      const d = new Date(m.created_at).toDateString();
      if (d !== day) {
        day = d;
        out.push({ divider: true, id: `d-${m.id}`, label: dayLabel(m.created_at) });
      }
      out.push(m);
    });
    return out;
  }, [messages]);

  const totalUnread = (rooms || []).reduce((sum, r) => sum + (r.unread || 0), 0);

  return (
    <div className={clsx(card, "overflow-hidden flex h-[calc(100vh-150px)] min-h-[520px]")}>
      {/* Mehmonlar ro'yxati */}
      <aside className={clsx("w-full md:w-[340px] shrink-0 border-r border-[#EEF2FA] flex flex-col", selectedId && "hidden md:flex")}>
        <div className={"p-3 border-b border-[#EEF2FA]"}>
          <div className={"flex items-center justify-between mb-2 px-1"}>
            <p className={"text-[15px] font-bold"}>Yozishmalar</p>
            <span className={clsx("flex items-center gap-1.5 text-[12px]", connected ? "text-[#1E9E62]" : "text-[#B7791F]")}>
              <span className={clsx("w-2 h-2 rounded-full", connected ? "bg-[#22C55E]" : "bg-[#F5B000]")} />
              {connected ? "Real vaqtda" : "Ulanmoqda..."}
            </span>
          </div>
          <div className={"relative"}>
            <SearchIcon className={"w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95B0]"} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={"Qidirish..."}
              className={"w-full h-10 pl-9 pr-3 rounded-[12px] bg-[#F4F6FB] text-[14px] outline-none focus:ring-2 focus:ring-[#1D5BE8]/20"}
            />
          </div>
        </div>
        <div className={"flex-1 overflow-y-auto"}>
          {rooms === null ? (
            <p className={"p-6 text-center text-[13px] text-[#8A95B0]"}>Yuklanmoqda...</p>
          ) : rooms.length === 0 ? (
            <div className={"p-8 text-center"}>
              <MessageIcon className={"w-10 h-10 mx-auto text-[#C9D3EA]"} />
              <p className={"mt-3 text-[13px] text-[#8A95B0]"}>Hozircha yozishmalar yo&apos;q</p>
            </div>
          ) : (
            rooms.map((r) => (
              <button
                key={r.id}
                type={"button"}
                onClick={() => setSelectedId(r.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  r.id === selectedId ? "bg-[#1D5BE8] text-white" : "hover:bg-[#F4F6FB]"
                )}
              >
                <RoomAvatar room={r} />
                <div className={"flex-1 min-w-0"}>
                  <div className={"flex items-center gap-2"}>
                    <p className={"flex-1 truncate text-[14px] font-semibold"}>{r.title}</p>
                    <span className={clsx("text-[11px]", r.id === selectedId ? "text-white/80" : "text-[#8A95B0]")}>
                      {timeLabel(r.last_message_at)}
                    </span>
                  </div>
                  <div className={"flex items-center gap-2"}>
                    <p className={clsx("flex-1 truncate text-[13px]", r.id === selectedId ? "text-white/85" : "text-[#5B6788]")}>
                      {r.last_message}
                    </p>
                    {r.unread > 0 && (
                      <span className={clsx("min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center", r.id === selectedId ? "bg-white text-[#1D5BE8]" : "bg-[#1D5BE8] text-white")}>
                        {r.unread}
                      </span>
                    )}
                  </div>
                  <p className={clsx("truncate text-[11px]", r.id === selectedId ? "text-white/70" : "text-[#8A95B0]")}>📍 {place(r)}</p>
                </div>
              </button>
            ))
          )}
        </div>
        {totalUnread > 0 && (
          <p className={"px-4 py-2 border-t border-[#EEF2FA] text-[12px] text-[#5B6788]"}>O&apos;qilmagan: {totalUnread}</p>
        )}
      </aside>

      {/* Yozishma */}
      <section className={clsx("flex-1 min-w-0 flex flex-col", !selectedId && "hidden md:flex")}>
        {!selectedId ? (
          <div className={"flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFE]"}>
            <div className={"w-16 h-16 rounded-full bg-[#E8F0FE] text-[#1D5BE8] flex items-center justify-center"}>
              <MessageIcon className={"w-8 h-8"} />
            </div>
            <p className={"mt-4 text-[15px] font-semibold"}>Yozishmani tanlang</p>
            <p className={"mt-1 text-[13px] text-[#5B6788]"}>Saytdagi yordamchi orqali yozgan mehmonlar chapda ko&apos;rinadi</p>
          </div>
        ) : (
          <>
            <header className={"shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[#EEF2FA]"}>
              <button type={"button"} onClick={() => setSelectedId(null)} className={"md:hidden text-[#1D5BE8] text-[20px] px-1"} aria-label={"Orqaga"}>
                ←
              </button>
              {room && <RoomAvatar room={room} size={"w-10 h-10 text-[14px]"} />}
              <div className={"flex-1 min-w-0"}>
                <p className={"text-[15px] font-bold truncate"}>{room?.title || "..."}</p>
                <p className={"text-[12px] text-[#5B6788] truncate"}>📍 {room ? place(room) : ""}</p>
              </div>
              {room?.page && (
                <a href={room.page} target={"_blank"} rel={"noopener noreferrer"} className={"hidden sm:flex items-center gap-1.5 text-[12px] text-[#1D5BE8] hover:underline max-w-[260px] truncate"} title={room.page}>
                  <ExternalLinkIcon className={"w-3.5 h-3.5 shrink-0"} /> Qaysi sahifadan yozgan
                </a>
              )}
            </header>

            <div ref={listRef} className={"flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-2 bg-[#EEF3FB]"}>
              {grouped.map((m) =>
                m.divider ? (
                  <div key={m.id} className={"flex justify-center py-1"}>
                    <span className={"px-3 py-1 rounded-full bg-white/80 text-[11px] text-[#5B6788]"}>{m.label}</span>
                  </div>
                ) : m.sender === "operator" ? (
                  <div key={m.id} className={"flex justify-end"}>
                    <div className={"max-w-[70%] rounded-2xl rounded-br-md bg-[#1D5BE8] text-white px-3.5 py-2 shadow-sm"}>
                      <p className={"text-[14px] leading-[1.5] whitespace-pre-wrap break-words"}>{m.text}</p>
                      <p className={"mt-0.5 text-[10px] text-white/70 flex items-center justify-end gap-1"}>
                        {m.operator && <span className={"mr-1"}>{m.operator}</span>}
                        {clock(m.created_at)} <Ticks read={m.read} />
                      </p>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className={"flex justify-start"}>
                    <div className={"max-w-[70%] rounded-2xl rounded-bl-md bg-white text-[#1E2B5A] px-3.5 py-2 shadow-sm"}>
                      <p className={"text-[14px] leading-[1.5] whitespace-pre-wrap break-words"}>{m.text}</p>
                      <p className={"mt-0.5 text-[10px] text-[#8A95B0] text-right"}>{clock(m.created_at)}</p>
                    </div>
                  </div>
                )
              )}
            </div>

            <form onSubmit={send} className={"shrink-0 flex items-end gap-2 px-4 py-3 border-t border-[#EEF2FA] bg-white"}>
              <textarea
                rows={1}
                value={text}
                maxLength={2000}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) send(e);
                }}
                placeholder={"Javob yozing... (Enter — yuborish, Shift+Enter — yangi qator)"}
                className={"flex-1 min-w-0 max-h-[140px] resize-none rounded-[12px] border border-[#DCE3F0] px-4 py-2.5 text-[14px] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10"}
              />
              <button
                type={"submit"}
                disabled={sending || !text.trim()}
                className={"h-[44px] px-5 rounded-[12px] bg-[#1D5BE8] text-white text-[14px] font-semibold hover:bg-[#174FD0] disabled:opacity-50 transition-colors"}
              >
                Yuborish
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};

export default ChatPanel;
