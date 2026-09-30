const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  xmlns: "http://www.w3.org/2000/svg",
};

export const SearchIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const ChevronDownIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ArrowRightIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const PlayIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="12" r="10" />
    <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" />
  </svg>
);

export const DocumentIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M19 8v3" />
    <path d="M14 3l5 5" />
    <path d="M8.5 11h6M8.5 14.5h3" />
    <path d="m17.5 13.5 2 2-4.5 4.5H13v-2l4.5-4.5Z" />
  </svg>
);

export const BookIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 7c-1.8-1.4-4.3-2-8-2v13c3.7 0 6.2.6 8 2 1.8-1.4 4.3-2 8-2V5c-3.7 0-6.2.6-8 2Z" />
    <path d="M12 7v13" />
  </svg>
);

export const UsersIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="8" r="3" />
    <path d="M6.5 19v-1a5.5 5.5 0 0 1 11 0v1" />
    <circle cx="5" cy="9.5" r="2.2" />
    <path d="M1.8 17.5v-.5A3.5 3.5 0 0 1 5.5 13.6" />
    <circle cx="19" cy="9.5" r="2.2" />
    <path d="M22.2 17.5v-.5a3.5 3.5 0 0 0-3.7-3.4" />
  </svg>
);

export const GlobeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
  </svg>
);

export const FlaskIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M9 3h6" />
    <path d="M10 3v6.2L4.6 18.4A1.7 1.7 0 0 0 6.1 21h11.8a1.7 1.7 0 0 0 1.5-2.6L14 9.2V3" />
    <path d="M7.3 15h9.4" />
  </svg>
);

export const GearIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8 13.6 5l2.7-.5.8 2.6 2.6.9-.5 2.7L21.2 12 19.2 13.3l.5 2.7-2.6.9-.8 2.6-2.7-.5L12 21.2 10.4 19l-2.7.5-.8-2.6-2.6-.9.5-2.7L2.8 12l2-1.3-.5-2.7 2.6-.9.8-2.6 2.7.5L12 2.8Z" />
  </svg>
);

const LaurelBranch = ({ className }) => (
  <svg
    viewBox="0 0 24 60"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 58C8 50 4 38 6 26 7.5 17 12 9 18 3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <ellipse cx="17" cy="7" rx="2.2" ry="4.4" transform="rotate(40 17 7)" />
    <ellipse cx="11.5" cy="14" rx="2.2" ry="4.6" transform="rotate(25 11.5 14)" />
    <ellipse cx="7.5" cy="23" rx="2.2" ry="4.8" transform="rotate(8 7.5 23)" />
    <ellipse cx="6.5" cy="33" rx="2.2" ry="4.8" transform="rotate(-10 6.5 33)" />
    <ellipse cx="8.5" cy="43" rx="2.2" ry="4.8" transform="rotate(-30 8.5 43)" />
    <ellipse cx="13" cy="51" rx="2.2" ry="4.6" transform="rotate(-50 13 51)" />
    <ellipse cx="15.5" cy="15" rx="1.8" ry="3.8" transform="rotate(70 15.5 15)" />
    <ellipse cx="12" cy="25" rx="1.8" ry="3.8" transform="rotate(60 12 25)" />
    <ellipse cx="11.5" cy="36" rx="1.8" ry="3.8" transform="rotate(45 11.5 36)" />
    <ellipse cx="14.5" cy="46" rx="1.8" ry="3.8" transform="rotate(25 14.5 46)" />
  </svg>
);

export const LaurelLeftIcon = ({ className }) => (
  <LaurelBranch className={className} />
);

export const LaurelRightIcon = ({ className }) => (
  <LaurelBranch className={`${className} -scale-x-100`} />
);
