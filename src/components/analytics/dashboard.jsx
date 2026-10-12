// Admin -> "Statistika": sayt tashriflari dashboardi.
// Ma'lumot: GET /api/shnq-admin/analytics/?from=&to= (tmsiti backend, analytics.py).
// Grafiklar qo'lda yozilgan SVG; ranglar dataviz validatoridan o'tgan (ko'k/yashil/to'q sariq).
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { MAP_VIEWBOX, UZ_REGIONS } from "./uzbekistan-map";

const card = "bg-white rounded-[18px] border border-[#EEF2FA] shadow-[0_8px_30px_rgba(16,42,116,0.06)]";

const C = {
  ink: "#0B1A4F",
  ink2: "#5B6788",
  muted: "#8A95B0",
  grid: "#EEF2FA",
  blue: "#1D5BE8",
  green: "#1BAF7A",
  orange: "#EB6834",
};
// Ketma-ket (sequential) ko'k shkala — xarita va reyting uchun, ochdan to'qqa
const RAMP = ["#DCE8FD", "#B3CDFA", "#7FA9F3", "#4A82EA", "#1D5BE8", "#1442B0"];
const EMPTY_REGION = "#EEF2F8";

const DEVICE = { mobile: "Mobil telefon", desktop: "Kompyuter", tablet: "Planshet" };
const DEVICE_COLORS = { mobile: C.blue, desktop: C.green, tablet: C.orange };
const BROWSER = {
  chrome: ["Chrome", "#1D5BE8"], safari: ["Safari", "#0EA5E9"], yandex: ["Yandex", "#E5484D"],
  firefox: ["Firefox", "#EB6834"], edge: ["Edge", "#1BAF7A"], opera: ["Opera", "#C0262D"],
  samsung: ["Samsung Internet", "#7C5CE0"], other: ["Boshqalar", "#8A95B0"],
};
const SOURCE = {
  direct: "To'g'ridan-to'g'ri", google: "Google", yandex: "Yandex", telegram: "Telegram",
  instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", bing: "Bing", referral: "Boshqa saytlar",
};
const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString("ru-RU"));
const pct = (part, total) => (total ? (part / total) * 100 : 0);
const pctText = (v) => `${v.toFixed(1).replace(".0", "")}%`;
const isoDay = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD, mahalliy vaqt
const shiftDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoDay(d);
};
const dayLabel = (iso) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
};
const dateText = (iso) => iso.split("-").reverse().join(".");
const duration = (sec) => {
  if (!sec) return "0 s";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m} daq ${s} s` : `${s} s`;
};

const useWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
};

const niceMax = (v) => {
  if (v <= 0) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].find((s) => (s * pow * 4) >= v) * pow;
  return step * 4;
};

// ---------------------------------------------------------------------
//   Kichik qismlar
// ---------------------------------------------------------------------
const Icon = ({ d, className }) => (
  <svg className={className} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={1.9} strokeLinecap={"round"} strokeLinejoin={"round"}>
    {d.map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const ICONS = {
  users: ["M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20", "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M22 20v-1.5a4 4 0 0 0-3-3.9", "M16 4.1a3.5 3.5 0 0 1 0 6.8"],
  user: ["M20 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-7A4.5 4.5 0 0 0 4 19.5V21", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"],
  eye: ["M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3 2"],
  map: ["M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z", "M9 4v14M15 6v14"],
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m21 21-4.3-4.3"],
  monitor: ["M3 4h18v12H3z", "M8 20h8M12 16v4"],
  share: ["M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"],
  file: ["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z", "M14 3v5h5M9 13h6M9 17h6"],
  pie: ["M21 12A9 9 0 1 1 12 3v9h9Z", "M15 3.3A9 9 0 0 1 20.7 9H15V3.3Z"],
  calendar: ["M4 6h16v14H4z", "M4 10h16M8 3v4M16 3v4"],
  download: ["M12 4v11M7 10l5 5 5-5", "M5 20h14"],
  refresh: ["M20 11a8 8 0 1 0-2.3 5.7", "M20 4v7h-7"],
};

const CardTitle = ({ icon, children, sub, right }) => (
  <div className={"flex flex-wrap items-start gap-3"}>
    <div className={"flex-1 min-w-0"}>
      <div className={"flex items-center gap-2.5 text-[16px] font-bold text-[#0B1A4F]"}>
        <Icon d={ICONS[icon]} className={"w-5 h-5 text-[#1D5BE8]"} />
        {children}
      </div>
      {sub && <p className={"mt-0.5 text-[12.5px] text-[#8A95B0]"}>{sub}</p>}
    </div>
    {right}
  </div>
);

const Segmented = ({ options, value, onChange }) => (
  <div className={"inline-flex rounded-[10px] bg-[#F1F4FA] p-0.5"}>
    {options.map(([id, label]) => (
      <button
        key={id}
        type={"button"}
        onClick={() => onChange(id)}
        className={clsx(
          "h-8 px-3 rounded-[8px] text-[12.5px] font-semibold transition-colors",
          value === id ? "bg-[#1D5BE8] text-white shadow-sm" : "text-[#5B6788] hover:text-[#0B1A4F]"
        )}
      >
        {label}
      </button>
    ))}
  </div>
);

const Change = ({ value }) => {
  if (value == null) return <span className={"text-[12.5px] text-[#8A95B0]"}>oldingi davr yo&apos;q</span>;
  const up = value >= 0;
  return (
    <span
      className={clsx("inline-flex items-center gap-1 text-[12.5px] font-semibold", up ? "text-[#1E9E62]" : "text-[#E5484D]")}
      title={"Oldingi teng davrga nisbatan"}
    >
      <svg viewBox={"0 0 12 12"} className={clsx("w-3 h-3", !up && "rotate-180")} fill={"currentColor"}>
        <path d={"M6 1.5 10.5 7H7.3v3.5H4.7V7H1.5L6 1.5Z"} />
      </svg>
      {up ? "+" : ""}
      {value}%
    </span>
  );
};

const Sparkline = ({ values, color, id }) => {
  const w = 100;
  const h = 44;
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [values.length === 1 ? w : (i / (values.length - 1)) * w, h - 3 - (v / max) * (h - 8)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={"w-[100px] h-[44px] shrink-0"} aria-hidden={"true"}>
      <defs>
        <linearGradient id={`sp-${id}`} x1={"0"} y1={"0"} x2={"0"} y2={"1"}>
          <stop offset={"0%"} stopColor={color} stopOpacity={0.28} />
          <stop offset={"100%"} stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${line}L${w},${h}L0,${h}Z`} fill={`url(#sp-${id})`} />
      <path d={line} fill={"none"} stroke={color} strokeWidth={2} strokeLinejoin={"round"} strokeLinecap={"round"} />
    </svg>
  );
};

const Tooltip = ({ x, y, children, containerWidth }) => (
  <div
    className={"pointer-events-none absolute z-20 rounded-[12px] bg-white px-3 py-2 text-[12.5px] shadow-[0_12px_32px_rgba(16,42,116,0.18)] border border-[#EEF2FA] whitespace-nowrap"}
    style={{
      left: x,
      top: y,
      transform: `translate(${containerWidth && x > containerWidth - 180 ? "calc(-100% - 12px)" : "12px"}, -50%)`,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------
//   KPI kartasi
// ---------------------------------------------------------------------
const KpiCard = ({ id, label, icon, iconCls, color, kpi, series, format = fmt }) => (
  <div className={clsx(card, "p-4 flex items-end gap-3")}>
    <div className={"flex-1 min-w-0"}>
      <div className={"flex items-center gap-3"}>
        <span className={clsx("w-12 h-12 shrink-0 rounded-full flex items-center justify-center", iconCls)}>
          <Icon d={ICONS[icon]} className={"w-6 h-6"} />
        </span>
        <div className={"min-w-0"}>
          <p className={"text-[13px] leading-tight text-[#5B6788]"}>{label}</p>
          <p className={"text-[24px] font-extrabold leading-tight text-[#0B1A4F] whitespace-nowrap"}>{kpi ? format(kpi.value) : "—"}</p>
        </div>
      </div>
      <div className={"mt-2 pl-[60px]"}>{kpi && <Change value={kpi.change} />}</div>
    </div>
    <Sparkline values={series} color={color} id={id} />
  </div>
);

// ---------------------------------------------------------------------
//   Xarita
// ---------------------------------------------------------------------
const RegionsCard = ({ report }) => {
  const [metric, setMetric] = useState("visits");
  const [hover, setHover] = useState(null);
  const [wrapRef, wrapWidth] = useWidth();

  const byCode = useMemo(() => Object.fromEntries((report.regions || []).map((r) => [r.code, r])), [report]);
  const rows = useMemo(
    () =>
      UZ_REGIONS.map((r) => ({ code: r.id, name: r.name, value: byCode[r.id]?.[metric] || 0 })).sort(
        (a, b) => b.value - a.value || a.name.localeCompare(b.name)
      ),
    [byCode, metric]
  );
  const total = rows.reduce((s, r) => s + r.value, 0);
  const max = Math.max(...rows.map((r) => r.value), 1);
  // Kvadrat ildiz shkalasi: Toshkent shahri kabi katta qiymat qolgan viloyatlarni bir xil och rangga "bosib" ketmasin
  const colorOf = (v) =>
    v ? RAMP[Math.min(RAMP.length - 1, Math.floor(Math.sqrt(v / max) * (RAMP.length - 0.001)))] : EMPTY_REGION;
  const other = report.region_other || {};

  return (
    <div className={clsx(card, "p-5")}>
      <CardTitle
        icon={"map"}
        sub={"O'zbekiston bo'yicha foydalanuvchilar geografiyasi"}
        right={<Segmented value={metric} onChange={setMetric} options={[["visits", "Tashriflar soni"], ["users", "Foydalanuvchilar"]]} />}
      >
        Hududlar bo&apos;yicha tashriflar
      </CardTitle>

      <div className={"mt-4 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-center"}>
        <div ref={wrapRef} className={"relative"} onMouseLeave={() => setHover(null)}>
          <svg viewBox={MAP_VIEWBOX} className={"w-full h-auto"} role={"img"} aria-label={"O'zbekiston viloyatlari bo'yicha tashriflar xaritasi"}>
            {UZ_REGIONS.map((r) => {
              const value = byCode[r.id]?.[metric] || 0;
              const active = hover?.code === r.id;
              return (
                <path
                  key={r.id}
                  d={r.d}
                  fill={colorOf(value)}
                  stroke={active ? C.ink : "#FFFFFF"}
                  strokeWidth={active ? 2.5 : 1.5}
                  strokeLinejoin={"round"}
                  className={"cursor-pointer transition-[fill] duration-300"}
                  onMouseMove={(e) => {
                    const box = wrapRef.current.getBoundingClientRect();
                    setHover({ code: r.id, name: r.name, value, x: e.clientX - box.left, y: e.clientY - box.top });
                  }}
                />
              );
            })}
            {hover && (
              <path d={UZ_REGIONS.find((r) => r.id === hover.code).d} fill={"none"} stroke={C.ink} strokeWidth={2.5} pointerEvents={"none"} />
            )}
          </svg>
          {hover && hover.x >= 0 && (
            <Tooltip x={hover.x} y={hover.y} containerWidth={wrapWidth}>
              <p className={"font-semibold text-[#0B1A4F]"}>{hover.name}</p>
              <p className={"mt-0.5 text-[#5B6788]"}>
                <b className={"text-[#0B1A4F]"}>{fmt(hover.value)}</b> {metric === "visits" ? "tashrif" : "foydalanuvchi"} ·{" "}
                {pctText(pct(hover.value, total))}
              </p>
            </Tooltip>
          )}
          <div className={"mt-2 flex items-center gap-2 text-[11.5px] text-[#8A95B0]"}>
            kam
            <span className={"flex h-2 w-28 overflow-hidden rounded-full"}>
              {RAMP.map((c) => <span key={c} className={"flex-1"} style={{ background: c }} />)}
            </span>
            ko&apos;p
          </div>
        </div>

        <ol className={"space-y-1.5"}>
          {rows.map((r, i) => (
            <li
              key={r.code}
              onMouseEnter={() => setHover({ code: r.code, name: r.name, value: r.value, x: -9999, y: 0 })}
              onMouseLeave={() => setHover(null)}
              className={clsx("grid grid-cols-[22px_minmax(0,1fr)_minmax(60px,110px)_52px_44px] items-center gap-2 rounded-[8px] px-1.5 py-[3px] text-[12.5px]", hover?.code === r.code && "bg-[#F1F5FE]")}
            >
              <span className={"text-[#8A95B0]"}>{i + 1}</span>
              <span className={"truncate text-[#1E2B5A]"}>{r.name}</span>
              <span className={"h-[7px] rounded-full bg-[#EEF2FA] overflow-hidden"}>
                <span className={"block h-full rounded-full bg-[#1D5BE8]"} style={{ width: `${(r.value / max) * 100}%` }} />
              </span>
              <span className={"text-right font-semibold text-[#0B1A4F]"}>{fmt(r.value)}</span>
              <span className={"text-right text-[#8A95B0]"}>{pctText(pct(r.value, total))}</span>
            </li>
          ))}
        </ol>
      </div>
      {(other.foreign > 0 || other.unknown > 0) && (
        <p className={"mt-3 text-[12px] text-[#8A95B0]"}>
          Xaritaga kirmagan tashriflar: xorijdan — <b className={"text-[#5B6788]"}>{fmt(other.foreign)}</b>, hududi
          aniqlanmagan — <b className={"text-[#5B6788]"}>{fmt(other.unknown)}</b>
        </p>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------
//   Dinamika (chiziqli grafik)
// ---------------------------------------------------------------------
const TrendCard = ({ report }) => {
  const [wrapRef, width] = useWidth();
  const [hover, setHover] = useState(null);
  const data = report.daily || [];
  const height = 250;
  const pad = { l: 38, r: 10, t: 12, b: 26 };
  const w = Math.max(width, 200);
  const innerW = w - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const max = niceMax(Math.max(...data.map((d) => Math.max(d.visits, d.users)), 0));
  const x = (i) => pad.l + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v) => pad.t + innerH - (v / max) * innerH;
  const series = [
    { key: "visits", label: "Tashriflar", color: C.blue },
    { key: "users", label: "Foydalanuvchilar", color: C.green },
  ];
  const ticks = [0, 1, 2, 3, 4].map((k) => (max / 4) * k);
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));
  const short = (v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 ? 1 : 0)}K` : String(v));

  const onMove = (e) => {
    if (!data.length) return;
    const box = wrapRef.current.getBoundingClientRect();
    const px = e.clientX - box.left;
    const i = Math.round(((px - pad.l) / innerW) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <div className={clsx(card, "p-5")}>
      <CardTitle
        icon={"search"}
        right={
          <div className={"flex items-center gap-4 text-[12.5px] text-[#5B6788]"}>
            {series.map((s) => (
              <span key={s.key} className={"flex items-center gap-1.5"}>
                <span className={"w-2.5 h-2.5 rounded-full"} style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        }
      >
        So&apos;nggi {report.range?.days} kunlik dinamika
      </CardTitle>
      <div ref={wrapRef} className={"relative mt-3"} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {width > 0 && (
          <svg width={w} height={height} role={"img"} aria-label={"Kunlik tashriflar va foydalanuvchilar grafigi"}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`tr-${s.key}`} x1={"0"} y1={"0"} x2={"0"} y2={"1"}>
                  <stop offset={"0%"} stopColor={s.color} stopOpacity={0.16} />
                  <stop offset={"100%"} stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke={C.grid} />
                <text x={pad.l - 8} y={y(t) + 4} textAnchor={"end"} fontSize={11} fill={C.muted}>
                  {short(t)}
                </text>
              </g>
            ))}
            {data.map((d, i) =>
              i % labelEvery === 0 || i === data.length - 1 ? (
                <text key={d.date} x={x(i)} y={height - 6} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize={11} fill={C.muted}>
                  {dayLabel(d.date)}
                </text>
              ) : null
            )}
            {series.map((s) => {
              const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[s.key]).toFixed(1)}`).join("");
              return (
                <g key={s.key}>
                  {data.length > 1 && <path d={`${line}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill={`url(#tr-${s.key})`} />}
                  <path d={line} fill={"none"} stroke={s.color} strokeWidth={2} strokeLinejoin={"round"} strokeLinecap={"round"} />
                </g>
              );
            })}
            {hover != null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + innerH} stroke={C.muted} strokeDasharray={"3 3"} />
                {series.map((s) => (
                  <circle key={s.key} cx={x(hover)} cy={y(data[hover][s.key])} r={4.5} fill={s.color} stroke={"#fff"} strokeWidth={2} />
                ))}
              </g>
            )}
          </svg>
        )}
        {hover != null && data[hover] && (
          <Tooltip x={x(hover)} y={pad.t + innerH / 2} containerWidth={w}>
            <p className={"font-semibold text-[#0B1A4F]"}>{dateText(data[hover].date)}</p>
            {series.map((s) => (
              <p key={s.key} className={"mt-0.5 flex items-center gap-1.5 text-[#5B6788]"}>
                <span className={"w-2 h-2 rounded-full"} style={{ background: s.color }} />
                {s.label}: <b className={"text-[#0B1A4F]"}>{fmt(data[hover][s.key])}</b>
              </p>
            ))}
            <p className={"mt-0.5 text-[#8A95B0]"}>Ko&apos;rishlar: {fmt(data[hover].pageviews)}</p>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------
//   Qurilmalar (donut)
// ---------------------------------------------------------------------
const DevicesCard = ({ report }) => {
  const [mode, setMode] = useState("count");
  const [hover, setHover] = useState(null);
  const rows = ["mobile", "desktop", "tablet"].map((key) => ({
    key,
    label: DEVICE[key],
    color: DEVICE_COLORS[key],
    value: (report.devices || []).find((d) => d.key === key)?.visits || 0,
  }));
  const total = rows.reduce((s, r) => s + r.value, 0);
  const r = 62;
  const circ = 2 * Math.PI * r;
  const gap = total ? 3 : 0;
  let offset = 0;
  const active = rows.find((x) => x.key === hover);

  return (
    <div className={clsx(card, "p-5")}>
      <CardTitle icon={"monitor"} right={<Segmented value={mode} onChange={setMode} options={[["count", "Son"], ["percent", "Foiz"]]} />}>
        Qurilmalar bo&apos;yicha
      </CardTitle>
      <div className={"mt-4 flex flex-col sm:flex-row items-center gap-6"}>
        <div className={"relative w-[170px] h-[170px] shrink-0"}>
          <svg viewBox={"0 0 170 170"} className={"w-full h-full -rotate-90"} role={"img"} aria-label={"Qurilmalar ulushi"}>
            <circle cx={85} cy={85} r={r} fill={"none"} stroke={C.grid} strokeWidth={22} />
            {total > 0 &&
              rows.map((row) => {
                const len = (row.value / total) * circ;
                const seg = (
                  <circle
                    key={row.key}
                    cx={85}
                    cy={85}
                    r={r}
                    fill={"none"}
                    stroke={row.color}
                    strokeWidth={hover === row.key ? 26 : 22}
                    strokeDasharray={`${Math.max(len - gap, 0)} ${circ}`}
                    strokeDashoffset={-offset}
                    className={"cursor-pointer transition-[stroke-width] duration-200"}
                    onMouseEnter={() => setHover(row.key)}
                    onMouseLeave={() => setHover(null)}
                  />
                );
                offset += len;
                return row.value ? seg : null;
              })}
          </svg>
          <div className={"absolute inset-0 flex flex-col items-center justify-center pointer-events-none"}>
            <span className={"text-[22px] font-extrabold text-[#0B1A4F]"}>
              {active ? (mode === "count" ? fmt(active.value) : pctText(pct(active.value, total))) : fmt(total)}
            </span>
            <span className={"text-[12px] text-[#8A95B0]"}>{active ? active.label : "Tashriflar"}</span>
          </div>
        </div>
        <ul className={"flex-1 w-full space-y-3"}>
          {rows.map((row) => (
            <li
              key={row.key}
              onMouseEnter={() => setHover(row.key)}
              onMouseLeave={() => setHover(null)}
              className={clsx("flex items-center gap-2.5 rounded-[8px] px-2 py-1 text-[13.5px]", hover === row.key && "bg-[#F1F5FE]")}
            >
              <span className={"w-2.5 h-2.5 rounded-full shrink-0"} style={{ background: row.color }} />
              <span className={"flex-1 text-[#1E2B5A]"}>{row.label}</span>
              <span className={clsx("w-[58px] text-right", mode === "percent" ? "font-semibold text-[#0B1A4F]" : "text-[#8A95B0]")}>
                {pctText(pct(row.value, total))}
              </span>
              <span className={clsx("w-[64px] text-right", mode === "count" ? "font-semibold text-[#0B1A4F]" : "text-[#8A95B0]")}>
                {fmt(row.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------
//   Manbalar, sahifalar, brauzerlar
// ---------------------------------------------------------------------
const SourcesCard = ({ report }) => {
  const rows = (report.sources || []).map((s) => ({ ...s, label: SOURCE[s.key] || s.key }));
  const total = rows.reduce((s, r) => s + r.visits, 0);
  const max = Math.max(...rows.map((r) => r.visits), 1);
  return (
    <div className={clsx(card, "p-5")}>
      <CardTitle icon={"share"}>Manbalar (Traffic Source)</CardTitle>
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <ol className={"mt-4 space-y-3"}>
          {rows.map((r, i) => (
            <li key={r.key} className={"grid grid-cols-[20px_minmax(0,140px)_minmax(0,1fr)_48px_56px] items-center gap-2 text-[13px]"} title={`${r.label}: ${fmt(r.visits)} tashrif`}>
              <span className={"text-[#8A95B0]"}>{i + 1}</span>
              <span className={"truncate text-[#1E2B5A]"}>{r.label}</span>
              <span className={"h-2 rounded-full bg-[#EEF2FA] overflow-hidden"}>
                <span className={"block h-full rounded-full bg-[#1D5BE8]"} style={{ width: `${(r.visits / max) * 100}%` }} />
              </span>
              <span className={"text-right text-[#8A95B0]"}>{pctText(pct(r.visits, total))}</span>
              <span className={"text-right font-semibold text-[#0B1A4F]"}>{fmt(r.visits)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const PagesCard = ({ report }) => {
  const rows = report.pages || [];
  return (
    <div className={clsx(card, "p-5")}>
      <CardTitle icon={"file"}>Mashhur sahifalar</CardTitle>
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <table className={"mt-4 w-full text-[13px]"}>
          <thead>
            <tr className={"bg-[#F7F9FD] text-[#5B6788]"}>
              <th className={"py-2 pl-3 w-8 text-left font-medium rounded-l-[8px]"}>#</th>
              <th className={"py-2 text-left font-medium"}>Sahifa</th>
              <th className={"py-2 pr-3 text-right font-medium rounded-r-[8px]"}>Ko&apos;rishlar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.path} className={"border-b border-[#F1F4FA] last:border-0"}>
                <td className={"py-2 pl-3 text-[#8A95B0]"}>{i + 1}</td>
                <td className={"py-2 pr-2 max-w-0"}>
                  <a href={r.path} target={"_blank"} rel={"noopener noreferrer"} className={"block truncate font-medium text-[#0B1A4F] hover:text-[#1D5BE8]"}>
                    {r.path}
                  </a>
                  {r.title && <span className={"block truncate text-[11.5px] text-[#8A95B0]"}>{r.title}</span>}
                </td>
                <td className={"py-2 pr-3 text-right font-semibold text-[#0B1A4F]"}>{fmt(r.views)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const BrowsersCard = ({ report }) => {
  const rows = report.browsers || [];
  const total = rows.reduce((s, r) => s + r.visits, 0);
  return (
    <div className={clsx(card, "p-5")}>
      <CardTitle icon={"pie"}>Brauzerlar bo&apos;yicha</CardTitle>
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <table className={"mt-4 w-full text-[13px]"}>
          <thead>
            <tr className={"bg-[#F7F9FD] text-[#5B6788]"}>
              <th className={"py-2 pl-3 w-8 text-left font-medium rounded-l-[8px]"}>#</th>
              <th className={"py-2 text-left font-medium"}>Brauzer</th>
              <th className={"py-2 text-right font-medium"}>Foiz</th>
              <th className={"py-2 pr-3 text-right font-medium rounded-r-[8px]"}>Tashriflar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const [name, color] = BROWSER[r.key] || BROWSER.other;
              return (
                <tr key={r.key} className={"border-b border-[#F1F4FA] last:border-0"}>
                  <td className={"py-2 pl-3 text-[#8A95B0]"}>{i + 1}</td>
                  <td className={"py-2"}>
                    <span className={"flex items-center gap-2 font-medium text-[#0B1A4F]"}>
                      <span className={"w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"} style={{ background: color }}>
                        {name[0]}
                      </span>
                      {name}
                    </span>
                  </td>
                  <td className={"py-2 text-right text-[#5B6788]"}>{pctText(pct(r.visits, total))}</td>
                  <td className={"py-2 pr-3 text-right font-semibold text-[#0B1A4F]"}>{fmt(r.visits)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

const Empty = () => <p className={"mt-6 py-6 text-center text-[13px] text-[#8A95B0]"}>Bu davrda ma&apos;lumot yo&apos;q</p>;

// ---------------------------------------------------------------------
//   CSV eksport
// ---------------------------------------------------------------------
const exportCsv = (report) => {
  const lines = [];
  const add = (...cells) => lines.push(cells.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","));
  add("Sayt statistikasi", `${report.range.from} — ${report.range.to}`);
  add();
  add("Ko'rsatkich", "Qiymat", "O'zgarish, %");
  [["visits", "Jami kirishlar"], ["users", "Noyob foydalanuvchilar"], ["pageviews", "Sahifa ko'rishlar"], ["avg_duration", "O'rtacha vaqt (soniya)"]].forEach(([k, l]) =>
    add(l, report.kpis[k].value, report.kpis[k].change ?? "")
  );
  add();
  add("Sana", "Tashriflar", "Foydalanuvchilar", "Ko'rishlar");
  report.daily.forEach((d) => add(d.date, d.visits, d.users, d.pageviews));
  add();
  add("Hudud", "Tashriflar", "Foydalanuvchilar");
  report.regions.forEach((r) => add(r.name, r.visits, r.users));
  add("Xorij", report.region_other.foreign);
  add("Aniqlanmagan", report.region_other.unknown);
  add();
  add("Manba", "Tashriflar");
  report.sources.forEach((s) => add(SOURCE[s.key] || s.key, s.visits));
  add();
  add("Qurilma", "Tashriflar");
  report.devices.forEach((s) => add(DEVICE[s.key] || s.key, s.visits));
  add();
  add("Brauzer", "Tashriflar");
  report.browsers.forEach((s) => add((BROWSER[s.key] || BROWSER.other)[0], s.visits));
  add();
  add("Sahifa", "Sarlavha", "Ko'rishlar");
  report.pages.forEach((p) => add(p.path, p.title, p.views));

  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `tmsiti-statistika_${report.range.from}_${report.range.to}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
};

// ---------------------------------------------------------------------
//   Dashboard
// ---------------------------------------------------------------------
const PRESETS = [
  ["today", "Bugun", 0],
  ["7", "7 kun", 6],
  ["30", "30 kun", 29],
  ["90", "90 kun", 89],
];

const AnalyticsDashboard = ({ client }) => {
  const [range, setRange] = useState(() => ({ from: shiftDays(-29), to: shiftDays(0), preset: "30" }));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    client
      .get("shnq-admin/analytics/", { params: { from: range.from, to: range.to } })
      .then(({ data }) => setReport(data))
      .catch((err) => setError(err?.response?.data?.detail || "Statistikani yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [client, range.from, range.to]);

  useEffect(() => {
    load();
  }, [load]);

  const choosePreset = (id, back) => setRange({ from: shiftDays(-back), to: shiftDays(0), preset: id });
  const setDate = (key, value) => value && setRange((r) => ({ ...r, [key]: value, preset: null }));

  const daily = report?.daily || [];
  const kpis = report?.kpis;

  return (
    <div className={clsx("space-y-5 transition-opacity", loading && report && "opacity-60")}>
      {/* Sarlavha va davr */}
      <div className={"flex flex-col xl:flex-row xl:items-end gap-4"}>
        <div className={"flex-1"}>
          <h2 className={"text-[26px] font-extrabold tracking-[-0.01em] text-[#0B1A4F]"}>Sayt statistikasi</h2>
          <p className={"text-[13.5px] text-[#5B6788]"}>TMSITI.uz veb-saytiga doir to&apos;liq statistik ma&apos;lumotlar</p>
        </div>
        <div className={"flex flex-wrap items-center gap-2"}>
          <div className={"h-10 flex items-center gap-2 rounded-[12px] border border-[#DCE3F0] bg-white px-3 text-[13px]"}>
            <input type={"date"} value={range.from} max={range.to} onChange={(e) => setDate("from", e.target.value)} className={"outline-none bg-transparent"} />
            <span className={"text-[#8A95B0]"}>→</span>
            <input type={"date"} value={range.to} min={range.from} max={shiftDays(0)} onChange={(e) => setDate("to", e.target.value)} className={"outline-none bg-transparent"} />
          </div>
          <div className={"inline-flex rounded-[12px] bg-white border border-[#EEF2FA] p-1"}>
            {PRESETS.map(([id, label, back]) => (
              <button
                key={id}
                type={"button"}
                onClick={() => choosePreset(id, back)}
                className={clsx(
                  "h-8 px-3.5 rounded-[9px] text-[13px] font-semibold transition-colors",
                  range.preset === id ? "bg-[#1D5BE8] text-white" : "text-[#5B6788] hover:bg-[#F1F4FA]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button type={"button"} onClick={load} title={"Yangilash"} className={"w-10 h-10 rounded-[12px] border border-[#DCE3F0] bg-white flex items-center justify-center text-[#5B6788] hover:text-[#1D5BE8]"}>
            <Icon d={ICONS.refresh} className={clsx("w-[18px] h-[18px]", loading && "animate-spin")} />
          </button>
          <button
            type={"button"}
            disabled={!report}
            onClick={() => {
              exportCsv(report);
              toast.success("CSV fayl yuklandi");
            }}
            title={"CSV (Excel) ga yuklab olish"}
            className={"w-10 h-10 rounded-[12px] border border-[#DCE3F0] bg-white flex items-center justify-center text-[#5B6788] hover:text-[#1D5BE8] disabled:opacity-50"}
          >
            <Icon d={ICONS.download} className={"w-[18px] h-[18px]"} />
          </button>
        </div>
      </div>

      {error && <div className={clsx(card, "p-4 text-[14px] text-[#E5484D]")}>{error}</div>}

      {report && !report.geoip && (
        <div className={"rounded-[14px] border border-[#F5DC8A] bg-[#FFF6DB] px-4 py-3 text-[13px] text-[#7A5A00]"}>
          IP → viloyat bazasi serverda o&apos;rnatilmagan, shuning uchun hududlar aniqlanmayapti. Serverda bir marta
          bajaring: <code className={"font-mono"}>python manage.py geoip_update</code>
        </div>
      )}

      {/* KPI */}
      <div className={"grid gap-4 sm:grid-cols-2 xl:grid-cols-4"}>
        <KpiCard id={"v"} label={"Jami kirishlar"} icon={"users"} iconCls={"bg-[#E8F0FE] text-[#1D5BE8]"} color={C.blue} kpi={kpis?.visits} series={daily.map((d) => d.visits)} />
        <KpiCard id={"u"} label={"Noyob foydalanuvchilar"} icon={"user"} iconCls={"bg-[#E4F6EC] text-[#1E9E62]"} color={C.green} kpi={kpis?.users} series={daily.map((d) => d.users)} />
        <KpiCard id={"p"} label={"Sahifa ko'rishlar"} icon={"eye"} iconCls={"bg-[#EEEAFD] text-[#7C5CE0]"} color={"#7C5CE0"} kpi={kpis?.pageviews} series={daily.map((d) => d.pageviews)} />
        <KpiCard id={"t"} label={"O'rtacha vaqt"} icon={"clock"} iconCls={"bg-[#FFEEE4] text-[#F0692A]"} color={C.orange} kpi={kpis?.avg_duration} series={daily.map((d) => d.avg_duration)} format={duration} />
      </div>

      {!report && loading && <div className={clsx(card, "p-12 text-center text-[#5B6788]")}>Yuklanmoqda...</div>}

      {report && (
        <>
          <div className={"grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] items-start"}>
            <RegionsCard report={report} />
            <div className={"space-y-5 min-w-0"}>
              <TrendCard report={report} />
              <DevicesCard report={report} />
            </div>
          </div>
          <div className={"grid gap-5 lg:grid-cols-2 xl:grid-cols-3 items-start"}>
            <SourcesCard report={report} />
            <PagesCard report={report} />
            <BrowsersCard report={report} />
          </div>
          <p className={"text-[12px] text-[#8A95B0]"}>
            Davr: {dateText(report.range.from)} — {dateText(report.range.to)}. O&apos;zgarish foizi oldingi teng davrga
            ({dateText(report.range.prev_from)} — {dateText(report.range.prev_to)}) nisbatan. «Tashrif» — 30 daqiqadan
            ortiq tanaffussiz ko&apos;rilgan sahifalar ketma-ketligi.
          </p>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
