const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
};

export const FileTextIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h6M9 9h2" />
  </svg>
);

export const FileSearchIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
    <path d="M14 3v5h5v3" />
    <path d="M8.5 9h3M8.5 12.5h4" />
    <circle cx="16.5" cy="16.5" r="2.8" />
    <path d="m18.6 18.6 2.1 2.1" />
  </svg>
);

export const LayersIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" />
    <path d="m3 12 9 4.5 9-4.5" />
    <path d="m3 16.5 9 4.5 9-4.5" />
  </svg>
);

export const UsersIcon = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20v-.5A5.5 5.5 0 0 1 8 14h2a5.5 5.5 0 0 1 5.5 5.5v.5" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
    <path d="M18 14.2a5.5 5.5 0 0 1 3.5 5.3v.5" />
  </svg>
);

export const DownloadIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);

export const EyeIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const StarIcon = ({ className, filled }) => (
  <svg className={className} {...base} fill={filled ? "currentColor" : "none"}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z" />
  </svg>
);

export const MoreVerticalIcon = ({ className }) => (
  <svg className={className} {...base} strokeWidth={2.6}>
    <path d="M12 5h.01M12 12h.01M12 19h.01" />
  </svg>
);

export const FilterIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4Z" />
  </svg>
);

export const ListIcon = ({ className }) => (
  <svg className={className} {...base} strokeWidth={2.2}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const GridIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
);

export const ChevronDownIcon = ({ className }) => (
  <svg className={className} {...base} strokeWidth={2}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronRightIcon = ({ className }) => (
  <svg className={className} {...base} strokeWidth={2}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const SearchIcon = ({ className }) => (
  <svg className={className} {...base} strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const ExternalLinkIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
  </svg>
);

export const LinkIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </svg>
);

export const TrashIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

// Qurilish / Shaharsozlik — ustunli binolar
export const BuildingsIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M3 21h18" />
    <path d="M5 21V10l3-2 3 2v11" />
    <path d="M11 21V5l4-2 4 2v16" />
    <path d="M8 13v5M15 8v10" />
  </svg>
);

// Turar joy — uylar
export const HomesIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M3 21h18" />
    <path d="M4 21V11l4-4 4 4v10" />
    <path d="M12 21V8l4-4 4 4v13" />
    <path d="M7 15h2M15 12h2M15 16h2" />
  </svg>
);

export const LeafIcon = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="11" r="8" />
    <path d="M12 19v3" />
    <path d="M12 16c-2.8-1-4-3.2-3.5-6.5 3 .3 4.8 1.8 5.3 4.3" />
    <path d="M12 16c2.8-1 4-3.2 3.5-6.5" />
  </svg>
);

export const BusIcon = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="4" y="3" width="16" height="15" rx="3" />
    <path d="M4 11h16" />
    <path d="M7 18v2.5M17 18v2.5" />
    <path d="M8 14.5h.01M16 14.5h.01" />
  </svg>
);

export const CheckIcon = ({ className }) => (
  <svg className={className} {...base} strokeWidth={3}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const RoadIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M9 3 5 21M15 3l4 18" />
    <path d="M12 4v2.5M12 10.5v3M12 17.5V20" />
  </svg>
);

export const FactoryIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M3 21V10l5 3V10l5 3V10l5 3V4h3v17H3Z" />
    <path d="M7 17h2M12 17h2M17 17h1" />
  </svg>
);

export const BoltIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);

export const DropIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3Z" />
  </svg>
);

export const CirclePlusIcon = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export const BookmarkIcon = ({ className, filled }) => (
  <svg className={className} {...base} fill={filled ? "currentColor" : "none"}>
    <path d="M6 3h12v18l-6-4.5L6 21V3Z" />
  </svg>
);

export const CalendarIcon = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);

export const ShieldCheckIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
    <path d="m8.8 12.2 2.3 2.3 4.3-4.6" />
  </svg>
);

export const ChartBoxIcon = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 16v-4M12 16V8M16 16v-6" />
  </svg>
);

export const RefreshUpIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M12 15V4" />
    <path d="m8 8 4-4 4 4" />
    <path d="M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
  </svg>
);

export const PhoneIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M5 3.5h3.2l1.6 4-2.1 1.4a11 11 0 0 0 5.4 5.4l1.4-2.1 4 1.6V17a2 2 0 0 1-2 2A14.5 14.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z" />
  </svg>
);

export const MailIcon = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </svg>
);

export const MessageIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    <path d="M8 10h8M8 13h5" />
  </svg>
);

export const OrgChartIcon = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="9" y="3" width="6" height="5" rx="1" />
    <rect x="2.5" y="16" width="5" height="5" rx="1" />
    <rect x="9.5" y="16" width="5" height="5" rx="1" />
    <rect x="16.5" y="16" width="5" height="5" rx="1" />
    <path d="M12 8v4M5 16v-4h14v4M12 12v4" />
  </svg>
);

export const CloseIcon = ({ className }) => (
  <svg className={className} {...base} strokeWidth={2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const DatabaseIcon = ({ className }) => (
  <svg className={className} {...base}>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
    <path d="M4.5 5.5v6.5c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V5.5" />
    <path d="M4.5 12v6.5c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V12" />
  </svg>
);

export const CubeIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="m12 2.8 8 4.4v9.6l-8 4.4-8-4.4V7.2l8-4.4Z" />
    <path d="m4 7.2 8 4.5 8-4.5M12 11.7v9.5" />
  </svg>
);

export const ServerIcon = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="3.5" y="3.5" width="17" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="17" height="7" rx="2" />
    <path d="M7.5 7h.01M7.5 17h.01M11 7h5M11 17h5" />
  </svg>
);

export const TargetIcon = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);

export const GraduationIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="m12 4 10 5-10 5L2 9l10-5Z" />
    <path d="M6 11v5c0 1.4 2.7 3 6 3s6-1.6 6-3v-5" />
    <path d="M22 9v5" />
  </svg>
);

export const InfoIcon = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" strokeWidth={2.2} />
    <path d="M12 7.6h.01" strokeWidth={2.8} />
  </svg>
);

export const PrinterIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M7 8V3.5h10V8" />
    <rect x="3.5" y="8" width="17" height="8.5" rx="2" />
    <path d="M7 14h10v6.5H7V14Z" />
    <path d="M17 11h.01" />
  </svg>
);

export const ShareIcon = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="18" cy="5.5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="18.5" r="2.5" />
    <path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" />
  </svg>
);

export const HistoryIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    <path d="M3.5 4v4h4" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const GlobeIcon = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5s1.1-6.1 3.4-8.5Z" />
  </svg>
);

export const LockIcon = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <path d="M12 14.5v2" />
  </svg>
);

export const UploadIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);

export const EditIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </svg>
);

export const LogoutIcon = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M10 16.5 5.5 12 10 7.5M5.5 12H16" />
  </svg>
);

export const MinusIcon = ({ className }) => (
  <svg className={className} {...base} strokeWidth={2}>
    <path d="M5 12h14" />
  </svg>
);

export const PlusIcon = ({ className }) => (
  <svg className={className} {...base} strokeWidth={2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
