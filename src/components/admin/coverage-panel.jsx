import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { DownloadIcon, ExternalLinkIcon, SearchIcon, UploadIcon } from "@/components/icons/docs";
import { displayText, searchNorm } from "@/utils/translit";

// Admin panel -> Hujjatlar holati: har bir SHNQ saytda qanday ochiladi —
// matn (lex.uz ko'rinishi), faqat PDF, faqat lex.uz havola yoki hech narsa.
// Backend: GET /api/shnq-admin/coverage/?status=active|all

const card = "bg-white rounded-[18px] border border-[#EEF2FA] shadow-[0_8px_30px_rgba(16,42,116,0.06)]";

const KINDS = {
  text: { label: "Matn ko'rinishida", hint: "lex.uz kabi ochiladi", color: "#1E9E62", bg: "bg-[#E6F6EC] text-[#1E9E62]" },
  pdf: { label: "Faqat PDF", hint: "matni yuklanmagan", color: "#F0692A", bg: "bg-[#FFEEE4] text-[#C2501C]" },
  link: { label: "Faqat lex.uz havola", hint: "saytda matn ham, PDF ham yo'q", color: "#7C5CE0", bg: "bg-[#EEEAFD] text-[#6A4BD0]" },
  none: { label: "Hech narsa yo'q", hint: "hujjat ochilmaydi", color: "#E5484D", bg: "bg-[#FDECEC] text-[#C4282D]" },
};
const LANG_LABELS = { uz: "O'zbekcha (lotin)", kr: "Ўзбекча (кирилл)", ru: "Русский" };

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);

const toCsv = (rows) => {
  const head = ["Belgilanishi", "Nomi", "Guruh", "Holati", "PDF uz", "PDF ru", "Havola", "Xato"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [r.designation, r.name_uz || r.name_ru, r.group, KINDS[r.kind].label, r.pdf_uz ? "ha" : "", r.pdf_ru ? "ha" : "", r.url, r.error]
      .map(esc)
      .join(";")
  );
  return "﻿" + [head.map(esc).join(";"), ...lines].join("\r\n");
};

const CoveragePanel = ({ client, onOpenDoc }) => {
  const [scope, setScope] = useState("active");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pdf");
  const [subsystem, setSubsystem] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    client
      .get("shnq-admin/coverage/", { params: { status: scope } })
      .then(({ data: res }) => setData(res))
      .catch(() => toast.error("Ma'lumotni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [client, scope]);

  const items = useMemo(() => {
    if (!data) return [];
    const q = searchNorm(search);
    return data.items.filter(
      (r) =>
        (filter === "error" ? r.error : r.kind === filter) &&
        (!subsystem || String(r.subsystem) === subsystem) &&
        (!q || searchNorm(`${r.designation} ${r.name_uz || ""} ${r.name_ru || ""}`).includes(q))
    );
  }, [data, filter, subsystem, search]);

  if (!data) {
    return <div className={clsx(card, "p-10 text-center text-[14px] text-[#8A95B0]")}>{loading ? "Yuklanmoqda..." : "Ma'lumot yo'q"}</div>;
  }

  const s = data.summary;
  const tabs = [
    { id: "pdf", count: s.pdf },
    { id: "link", count: s.link },
    { id: "none", count: s.none },
    { id: "error", count: s.error, label: "O'qishda xato" },
  ];

  const exportCsv = () => {
    const blob = new Blob([toCsv(items)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `shnq-holati-${filter}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  };

  return (
    <div className={clsx("space-y-5 transition-opacity", loading && "opacity-60")}>
      {/* Qamrov */}
      <div className={"flex flex-wrap items-center gap-2"}>
        {[
          ["active", "Amaldagi hujjatlar"],
          ["all", "Hammasi (bekor qilinganlar bilan)"],
        ].map(([id, label]) => (
          <button
            key={id}
            type={"button"}
            onClick={() => setScope(id)}
            className={clsx(
              "h-9 px-4 rounded-[10px] text-[13px] font-semibold transition-colors",
              scope === id ? "bg-[#1D5BE8] text-white" : "bg-white border border-[#DCE3F0] text-[#5B6788] hover:bg-[#F1F4FA]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Asosiy raqamlar */}
      <div className={"grid grid-cols-2 lg:grid-cols-5 gap-3"}>
        <div className={clsx(card, "p-4")}>
          <p className={"text-[13px] text-[#5B6788]"}>Jami SHNQ</p>
          <p className={"mt-1 text-[28px] font-extrabold"}>{s.total}</p>
        </div>
        {Object.entries(KINDS).map(([id, k]) => (
          <button
            key={id}
            type={"button"}
            onClick={() => id !== "text" && setFilter(id)}
            className={clsx(card, "p-4 text-left", id !== "text" && "hover:border-[#BFD3FA] cursor-pointer", filter === id && "ring-2 ring-[#1D5BE8]/30")}
          >
            <p className={"text-[13px] text-[#5B6788]"}>{k.label}</p>
            <p className={"mt-1 text-[28px] font-extrabold"} style={{ color: k.color }}>
              {s[id]}
              <span className={"ml-1.5 text-[14px] font-semibold text-[#8A95B0]"}>{pct(s[id], s.total)}%</span>
            </p>
            <p className={"text-[12px] text-[#8A95B0]"}>{k.hint}</p>
          </button>
        ))}
      </div>

      {/* Umumiy chiziq */}
      <div className={clsx(card, "p-5")}>
        <div className={"flex h-4 rounded-full overflow-hidden bg-[#F1F4FA]"}>
          {Object.entries(KINDS).map(([id, k]) =>
            s[id] ? <div key={id} title={`${k.label}: ${s[id]}`} style={{ width: `${(s[id] / s.total) * 100}%`, background: k.color }} /> : null
          )}
        </div>
        <div className={"mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#5B6788]"}>
          {Object.entries(KINDS).map(([id, k]) => (
            <span key={id} className={"flex items-center gap-2"}>
              <span className={"w-3 h-3 rounded-sm"} style={{ background: k.color }} /> {k.label}: <b className={"text-[#0B1A4F]"}>{s[id]}</b>
            </span>
          ))}
          {s.error > 0 && <span className={"text-[#C4282D]"}>⚠ O&apos;qishda xato bo&apos;lgan tahrirlar: <b>{s.error}</b></span>}
        </div>
        <div className={"mt-4 pt-4 border-t border-[#EEF2FA] flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#5B6788]"}>
          <span className={"font-semibold text-[#0B1A4F]"}>Matni bor tillar:</span>
          {Object.entries(LANG_LABELS).map(([code, label]) => (
            <span key={code}>
              {label}: <b className={"text-[#0B1A4F]"}>{s.langs[code] || 0}</b>
            </span>
          ))}
        </div>
      </div>

      {/* Quyi tizimlar bo'yicha */}
      <div className={clsx(card, "overflow-x-auto")}>
        <table className={"w-full text-[13px]"}>
          <thead>
            <tr className={"text-left text-[#5B6788] border-b border-[#EEF2FA]"}>
              <th className={"px-4 py-3 font-semibold"}>Quyi tizim</th>
              <th className={"px-3 py-3 font-semibold text-right"}>Jami</th>
              {Object.entries(KINDS).map(([id, k]) => (
                <th key={id} className={"px-3 py-3 font-semibold text-right whitespace-nowrap"}>{k.label}</th>
              ))}
              <th className={"px-4 py-3 font-semibold w-[180px]"}>Matn ulushi</th>
            </tr>
          </thead>
          <tbody>
            {data.subsystems.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSubsystem(subsystem === String(row.id) ? "" : String(row.id))}
                className={clsx("border-b border-[#F4F6FB] cursor-pointer hover:bg-[#F8FAFE]", subsystem === String(row.id) && "bg-[#EEF4FF]")}
              >
                <td className={"px-4 py-2.5 text-[#0B1A4F]"}>{displayText(row.title, "uz")}</td>
                <td className={"px-3 py-2.5 text-right font-semibold"}>{row.total}</td>
                {Object.keys(KINDS).map((id) => (
                  <td key={id} className={"px-3 py-2.5 text-right"} style={{ color: row[id] ? KINDS[id].color : "#C0C8DA" }}>
                    {row[id]}
                  </td>
                ))}
                <td className={"px-4 py-2.5"}>
                  <div className={"flex items-center gap-2"}>
                    <div className={"flex-1 h-2 rounded-full bg-[#F1F4FA] overflow-hidden"}>
                      <div className={"h-full rounded-full bg-[#1E9E62]"} style={{ width: `${pct(row.text, row.total)}%` }} />
                    </div>
                    <span className={"w-9 text-right text-[12px] text-[#5B6788]"}>{pct(row.text, row.total)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Matni yo'q hujjatlar ro'yxati */}
      <div className={clsx(card, "p-4 md:p-5")}>
        <div className={"flex flex-wrap items-center gap-2"}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type={"button"}
              onClick={() => setFilter(t.id)}
              className={clsx(
                "h-9 px-3.5 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-colors",
                filter === t.id ? "bg-[#1D5BE8] text-white" : "text-[#5B6788] hover:bg-[#F1F4FA]"
              )}
            >
              {t.label || KINDS[t.id].label}
              <span className={clsx("min-w-[22px] h-5 px-1.5 rounded-full text-[11px] flex items-center justify-center", filter === t.id ? "bg-white/25" : "bg-[#F1F4FA]")}>
                {t.count}
              </span>
            </button>
          ))}
          <div className={"flex-1"} />
          {subsystem && (
            <button type={"button"} onClick={() => setSubsystem("")} className={"h-9 px-3 rounded-[10px] bg-[#EEF4FF] text-[12px] text-[#1D5BE8]"}>
              Quyi tizim filtri ×
            </button>
          )}
          <div className={"relative w-full sm:w-[240px]"}>
            <SearchIcon className={"w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95B0]"} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={"Shifr yoki nom..."}
              className={"w-full h-9 pl-9 pr-3 rounded-[10px] border border-[#DCE3F0] text-[13px] outline-none focus:border-[#1D5BE8]"}
            />
          </div>
          <button
            type={"button"}
            onClick={exportCsv}
            disabled={!items.length}
            className={"h-9 px-3.5 rounded-[10px] border border-[#DCE3F0] text-[13px] font-medium text-[#1D5BE8] hover:bg-[#EEF4FF] disabled:opacity-40 flex items-center gap-2"}
          >
            <DownloadIcon className={"w-4 h-4"} /> Excel (CSV)
          </button>
        </div>

        {items.length === 0 ? (
          <p className={"py-10 text-center text-[14px] text-[#8A95B0]"}>Bu ro&apos;yxatda hujjat yo&apos;q 🎉</p>
        ) : (
          <div className={"mt-4 divide-y divide-[#F1F4FA]"}>
            {items.map((r) => (
              <div key={r.id} className={"py-3 flex flex-col md:flex-row md:items-center gap-3"}>
                <div className={"md:w-[170px] shrink-0"}>
                  <p className={"text-[13px] font-bold text-[#0B1A4F]"}>{displayText(r.designation, "uz")}</p>
                  <span className={clsx("inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-semibold", KINDS[r.kind].bg)}>
                    {KINDS[r.kind].label}
                  </span>
                </div>
                <div className={"flex-1 min-w-0"}>
                  <p className={"text-[14px] text-[#1E2B5A]"}>{displayText(r.name_uz || r.name_ru || "—", "uz")}</p>
                  <p className={"text-[12px] text-[#8A95B0] truncate"}>
                    {r.group ? displayText(r.group, "uz") : ""}
                    {(r.pdf_uz || r.pdf_ru) && ` · PDF: ${[r.pdf_uz && "uz", r.pdf_ru && "ru"].filter(Boolean).join(", ")}`}
                    {!r.status && " · bekor qilingan"}
                  </p>
                  {r.error && <p className={"mt-1 text-[12px] text-[#C4282D]"}>⚠ {r.error}</p>}
                </div>
                <div className={"flex items-center gap-2 shrink-0"}>
                  <a
                    href={`/shnq/${r.id}`}
                    target={"_blank"}
                    rel={"noopener noreferrer"}
                    className={"h-9 px-3 rounded-[10px] border border-[#DCE3F0] text-[13px] text-[#5B6788] hover:bg-[#F1F4FA] flex items-center gap-1.5"}
                  >
                    <ExternalLinkIcon className={"w-4 h-4"} /> Saytda
                  </a>
                  <button
                    type={"button"}
                    onClick={() => onOpenDoc(r.id)}
                    className={"h-9 px-3 rounded-[10px] bg-[#1D5BE8] text-white text-[13px] font-semibold hover:bg-[#174FD0] flex items-center gap-1.5"}
                  >
                    <UploadIcon className={"w-4 h-4"} /> Matn yuklash
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoveragePanel;
