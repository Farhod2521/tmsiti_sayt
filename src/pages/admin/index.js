import React, { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
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
  const [busy, setBusy] = useState(false);
  const s = edition.stats || {};

  const save = async () => {
    setBusy(true);
    try {
      await client.patch(`shnq-admin/editions/${edition.id}/`, { edition_date: date, note });
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
        <div className={"grid gap-3 md:grid-cols-[170px_1fr_auto] items-center"}>
          <input type={"date"} value={date} onChange={(e) => setDate(e.target.value)} className={input} />
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
              <span className={"px-2 py-0.5 rounded-md bg-[#F1F4FA] text-[11px] font-semibold uppercase text-[#5B6788]"}>{edition.lang}</span>
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
  const [lang, setLang] = useState("uz");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const isFirst = !(doc.editions || []).some((e) => e.lang === lang);

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
        s.original
          ? `Yuklandi: ${s.blocks} ta band, ${s.headings} ta bo'lim`
          : `Yangi tahrir: ${s.changed || 0} o'zgargan, ${s.added || 0} qo'shilgan, ${s.removed || 0} chiqarilgan`,
        { duration: 5000 }
      );
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

      <div className={"mt-4 grid gap-3 sm:grid-cols-2"}>
        <div>
          <label className={"text-[13px] font-semibold text-[#0B1A4F]"}>Til</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className={clsx(input, "mt-1.5 cursor-pointer")}>
            <option value={"uz"}>O&apos;zbekcha</option>
            <option value={"ru"}>Русский</option>
          </select>
        </div>
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
  const [selectedId, setSelectedId] = useState(null);
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
                        <span className={"px-1.5 py-0.5 rounded bg-[#E6F6EC] text-[11px] font-medium text-[#1E9E62]"}>{item.editions_count} tahrir</span>
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
                    Object.entries(editionsByLang).map(([lang, items]) => (
                      <div key={lang} className={"mt-4"}>
                        <p className={"mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#8A95B0]"}>
                          {lang === "ru" ? "Русский" : "O'zbekcha"}
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
