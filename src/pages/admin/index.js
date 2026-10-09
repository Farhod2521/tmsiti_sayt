import React, { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "clsx";
import axios from "axios";
import toast from "react-hot-toast";
import { config } from "@/config";
import {
  CheckIcon,
  CloseIcon,
  DatabaseIcon,
  EditIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileTextIcon,
  HistoryIcon,
  LockIcon,
  LogoutIcon,
  RefreshUpIcon,
  SearchIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/icons/docs";

const API = config.BASE_MAIN_API;
const TOKEN_KEY = "shnq_admin_token";
const ACCEPT = ".doc,.docx,.htm,.html";

const card = "bg-white rounded-[18px] border border-[#EEF2FA] shadow-[0_8px_30px_rgba(16,42,116,0.06)]";
const input =
  "w-full h-[44px] px-4 rounded-[12px] border border-[#DCE3F0] text-[14px] text-[#0B1A4F] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition bg-white";

// Hujjat tillari: uz — o'zbek (lotin), kr — o'zbek (kirill), ru — rus
const LANGS = [
  { id: "uz", label: "O'zbekcha", hint: "lotin", short: "UZ" },
  { id: "kr", label: "Ўзбекча", hint: "кирилл", short: "ЎЗ" },
  { id: "ru", label: "Русский", hint: "rus", short: "RU" },
];
const langLabel = (id) => {
  const l = LANGS.find((x) => x.id === id);
  return l ? `${l.label} (${l.hint})` : id;
};
const langShort = (id) => LANGS.find((x) => x.id === id)?.short || id;

const today = () => new Date().toISOString().slice(0, 10);

const formatDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
};

const errorText = (err, fallback = "Xatolik yuz berdi") =>
  err?.response?.data?.detail || (err?.response ? fallback : "Server bilan aloqa yo'q");

// ===================================================================
//   LOGIN
// ===================================================================
const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API}shnq-admin/login/`, { password });
      onLogin(data.token);
    } catch (err) {
      setError(errorText(err, "Parol noto'g'ri"));
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={"min-h-screen font-jakarta bg-gradient-to-br from-[#F6F9FF] via-white to-[#EAF1FF] flex items-center justify-center p-4"}>
      <form onSubmit={submit} className={clsx(card, "w-full max-w-[400px] p-8")}>
        <div className={"w-[60px] h-[60px] rounded-[16px] bg-[#E8F0FE] text-[#1D5BE8] flex items-center justify-center mx-auto"}>
          <LockIcon className={"w-8 h-8"} />
        </div>
        <h1 className={"mt-5 text-center text-[22px] font-extrabold text-[#0B1A4F]"}>Admin panel</h1>
        <p className={"mt-1 text-center text-[14px] text-[#5B6788]"}>SHNQ hujjatlarini boshqarish</p>
        <label className={"block mt-7 text-[13px] font-semibold text-[#0B1A4F]"}>Parol</label>
        <input
          type={"password"}
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={clsx(input, "mt-2", error && "border-[#E5484D]")}
          placeholder={"••••"}
        />
        {error && <p className={"mt-2 text-[13px] text-[#E5484D]"}>{error}</p>}
        <button
          type={"submit"}
          disabled={loading || !password}
          className={"mt-6 w-full h-[46px] rounded-[12px] bg-[#1D5BE8] text-white text-[15px] font-semibold hover:bg-[#174FD0] disabled:opacity-60 transition-colors"}
        >
          {loading ? "Tekshirilmoqda..." : "Kirish"}
        </button>
        <Link href={"/"} className={"block mt-5 text-center text-[13px] text-[#5B6788] hover:text-[#1D5BE8]"}>
          ← Saytga qaytish
        </Link>
      </form>
    </div>
  );
};

// ===================================================================
//   TAHRIR QATORI
// ===================================================================
const EditionRow = ({ edition, docId, client, onChanged }) => {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(edition.date);
  const [note, setNote] = useState(edition.note || "");
  const [lang, setLang] = useState(edition.lang);
  const [busy, setBusy] = useState(false);
  const s = edition.stats || {};

  const save = async () => {
    setBusy(true);
    try {
      await client.patch(`shnq-admin/editions/${edition.id}/`, { edition_date: date, note, lang });
      toast.success("Saqlandi");
      setEditing(false);
      onChanged();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const reparse = async () => {
    setBusy(true);
    try {
      await client.post(`shnq-admin/editions/${edition.id}/reparse/`);
      toast.success("Fayl qayta o'qildi");
      onChanged();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`${formatDate(edition.date)} dagi tahrirni o'chirasizmi?`)) return;
    setBusy(true);
    try {
      await client.delete(`shnq-admin/editions/${edition.id}/`);
      toast.success("Tahrir o'chirildi");
      onChanged();
    } catch (err) {
      toast.error(errorText(err));
      setBusy(false);
    }
  };

  const iconBtn = "w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors disabled:opacity-50";

  return (
    <li className={clsx("rounded-[14px] border p-4", edition.error ? "border-[#F5C2C2] bg-[#FFF7F7]" : "border-[#EEF2FA]")}>
      {editing ? (
        <div className={"grid gap-3 md:grid-cols-[170px_190px_1fr_auto] items-center"}>
          <input type={"date"} value={date} onChange={(e) => setDate(e.target.value)} className={input} />
          <select value={lang} onChange={(e) => setLang(e.target.value)} className={clsx(input, "cursor-pointer")}>
            {LANGS.map((l) => (
              <option key={l.id} value={l.id}>{langLabel(l.id)}</option>
            ))}
          </select>
          <input value={note} onChange={(e) => setNote(e.target.value)} className={input} placeholder={"O'zgartirish kiritgan hujjat"} />
          <div className={"flex gap-2"}>
            <button type={"button"} onClick={save} disabled={busy} className={clsx(iconBtn, "bg-[#1D5BE8] text-white")} title={"Saqlash"}>
              <CheckIcon className={"w-5 h-5"} />
            </button>
            <button type={"button"} onClick={() => setEditing(false)} className={clsx(iconBtn, "bg-[#F1F4FA] text-[#5B6788]")} title={"Bekor qilish"}>
              <CloseIcon className={"w-4 h-4"} />
            </button>
          </div>
        </div>
      ) : (
        <div className={"flex flex-col md:flex-row md:items-center gap-3"}>
          <div className={"flex-1 min-w-0"}>
            <div className={"flex flex-wrap items-center gap-2"}>
              <span className={"text-[15px] font-bold text-[#0B1A4F]"}>{formatDate(edition.date)}</span>
              <span className={"px-2 py-0.5 rounded-md bg-[#F1F4FA] text-[11px] font-semibold text-[#5B6788]"}>{langShort(edition.lang)}</span>
              {s.original && <span className={"px-2 py-0.5 rounded-md bg-[#E8F0FE] text-[11px] font-medium text-[#1D5BE8]"}>asl tahrir</span>}
              {edition.error && <span className={"px-2 py-0.5 rounded-md bg-[#FDECEC] text-[11px] font-medium text-[#E5484D]"}>xato</span>}
            </div>
            {edition.note && <p className={"mt-1 text-[13px] text-[#1E2B5A]"}>{edition.note}</p>}
            <p className={"mt-1 text-[12px] text-[#8A95B0]"}>
              {edition.error
                ? edition.error
                : [
                    `${s.blocks || 0} ta band`,
                    `${s.headings || 0} ta bo'lim`,
                    !s.original && `${s.changed || 0} o'zgargan · ${s.added || 0} qo'shilgan · ${s.removed || 0} chiqarilgan`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
            </p>
          </div>
          <div className={"flex items-center gap-1.5"}>
            <a
              href={`/shnq/${docId}?lang=${edition.lang}&edition=${edition.id}`}
              target={"_blank"}
              rel={"noopener noreferrer"}
              className={clsx(iconBtn, "text-[#1D5BE8] hover:bg-[#EEF4FF]")}
              title={"Saytda ko'rish"}
            >
              <EyeIcon className={"w-5 h-5"} />
            </a>
            {edition.file && (
              <a href={`${config.MEDIA_URL}${edition.file}`} target={"_blank"} rel={"noopener noreferrer"} className={clsx(iconBtn, "text-[#1D5BE8] hover:bg-[#EEF4FF]")} title={"Yuklangan fayl"}>
                <FileTextIcon className={"w-5 h-5"} />
              </a>
            )}
            <button type={"button"} onClick={() => setEditing(true)} disabled={busy} className={clsx(iconBtn, "text-[#1D5BE8] hover:bg-[#EEF4FF]")} title={"Sana / izohni tahrirlash"}>
              <EditIcon className={"w-5 h-5"} />
            </button>
            <button type={"button"} onClick={reparse} disabled={busy} className={clsx(iconBtn, "text-[#1D5BE8] hover:bg-[#EEF4FF]")} title={"Faylni qayta o'qish"}>
              <RefreshUpIcon className={"w-5 h-5"} />
            </button>
            <button type={"button"} onClick={remove} disabled={busy} className={clsx(iconBtn, "text-[#E5484D] hover:bg-[#FDECEC]")} title={"O'chirish"}>
              <TrashIcon className={"w-5 h-5"} />
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

// ===================================================================
//   YUKLASH FORMASI
// ===================================================================
const UploadForm = ({ doc, client, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [lang, setLang] = useState("auto");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const editions = doc.editions || [];
  const countIn = (id) => editions.filter((e) => e.lang === id).length;
  const isFirst = lang === "auto" ? editions.length === 0 : countIn(lang) === 0;

  const pickFile = (f) => {
    if (!f) return;
    if (!/\.(docx?|html?)$/i.test(f.name)) {
      toast.error("Faqat .doc, .docx yoki .html fayl");
      return;
    }
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Fayl tanlang");
    const form = new FormData();
    form.append("file", file);
    form.append("lang", lang);
    form.append("edition_date", date);
    form.append("note", note);
    setProgress(0);
    try {
      const { data } = await client.post(`shnq-admin/documents/${doc.id}/editions/`, form, {
        onUploadProgress: (ev) => ev.total && setProgress(Math.round((ev.loaded / ev.total) * 100)),
      });
      const s = data.stats || {};
      toast.success(
        `${langLabel(data.lang)} — ` +
          (s.original
            ? `yuklandi: ${s.blocks} ta band, ${s.headings} ta bo'lim`
            : `yangi tahrir: ${s.changed || 0} o'zgargan, ${s.added || 0} qo'shilgan, ${s.removed || 0} chiqarilgan`),
        { duration: 6000 }
      );
      if (data.lang_corrected) {
        toast(`Fayl yozuvi boshqacha ekan — "${langLabel(data.lang)}" sifatida saqlandi`, { icon: "ℹ️", duration: 7000 });
      }
      setFile(null);
      setNote("");
      if (fileRef.current) fileRef.current.value = "";
      onUploaded();
    } catch (err) {
      toast.error(errorText(err, "Yuklab bo'lmadi"));
    } finally {
      setProgress(null);
    }
  };

  return (
    <form onSubmit={submit} className={clsx(card, "p-5")}>
      <div className={"flex items-center gap-3 text-[16px] font-bold text-[#0B1A4F]"}>
        <UploadIcon className={"w-6 h-6 text-[#1D5BE8]"} />
        {isFirst ? "Hujjat matnini yuklash" : "Yangi tahrir yuklash"}
      </div>
      <p className={"mt-2 text-[13px] leading-[1.5] text-[#5B6788]"}>
        lex.uz da hujjatni oching → <b>«Yuklab olish»</b> → Word (.doc) faylni shu yerga tashlang. Hujjatga o&apos;zgartirish
        kiritilganda yangi faylni <b>o&apos;zgartirish sanasi</b> bilan yuklang — tizim oldingi tahrir bilan solishtirib,
        o&apos;zgargan bandlarga «Oldingi tahrirga qarang» qo&apos;shadi.
      </p>

      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pickFile(e.dataTransfer.files?.[0]);
        }}
        className={clsx(
          "mt-4 rounded-[14px] border-2 border-dashed px-4 py-7 text-center cursor-pointer transition-colors",
          dragOver ? "border-[#1D5BE8] bg-[#EEF4FF]" : file ? "border-[#1E9E62] bg-[#F2FBF6]" : "border-[#DCE3F0] hover:border-[#1D5BE8] hover:bg-[#F8FAFF]"
        )}
      >
        <input ref={fileRef} type={"file"} accept={ACCEPT} className={"hidden"} onChange={(e) => pickFile(e.target.files?.[0])} />
        {file ? (
          <>
            <FileTextIcon className={"w-8 h-8 mx-auto text-[#1E9E62]"} />
            <p className={"mt-2 text-[14px] font-semibold text-[#0B1A4F] break-all"}>{file.name}</p>
            <p className={"text-[12px] text-[#5B6788]"}>{(file.size / 1024 / 1024).toFixed(2)} MB · boshqa fayl tanlash uchun bosing</p>
          </>
        ) : (
          <>
            <UploadIcon className={"w-8 h-8 mx-auto text-[#8A95B0]"} />
            <p className={"mt-2 text-[14px] font-semibold text-[#0B1A4F]"}>Faylni shu yerga tashlang yoki tanlang</p>
            <p className={"text-[12px] text-[#5B6788]"}>.doc (lex.uz), .docx, .html · 50 MB gacha</p>
          </>
        )}
      </div>

      <div className={"mt-4"}>
        <label className={"text-[13px] font-semibold text-[#0B1A4F]"}>Hujjat tili</label>
        <div className={"mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2"}>
          {[{ id: "auto", label: "Avtomatik", hint: "matndan aniqlanadi" }, ...LANGS].map((l) => {
            const n = l.id === "auto" ? null : countIn(l.id);
            const active = lang === l.id;
            return (
              <button
                key={l.id}
                type={"button"}
                onClick={() => setLang(l.id)}
                className={clsx(
                  "rounded-[12px] border-2 px-3 py-2.5 text-left transition-colors",
                  active ? "border-[#1D5BE8] bg-[#EEF4FF]" : "border-[#E3E9F5] hover:border-[#B8C6E6]"
                )}
              >
                <span className={clsx("block text-[14px] font-semibold", active ? "text-[#1D5BE8]" : "text-[#0B1A4F]")}>{l.label}</span>
                <span className={"block text-[12px] text-[#8A95B0]"}>
                  {n === null ? l.hint : n > 0 ? `${l.hint} · ${n} tahrir bor` : `${l.hint} · hali yo'q`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={"mt-3 grid gap-3 sm:grid-cols-2"}>
        <div>
          <label className={"text-[13px] font-semibold text-[#0B1A4F]"}>{isFirst ? "Qabul qilingan sana" : "O'zgartirish sanasi"}</label>
          <input type={"date"} required value={date} onChange={(e) => setDate(e.target.value)} className={clsx(input, "mt-1.5")} />
        </div>
      </div>
      <div className={"mt-3"}>
        <label className={"text-[13px] font-semibold text-[#0B1A4F]"}>
          {isFirst ? "Izoh (ixtiyoriy)" : "O'zgartirish kiritgan hujjat"}
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={clsx(input, "mt-1.5")}
          placeholder={"Qurilish vazirining 2025-yil 24-iyundagi 01/2-37-son buyrug'i (hisob raqami 358)"}
        />
        {!isFirst && (
          <p className={"mt-1.5 text-[12px] text-[#8A95B0]"}>
            Bu matn o&apos;zgargan bandlar tagida «(... tahririda)» ko&apos;rinishida chiqadi.
          </p>
        )}
      </div>

      <button
        type={"submit"}
        disabled={!file || progress !== null}
        className={"mt-5 w-full h-[46px] rounded-[12px] bg-[#1D5BE8] text-white text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#174FD0] disabled:opacity-60 transition-colors"}
      >
        <UploadIcon className={"w-5 h-5"} />
        {progress === null ? "Yuklash" : progress < 100 ? `Yuklanmoqda... ${progress}%` : "Matn ajratilmoqda..."}
      </button>
    </form>
  );
};

// ===================================================================
//   DASHBOARD
// ===================================================================
// ===================================================================
//   lex.uz AVTOMATIK IMPORT
// ===================================================================
const COUNTERS = [
  ["created", "Yangi yuklandi", "bg-[#E6F6EC] text-[#1E9E62]"],
  ["updated", "Yangi tahrir", "bg-[#E8F0FE] text-[#2B5CD9]"],
  ["replaced", "Almashtirildi", "bg-[#EEEAFD] text-[#7C5CE0]"],
  ["ok", "Tekshirildi", "bg-[#F1F4FA] text-[#5B6788]"],
  ["stub", "PDF qoldi", "bg-[#FFF6DB] text-[#B78100]"],
  ["mismatch", "Shifr mos emas", "bg-[#FFEEE4] text-[#F0692A]"],
  ["error", "Xato", "bg-[#FDECEC] text-[#E5484D]"],
  ["laws", "Qonunlar", "bg-[#E8F0FE] text-[#1D5BE8]"],
];

const JOB_STATUS_CLS = {
  queued: "bg-[#F1F4FA] text-[#5B6788]",
  running: "bg-[#E8F0FE] text-[#1D5BE8]",
  done: "bg-[#E6F6EC] text-[#1E9E62]",
  stopped: "bg-[#FFF6DB] text-[#B78100]",
  failed: "bg-[#FDECEC] text-[#E5484D]",
};

const SCOPES = [
  { id: "all", label: "Hammasi", hint: "barcha SHNQ tekshiriladi" },
  { id: "missing", label: "Matni yo'qlar", hint: "faqat hali matni yuklanmaganlar" },
  { id: "failed", label: "Xatolarni qayta", hint: "oldin xato bergan hujjatlar" },
];

const duration = (from, to) => {
  if (!from) return "";
  const sec = Math.max(0, Math.round(((to ? new Date(to) : new Date()) - new Date(from)) / 1000));
  const m = Math.floor(sec / 60);
  return m ? `${m} daq ${sec % 60} s` : `${sec} s`;
};

const LexSyncPanel = ({ client, onOpenDoc }) => {
  const [state, setState] = useState(null);
  const [scope, setScope] = useState("all");
  const [laws, setLaws] = useState(true);
  const [replace, setReplace] = useState(false);
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);

  const load = useCallback(() => {
    client
      .get("shnq-admin/lex-sync/")
      .then(({ data }) => setState(data))
      .catch((err) => toast.error(errorText(err)));
  }, [client]);

  const running = !!state?.running;
  useEffect(() => {
    load();
    const timer = setInterval(load, running ? 2000 : 15000);
    return () => clearInterval(timer);
  }, [load, running]);

  const job = state?.job;
  const logLength = job?.log?.length || 0;
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLength]);

  const start = async () => {
    if (replace && !window.confirm("Mavjud matnlar o'chirilib, lex.uz dan qaytadan yuklanadi. Davom etasizmi?")) return;
    setBusy(true);
    try {
      await client.post("shnq-admin/lex-sync/start/", { scope, laws, mode: replace ? "replace" : "update" });
      toast.success("Import boshlandi");
      load();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    setBusy(true);
    try {
      await client.post("shnq-admin/lex-sync/stop/");
      toast("Joriy hujjatdan keyin to'xtaydi", { icon: "⏸" });
      load();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const summary = state?.summary || {};
  const statuses = summary.statuses || {};
  const percent = job && job.total ? Math.round((job.done / job.total) * 100) : 0;

  return (
    <div className={"space-y-5"}>
      <div className={"grid grid-cols-2 lg:grid-cols-5 gap-3"}>
        {[
          ["lex.uz havolasi bor", summary.with_lex_link, "text-[#0B1A4F]"],
          ["Matni yuklangan", statuses.ok, "text-[#1E9E62]"],
          ["PDF qolgan (zip/matnsiz)", statuses.stub, "text-[#B78100]"],
          ["Shifr mos emas / xato", (statuses.mismatch || 0) + (statuses.error || 0), "text-[#E5484D]"],
          ["Qonunlar", summary.laws, "text-[#1D5BE8]"],
        ].map(([label, value, cls]) => (
          <div key={label} className={clsx(card, "p-4")}>
            <p className={clsx("text-[22px] font-bold leading-tight", cls)}>{value == null ? "—" : value}</p>
            <p className={"text-[12.5px] text-[#5B6788]"}>{label}</p>
          </div>
        ))}
      </div>

      <div className={"grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] items-start"}>
        {/* Sozlamalar */}
        <div className={clsx(card, "p-5")}>
          <div className={"flex items-center gap-3 text-[16px] font-bold"}>
            <RefreshUpIcon className={"w-6 h-6 text-[#1D5BE8]"} /> lex.uz dan avtomatik yuklash
          </div>
          <ul className={"mt-3 space-y-1.5 text-[13px] leading-[1.5] text-[#5B6788] list-disc pl-5"}>
            <li>Har bir SHNQ ning lex.uz havolasidan <b>o&apos;zbek (lotin, kirill) va rus</b> matnlari yuklanadi.</li>
            <li>lex.uz dagi hujjat <b>shifri mos kelmasa</b> — yuklanmaydi, pastdagi ro&apos;yxatga tushadi.</li>
            <li>Matn o&apos;rniga <b>zip/pdf</b> biriktirilgan hujjatlarda PDF qoladi.</li>
            <li>Matn o&apos;zgargan bo&apos;lsa — yangi tahrir qo&apos;shiladi («Oldingi tahrirga qarang»); adashib yuklangan matn almashtiriladi.</li>
            <li>Matnlarda havola qilingan qonun va kodekslar «Qonunlar» bo&apos;limiga yuklanadi — havolalar sayt ichida ochiladi.</li>
          </ul>

          <p className={"mt-5 text-[13px] font-semibold"}>Qaysi hujjatlar</p>
          <div className={"mt-2 grid grid-cols-3 gap-2"}>
            {SCOPES.map((s) => (
              <button
                key={s.id}
                type={"button"}
                disabled={running}
                onClick={() => setScope(s.id)}
                title={s.hint}
                className={clsx(
                  "rounded-[12px] border-2 px-2 py-2 text-[13px] font-semibold transition-colors disabled:opacity-60",
                  scope === s.id ? "border-[#1D5BE8] bg-[#EEF4FF] text-[#1D5BE8]" : "border-[#E3E9F5] hover:border-[#B8C6E6]"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <label className={"mt-4 flex items-start gap-3 cursor-pointer"}>
            <input type={"checkbox"} className={"mt-1"} checked={laws} disabled={running} onChange={(e) => setLaws(e.target.checked)} />
            <span className={"text-[13.5px]"}>
              Havola qilingan qonunlarni ham yuklash
              <span className={"block text-[12px] text-[#8A95B0]"}>Kodeks, qonun, qarorlar — «Qonunlar» bo&apos;limi</span>
            </span>
          </label>
          <label className={"mt-3 flex items-start gap-3 cursor-pointer"}>
            <input type={"checkbox"} className={"mt-1"} checked={replace} disabled={running} onChange={(e) => setReplace(e.target.checked)} />
            <span className={"text-[13.5px] text-[#E5484D]"}>
              Mavjud matnlarni o&apos;chirib, qaytadan yuklash
              <span className={"block text-[12px] text-[#8A95B0]"}>Tahrirlar tarixi ham qaytadan boshlanadi</span>
            </span>
          </label>

          {running ? (
            <button
              type={"button"}
              onClick={stop}
              disabled={busy || job?.stop_requested}
              className={"mt-5 w-full h-[46px] rounded-[12px] bg-[#FDECEC] text-[#E5484D] text-[15px] font-semibold hover:bg-[#FBDADA] disabled:opacity-60"}
            >
              {job?.stop_requested ? "To'xtatilmoqda..." : "To'xtatish"}
            </button>
          ) : (
            <button
              type={"button"}
              onClick={start}
              disabled={busy || !state}
              className={"mt-5 w-full h-[46px] rounded-[12px] bg-[#1D5BE8] text-white text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#174FD0] disabled:opacity-60"}
            >
              <RefreshUpIcon className={"w-5 h-5"} /> Boshlash
            </button>
          )}
          <p className={"mt-3 text-[12px] text-[#8A95B0]"}>
            lex.uz ni ortiqcha yuklamaslik uchun so&apos;rovlar orasida pauza bor: 150 ta hujjat ~30–60 daqiqa.
            Sahifani yopsangiz ham jarayon serverda davom etadi.
          </p>
        </div>

        {/* Jarayon */}
        <div className={clsx(card, "p-5 min-w-0")}>
          {!job ? (
            <div className={"py-16 text-center text-[#5B6788]"}>
              <HistoryIcon className={"w-12 h-12 mx-auto text-[#B8C6E6]"} />
              <p className={"mt-4 text-[15px] font-semibold text-[#0B1A4F]"}>Hali import qilinmagan</p>
              <p className={"mt-1 text-[13px]"}>«Boshlash» tugmasini bosing — jarayon shu yerda ko&apos;rinadi</p>
            </div>
          ) : (
            <>
              <div className={"flex flex-wrap items-center gap-3"}>
                <span className={"text-[16px] font-bold"}>Jarayon #{job.id}</span>
                <span className={clsx("px-2.5 py-1 rounded-md text-[12px] font-semibold", JOB_STATUS_CLS[job.status])}>
                  {job.status_label}
                </span>
                <span className={"ml-auto text-[12.5px] text-[#8A95B0]"}>
                  {duration(job.started_at || job.created_at, job.finished_at)}
                </span>
              </div>

              <div className={"mt-4 h-3 rounded-full bg-[#EEF2FA] overflow-hidden"}>
                <div
                  className={clsx("h-full rounded-full transition-all duration-500", job.status === "failed" ? "bg-[#E5484D]" : "bg-[#1D5BE8]")}
                  style={{ width: `${job.status === "done" ? 100 : percent}%` }}
                />
              </div>
              <div className={"mt-2 flex items-center justify-between gap-3 text-[13px]"}>
                <span className={"truncate text-[#1E2B5A]"}>{running ? job.current || "Tayyorlanmoqda..." : " "}</span>
                <span className={"shrink-0 font-semibold"}>
                  {job.done} / {job.total || "?"} · {job.status === "done" ? 100 : percent}%
                </span>
              </div>

              <div className={"mt-4 flex flex-wrap gap-2"}>
                {COUNTERS.filter(([key]) => job.counters?.[key]).map(([key, label, cls]) => (
                  <span key={key} className={clsx("px-2.5 py-1 rounded-md text-[12.5px] font-medium", cls)}>
                    {label}: <b>{job.counters[key]}</b>
                  </span>
                ))}
              </div>

              <div
                ref={logRef}
                className={"mt-4 h-[340px] overflow-y-auto rounded-[12px] bg-[#0F172A] text-[#CBD5E1] p-3 font-mono text-[12px] leading-[1.6]"}
              >
                {(job.log || []).map((line, i) => (
                  <div
                    key={i}
                    className={clsx(
                      "whitespace-pre-wrap break-words",
                      line.includes("✗") && "text-[#FCA5A5]",
                      line.includes("✓") && "text-[#86EFAC]",
                      line.includes("○") && "text-[#FDE68A]",
                      line.includes("▶") && "text-white"
                    )}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Muammoli hujjatlar */}
      {state?.problems?.length > 0 && (
        <div className={clsx(card, "p-5")}>
          <div className={"flex items-center gap-3 text-[16px] font-bold"}>
            <FileTextIcon className={"w-6 h-6 text-[#F0692A]"} /> Tekshirish kerak
            <span className={"px-2 py-0.5 rounded-md bg-[#FFEEE4] text-[12px] font-medium text-[#F0692A]"}>{state.problems.length}</span>
          </div>
          <p className={"mt-1 text-[13px] text-[#5B6788]"}>
            «Shifr mos emas» — SHNQ dagi lex.uz havolasi boshqa hujjatga olib boradi: havolani to&apos;g&apos;rilang yoki matnni qo&apos;lda yuklang.
          </p>
          <ul className={"mt-4 divide-y divide-[#EEF2FA]"}>
            {state.problems.map((p) => (
              <li key={p.shnk_id} className={"py-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4"}>
                <div className={"md:w-[180px] shrink-0"}>
                  <p className={"text-[13px] font-bold"}>{p.designation}</p>
                  <span
                    className={clsx(
                      "inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold",
                      p.status === "stub" ? "bg-[#FFF6DB] text-[#B78100]" : p.status === "mismatch" ? "bg-[#FFEEE4] text-[#F0692A]" : "bg-[#FDECEC] text-[#E5484D]"
                    )}
                  >
                    {p.status_label}
                  </span>
                </div>
                <p className={"flex-1 min-w-0 text-[13px] text-[#1E2B5A] break-words"}>{p.message}</p>
                <div className={"flex gap-2 shrink-0"}>
                  {p.url && (
                    <a href={p.url} target={"_blank"} rel={"noopener noreferrer"} className={"h-9 px-3 rounded-[10px] border border-[#DCE3F0] text-[#1D5BE8] text-[13px] font-medium flex items-center gap-1.5 hover:bg-[#F5F8FF]"}>
                      <ExternalLinkIcon className={"w-4 h-4"} /> lex.uz
                    </a>
                  )}
                  <button type={"button"} onClick={() => onOpenDoc(p.shnk_id)} className={"h-9 px-3 rounded-[10px] bg-[#EEF4FF] text-[#1D5BE8] text-[13px] font-medium hover:bg-[#DCE7FF]"}>
                    Hujjatni ochish
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const FILTERS = [
  { id: "", label: "Barchasi" },
  { id: "1", label: "Matni bor" },
  { id: "0", label: "Matnsiz" },
];

const Dashboard = ({ token, onLogout }) => {
  const client = React.useMemo(() => {
    const instance = axios.create({ baseURL: API, headers: { "X-Admin-Token": token } });
    instance.interceptors.response.use(
      (r) => r,
      (err) => {
        if ([401, 403].includes(err?.response?.status)) {
          toast.error("Sessiya tugadi, qayta kiring");
          onLogout();
        }
        return Promise.reject(err);
      }
    );
    return instance;
  }, [token, onLogout]);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(null);

  const [tab, setTab] = useState("docs");

  // /admin?doc=12 — hujjatni to'g'ridan-to'g'ri ochish; /admin?tab=lex — lex.uz import bo'limi
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.doc) setSelectedId(Number(router.query.doc) || null);
    if (router.query.tab === "lex") setTab("lex");
  }, [router.isReady, router.query.doc, router.query.tab]);

  const openDoc = (id) => {
    setSelectedId(id);
    setTab("docs");
  };

  const syncDocFromLex = async () => {
    try {
      await client.post("shnq-admin/lex-sync/start/", { shnk_ids: [doc.id], laws: false });
      toast.success("lex.uz dan yuklash boshlandi");
      setTab("lex");
    } catch (err) {
      toast.error(errorText(err));
    }
  };
  const [doc, setDoc] = useState(null);
  const [docLoading, setDocLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setPage(1), [debounced, filter]);

  const loadList = useCallback(() => {
    setListLoading(true);
    client
      .get("shnq-admin/documents/", { params: { search: debounced, has_text: filter, page, page_size: 25 } })
      .then(({ data }) => setList(data))
      .catch((err) => toast.error(errorText(err)))
      .finally(() => setListLoading(false));
  }, [client, debounced, filter, page]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const loadDoc = useCallback(() => {
    if (!selectedId) return;
    setDocLoading(true);
    client
      .get(`shnq-admin/documents/${selectedId}/`)
      .then(({ data }) => setDoc(data))
      .catch((err) => toast.error(errorText(err)))
      .finally(() => setDocLoading(false));
  }, [client, selectedId]);

  useEffect(() => {
    setDoc(null);
    loadDoc();
  }, [loadDoc]);

  const refreshAll = () => {
    loadDoc();
    loadList();
  };

  const summary = list?.summary || {};
  const stats = [
    { label: "Jami SHNQ", value: summary.documents, cls: "bg-[#E8F0FE] text-[#2B5CD9]", Icon: FileTextIcon },
    { label: "Matni yuklangan", value: summary.with_text, cls: "bg-[#E4F6EC] text-[#1E9E62]", Icon: CheckIcon },
    { label: "Tahrirlar", value: summary.editions, cls: "bg-[#EEEAFD] text-[#7C5CE0]", Icon: HistoryIcon },
    { label: "Ko'rishlar", value: summary.views, cls: "bg-[#FFEEE4] text-[#F0692A]", Icon: EyeIcon },
  ];

  const editionsByLang = (doc?.editions || []).reduce((acc, e) => {
    (acc[e.lang] = acc[e.lang] || []).push(e);
    return acc;
  }, {});

  return (
    <div className={"min-h-screen font-jakarta bg-[#F6F9FF] text-[#0B1A4F]"}>
      <header className={"sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EEF2FA]"}>
        <div className={"max-w-[1536px] mx-auto px-4 lg:px-8 h-[64px] flex items-center gap-4"}>
          <div className={"w-10 h-10 rounded-[12px] bg-[#1D5BE8] text-white flex items-center justify-center"}>
            <DatabaseIcon className={"w-6 h-6"} />
          </div>
          <div className={"flex-1"}>
            <p className={"text-[16px] font-extrabold leading-tight"}>TMSITI · Admin panel</p>
            <p className={"text-[12px] text-[#5B6788]"}>SHNQ hujjatlari va tahrirlari</p>
          </div>
          <Link href={"/shnq"} target={"_blank"} className={"hidden sm:flex h-10 px-4 rounded-[12px] items-center gap-2 text-[14px] font-medium text-[#1D5BE8] hover:bg-[#EEF4FF]"}>
            <ExternalLinkIcon className={"w-4 h-4"} /> Saytda ko&apos;rish
          </Link>
          <button type={"button"} onClick={onLogout} className={"h-10 px-4 rounded-[12px] flex items-center gap-2 text-[14px] font-medium text-[#E5484D] hover:bg-[#FDECEC]"}>
            <LogoutIcon className={"w-5 h-5"} /> Chiqish
          </button>
        </div>
      </header>

      <main className={"max-w-[1536px] mx-auto px-4 lg:px-8 py-6"}>
        <div className={"mb-5 inline-flex rounded-[14px] bg-white border border-[#EEF2FA] p-1 shadow-[0_8px_30px_rgba(16,42,116,0.06)]"}>
          {[
            ["docs", "Hujjatlar", FileTextIcon],
            ["lex", "lex.uz import", RefreshUpIcon],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              type={"button"}
              onClick={() => setTab(id)}
              className={clsx(
                "h-10 px-4 rounded-[10px] flex items-center gap-2 text-[14px] font-semibold transition-colors",
                tab === id ? "bg-[#1D5BE8] text-white" : "text-[#5B6788] hover:bg-[#F1F4FA]"
              )}
            >
              <Icon className={"w-5 h-5"} /> {label}
            </button>
          ))}
        </div>

        {tab === "lex" && <LexSyncPanel client={client} onOpenDoc={openDoc} />}

        {tab === "docs" && (
        <>
        <div className={"grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"}>
          {stats.map(({ label, value, cls, Icon }) => (
            <div key={label} className={clsx(card, "flex items-center gap-4 p-4")}>
              <div className={clsx("w-[46px] h-[46px] shrink-0 rounded-[12px] flex items-center justify-center", cls)}>
                <Icon className={"w-6 h-6"} />
              </div>
              <div>
                <p className={"text-[20px] font-bold leading-tight"}>{value == null ? "—" : value.toLocaleString("ru-RU")}</p>
                <p className={"text-[13px] text-[#5B6788]"}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={"mt-5 grid gap-5 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] items-start"}>
          {/* Ro'yxat */}
          <div className={clsx(card, "p-4 lg:sticky lg:top-[84px]")}>
            <div className={"relative"}>
              <SearchIcon className={"absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A95B0]"} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={"Shifr yoki nomi bo'yicha qidirish..."} className={clsx(input, "pl-12")} />
            </div>
            <div className={"mt-3 flex gap-1 rounded-[12px] bg-[#F1F4FA] p-1"}>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type={"button"}
                  onClick={() => setFilter(f.id)}
                  className={clsx("flex-1 h-8 rounded-[9px] text-[13px] font-medium transition-colors", filter === f.id ? "bg-white text-[#1D5BE8] shadow-sm" : "text-[#5B6788]")}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <ul className={clsx("mt-3 space-y-1 lg:max-h-[calc(100vh-330px)] overflow-y-auto transition-opacity", listLoading && "opacity-60")}>
              {list?.results?.length === 0 && <li className={"py-10 text-center text-[14px] text-[#8A95B0]"}>Hech narsa topilmadi</li>}
              {(list?.results || []).map((item) => (
                <li key={item.id}>
                  <button
                    type={"button"}
                    onClick={() => setSelectedId(item.id)}
                    className={clsx(
                      "w-full text-left rounded-[12px] px-3 py-2.5 transition-colors",
                      selectedId === item.id ? "bg-[#EEF4FF] shadow-[inset_3px_0_0_#1D5BE8]" : "hover:bg-[#F7F9FD]"
                    )}
                  >
                    <span className={"flex items-center gap-2"}>
                      <span className={"text-[13px] font-bold"}>{item.designation}</span>
                      {item.editions_count > 0 ? (
                        <>
                          <span className={"px-1.5 py-0.5 rounded bg-[#E6F6EC] text-[11px] font-medium text-[#1E9E62]"}>{item.editions_count} tahrir</span>
                          {(item.languages || []).map((l) => (
                            <span key={l} className={"px-1.5 py-0.5 rounded bg-[#EEF4FF] text-[10.5px] font-semibold text-[#1D5BE8]"}>{langShort(l)}</span>
                          ))}
                        </>
                      ) : (
                        <span className={"px-1.5 py-0.5 rounded bg-[#F1F4FA] text-[11px] font-medium text-[#8A95B0]"}>matnsiz</span>
                      )}
                      {!item.status && <span className={"px-1.5 py-0.5 rounded bg-[#FDECEC] text-[11px] font-medium text-[#E5484D]"}>bekor</span>}
                    </span>
                    <span className={"block mt-0.5 text-[12.5px] leading-[1.4] text-[#5B6788] line-clamp-2"}>{item.name_uz || item.name_ru}</span>
                  </button>
                </li>
              ))}
            </ul>

            {list && list.pages > 1 && (
              <div className={"mt-3 flex items-center justify-between text-[13px]"}>
                <button type={"button"} disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={"h-9 px-3 rounded-[10px] bg-[#F1F4FA] disabled:opacity-40"}>
                  ← Oldingi
                </button>
                <span className={"text-[#5B6788]"}>
                  {page} / {list.pages} · {list.count} ta
                </span>
                <button type={"button"} disabled={page >= list.pages} onClick={() => setPage((p) => p + 1)} className={"h-9 px-3 rounded-[10px] bg-[#F1F4FA] disabled:opacity-40"}>
                  Keyingi →
                </button>
              </div>
            )}
          </div>

          {/* Tanlangan hujjat */}
          <div className={"space-y-5 min-w-0"}>
            {!selectedId && (
              <div className={clsx(card, "p-12 text-center")}>
                <FileTextIcon className={"w-12 h-12 mx-auto text-[#B8C6E6]"} />
                <p className={"mt-4 text-[16px] font-semibold"}>Chapdagi ro&apos;yxatdan SHNQ ni tanlang</p>
                <p className={"mt-1 text-[14px] text-[#5B6788]"}>So&apos;ng uning matnini (lex.uz .doc fayl) yuklaysiz</p>
              </div>
            )}

            {selectedId && !doc && docLoading && <div className={clsx(card, "p-10 text-center text-[#5B6788]")}>Yuklanmoqda...</div>}

            {doc && (
              <>
                <div className={clsx(card, "p-5")}>
                  <div className={"flex flex-col md:flex-row md:items-start gap-4"}>
                    <div className={"flex-1 min-w-0"}>
                      <p className={"text-[13px] font-semibold text-[#1D5BE8]"}>{doc.designation}</p>
                      <h2 className={"mt-1 text-[20px] font-extrabold leading-[1.3]"}>{doc.name_uz || doc.name_ru}</h2>
                      {doc.group && <p className={"mt-1 text-[13px] text-[#5B6788]"}>{doc.group.title_uz}</p>}
                    </div>
                    <div className={"flex flex-wrap gap-2 shrink-0"}>
                      <a href={`/shnq/${doc.id}`} target={"_blank"} rel={"noopener noreferrer"} className={"h-10 px-4 rounded-[12px] bg-[#EEF4FF] text-[#1D5BE8] text-[14px] font-medium flex items-center gap-2 hover:bg-[#DCE7FF]"}>
                        <EyeIcon className={"w-5 h-5"} /> Sahifani ochish
                      </a>
                      {doc.url && doc.url.includes("lex.uz") && (
                        <a href={doc.url} target={"_blank"} rel={"noopener noreferrer"} className={"h-10 px-4 rounded-[12px] border border-[#DCE3F0] text-[#1D5BE8] text-[14px] font-medium flex items-center gap-2 hover:bg-[#F5F8FF]"}>
                          <ExternalLinkIcon className={"w-4 h-4"} /> lex.uz
                        </a>
                      )}
                    </div>
                  </div>
                  {doc.url && doc.url.includes("lex.uz") && (
                    <div className={"mt-4 rounded-[12px] bg-[#F7F9FD] border border-[#EEF2FA] px-4 py-3 flex flex-col md:flex-row md:items-center gap-3"}>
                      <div className={"flex-1 min-w-0 text-[13px]"}>
                        <span className={"font-semibold"}>lex.uz: </span>
                        {doc.lex ? (
                          <>
                            <span className={"font-semibold text-[#1D5BE8]"}>{doc.lex.status_label}</span>
                            {doc.lex.message && <span className={"text-[#5B6788]"}> — {doc.lex.message}</span>}
                            {doc.lex.synced_at && (
                              <span className={"block text-[12px] text-[#8A95B0]"}>
                                Oxirgi tekshiruv: {formatDate(doc.lex.synced_at)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className={"text-[#5B6788]"}>hali avtomatik yuklanmagan</span>
                        )}
                      </div>
                      <button type={"button"} onClick={syncDocFromLex} className={"h-9 px-4 rounded-[10px] bg-[#1D5BE8] text-white text-[13px] font-semibold flex items-center gap-2 hover:bg-[#174FD0] shrink-0"}>
                        <RefreshUpIcon className={"w-4 h-4"} /> lex.uz dan yuklash
                      </button>
                    </div>
                  )}
                </div>

                <div className={clsx(card, "p-5")}>
                  <div className={"flex items-center gap-3 text-[16px] font-bold"}>
                    <HistoryIcon className={"w-6 h-6 text-[#1D5BE8]"} /> Tahrirlar
                    <span className={"px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[12px] font-medium text-[#1D5BE8]"}>{doc.editions.length}</span>
                  </div>
                  {doc.editions.length === 0 ? (
                    <p className={"mt-4 text-[14px] text-[#5B6788]"}>
                      Hali matn yuklanmagan. Saytda hozircha PDF ko&apos;rsatiladi.
                    </p>
                  ) : (
                    LANGS.filter((l) => editionsByLang[l.id]).map(({ id: lang }) => [lang, editionsByLang[lang]]).map(([lang, items]) => (
                      <div key={lang} className={"mt-4"}>
                        <p className={"mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#8A95B0]"}>
                          {langLabel(lang)}
                        </p>
                        <ul className={"space-y-2"}>
                          {items
                            .slice()
                            .reverse()
                            .map((e) => (
                              <EditionRow key={e.id} edition={e} docId={doc.id} client={client} onChanged={refreshAll} />
                            ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>

                <UploadForm doc={doc} client={client} onUploaded={refreshAll} />
              </>
            )}
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
};

// ===================================================================
const AdminPage = () => {
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setToken(localStorage.getItem(TOKEN_KEY));
    } catch (e) {
      setToken(null);
    }
    setReady(true);
  }, []);

  const login = (value) => {
    try {
      localStorage.setItem(TOKEN_KEY, value);
    } catch (e) {
      // localStorage yopiq bo'lsa ham sessiya davomida ishlaydi
    }
    setToken(value);
  };

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      // e'tiborsiz
    }
    setToken(null);
  }, []);

  return (
    <>
      <Head>
        <title>Admin panel — TMSITI</title>
        <meta name={"robots"} content={"noindex, nofollow"} />
      </Head>
      {!ready ? null : token ? <Dashboard token={token} onLogout={logout} /> : <LoginScreen onLogin={login} />}
    </>
  );
};

export default AdminPage;
